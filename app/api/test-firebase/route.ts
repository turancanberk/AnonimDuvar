import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';

export async function GET() {
    try {
        // Try to list collections just to test connection
        const collections = await adminDb.listCollections();
        const collectionIds = collections.map(col => col.id);

        return NextResponse.json({
            success: true,
            message: 'Firebase Admin connected successfully!',
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length,
            collections: collectionIds
        });
    } catch (error: any) {
        console.error('Firebase Connection Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to connect to Firebase Admin',
            error: error.message,
            stack: error.stack,
            envCheck: {
                projectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
                clientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY
            }
        }, { status: 500 });
    }
}
