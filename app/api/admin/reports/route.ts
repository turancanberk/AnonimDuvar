/**
 * /api/admin/reports
 * 
 * Admin endpoint for viewing reported messages
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/infrastructure/auth/nextAuthOptions';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';
import { Logger } from '@/lib/utils/logger';

/**
 * GET /api/admin/reports
 * 
 * Fetch all messages that have been reported
 */
export async function GET(request: Request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Yetkisiz erişim' },
                },
                { status: 401 }
            );
        }

        // Fetch all messages and filter client-side
        // This avoids Firestore index issues with array queries
        const messagesSnapshot = await adminDb
            .collection('messages')
            .orderBy('createdAt', 'desc')
            .get();

        const reportedMessages = messagesSnapshot.docs
            .map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                    moderatedAt: data.moderatedAt?.toDate?.() || data.moderatedAt,
                } as any;
            })
            .filter((msg: any) => {
                // Filter messages that have reports array with at least one report
                return msg.reports && Array.isArray(msg.reports) && msg.reports.length > 0;
            });

        Logger.info('Reported messages found:', reportedMessages.length);

        return NextResponse.json({
            success: true,
            data: reportedMessages,
        });
    } catch (error) {
        Logger.error('GET /api/admin/reports error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Şikayetler yüklenirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}
