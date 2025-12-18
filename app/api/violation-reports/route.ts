/**
 * /api/violation-reports
 * 
 * Public endpoint for submitting violation reports
 */

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';
import { checkViolationReportRateLimit } from '@/lib/utils/rateLimit';
import { getClientIp, generateClientFingerprint } from '@/lib/utils/clientIdentification';
import { ViolationReportType } from '@/lib/domain/entities/ViolationReport';

const VALID_REPORT_TYPES: ViolationReportType[] = [
    'HATE_SPEECH',
    'VIOLENCE',
    'SPAM',
    'ILLEGAL',
    'PERSONAL_INFO',
    'ADULT_CONTENT',
    'OTHER',
];

/**
 * POST /api/violation-reports
 * 
 * Submit a new violation report
 * 
 * SECURITY:
 * - Rate limited to 5 reports per hour per client
 * - Client identified by fingerprint
 */
export async function POST(request: Request) {
    try {
        // Get client identification
        const clientIp = getClientIp(request);
        const clientFingerprint = generateClientFingerprint(request);

        // Check rate limit
        const rateLimitResult = checkViolationReportRateLimit(clientFingerprint);

        if (!rateLimitResult.success) {
            const resetDate = new Date(rateLimitResult.reset);
            const waitMinutes = Math.ceil((resetDate.getTime() - Date.now()) / 60000);

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: `Çok fazla bildirim gönderdiniz. Lütfen ${waitMinutes} dakika sonra tekrar deneyin.`,
                        code: 'RATE_LIMIT_EXCEEDED',
                    },
                },
                { status: 429 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { type, description, url, messageId } = body;

        // Validation
        if (!type || !VALID_REPORT_TYPES.includes(type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Geçersiz bildirim türü' },
                },
                { status: 400 }
            );
        }

        if (!description || typeof description !== 'string' || description.trim().length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Açıklama gereklidir' },
                },
                { status: 400 }
            );
        }

        if (description.length > 1000) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Açıklama çok uzun (maksimum 1000 karakter)' },
                },
                { status: 400 }
            );
        }

        // Create violation report
        const reportData = {
            type,
            description: description.trim(),
            url: url || null,
            messageId: messageId || null,
            status: 'PENDING',
            reportedBy: clientFingerprint,
            reportedByIp: clientIp,
            createdAt: new Date().toISOString(),
        };

        const docRef = await adminDb.collection('violationReports').add(reportData);

        return NextResponse.json({
            success: true,
            data: {
                id: docRef.id,
            },
            message: 'Bildiriminiz alındı. En kısa sürede incelenecektir.',
        });
    } catch (error) {
        console.error('POST /api/violation-reports error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'Bildirim gönderilirken hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}
