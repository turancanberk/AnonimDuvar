/**
 * /api/admin/deleted-messages
 * 
 * Admin endpoint for fetching deleted messages
 */

import { NextResponse } from 'next/server';
import { getMessageService } from '@/lib/infrastructure/di/container';
import { requireAdmin } from '@/lib/utils/auth';

/**
 * GET /api/admin/deleted-messages
 * 
 * Get all soft-deleted messages
 */
export async function GET(request: Request) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        const messageService = getMessageService();
        const messages = await messageService.getDeletedMessages(limit, offset);

        return NextResponse.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('GET /api/admin/deleted-messages error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Silinen mesajlar yüklenirken hata oluştu',
                },
            },
            { status: 400 }
        );
    }
}
