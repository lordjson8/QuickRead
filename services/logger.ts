/**
 * Logger Service
 * Provides structured logging with different levels
 * Integrates with error monitoring services in production
 */

import config from '@/config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = config.env === 'development';
  private isDebugEnabled = config.debug;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context, null, 2) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    if (level === 'debug') return this.isDebugEnabled;
    return true;
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      };
      console.error(this.formatMessage('error', message, errorContext));
      
      // In production, send to error monitoring service (e.g., Sentry)
      if (!this.isDevelopment && config.sentry.dsn) {
        this.sendToErrorMonitoring(message, error, errorContext);
      }
    }
  }

  private sendToErrorMonitoring(message: string, error: Error | unknown, context: LogContext): void {
    // TODO: Integrate with Sentry or similar service
    // Example: Sentry.captureException(error, { extra: context });
  }
}

export const logger = new Logger();
export default logger;