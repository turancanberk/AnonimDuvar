/**
 * /api/admin/comments/statistics
 * 
 * Admin endpoint for comment statistics
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth';
import { FirestoreCommentRepository } from '@/lib/infrastructure/repositories/FirestoreCommentRepository';
import { CommentService } from '@/lib/application/services/commentService';

// Initialize repository and service
const commentRepository = new FirestoreCommentRepository();
const commentService = new CommentService(commentRepository);

/**
 * GET /api/admin/comments/statistics
 * 
 * Get comment statistics
 * Query params:
 * - messageId: string (optional, get stats for specific message)
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        const searchParams = request.nextUrl.searchParams;
        const messageId = searchParams.get('messageId');

        const filters = messageId ? { messageId } : undefined;
        const statistics = await commentService.getCommentStatistics(filters);

        return NextResponse.json({
            success: true,
            data: statistics,
        });
    } catch (error) {
        console.error('GET /api/admin/comments/statistics error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'İstatistikler yüklenirken hata oluştu',
                },
            },
            { status: error instanceof Error && error.message.includes('yetkisi') ? 403 : 500 }
        );
    }
}
