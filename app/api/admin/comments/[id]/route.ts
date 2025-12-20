/**
 * /api/admin/comments/[id]
 * 
 * Admin endpoint for managing individual comments
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/utils/auth';
import { FirestoreCommentRepository } from '@/lib/infrastructure/repositories/FirestoreCommentRepository';
import { CommentService, CommentError } from '@/lib/application/services/commentService';
import { COMMENT_SUCCESS_MESSAGES } from '@/lib/constants/commentConstants';

// Initialize repository and service
const commentRepository = new FirestoreCommentRepository();
const commentService = new CommentService(commentRepository);

/**
 * GET /api/admin/comments/[id]
 * 
 * Get a specific comment by ID
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin authentication
        await requireAdmin();

        const { id } = await params;
        const comment = await commentService.getCommentById(id);

        return NextResponse.json({
            success: true,
            data: comment,
        });
    } catch (error) {
        console.error('GET /api/admin/comments/[id] error:', error);

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
                    message: 'Yorum yüklenirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/comments/[id]
 * 
 * Update comment status (approve/reject)
 * Body:
 * - action: 'approve' | 'reject' | 'restore'
 * - reason: string (required for reject action)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin authentication
        const session = await requireAdmin();
        const adminEmail = session.user?.email || 'admin';

        const { id } = await params;
        const body = await request.json();
        const { action, reason } = body;

        // Validate action
        if (!action || !['approve', 'reject', 'restore'].includes(action)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'Geçersiz aksiyon. approve, reject veya restore olmalı',
                        code: 'INVALID_ACTION',
                    },
                },
                { status: 400 }
            );
        }

        let updatedComment;
        let message;

        switch (action) {
            case 'approve':
                updatedComment = await commentService.approveComment(id, adminEmail);
                message = COMMENT_SUCCESS_MESSAGES.APPROVED;
                break;

            case 'reject':
                // Reason is now optional
                updatedComment = await commentService.rejectComment(
                    id,
                    adminEmail,
                    reason || 'Yönetici tarafından reddedildi'
                );
                message = COMMENT_SUCCESS_MESSAGES.REJECTED;
                break;

            case 'restore':
                updatedComment = await commentService.restoreComment(id);
                message = 'Yorum geri yüklendi';
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

        return NextResponse.json({
            success: true,
            data: updatedComment,
            message,
        });
    } catch (error) {
        console.error('PATCH /api/admin/comments/[id] error:', error);

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
                    message: 'Yorum güncellenirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/comments/[id]
 * 
 * Delete a comment (soft delete)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Require admin authentication
        const session = await requireAdmin();
        const adminEmail = session.user?.email || 'admin';

        const { id } = await params;
        const deletedComment = await commentService.deleteComment(id, adminEmail);

        return NextResponse.json({
            success: true,
            data: deletedComment,
            message: COMMENT_SUCCESS_MESSAGES.DELETED,
        });
    } catch (error) {
        console.error('DELETE /api/admin/comments/[id] error:', error);

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
                    message: 'Yorum silinirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}
