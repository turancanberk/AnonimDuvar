/**
 * /api/admin/comments
 * 
 * Admin endpoint for managing all comments
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth';
import { FirestoreCommentRepository } from '@/lib/infrastructure/repositories/FirestoreCommentRepository';
import { FirestoreMessageRepository } from '@/lib/infrastructure/repositories/FirestoreMessageRepository';
import { CommentService, CommentError } from '@/lib/application/services/commentService';
import { CommentStatus } from '@/lib/domain/entities/Comment';

// Initialize repositories and services
const commentRepository = new FirestoreCommentRepository();
const messageRepository = new FirestoreMessageRepository();
const commentService = new CommentService(commentRepository);

/**
 * GET /api/admin/comments
 * 
 * Fetch all comments with optional filtering
 * Query params:
 * - status: 'PENDING' | 'APPROVED' | 'REJECTED'
 * - messageId: string
 * - limit: number (default: 50)
 * - offset: number (default: 0)
 * - reported: boolean (only show reported comments)
 */
export async function GET(request: NextRequest) {
    try {
        // Require admin authentication
        await requireAdmin();

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') as CommentStatus | null;
        const messageId = searchParams.get('messageId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');
        const reported = searchParams.get('reported') === 'true';

        let result;

        if (reported) {
            // Get reported comments
            result = await commentService.getReportedComments({ limit, offset });
        } else {
            // Use findWithFilters with minimal filters
            const filters: any = {};
            if (status) {
                filters.status = status;
                // When filtering by status, exclude deleted comments
                filters.isDeleted = false;
            }
            if (messageId) filters.messageId = messageId;

            try {
                result = await commentRepository.findWithFilters(filters, { limit, offset });
            } catch (error) {
                console.error('findWithFilters error:', error);
                // Fallback: return empty result
                result = { comments: [], total: 0, hasMore: false };
            }
        }

        // Fetch message previews for all comments (with caching to avoid duplicate queries)
        let commentsWithPreviews = result.comments;

        try {
            const messageCache = new Map<string, string>();

            commentsWithPreviews = await Promise.all(
                result.comments.map(async (comment) => {
                    try {
                        // Check cache first
                        if (messageCache.has(comment.messageId)) {
                            return {
                                ...comment,
                                messagePreview: messageCache.get(comment.messageId)
                            };
                        }

                        const message = await messageRepository.findById(comment.messageId);
                        const preview = message
                            ? message.content.substring(0, 80) + (message.content.length > 80 ? '...' : '')
                            : 'Mesaj bulunamadı';

                        messageCache.set(comment.messageId, preview);

                        return {
                            ...comment,
                            messagePreview: preview
                        };
                    } catch (err) {
                        return {
                            ...comment,
                            messagePreview: 'Mesaj yüklenemedi'
                        };
                    }
                })
            );
        } catch (previewError) {
            console.error('Error fetching message previews:', previewError);
            // If preview fetching fails entirely, just return comments without previews
            commentsWithPreviews = result.comments.map(c => ({
                ...c,
                messagePreview: 'Önizleme yüklenemedi'
            }));
        }

        return NextResponse.json({
            success: true,
            data: commentsWithPreviews,
            pagination: {
                total: result.total,
                limit,
                offset,
                hasMore: result.hasMore,
            },
        });
    } catch (error) {
        console.error('GET /api/admin/comments error:', error);

        if (error instanceof CommentError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code,
                    },
                },
                { status: error.statusCode }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Yorumlar yüklenirken hata oluştu',
                },
            },
            { status: error instanceof Error && error.message.includes('yetkisi') ? 403 : 500 }
        );
    }
}

/**
 * POST /api/admin/comments
 * 
 * Batch operations on comments
 * Body:
 * - action: 'approve' | 'reject' | 'delete'
 * - commentIds: string[]
 * - reason: string (required for reject action)
 */
export async function POST(request: NextRequest) {
    try {
        // Require admin authentication
        const session = await requireAdmin();
        const adminEmail = session.user?.email || 'admin';

        const body = await request.json();
        const { action, commentIds, reason } = body;

        // Validate input
        if (!action || !['approve', 'reject', 'delete'].includes(action)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Geçersiz aksiyon',
                        code: 'INVALID_ACTION',
                    },
                },
                { status: 400 }
            );
        }

        if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Yorum ID\'leri gerekli',
                        code: 'MISSING_COMMENT_IDS',
                    },
                },
                { status: 400 }
            );
        }

        // Rejection reason is optional - use default if not provided
        const rejectionReason = action === 'reject'
            ? (reason && reason.trim().length > 0 ? reason.trim() : 'Toplu reddetme')
            : undefined;

        let count = 0;

        switch (action) {
            case 'approve':
                count = await commentService.batchApproveComments(commentIds, adminEmail);
                break;

            case 'reject':
                count = await commentService.batchRejectComments(commentIds, adminEmail, rejectionReason || 'Toplu reddetme');
                break;

            case 'delete':
                count = await commentService.batchDeleteComments(commentIds, adminEmail);
                break;
        }

        return NextResponse.json({
            success: true,
            data: {
                count,
                action,
            },
            message: `${count} yorum başarıyla ${action === 'approve' ? 'onaylandı' : action === 'reject' ? 'reddedildi' : 'silindi'}`,
        });
    } catch (error) {
        console.error('POST /api/admin/comments error:', error);

        if (error instanceof CommentError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code,
                    },
                },
                { status: error.statusCode }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'İşlem sırasında hata oluştu',
                },
            },
            { status: error instanceof Error && error.message.includes('yetkisi') ? 403 : 500 }
        );
    }
}
