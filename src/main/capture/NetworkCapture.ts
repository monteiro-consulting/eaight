// Network Capture Module

import { session } from 'electron';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  timestamp: number;
  resourceType: string;
}

export interface NetworkResponse {
  id: string;
  url: string;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  timestamp: number;
}

class NetworkCapture extends EventEmitter {
  private requests: Map<string, NetworkRequest> = new Map();
  private responses: NetworkResponse[] = [];
  private maxEntries = 100;

  setupForSession(ses: typeof session.defaultSession): void {
    ses.webRequest.onBeforeRequest((details, callback) => {
      const request: NetworkRequest = {
        id: details.id.toString(),
        url: details.url,
        method: details.method,
        headers: {},
        timestamp: Date.now(),
        resourceType: details.resourceType,
      };

      this.requests.set(request.id, request);
      this.emit('request', request);

      callback({});
    });

    ses.webRequest.onCompleted((details) => {
      const headers: Record<string, string> = {};
      if (details.responseHeaders) {
        for (const [key, values] of Object.entries(details.responseHeaders)) {
          headers[key] = Array.isArray(values) ? values.join(', ') : String(values);
        }
      }
      const response: NetworkResponse = {
        id: details.id.toString(),
        url: details.url,
        status: details.statusCode,
        statusText: '',
        headers,
        timestamp: Date.now(),
      };

      this.responses.push(response);
      if (this.responses.length > this.maxEntries) {
        this.responses.shift();
      }

      this.emit('response', response);
    });

    logger.debug('Network capture setup complete');
  }

  getRequests(): NetworkRequest[] {
    return Array.from(this.requests.values()).slice(-this.maxEntries);
  }

  getResponses(): NetworkResponse[] {
    return this.responses;
  }

  getAll(): { requests: NetworkRequest[]; responses: NetworkResponse[] } {
    return {
      requests: this.getRequests(),
      responses: this.getResponses(),
    };
  }

  clear(): void {
    this.requests.clear();
    this.responses = [];
  }
}

export const networkCapture = new NetworkCapture();
export default networkCapture;
