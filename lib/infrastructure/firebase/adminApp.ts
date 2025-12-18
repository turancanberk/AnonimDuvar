/**
 * Firebase Admin Configuration
 * 
 * This file initializes Firebase Admin SDK for server-side usage.
 * Used in API routes and server components.
 * 
 * IMPORTANT: This should ONLY be used in server-side code.
 * Never import this in client components.
 * 
 * SECURITY: All credentials are loaded from environment variables.
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { Logger } from '@/lib/utils/logger';

/**
 * Validate and get Firebase Admin credentials from environment variables
 * Only validates at runtime, not during build
 */
function getFirebaseCredentials() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    // Special handling for Vercel Build Step
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true' ||
        process.env.VERCEL_ENV === 'production' ||
        !privateKey;

    if (isBuildPhase && (!projectId || !clientEmail || !privateKey)) {
        // Fallback for build time ONLY
        return {
            projectId: projectId || 'build-time-placeholder',
            clientEmail: clientEmail || 'build@placeholder.com',
            privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADA...\n-----END PRIVATE KEY-----',
        };
    }

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            `Missing Firebase Admin credentials. Please check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.`
        );
    }

    // --- AGGRESSIVE PRIVATE KEY SANITIZATION ---

    let formattedKey = privateKey.replace(/^['"]|['"]$/g, '');

    if (formattedKey.includes('\\n')) {
        formattedKey = formattedKey.replace(/\\n/g, '\n');
    }

    if (formattedKey.indexOf('\n') === -1 && formattedKey.includes('PRIVATE KEY') && formattedKey.includes(' ')) {
        formattedKey = formattedKey
            .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
            .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');

        const bodyStart = formattedKey.indexOf('\n');
        const bodyEnd = formattedKey.lastIndexOf('\n');
        if (bodyStart > -1 && bodyEnd > bodyStart) {
            const body = formattedKey.substring(bodyStart + 1, bodyEnd);
            if (body.includes(' ')) {
                const newBody = body.replace(/ /g, '\n');
                formattedKey = formattedKey.replace(body, newBody);
            }
        }
    }

    return {
        projectId,
        clientEmail,
        privateKey: formattedKey,
    };
}

/**
 * Initialize Firebase Admin App (Server-side)
 * Prevents multiple initializations
 */
let adminApp: App; // Declare variable

// Initialize logic
if (!getApps().length) {
    try {
        const credentials = getFirebaseCredentials();

        adminApp = initializeApp({
            credential: cert(credentials),
        });

        Logger.success('Firebase Admin Initialized Successfully');
    } catch (error) {
        // If there's an error, we MUST verify if we can recover or throw.
        // We cannot leave adminApp unassigned.

        // Check if maybe another request initialized it in parallel?
        if (getApps().length > 0) {
            adminApp = getApps()[0];
            Logger.warn('Firebase Admin init failed, but using existing app instance.');
        } else {
            // Unrecoverable error. We must throw to fail the build/request.
            // Leaving adminApp undefined would cause a confusing crash later.
            Logger.error('Firebase Admin Initialization Error:', error);
            throw error;
        }
    }
} else {
    adminApp = getApps()[0];
}

/**
 * Get Firestore Admin instance
 */
// Now adminApp is guaranteed to be assigned or we threw an error.
export const adminDb: Firestore = getFirestore(adminApp);

/**
 * Export the admin app instance
 */
export { adminApp };
