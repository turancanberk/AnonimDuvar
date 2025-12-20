/**
 * Comment Interactions API Route
 * 
 * Handles comment interactions (like, dislike, report).
 * Route: /api/comments/[id]/interactions
 */

import { NextRequest, NextResponse } from 'next/server';
import { FirestoreCommentRepository } from '@/lib/infrastructure/repositories/FirestoreCommentRepository';
import { CommentService, CommentError } from '@/lib/application/services/commentService';
import { COMMENT_SUCCESS_MESSAGES } from '@/lib/constants/commentConstants';

// Initialize repository and service
const commentRepository = new FirestoreCommentRepository();
const commentService = new CommentService(commentRepository);

/**
 * POST /api/comments/[id]/interactions
 * Handle comment interactions
 * 
 * Body:
 * - action: 'like' | 'dislike' | 'report' (required)
 * - reason: string (required for report action)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { action, reason } = body;

        // Validate action
        if (!action || !['like', 'dislike', 'report'].includes(action)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Geçersiz aksiyon. like, dislike veya report olmalı',
                        code: 'INVALID_ACTION',
                    },
                },
                { status: 400 }
            );
        }

        // Get client IP address
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

        let updatedComment;

        switch (action) {
            case 'like':
                updatedComment = await commentService.likeComment(id, ip);
                break;

            case 'dislike':
                updatedComment = await commentService.dislikeComment(id, ip);
                break;

            case 'report':
                if (!reason || reason.trim().length === 0) {
                    return NextResponse.json(
                        {
                            success: false,
                            error: {
                                message: 'Raporlama için sebep gerekli',
                                code: 'MISSING_REASON',
                            },
                        },
                        { status: 400 }
                    );
                }

                updatedComment = await commentService.reportComment(id, ip, reason);
                break;

            default:
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

        // Prepare response data
        const responseData = {
            likeCount: updatedComment.likedBy?.length || 0,
            dislikeCount: updatedComment.dislikedBy?.length || 0,
            userLiked: updatedComment.likedBy?.includes(ip) || false,
            userDisliked: updatedComment.dislikedBy?.includes(ip) || false,
        };

        const message = action === 'report'
            ? COMMENT_SUCCESS_MESSAGES.REPORTED
            : `Yorum ${action === 'like' ? 'beğenildi' : 'beğenilmedi'}`;

        return NextResponse.json({
            success: true,
            data: responseData,
            message,
        });
    } catch (error) {
        console.error('Error in POST /api/comments/[id]/interactions:', error);

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

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Geçersiz JSON formatı',
                        code: 'INVALID_JSON',
                    },
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: 'İşlem sırasında bir hata oluştu',
                    code: 'INTERNAL_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
