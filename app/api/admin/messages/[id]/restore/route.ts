/**
 * /api/admin/messages/[id]/restore
 * 
 * Admin endpoint for restoring deleted messages
 */

import { NextResponse } from 'next/server';
import { getMessageService } from '@/lib/infrastructure/di/container';
import { requireAdmin } from '@/lib/utils/auth';

/**
 * POST /api/admin/messages/[id]/restore
 * 
 * Restore a soft-deleted message
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { id } = await params;

        const messageService = getMessageService();
        const restoredMessage = await messageService.restoreMessage(id);

        return NextResponse.json({
            success: true,
            data: restoredMessage,
            message: 'Mesaj başarıyla geri yüklendi',
        });
    } catch (error) {
        console.error('POST /api/admin/messages/[id]/restore error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Mesaj geri yüklenirken hata oluştu',
                },
            },
            { status: 400 }
        );
    }
}
