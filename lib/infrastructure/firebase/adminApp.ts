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
    // If we are missing keys during build, return dummy values to allow static generation to proceed
    // The app won't function, but the build will finish.
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true' ||
        process.env.VERCEL_ENV === 'production' ||
        !privateKey; // Fallback: if no key, assume we might be in build/CI

    if (isBuildPhase && (!projectId || !clientEmail || !privateKey)) {
        console.warn('⚠️ Missing Firebase Admin credentials during build/CI. Using placeholder credentials.');
        return {
            projectId: projectId || 'build-time-placeholder',
            clientEmail: clientEmail || 'build@placeholder.com',
            // Valid internal structure for a fake key to pass basic parsing if called
            privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADA...\n-----END PRIVATE KEY-----',
        };
    }

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            `Missing Firebase Admin credentials. Please check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.`
        );
    }

    // Sanitize Private Key
    // 1. Remove surrounding double or single quotes if present (common Vercel/env mistake)
    let formattedKey = privateKey.replace(/^['"]|['"]$/g, '');

    // 2. Handle escaped newlines (literal \n characters)
    if (formattedKey.includes('\\n')) {
        formattedKey = formattedKey.replace(/\\n/g, '\n');
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
let adminApp: App;

if (!getApps().length) {
    try {
        const credentials = getFirebaseCredentials();

        // If we are using placeholder credentials (build phase), don't actually try to connect if it's gonna fail
        if (credentials.projectId === 'build-time-placeholder') {
            // In build phase, we might just want to initialize with garbage to satisfy the type system
            // because we won't actually be fetching data from Firestore during build for dynamic routes.
            // But if we do, it will fail naturally.
        }

        adminApp = initializeApp({
            credential: cert(credentials),
        });

        Logger.success('Firebase Admin Initialized Successfully');
    } catch (error) {
        // If we are in a build environment, we don't want to crash.
        if (process.env.CI || process.env.VERCEL) {
            console.warn('⚠️ Firebase Admin failed to initialize (expected during build if secrets missing).', error);
            // We still need to assign something to adminApp to prevent "variable used before assignment"
            // But throwing is usually better so the dev knows why it failed at runtime.
            // For now, let's re-throw unless we really want to suppress it.
            // Suppressing it might hide real runtime errors.
            // Let's re-throw, but the helper above should have prevented invalid cert error if it was just missing keys.
            // If it's invalid format, we WANT to know.
        }
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
