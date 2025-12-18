/**
 * /api/admin/violation-reports
 * 
 * Admin endpoint for viewing violation reports
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/infrastructure/auth/nextAuthOptions';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';
import { Logger } from '@/lib/utils/logger';

/**
 * GET /api/admin/violation-reports
 * 
 * Fetch all violation reports
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

        // Parse query params for filtering
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Build query
        let query = adminDb.collection('violationReports').orderBy('createdAt', 'desc');

        if (status && ['PENDING', 'REVIEWED', 'RESOLVED'].includes(status)) {
            query = query.where('status', '==', status) as any;
        }

        const snapshot = await query.get();

        const reports = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt || new Date().toISOString(),
                reviewedAt: data.reviewedAt || null,
            };
        });

        Logger.info('Violation reports fetched:', reports.length);

        return NextResponse.json({
            success: true,
            data: reports,
        });
    } catch (error) {
        Logger.error('GET /api/admin/violation-reports error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Bildirimler yüklenirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}
