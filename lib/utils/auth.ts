/**
 * Auth Utilities
 * 
 * Helper functions for authentication and authorization.
 * 
 * SECURITY:
 * - Admin access requires both authentication AND email whitelist
 * - Session validation on every request
 */

import { getServerSession } from 'next-auth/next';
import { authOptions, isAdmin as checkIsAdmin } from '@/lib/infrastructure/auth/nextAuthOptions';
import { UnauthorizedError, ForbiddenError } from '@/lib/utils/errors';

/**
 * Get current session (server-side)
 */
export async function getSession() {
    return await getServerSession(authOptions);
}

/**
 * Require authentication
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth() {
    const session = await getSession();

    if (!session || !session.user) {
        throw new UnauthorizedError('Giriş yapmanız gerekiyor');
    }

    return session;
}

/**
 * Require admin access
 * Throws UnauthorizedError if not authenticated
 * Throws ForbiddenError if not in admin whitelist
 * 
 * SECURITY: Validates both authentication AND admin email whitelist
 */
export async function requireAdmin() {
    const session = await requireAuth();

    // Check if user is in admin whitelist
    if (!checkIsAdmin(session.user)) {
        throw new ForbiddenError(
            'Bu işlem için admin yetkisi gerekiyor. ' +
            'Email adresiniz admin listesinde değil.'
        );
    }

    return session;
}

/**
 * Check if current user is admin
 * Returns false if not authenticated or not in whitelist
 */
export async function isAdmin(): Promise<boolean> {
    const session = await getSession();
    if (!session?.user) return false;
    return checkIsAdmin(session.user);
}

/**
 * Get current user email
 */
export async function getCurrentUserEmail(): Promise<string | null> {
    const session = await getSession();
    return session?.user?.email || null;
}
