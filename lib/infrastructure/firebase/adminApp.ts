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
        console.warn('⚠️ Missing Firebase Admin credentials during build/CI. Using placeholder credentials.');
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

    // 1. Remove surrounding double or single quotes
    let formattedKey = privateKey.replace(/^['"]|['"]$/g, '');

    // 2. Unescape escaped newlines (e.g. "\\n" -> "\n")
    // This handles keys copied from JSON files or .env files that use literally escaped C-style newlines
    if (formattedKey.includes('\\n')) {
        formattedKey = formattedKey.replace(/\\n/g, '\n');
    }

    // 3. Handle keys that are single-line but missing real newlines (e.g. copy-paste error where newlines became spaces)
    // A valid PEM key must have lines of approx 64 chars, but sometimes it comes as a massive blob.
    // If it has spaces but NO newlines, we suspect space-conversion.
    if (formattedKey.indexOf('\n') === -1 && formattedKey.includes('PRIVATE KEY') && formattedKey.includes(' ')) {
        // Try to reconstruct standard PEM format
        // This is a heuristic: " KEY----- " -> " KEY-----\n"
        formattedKey = formattedKey
            .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
            .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');

        // If there are still lots of spaces in the middle (base64 part), replace them with newlines
        // Only do this if it looks like a blob with spaces
        const bodyStart = formattedKey.indexOf('\n');
        const bodyEnd = formattedKey.lastIndexOf('\n');
        if (bodyStart > -1 && bodyEnd > bodyStart) {
            const body = formattedKey.substring(bodyStart + 1, bodyEnd);
            // If body has spaces, replace with newlines or remove them?
            // Usually spaces inside base64 are line breaks.
            if (body.includes(' ')) {
                const newBody = body.replace(/ /g, '\n');
                formattedKey = formattedKey.replace(body, newBody);
            }
        }
    }

    // 4. Final safety check: if it doesn't look like a PEM, log a warning (obscured)
    if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
        const obscured = formattedKey.substring(0, 10) + '...' + formattedKey.substring(formattedKey.length - 10);
        console.error(`Invalid Private Key format detected! Starts with: ${obscured}`);
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

        // Skip init if using placeholders
        if (credentials.projectId === 'build-time-placeholder') {
            // Do nothing or mock app
        }

        adminApp = initializeApp({
            credential: cert(credentials),
        });

        Logger.success('Firebase Admin Initialized Successfully');
    } catch (error) {
        if (process.env.CI || process.env.VERCEL) {
            console.warn('⚠️ Firebase Admin failed to initialize (likely missing secrets in build). Ignoring for build.', error);
        } else {
            // Re-throw in runtime because we need this to work
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
export const adminDb: Firestore = getFirestore(adminApp);

/**
 * Export the admin app instance
 */
export { adminApp };
