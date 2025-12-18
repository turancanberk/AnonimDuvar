/**
 * /api/messages
 * 
 * Public endpoint for messages
 * - GET: Fetch approved messages
 * - POST: Create new message
 * 
 * SECURITY:
 * - Rate limiting: 5 messages per hour per client
 * - Secure IP tracking with fingerprinting
 */

import { NextResponse } from 'next/server';
import { getMessageService } from '@/lib/infrastructure/di/container';
import { checkMessageRateLimit } from '@/lib/utils/rateLimit';
import { getClientIp, generateClientFingerprint } from '@/lib/utils/clientIdentification';

export const revalidate = 10;

/**
 * GET /api/messages
 * 
 * Fetch approved messages for public display
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        const messageService = getMessageService();
        const messages = await messageService.getApprovedMessages(limit, offset);

        return NextResponse.json({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error('GET /api/messages error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Mesajlar yüklenirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/messages
 * 
 * Create a new message (pending approval)
 * 
 * SECURITY:
 * - Rate limited to 5 messages per hour per client
 * - Client identified by fingerprint (IP + User-Agent + headers)
 */
export async function POST(request: Request) {
    try {
        // Get client identification
        const clientIp = getClientIp(request);
        const clientFingerprint = generateClientFingerprint(request);

        // Check rate limit
        const rateLimitResult = checkMessageRateLimit(clientFingerprint);

        if (!rateLimitResult.success) {
            const resetDate = new Date(rateLimitResult.reset);
            const waitMinutes = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60));

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: `Çok fazla mesaj gönderdiniz. Lütfen ${waitMinutes} dakika sonra tekrar deneyin.`,
                        code: 'RATE_LIMIT_EXCEEDED',
                        resetAt: resetDate.toISOString(),
                    },
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((resetDate.getTime() - Date.now()) / 1000)),
                    }
                }
            );
        }

        const body = await request.json();
        const { content, color, authorName } = body;

        const userAgent = request.headers.get('user-agent') || 'unknown';

        const messageService = getMessageService();

        const message = await messageService.createMessage({
            content,
            color,
            authorName,
            metadata: {
                ipAddress: clientIp,
                userAgent,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: message,
                message: 'Mesajınız başarıyla gönderildi! Admin onayından sonra yayınlanacak.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('POST /api/messages error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Mesaj gönderilirken hata oluştu',
                },
            },
            { status: 400 }
        );
    }
}
