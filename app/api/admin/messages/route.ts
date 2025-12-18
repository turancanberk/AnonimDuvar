/**
 * /api/admin/messages
 * 
 * Admin endpoint for managing all messages
 */

import { NextResponse } from 'next/server';
import { getMessageService } from '@/lib/infrastructure/di/container';
import { requireAdmin } from '@/lib/utils/auth';

/**
 * GET /api/admin/messages
 * 
 * Fetch all messages with optional filtering
 */
export async function GET(request: Request) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null;
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const messageService = getMessageService();
        const messages = await messageService.getAllMessages(
            status || undefined,
            limit,
            offset
        );

        return NextResponse.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('GET /api/admin/messages error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Mesajlar yüklenirken hata oluştu',
                },
            },
            { status: error instanceof Error && error.message.includes('yetkisi') ? 403 : 500 }
        );
    }
}
