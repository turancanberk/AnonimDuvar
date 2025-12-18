/**
 * API Response Helpers
 * 
 * Standardized response formats for API routes.
 * Follows consistent error handling patterns.
 */

import { NextResponse } from 'next/server';
import { ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
    success: true;
    data: T;
    message?: string;
    meta?: Record<string, any>;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        field?: string;
        details?: any;
    };
}

/**
 * Create a success response
 */
export function successResponse<T>(
    data: T,
    message?: string,
    meta?: Record<string, any>,
    status: number = 200
): NextResponse<SuccessResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            message,
            meta,
        },
        { status }
    );
}

/**
 * Create an error response
 */
export function errorResponse(
    message: string,
    status: number = 500,
    code?: string,
    field?: string,
    details?: any
): NextResponse<ErrorResponse> {
    return NextResponse.json(
        {
            success: false,
            error: {
                message,
                code,
                field,
                details,
            },
        },
        { status }
    );
}

/**
 * Handle errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
    console.error('API Error:', error);

    // Validation Error
    if (error instanceof ValidationError) {
        return errorResponse(
            error.message,
            400,
            'VALIDATION_ERROR',
            error.field
        );
    }

    // Not Found Error
    if (error instanceof NotFoundError) {
        return errorResponse(
            error.message,
            404,
            'NOT_FOUND'
        );
    }

    // Unauthorized Error
    if (error instanceof UnauthorizedError) {
        return errorResponse(
            error.message,
            401,
            'UNAUTHORIZED'
        );
    }

    // Forbidden Error
    if (error instanceof ForbiddenError) {
        return errorResponse(
            error.message,
            403,
            'FORBIDDEN'
        );
    }

    // Generic Error
    if (error instanceof Error) {
        return errorResponse(
            error.message,
            500,
            'INTERNAL_ERROR'
        );
    }

    // Unknown Error
    return errorResponse(
        'Beklenmeyen bir hata oluştu',
        500,
        'UNKNOWN_ERROR'
    );
}

/**
 * Pagination metadata interface
 */
export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
    total: number,
    page: number,
    pageSize: number
): PaginationMeta {
    const totalPages = Math.ceil(total / pageSize);

    return {
        total,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
    };
}

/**
 * Paginated response interface
 */
export interface PaginatedResponse<T> {
    success: true;
    data: T[];
    pagination: PaginationMeta;
}

/**
 * Create a paginated success response
 */
export function paginatedResponse<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
    status: number = 200
): NextResponse<PaginatedResponse<T>> {
    return NextResponse.json(
        {
            success: true,
            data,
            pagination: createPaginationMeta(total, page, pageSize),
        },
        { status }
    );
}

/**
 * Extract client IP address from request
 */
export function getClientIp(headers: Headers): string {
    return (
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') || // Cloudflare
        'unknown'
    );
}

/**
 * Extract user agent from request
 */
export function getUserAgent(headers: Headers): string | undefined {
    return headers.get('user-agent') || undefined;
}

/**
 * Parse pagination parameters from URL
 */
export function parsePaginationParams(searchParams: URLSearchParams): {
    limit: number;
    offset: number;
    page: number;
} {
    const limit = Math.min(
        Math.max(parseInt(searchParams.get('limit') || '20'), 1),
        100 // Max 100 items per page
    );

    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    return { limit, offset, page };
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
    body: Record<string, any>,
    requiredFields: string[]
): void {
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
        throw new ValidationError(
            `Eksik alanlar: ${missingFields.join(', ')}`,
            missingFields[0]
        );
    }
}
