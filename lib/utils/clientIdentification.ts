/**
 * Client IP and Fingerprinting Utilities
 * 
 * Provides secure methods to identify clients.
 */

import crypto from 'crypto';

/**
 * Get client IP address from request headers
 * Handles various proxy scenarios (Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string {
    // Try x-forwarded-for (most common)
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        // Take the first IP (client IP before proxies)
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        return ips[0];
    }

    // Try x-real-ip (some proxies use this)
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    // Fallback
    return 'unknown';
}

/**
 * Generate a fingerprint for the client
 * Combines IP, User-Agent, and Accept-Language for better tracking
 */
export function generateClientFingerprint(request: Request): string {
    const ip = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    const acceptEncoding = request.headers.get('accept-encoding') || '';

    // Combine multiple factors
    const data = `${ip}|${userAgent}|${acceptLanguage}|${acceptEncoding}`;

    // Hash to create a unique fingerprint
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Hash an IP address for privacy
 * Use this when storing IPs in database
 */
export function hashIpAddress(ip: string): string {
    const salt = process.env.IP_HASH_SALT || 'default-salt-change-in-production';
    return crypto.createHash('sha256').update(ip + salt).digest('hex');
}
