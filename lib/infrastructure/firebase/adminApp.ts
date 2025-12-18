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

    // Skip validation during build time
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return {
            projectId: projectId || 'build-time-placeholder',
            clientEmail: clientEmail || 'build@placeholder.com',
            privateKey: privateKey || 'build-time-placeholder-key',
        };
    }

    // Validate all required credentials are present
    if (!projectId || !clientEmail || !privateKey) {
        const missing = [];
        if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
        if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
        if (!privateKey) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');

        throw new Error(
            `Missing Firebase Admin credentials: ${missing.join(', ')}. ` +
            'Please set these environment variables in .env.local'
        );
    }

    // Replace escaped newlines in private key
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    return {
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey,
    };
}

/**
 * Initialize Firebase Admin App (Server-side)
 * Prevents multiple initializations
 */
let adminApp: App;

if (!getApps().length) {
    try {
        const credentials = getFirebaseCredentials();

        adminApp = initializeApp({
            credential: cert(credentials),
        });

        Logger.success('Firebase Admin Initialized Successfully');
    } catch (error) {
        Logger.error('Firebase Admin Initialization Error:', error);
        throw error;
    }
} else {
    adminApp = getApps()[0];
}

/**
 * Get Firestore Admin instance
 */
export const adminDb: Firestore = getFirestore(adminApp);

/**
 * Export the admin app instance
 */
export { adminApp };
