/**
 * /api/admin/statistics
 * 
 * Admin endpoint for message statistics
 */

import { NextResponse } from 'next/server';
import { getMessageService } from '@/lib/infrastructure/di/container';
import { requireAdmin } from '@/lib/utils/auth';

/**
 * GET /api/admin/statistics
 * 
 * Fetch message statistics (counts by status)
 */
export async function GET(request: Request) {
    try {
        // Require admin authentication
        await requireAdmin();

        const messageService = getMessageService();
        const stats = await messageService.getMessageStats();

        return NextResponse.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('GET /api/admin/statistics error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'İstatistikler yüklenirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}
