// Color Utilities - Validation, conversion, and contrast checking

import { ColorValidation, ContrastResult } from '../types/theme';

/**
 * Parse a color string to RGB values
 */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  if (!color) return null;

  // Remove whitespace
  color = color.trim();

  // Hex format (#RGB, #RGBA, #RRGGBB, #RRGGBBAA)
  if (color.startsWith('#')) {
    const hex = color.slice(1);

    if (hex.length === 3) {
      // #RGB
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    } else if (hex.length === 4) {
      // #RGBA
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: parseInt(hex[3] + hex[3], 16) / 255,
      };
    } else if (hex.length === 6) {
      // #RRGGBB
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    } else if (hex.length === 8) {
      // #RRGGBBAA
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
  }

  // RGB format: rgb(r, g, b)
  const rgbMatch = color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
      a: 1,
    };
  }

  // RGBA format: rgba(r, g, b, a)
  const rgbaMatch = color.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/i);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: parseFloat(rgbaMatch[4]),
    };
  }

  // HSL format: hsl(h, s%, l%)
  const hslMatch = color.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    const rgb = hslToRgb(h, s, l);
    return { ...rgb, a: 1 };
  }

  // HSLA format: hsla(h, s%, l%, a)
  const hslaMatch = color.match(/^hsla\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*,\s*([\d.]+)\s*\)$/i);
  if (hslaMatch) {
    const h = parseInt(hslaMatch[1], 10) / 360;
    const s = parseInt(hslaMatch[2], 10) / 100;
    const l = parseInt(hslaMatch[3], 10) / 100;
    const rgb = hslToRgb(h, s, l);
    return { ...rgb, a: parseFloat(hslaMatch[4]) };
  }

  return null;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number, a?: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  if (a !== undefined && a < 1) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`;
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Validate a color string
 */
export function validateColor(color: string): ColorValidation {
  if (!color) {
    return { isValid: false, format: 'unknown', normalized: '' };
  }

  const parsed = parseColor(color);
  if (!parsed) {
    return { isValid: false, format: 'unknown', normalized: '' };
  }

  const normalized = rgbToHex(parsed.r, parsed.g, parsed.b, parsed.a);

  let format: ColorValidation['format'] = 'unknown';
  const trimmed = color.trim().toLowerCase();

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (hex.length === 3 || hex.length === 6) format = 'hex';
    else if (hex.length === 4 || hex.length === 8) format = 'hex8';
  } else if (trimmed.startsWith('rgba')) {
    format = 'rgba';
  } else if (trimmed.startsWith('rgb')) {
    format = 'rgb';
  } else if (trimmed.startsWith('hsla')) {
    format = 'hsla';
  } else if (trimmed.startsWith('hsl')) {
    format = 'hsl';
  }

  return { isValid: true, format, normalized };
}

/**
 * Calculate relative luminance of a color
 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getLuminance(color: string): number {
  const parsed = parseColor(color);
  if (!parsed) return 0;

  const { r, g, b } = parsed;

  const sRGB = [r / 255, g / 255, b / 255];
  const RGB = sRGB.map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * RGB[0] + 0.7152 * RGB[1] + 0.0722 * RGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check contrast levels according to WCAG 2.0
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 100) / 100,
    levelAA: ratio >= 4.5,        // Normal text
    levelAAA: ratio >= 7,         // Normal text (enhanced)
    levelAALarge: ratio >= 3,     // Large text (18pt+ or 14pt+ bold)
    levelAAALarge: ratio >= 4.5,  // Large text (enhanced)
  };
}

/**
 * Lighten a color by a percentage
 */
export function lighten(color: string, percent: number): string {
  const parsed = parseColor(color);
  if (!parsed) return color;

  const { r, g, b, a } = parsed;
  const factor = percent / 100;

  return rgbToHex(
    Math.min(255, r + (255 - r) * factor),
    Math.min(255, g + (255 - g) * factor),
    Math.min(255, b + (255 - b) * factor),
    a
  );
}

/**
 * Darken a color by a percentage
 */
export function darken(color: string, percent: number): string {
  const parsed = parseColor(color);
  if (!parsed) return color;

  const { r, g, b, a } = parsed;
  const factor = 1 - percent / 100;

  return rgbToHex(
    Math.max(0, r * factor),
    Math.max(0, g * factor),
    Math.max(0, b * factor),
    a
  );
}

/**
 * Set opacity of a color
 */
export function setOpacity(color: string, opacity: number): string {
  const parsed = parseColor(color);
  if (!parsed) return color;

  const { r, g, b } = parsed;
  return rgbToHex(r, g, b, opacity);
}

/**
 * Mix two colors
 */
export function mixColors(color1: string, color2: string, weight: number = 0.5): string {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  if (!c1 || !c2) return color1;

  const w = Math.max(0, Math.min(1, weight));

  return rgbToHex(
    Math.round(c1.r * (1 - w) + c2.r * w),
    Math.round(c1.g * (1 - w) + c2.g * w),
    Math.round(c1.b * (1 - w) + c2.b * w),
    c1.a * (1 - w) + c2.a * w
  );
}

/**
 * Check if a color is dark
 */
export function isDark(color: string): boolean {
  return getLuminance(color) < 0.5;
}

/**
 * Check if a color is light
 */
export function isLight(color: string): boolean {
  return getLuminance(color) >= 0.5;
}

/**
 * Get a contrasting color (black or white)
 */
export function getContrastingColor(background: string): string {
  return isDark(background) ? '#ffffff' : '#000000';
}

/**
 * Format color for display
 */
export function formatColor(color: string, format: 'hex' | 'rgb' | 'hsl' = 'hex'): string {
  const parsed = parseColor(color);
  if (!parsed) return color;

  const { r, g, b, a } = parsed;

  switch (format) {
    case 'hex':
      return rgbToHex(r, g, b, a < 1 ? a : undefined);

    case 'rgb':
      return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;

    case 'hsl': {
      const max = Math.max(r, g, b) / 255;
      const min = Math.min(r, g, b) / 255;
      const l = (max + min) / 2;

      let h = 0;
      let s = 0;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
          case r / 255:
            h = ((g / 255 - b / 255) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g / 255:
            h = ((b / 255 - r / 255) / d + 2) / 6;
            break;
          case b / 255:
            h = ((r / 255 - g / 255) / d + 4) / 6;
            break;
        }
      }

      const hDeg = Math.round(h * 360);
      const sPercent = Math.round(s * 100);
      const lPercent = Math.round(l * 100);

      return a < 1
        ? `hsla(${hDeg}, ${sPercent}%, ${lPercent}%, ${a})`
        : `hsl(${hDeg}, ${sPercent}%, ${lPercent}%)`;
    }

    default:
      return color;
  }
}

export default {
  parseColor,
  rgbToHex,
  validateColor,
  getLuminance,
  getContrastRatio,
  checkContrast,
  lighten,
  darken,
  setOpacity,
  mixColors,
  isDark,
  isLight,
  getContrastingColor,
  formatColor,
};
