/**
 * Comments API Route
 * 
 * Public API for comment operations (create, list).
 * Follows REST principles and clean architecture.
 */

import { NextRequest, NextResponse } from 'next/server';
import { FirestoreCommentRepository } from '@/lib/infrastructure/repositories/FirestoreCommentRepository';
import { CommentService, CommentError } from '@/lib/application/services/commentService';
import { COMMENT_SUCCESS_MESSAGES } from '@/lib/constants/commentConstants';

// Initialize repository and service (Dependency Injection)
const commentRepository = new FirestoreCommentRepository();
const commentService = new CommentService(commentRepository);

/**
 * GET /api/comments
 * Get comments for a specific message
 * 
 * Query params:
 * - messageId: string (required)
 * - limit: number (optional, default: 20)
 * - offset: number (optional, default: 0)
 * - sortBy: 'newest' | 'oldest' | 'most_liked' (optional, default: 'newest')
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const messageId = searchParams.get('messageId');

        if (!messageId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: 'messageId parametresi gerekli',
                        code: 'MISSING_MESSAGE_ID',
                    },
                },
                { status: 400 }
            );
        }

        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');
        const sortBy = searchParams.get('sortBy') as 'newest' | 'oldest' | 'most_liked' || 'newest';
        const status = searchParams.get('status') as 'PENDING' | 'APPROVED' | 'REJECTED' | null;

        const result = await commentService.getCommentsByMessageId(messageId, {
            limit,
            offset,
            sortBy,
            status: status || undefined, // Only include if specified
        });

        return NextResponse.json({
            success: true,
            data: result.comments,
            pagination: {
                total: result.total,
                limit,
                offset,
                hasMore: result.hasMore,
            },
        });
    } catch (error) {
        console.error('Error in GET /api/comments:', error);

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
                    message: 'Yorumlar yüklenirken bir hata oluştu',
                    code: 'INTERNAL_ERROR',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/comments
 * Create a new comment
 * 
 * Body:
 * - messageId: string (required)
 * - content: string (required, 1-500 chars)
 * - authorName: string (optional, 2-50 chars)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messageId, content, authorName } = body;

        // Get client IP address
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

        // Get user agent
        const userAgent = request.headers.get('user-agent') || undefined;

        // Create comment
        const comment = await commentService.createComment(
            {
                messageId,
                content,
                authorName,
            },
            {
                ipAddress: ip,
                userAgent,
            }
        );

        return NextResponse.json(
            {
                success: true,
                data: comment,
                message: COMMENT_SUCCESS_MESSAGES.CREATED,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/comments:', error);

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

        // Handle JSON parse errors
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
                    message: 'Yorum oluşturulurken bir hata oluştu',
                    code: 'INTERNAL_ERROR',
                },
            },
            { status: 500 }
        );
    }
}
