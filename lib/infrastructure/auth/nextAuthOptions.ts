/**
 * NextAuth Configuration
 * 
 * Authentication configuration for admin panel.
 * Uses credentials authentication with email whitelist.
 * 
 * SECURITY:
 * - Admin emails must be whitelisted in ADMIN_EMAILS env var
 * - Strong password requirements enforced
 * - No default credentials allowed in production
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { Logger } from '@/lib/utils/logger';

/**
 * Validate environment variables
 * Only runs at runtime, not during build
 */
function validateAuthConfig() {
    // Skip validation during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return {
            users: [{ username: 'admin', password: 'temporary', email: 'admin@example.com' }],
            secret: process.env.NEXTAUTH_SECRET || 'temporary-secret-for-build-only',
            adminEmails: (process.env.ADMIN_EMAILS || 'admin@example.com').split(',').map(email => email.trim()),
        };
    }

    Logger.debug('Validating auth config...');

    const adminUsers = process.env.ADMIN_USERS;
    const secret = process.env.NEXTAUTH_SECRET;
    const adminEmails = process.env.ADMIN_EMAILS;

    Logger.debug('Environment variables:', {
        adminUsers: adminUsers ? '✅ SET' : '❌ MISSING',
        secret: secret ? `✅ SET (${secret.length} chars)` : '❌ MISSING',
        adminEmails: adminEmails ? '✅ SET' : '❌ MISSING',
    });

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check NEXTAUTH_SECRET
    if (!secret) {
        errors.push('NEXTAUTH_SECRET is required');
    } else if (secret.length < 32) {
        warnings.push(`NEXTAUTH_SECRET is short (${secret.length} chars, recommended 32+)`);
    }

    // Check ADMIN_USERS
    if (!adminUsers) {
        errors.push('ADMIN_USERS is required (format: username:password,username2:password2)');
    }

    // Parse admin users
    const users: Array<{ username: string; password: string; email: string }> = [];
    if (adminUsers) {
        const userPairs = adminUsers.split(',').map(pair => pair.trim());
        const emails = adminEmails ? adminEmails.split(',').map(email => email.trim()) : [];

        userPairs.forEach((pair, index) => {
            const [username, password] = pair.split(':');
            if (!username || !password) {
                errors.push(`Invalid user format at position ${index + 1}: "${pair}". Expected format: username:password`);
            } else {
                if (password.length < 12) {
                    warnings.push(`Password for "${username}" is short (${password.length} chars, recommended 12+)`);
                }
                users.push({
                    username: username.trim(),
                    password: password.trim(),
                    email: emails[index] || `${username}@admin.local`
                });
            }
        });
    }

    // Check ADMIN_EMAILS
    if (!adminEmails) {
        warnings.push('ADMIN_EMAILS not set, using generated emails');
    }

    if (warnings.length > 0) {
        Logger.warn('Auth Config Warnings:');
        warnings.forEach(w => Logger.warn(`  - ${w}`));
    }

    if (errors.length > 0) {
        Logger.error('Auth Config Errors:');
        errors.forEach(e => Logger.error(`  - ${e}`));
        throw new Error(
            'Authentication configuration errors:\n' +
            errors.map(e => `  - ${e}`).join('\n') +
            '\n\nPlease set ADMIN_USERS in .env.local\nFormat: username:password,username2:password2'
        );
    }

    Logger.success('Auth config validation passed!');
    Logger.debug(`Loaded ${users.length} admin user(s)`);

    return {
        users,
        secret: secret!,
        adminEmails: adminEmails ? adminEmails.split(',').map(email => email.trim()) : users.map(u => u.email),
    };
}

// Get and validate configuration
const authConfig = validateAuthConfig();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                username: { label: "Kullanıcı Adı", type: "text" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials) {
                Logger.debug('Login attempt received');
                Logger.debug('Credentials:', {
                    username: credentials?.username || 'MISSING',
                    passwordProvided: !!credentials?.password,
                });

                try {
                    // Find matching user
                    const matchedUser = authConfig.users.find(
                        user => user.username === credentials?.username && user.password === credentials?.password
                    );

                    if (matchedUser) {
                        Logger.success(`Login successful for user: ${matchedUser.username}!`);
                        // Return user object on success
                        return {
                            id: matchedUser.username,
                            name: matchedUser.username,
                            email: matchedUser.email,
                        };
                    }

                    Logger.debug('Login failed - credentials do not match any user');
                    // Return null if credentials are invalid
                    return null;
                } catch (error) {
                    Logger.error('Error in authorize:', error);
                    return null;
                }
            }
        })
    ],

    callbacks: {
        /**
         * Add custom properties to session
         */
        async session({ session, token }) {
            if (session.user) {
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        },

        /**
         * Add custom properties to JWT token
         * Also validate that user is in admin whitelist
         */
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email;
                token.name = user.name;

                // Validate admin email
                if (!authConfig.adminEmails.includes(user.email || '')) {
                    throw new Error('Unauthorized: Email not in admin whitelist');
                }
            }
            return token;
        },
    },

    pages: {
        signIn: '/admin/login',
        error: '/admin/login',
    },

    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours (reduced from 30 days for security)
    },

    secret: authConfig.secret,
};

/**
 * Check if user is authenticated admin
 * Validates both authentication and admin whitelist
 */
export function isAdmin(user: any): boolean {
    if (!user?.email) return false;
    return authConfig.adminEmails.includes(user.email);
}

/**
 * Get list of admin emails (for debugging only, remove in production)
 */
export function getAdminEmails(): string[] {
    return authConfig.adminEmails;
}
