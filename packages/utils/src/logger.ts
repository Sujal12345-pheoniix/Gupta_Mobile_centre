/**
 * Structured logger for Gupta Mobile Centre
 *
 * Uses pino for production (JSON format) and pino-pretty for development.
 * All logs include structured metadata for observability.
 */

import pino from 'pino';

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface LoggerOptions {
  level?: LogLevel;
  module?: string;
  correlationId?: string;
}

export interface LogMeta {
  module?: string;
  correlationId?: string;
  userId?: string;
  organizationId?: string;
  branchId?: string;
  entityType?: string;
  entityId?: string;
  [key: string]: unknown;
}

let loggerInstance: pino.Logger | null = null;

export function createLogger(options: LoggerOptions = {}): pino.Logger {
  const level = options.level ?? (process.env.APP_ENV === 'production' ? 'info' : 'debug');

  if (process.env.APP_ENV === 'production') {
    return pino({
      level,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level(label) {
          return { level: label };
        },
      },
    });
  }

  return pino({
    level,
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  });
}

export function getLogger(): pino.Logger {
  if (!loggerInstance) {
    loggerInstance = createLogger();
  }
  return loggerInstance;
}

/**
 * NestJS-compatible logger interface
 * Wraps pino for use in NestJS modules
 */
export class NestLogger {
  private readonly logger: pino.Logger;
  private readonly module: string;

  constructor(module: string) {
    this.module = module;
    this.logger = getLogger();
  }

  log(message: string, meta?: LogMeta) {
    this.logger.info({ ...meta, module: this.module }, message);
  }

  error(message: string, error?: unknown, meta?: LogMeta) {
    const errorMeta = error instanceof Error
      ? { ...meta, module: this.module, error: error.message, stack: error.stack }
      : { ...meta, module: this.module, error };
    this.logger.error(errorMeta, message);
  }

  warn(message: string, meta?: LogMeta) {
    this.logger.warn({ ...meta, module: this.module }, message);
  }

  debug(message: string, meta?: LogMeta) {
    this.logger.debug({ ...meta, module: this.module }, message);
  }
}