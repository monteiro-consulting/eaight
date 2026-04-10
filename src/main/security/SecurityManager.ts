// Security Manager - Manages authentication and permissions

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { getTokenPath, ensureSocketDir } from '../utils/paths';
import { logger } from '../utils/logger';
import settingsManager from '../settings/SettingsManager';

export interface ClientInfo {
  name: string;
  token?: string;
}

class SecurityManager extends EventEmitter {
  private authToken: string | null = null;

  constructor() {
    super();
    this.initializeToken();
  }

  private initializeToken(): void {
    const tokenPath = getTokenPath();

    try {
      if (fs.existsSync(tokenPath)) {
        this.authToken = fs.readFileSync(tokenPath, 'utf-8').trim();
        logger.debug('Auth token loaded from file');
      } else {
        this.generateNewToken();
      }
    } catch (error) {
      logger.error('Failed to load auth token', { error });
      this.generateNewToken();
    }
  }

  private generateNewToken(): void {
    this.authToken = crypto.randomBytes(32).toString('hex');
    this.saveToken();
    logger.info('New auth token generated');
  }

  private saveToken(): void {
    if (!this.authToken) return;

    try {
      ensureSocketDir();
      fs.writeFileSync(getTokenPath(), this.authToken, 'utf-8');
      logger.debug('Auth token saved');
    } catch (error) {
      logger.error('Failed to save auth token', { error });
    }
  }

  getToken(): string | null {
    return this.authToken;
  }

  validateToken(token: string): boolean {
    if (!settingsManager.isMCPAuthEnabled()) {
      return true;
    }

    return token === this.authToken;
  }

  async validateConnection(clientInfo: ClientInfo): Promise<boolean> {
    if (!settingsManager.isMCPAuthEnabled()) {
      logger.debug('Auth disabled, allowing connection');
      return true;
    }

    const allowedApps = settingsManager.getAllowedApps();

    // Check if app is in whitelist
    if (allowedApps.includes(clientInfo.name)) {
      // Validate token if provided
      if (clientInfo.token) {
        const valid = this.validateToken(clientInfo.token);
        logger.debug('Connection validated', { client: clientInfo.name, valid });
        return valid;
      }

      // No token but in whitelist - may need approval
      const authSettings = settingsManager.get('security').mcpAuth;
      if (authSettings.requireApproval) {
        return this.promptUserApproval(clientInfo);
      }

      return true;
    }

    logger.warn('Connection rejected - not in whitelist', { client: clientInfo.name });
    return false;
  }

  private async promptUserApproval(clientInfo: ClientInfo): Promise<boolean> {
    // In a full implementation, this would show a dialog
    // For MVP, we auto-approve whitelisted apps
    logger.info('Auto-approving whitelisted client', { client: clientInfo.name });
    return true;
  }

  rotateToken(): void {
    this.generateNewToken();
    this.emit('token-rotated', this.authToken);
  }
}

export const securityManager = new SecurityManager();
export default securityManager;
