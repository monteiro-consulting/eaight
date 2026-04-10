// MCP Event Emitter

import { EventEmitter } from 'events';
import { MCPEvent, MCPEventType, MCPEventData } from './EventTypes';
import { logger } from '../../utils/logger';

class MCPEventEmitter extends EventEmitter {
  emit<T extends MCPEventType>(type: T, data: MCPEventData[T]): boolean {
    const event: MCPEvent<T> = {
      type,
      timestamp: Date.now(),
      data,
    };
    logger.debug('MCP event emitted', { type, data });
    return super.emit(type, event);
  }

  on<T extends MCPEventType>(
    type: T,
    listener: (event: MCPEvent<T>) => void
  ): this {
    return super.on(type, listener);
  }

  once<T extends MCPEventType>(
    type: T,
    listener: (event: MCPEvent<T>) => void
  ): this {
    return super.once(type, listener);
  }

  off<T extends MCPEventType>(
    type: T,
    listener: (event: MCPEvent<T>) => void
  ): this {
    return super.off(type, listener);
  }
}

export const mcpEventEmitter = new MCPEventEmitter();
export default mcpEventEmitter;
