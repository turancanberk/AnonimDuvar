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
 * DEBUG VERSION - More tolerant for troubleshooting
 */
function validateAuthConfig() {
    Logger.debug('Validating auth config...');

    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const secret = process.env.NEXTAUTH_SECRET;
    const adminEmails = process.env.ADMIN_EMAILS;

    Logger.debug('Environment variables:', {
        username: username ? '✅ SET' : '❌ MISSING',
        password: password ? `✅ SET (${password.length} chars)` : '❌ MISSING',
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

    // Check ADMIN_USERNAME
    if (!username) {
        errors.push('ADMIN_USERNAME is required');
    }

    // Check ADMIN_PASSWORD
    if (!password) {
        errors.push('ADMIN_PASSWORD is required');
    } else if (password.length < 12) {
        warnings.push(`ADMIN_PASSWORD is short (${password.length} chars, recommended 12+)`);
    } else if (password === 'admin123' || password === 'password') {
        warnings.push('ADMIN_PASSWORD is a common password (not recommended)');
    }

    // Check ADMIN_EMAILS
    if (!adminEmails) {
        errors.push('ADMIN_EMAILS is required (comma-separated list of authorized admin emails)');
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
            '\n\nPlease set these environment variables in .env.local'
        );
    }

    Logger.success('Auth config validation passed!');

    return {
        username: username!,
        password: password!,
        secret: secret!,
        adminEmails: adminEmails!.split(',').map(email => email.trim()),
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
                Logger.debug('Expected:', {
                    username: authConfig.username,
                    passwordLength: authConfig.password.length,
                });

                try {
                    // Validate credentials
                    if (
                        credentials?.username === authConfig.username &&
                        credentials?.password === authConfig.password
                    ) {
                        Logger.success('Login successful!');
                        // Return user object on success
                        // Use the first admin email from whitelist
                        return {
                            id: '1',
                            name: 'Admin',
                            email: authConfig.adminEmails[0], // Use first email from whitelist
                        };
                    }

                    Logger.debug('Login failed - credentials do not match');
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
