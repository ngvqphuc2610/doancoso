"use client";

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Determines what level of logs will be outputted
const currentLogLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

/**
 * Enhanced logger that can be used in both server and client components
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (levelPriority[currentLogLevel] <= levelPriority.debug) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (levelPriority[currentLogLevel] <= levelPriority.info) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (levelPriority[currentLogLevel] <= levelPriority.warn) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    if (levelPriority[currentLogLevel] <= levelPriority.error) {
      console.error(`[ERROR] ${message}`, ...args);
    }

    // Here you could also log to a service like Sentry, LogRocket, etc.
  },

  // Helper for API request logging
  apiRequest: (url: string, method: string = 'GET') => {
    if (levelPriority[currentLogLevel] <= levelPriority.debug) {
      const isClient = typeof window !== 'undefined';
      const contextLabel = isClient ? '[CLIENT]' : '[SERVER]';
      console.debug(`${contextLabel} API ${method} request to: ${url}`);
    }
  },

  // Helper for API response logging
  apiResponse: (url: string, status: number, ok: boolean) => {
    const logMethod = ok ? 'debug' : 'error';
    const isClient = typeof window !== 'undefined';
    const contextLabel = isClient ? '[CLIENT]' : '[SERVER]';

    if (logMethod === 'debug' && levelPriority[currentLogLevel] <= levelPriority.debug) {
      console.debug(`${contextLabel} API response from ${url}: ${status}`);
    } else if (logMethod === 'error' && levelPriority[currentLogLevel] <= levelPriority.error) {
      console.error(`${contextLabel} API error from ${url}: ${status}`);
    }
  }
};
