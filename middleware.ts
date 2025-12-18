/**
 * CSRF Protection Middleware
 * 
 * Protects against Cross-Site Request Forgery attacks
 * by validating Origin and Referer headers for state-changing requests.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Check if the request origin is allowed
 */
function isAllowedOrigin(origin: string | null, host: string | null): boolean {
    if (!origin || !host) return false;

    // Extract hostname from origin
    try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host;

        // Allow same origin
        if (originHost === host) return true;

        // Allow localhost in development
        if (process.env.NODE_ENV === 'development') {
            if (originHost.includes('localhost') || originHost.includes('127.0.0.1')) {
                return true;
            }
        }

        return false;
    } catch {
        return false;
    }
}

export function middleware(request: NextRequest) {
    // Only check state-changing methods
    const stateMutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    if (stateMutatingMethods.includes(request.method)) {
        const origin = request.headers.get('origin');
        const referer = request.headers.get('referer');
        const host = request.headers.get('host');

        // Check Origin header (preferred)
        if (origin) {
            if (!isAllowedOrigin(origin, host)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: 'CSRF validation failed: Invalid origin',
                            code: 'CSRF_ERROR'
                        }
                    },
                    { status: 403 }
                );
            }
        }
        // Fallback to Referer header
        else if (referer) {
            if (!isAllowedOrigin(referer, host)) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: 'CSRF validation failed: Invalid referer',
                            code: 'CSRF_ERROR'
                        }
                    },
                    { status: 403 }
                );
            }
        }
        // No Origin or Referer header (suspicious)
        else {
            // Allow in development for testing
            if (process.env.NODE_ENV !== 'development') {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            message: 'CSRF validation failed: Missing origin/referer headers',
                            code: 'CSRF_ERROR'
                        }
                    },
                    { status: 403 }
                );
            }
        }
    }

    return NextResponse.next();
}

// Apply middleware to API routes
export const config = {
    matcher: '/api/:path*',
};
