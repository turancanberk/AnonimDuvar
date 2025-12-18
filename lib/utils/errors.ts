/**
 * Custom Error Classes
 * 
 * Centralized error definitions for the application.
 * Follows Single Responsibility Principle.
 * 
 * @module Errors
 */

/**
 * Base Application Error
 */
export class ApplicationError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends ApplicationError {
    constructor(message: string, public field?: string) {
        super(message, 400, 'VALIDATION_ERROR');
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApplicationError {
    constructor(message: string = 'Kaynak bulunamadı') {
        super(message, 404, 'NOT_FOUND');
    }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApplicationError {
    constructor(message: string = 'Yetkisiz erişim') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends ApplicationError {
    constructor(message: string = 'Bu işlem için yetkiniz yok') {
        super(message, 403, 'FORBIDDEN');
    }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends ApplicationError {
    constructor(message: string = 'Çakışma hatası') {
        super(message, 409, 'CONFLICT');
    }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends ApplicationError {
    constructor(message: string = 'Sunucu hatası') {
        super(message, 500, 'INTERNAL_SERVER_ERROR');
    }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends ApplicationError {
    constructor(message: string = 'Çok fazla istek gönderildi') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
    }
}

/**
 * Error Response Interface
 */
export interface ErrorResponse {
    error: {
        message: string;
        code?: string;
        field?: string;
        statusCode: number;
    };
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: Error): ErrorResponse {
    if (error instanceof ApplicationError) {
        return {
            error: {
                message: error.message,
                code: error.code,
                field: error instanceof ValidationError ? error.field : undefined,
                statusCode: error.statusCode,
            },
        };
    }

    // Unknown errors
    return {
        error: {
            message: 'Beklenmeyen bir hata oluştu',
            code: 'UNKNOWN_ERROR',
            statusCode: 500,
        },
    };
}
