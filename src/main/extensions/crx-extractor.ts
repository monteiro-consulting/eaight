// CRX File Extractor
// Extracts Chrome extension .crx files (v2 and v3 formats)

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { logger } from '../utils/logger';

const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

// CRX Magic Number: "Cr24"
const CRX_MAGIC = Buffer.from([0x43, 0x72, 0x32, 0x34]);

interface CRXHeader {
  version: number;
  zipOffset: number;
}

/**
 * Parse CRX header to find where the ZIP data starts
 */
function parseCRXHeader(buffer: Buffer): CRXHeader {
  // Check magic number
  if (!buffer.subarray(0, 4).equals(CRX_MAGIC)) {
    throw new Error('Invalid CRX file: magic number not found');
  }

  // Read version (4 bytes, little-endian)
  const version = buffer.readUInt32LE(4);

  if (version === 2) {
    // CRX2 format:
    // 4 bytes: magic
    // 4 bytes: version (2)
    // 4 bytes: public key length
    // 4 bytes: signature length
    // public key
    // signature
    // ZIP data
    const pubKeyLength = buffer.readUInt32LE(8);
    const sigLength = buffer.readUInt32LE(12);
    const zipOffset = 16 + pubKeyLength + sigLength;

    return { version: 2, zipOffset };
  } else if (version === 3) {
    // CRX3 format:
    // 4 bytes: magic
    // 4 bytes: version (3)
    // 4 bytes: header length (protobuf header)
    // header (protobuf)
    // ZIP data
    const headerLength = buffer.readUInt32LE(8);
    const zipOffset = 12 + headerLength;

    return { version: 3, zipOffset };
  } else {
    throw new Error(`Unsupported CRX version: ${version}`);
  }
}

/**
 * Simple ZIP extractor using Node.js built-in zlib
 * This is a minimal implementation that handles the basic ZIP format
 */
async function extractZip(zipBuffer: Buffer, outputDir: string): Promise<void> {
  // ZIP file structure:
  // Local file headers + data
  // Central directory
  // End of central directory record

  let offset = 0;
  const files: { name: string; compressedData: Buffer; compressionMethod: number; uncompressedSize: number }[] = [];

  // Read local file headers
  while (offset < zipBuffer.length - 4) {
    const signature = zipBuffer.readUInt32LE(offset);

    // Local file header signature: 0x04034b50
    if (signature !== 0x04034b50) {
      break; // No more local file headers
    }

    const compressionMethod = zipBuffer.readUInt16LE(offset + 8);
    const compressedSize = zipBuffer.readUInt32LE(offset + 18);
    const uncompressedSize = zipBuffer.readUInt32LE(offset + 22);
    const fileNameLength = zipBuffer.readUInt16LE(offset + 26);
    const extraFieldLength = zipBuffer.readUInt16LE(offset + 28);

    const fileName = zipBuffer.subarray(offset + 30, offset + 30 + fileNameLength).toString('utf8');
    const dataOffset = offset + 30 + fileNameLength + extraFieldLength;
    const compressedData = zipBuffer.subarray(dataOffset, dataOffset + compressedSize);

    files.push({
      name: fileName,
      compressedData,
      compressionMethod,
      uncompressedSize,
    });

    offset = dataOffset + compressedSize;
  }

  // Extract files
  for (const file of files) {
    const filePath = path.join(outputDir, file.name);
    const dirPath = path.dirname(filePath);

    // Create directory if needed
    await mkdir(dirPath, { recursive: true });

    // Skip directories (they end with /)
    if (file.name.endsWith('/')) {
      continue;
    }

    let data: Buffer;
    if (file.compressionMethod === 0) {
      // Stored (no compression)
      data = file.compressedData;
    } else if (file.compressionMethod === 8) {
      // Deflate compression
      try {
        data = zlib.inflateRawSync(file.compressedData);
      } catch (err) {
        logger.error('Failed to decompress file', { file: file.name, error: err });
        throw new Error(`Failed to decompress ${file.name}`);
      }
    } else {
      throw new Error(`Unsupported compression method: ${file.compressionMethod}`);
    }

    await writeFile(filePath, data);
  }
}

/**
 * Extract a CRX file to a directory
 * @param crxPath Path to the .crx file
 * @param outputDir Directory to extract to
 * @returns Path to the extracted extension directory
 */
export async function extractCRX(crxPath: string, outputDir: string): Promise<string> {
  logger.info('Extracting CRX file', { crxPath, outputDir });

  // Read CRX file
  const crxBuffer = await readFile(crxPath);

  // Parse header to find ZIP offset
  const header = parseCRXHeader(crxBuffer);
  logger.debug('CRX header parsed', { version: header.version, zipOffset: header.zipOffset });

  // Extract ZIP portion
  const zipBuffer = crxBuffer.subarray(header.zipOffset);

  // Create output directory
  await mkdir(outputDir, { recursive: true });

  // Extract ZIP contents
  await extractZip(zipBuffer, outputDir);

  logger.info('CRX file extracted successfully', { outputDir });
  return outputDir;
}

/**
 * Check if a file is a valid CRX file
 */
export function isCRXFile(filePath: string): boolean {
  try {
    const buffer = fs.readFileSync(filePath, { encoding: null });
    return buffer.length >= 4 && buffer.subarray(0, 4).equals(CRX_MAGIC);
  } catch {
    return false;
  }
}

/**
 * Check if a directory contains a valid Chrome extension (has manifest.json)
 */
export function isExtensionDirectory(dirPath: string): boolean {
  const manifestPath = path.join(dirPath, 'manifest.json');
  return fs.existsSync(manifestPath);
}

export default { extractCRX, isCRXFile, isExtensionDirectory };
