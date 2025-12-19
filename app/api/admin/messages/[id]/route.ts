/**
 * /api/admin/messages/[id]
 * 
 * Admin endpoint for managing individual messages
 */

import { NextResponse } from 'next/server';
import { getMessageService } from '@/lib/infrastructure/di/container';
import { requireAdmin } from '@/lib/utils/auth';

/**
 * PATCH /api/admin/messages/[id]
 * 
 * Update message status (approve or reject)
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { id } = await params;
        const body = await request.json();
        const { status, moderatedBy, rejectionReason } = body;

        // Validate status
        if (status !== 'APPROVED' && status !== 'REJECTED') {
            throw new Error('Status must be APPROVED or REJECTED');
        }

        const messageService = getMessageService();
        const updatedMessage = await messageService.updateMessageStatus(id, {
            status,
            moderatedBy,
            rejectionReason,
        });

        return NextResponse.json({
            success: true,
            data: updatedMessage,
            message: `Mesaj başarıyla ${status === 'APPROVED' ? 'onaylandı' : 'reddedildi'}`,
        });
    } catch (error) {
        console.error('PATCH /api/admin/messages/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Mesaj güncellenirken hata oluştu',
                },
            },
            { status: 400 }
        );
    }
}

/**
 * DELETE /api/admin/messages/[id]
 * 
 * Soft delete a message
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin authentication
        const session = await requireAdmin();

        const { id } = await params;

        const messageService = getMessageService();
        await messageService.deleteMessage(id, session.user?.email || 'unknown');

        return NextResponse.json({
            success: true,
            data: { id },
            message: 'Mesaj başarıyla silindi',
        });
    } catch (error) {
        console.error('DELETE /api/admin/messages/[id] error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Mesaj silinirken hata oluştu',
                },
            },
            { status: 400 }
        );
    }
}
