/**
 * Firebase Admin Configuration
 * 
 * This file initializes Firebase Admin SDK for server-side usage.
 * Used in API routes and server components.
 * 
 * IMPORTANT: This should ONLY be used in server-side code.
 * Never import this in client components.
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { Logger } from '@/lib/utils/logger';

// Mock Firestore for Build Time to prevent crashes
const createMockFirestore = (): Firestore => {
    return {
        collection: () => ({
            doc: () => ({
                get: async () => ({ exists: false, data: () => ({}) }),
                set: async () => { },
                update: async () => { },
                delete: async () => { },
            }),
            where: () => ({ get: async () => ({ docs: [], empty: true }) }),
            orderBy: () => ({ get: async () => ({ docs: [], empty: true }) }),
            limit: () => ({ get: async () => ({ docs: [], empty: true }) }),
            get: async () => ({ docs: [], empty: true }),
            add: async () => ({ id: 'mock-id' }),
        }),
    } as unknown as Firestore;
};

function getFirebaseCredentials() {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    // BUILD PHASE CHECK: If we are building, return null to signal skipping init
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' ||
        process.env.CI === 'true' ||
        process.env.VERCEL_ENV === 'production' ||
        !privateKey;

    if (isBuildPhase && (!projectId || !clientEmail || !privateKey)) {
        console.warn('⚠️ Build phase detected with missing credentials. Using Mock Firestore.');
        return null;
    }

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase Admin credentials.');
    }

    // --- ROBUST PRIVATE KEY SANITIZATION ---
    let formattedKey = privateKey;

    // 1. Remove surrounding quotes (single or double)
    formattedKey = formattedKey.replace(/^['"]|['"]$/g, '');

    // 2. Handle different newline formats
    // Check if key contains literal \n characters (as string, not newline)
    if (formattedKey.includes('\\n') && !formattedKey.includes('\n')) {
        // Case: "-----BEGIN PRIVATE KEY-----\nMIIE..." (escaped newlines)
        formattedKey = formattedKey.replace(/\\n/g, '\n');
    } else if (formattedKey.includes('\\\\n')) {
        // Case: "-----BEGIN PRIVATE KEY-----\\nMIIE..." (double-escaped)
        formattedKey = formattedKey.replace(/\\\\n/g, '\n');
    }
    // If already contains real newlines, no transformation needed

    // 3. Validate key format
    if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error('Invalid private key format: Missing BEGIN marker');
    }

    return {
        projectId,
        clientEmail,
        privateKey: formattedKey,
    };
}

let adminApp: App | null = null;
let adminDb: Firestore;

// Initialize
try {
    if (!getApps().length) {
        const credentials = getFirebaseCredentials();

        if (credentials) {
            adminApp = initializeApp({
                credential: cert(credentials),
            });
            adminDb = getFirestore(adminApp);
            Logger.success('Firebase Admin Initialized Successfully');
        } else {
            // Build Mode: Use Mock DB
            adminDb = createMockFirestore();
        }
    } else {
        adminApp = getApps()[0];
        adminDb = getFirestore(adminApp);
    }
} catch (error) {
    console.error('Firebase Admin Init Error:', error);
    // Fallback to Mock DB on error to keep app alive
    adminDb = createMockFirestore();
}

/**
 * Export the admin db instance
 */
export { adminDb, adminApp };
