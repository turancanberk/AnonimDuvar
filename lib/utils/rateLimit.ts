/**
 * Rate Limiting Utilities
 * 
 * Provides in-memory rate limiting for API endpoints.
 * For production, consider using Redis-based rate limiting (Upstash, Vercel KV).
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private store = new Map<string, RateLimitEntry>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Cleanup expired entries every 5 minutes
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, entry] of this.store.entries()) {
                if (now > entry.resetTime) {
                    this.store.delete(key);
                }
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Check if request should be rate limited
     * @param key - Unique identifier (e.g., IP address)
     * @param limit - Maximum number of requests
     * @param windowMs - Time window in milliseconds
     * @returns Object with success status and reset time
     */
    check(key: string, limit: number, windowMs: number): {
        success: boolean;
        remaining: number;
        reset: number;
    } {
        const now = Date.now();
        const entry = this.store.get(key);

        if (!entry || now > entry.resetTime) {
            // First request or window expired
            this.store.set(key, {
                count: 1,
                resetTime: now + windowMs,
            });
            return {
                success: true,
                remaining: limit - 1,
                reset: now + windowMs,
            };
        }

        if (entry.count >= limit) {
            // Rate limit exceeded
            return {
                success: false,
                remaining: 0,
                reset: entry.resetTime,
            };
        }

        // Increment count
        entry.count++;
        return {
            success: true,
            remaining: limit - entry.count,
            reset: entry.resetTime,
        };
    }

    /**
     * Clear all rate limit entries (useful for testing)
     */
    clear() {
        this.store.clear();
    }

    /**
     * Cleanup interval
     */
    destroy() {
        clearInterval(this.cleanupInterval);
    }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit for message creation
 * 5 messages per hour per IP
 */
export function checkMessageRateLimit(identifier: string) {
    return rateLimiter.check(identifier, 5, 60 * 60 * 1000); // 5 per hour
}

/**
 * Rate limit for interactions (like, dislike, report)
 * 30 interactions per minute per IP
 */
export function checkInteractionRateLimit(identifier: string) {
    return rateLimiter.check(identifier, 30, 60 * 1000); // 30 per minute
}

/**
 * Rate limit for admin endpoints
 * 100 requests per minute per session
 */
export function checkAdminRateLimit(identifier: string) {
    return rateLimiter.check(identifier, 100, 60 * 1000); // 100 per minute
}

/**
 * Rate limit for violation reports
 * 5 reports per hour per client
 */
export function checkViolationReportRateLimit(identifier: string) {
    return rateLimiter.check(identifier, 5, 60 * 60 * 1000); // 5 per hour
}

/**
 * Clear all rate limits (for testing)
 */
export function clearRateLimits() {
    rateLimiter.clear();
}

export default rateLimiter;
