/**
 * /api/admin/violation-reports/[id]
 * 
 * Admin endpoint for managing individual violation reports
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/infrastructure/auth/nextAuthOptions';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';
import { Logger } from '@/lib/utils/logger';

/**
 * PATCH /api/admin/violation-reports/[id]
 * 
 * Update violation report status and add admin notes
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        const body = await request.json();
        const { status, adminNotes } = body;

        // Validation
        if (status && !['PENDING', 'REVIEWED', 'RESOLVED'].includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Geçersiz durum' },
                },
                { status: 400 }
            );
        }

        // Update report
        const reportRef = adminDb.collection('violationReports').doc(id);
        const reportDoc = await reportRef.get();

        if (!reportDoc.exists) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Bildirim bulunamadı' },
                },
                { status: 404 }
            );
        }

        const updateData: any = {};

        if (status) {
            updateData.status = status;
            updateData.reviewedAt = new Date().toISOString();
            updateData.reviewedBy = session.user?.email;
        }

        if (adminNotes !== undefined) {
            updateData.adminNotes = adminNotes;
        }

        await reportRef.update(updateData);

        Logger.info(`Violation report ${id} updated by ${session.user?.email}`);

        return NextResponse.json({
            success: true,
            message: 'Bildirim güncellendi',
        });
    } catch (error) {
        Logger.error('PATCH /api/admin/violation-reports/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Güncelleme sırasında hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/violation-reports/[id]
 * 
 * Delete a violation report
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;

        // Delete report
        const reportRef = adminDb.collection('violationReports').doc(id);
        const reportDoc = await reportRef.get();

        if (!reportDoc.exists) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Bildirim bulunamadı' },
                },
                { status: 404 }
            );
        }

        await reportRef.delete();

        Logger.info(`Violation report ${id} deleted by ${session.user?.email}`);

        return NextResponse.json({
            success: true,
            message: 'Bildirim silindi',
        });
    } catch (error) {
        Logger.error('DELETE /api/admin/violation-reports/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Silme sırasında hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}
