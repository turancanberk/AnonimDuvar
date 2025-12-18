/**
 * Logger Utility
 * 
 * Centralized logging utility that respects environment settings.
 * In production, only errors are logged. In development, all logs are shown.
 * 
 * @module Logger
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

export class Logger {
    /**
     * Log informational messages (development only)
     */
    static info(message: string, ...args: any[]): void {
        if (isDevelopment && !isTest) {
            console.log(`ℹ️  ${message}`, ...args);
        }
    }

    /**
     * Log success messages (development only)
     */
    static success(message: string, ...args: any[]): void {
        if (isDevelopment && !isTest) {
            console.log(`✅ ${message}`, ...args);
        }
    }

    /**
     * Log warning messages (always shown)
     */
    static warn(message: string, ...args: any[]): void {
        if (!isTest) {
            console.warn(`⚠️  ${message}`, ...args);
        }
    }

    /**
     * Log error messages (always shown)
     */
    static error(message: string, ...args: any[]): void {
        if (!isTest) {
            console.error(`❌ ${message}`, ...args);
        }
    }

    /**
     * Log debug messages (development only)
     */
    static debug(message: string, ...args: any[]): void {
        if (isDevelopment && !isTest) {
            console.log(`🔍 ${message}`, ...args);
        }
    }
}
