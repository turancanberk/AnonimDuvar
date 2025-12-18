/**
 * /api/messages/[id]/interactions
 * 
 * Handle message interactions: like, dislike, report
 * 
 * SECURITY:
 * - Rate limiting: 30 interactions per minute per client
 * - Secure IP tracking with fingerprinting
 */

import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/lib/infrastructure/firebase/adminApp';
import { checkInteractionRateLimit } from '@/lib/utils/rateLimit';
import { getClientIp, generateClientFingerprint } from '@/lib/utils/clientIdentification';

const db = getFirestore(adminApp);

/**
 * POST /api/messages/[id]/interactions
 * 
 * Handle like, dislike, or report actions
 * 
 * SECURITY:
 * - Rate limited to 30 interactions per minute
 * - Client identified by fingerprint
 */
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get client identification
        const clientIp = getClientIp(request);
        const clientFingerprint = generateClientFingerprint(request);

        // Check rate limit
        const rateLimitResult = checkInteractionRateLimit(clientFingerprint);

        if (!rateLimitResult.success) {
            const resetDate = new Date(rateLimitResult.reset);
            const waitSeconds = Math.ceil((resetDate.getTime() - Date.now()) / 1000);

            return NextResponse.json(
                {
                    success: false,
                    error: {
                        message: `Çok fazla işlem yaptınız. Lütfen ${waitSeconds} saniye sonra tekrar deneyin.`,
                        code: 'RATE_LIMIT_EXCEEDED',
                    },
                },
                { status: 429 }
            );
        }

        // Await params in Next.js 15
        const { id } = await params;
        const body = await request.json();
        const { action, reason } = body; // action: 'like' | 'dislike' | 'report'

        if (!action || !['like', 'dislike', 'report'].includes(action)) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Geçersiz işlem' },
                },
                { status: 400 }
            );
        }

        // Get message
        const messageRef = db.collection('messages').doc(id);
        const messageDoc = await messageRef.get();

        if (!messageDoc.exists) {
            return NextResponse.json(
                {
                    success: false,
                    error: { message: 'Mesaj bulunamadı' },
                },
                { status: 404 }
            );
        }

        const messageData = messageDoc.data();
        const likedBy = messageData?.likedBy || [];
        const dislikedBy = messageData?.dislikedBy || [];
        const reports = messageData?.reports || [];

        const updateData: any = {};

        if (action === 'like') {
            // Toggle like
            if (likedBy.includes(clientFingerprint)) {
                // Remove like
                updateData.likedBy = likedBy.filter((fp: string) => fp !== clientFingerprint);
            } else {
                // Add like and remove dislike if exists
                updateData.likedBy = [...likedBy.filter((fp: string) => fp !== clientFingerprint), clientFingerprint];
                updateData.dislikedBy = dislikedBy.filter((fp: string) => fp !== clientFingerprint);
            }
        } else if (action === 'dislike') {
            // Toggle dislike
            if (dislikedBy.includes(clientFingerprint)) {
                // Remove dislike
                updateData.dislikedBy = dislikedBy.filter((fp: string) => fp !== clientFingerprint);
            } else {
                // Add dislike and remove like if exists
                updateData.dislikedBy = [...dislikedBy.filter((fp: string) => fp !== clientFingerprint), clientFingerprint];
                updateData.likedBy = likedBy.filter((fp: string) => fp !== clientFingerprint);
            }
        } else if (action === 'report') {
            // Add report
            if (!reason || reason.trim() === '') {
                return NextResponse.json(
                    {
                        success: false,
                        error: { message: 'Şikayet nedeni gereklidir' },
                    },
                    { status: 400 }
                );
            }

            // Check if already reported by this client
            const alreadyReported = reports.some((r: any) => r.reportedBy === clientFingerprint);
            if (alreadyReported) {
                return NextResponse.json(
                    {
                        success: false,
                        error: { message: 'Bu mesajı zaten şikayet ettiniz' },
                    },
                    { status: 400 }
                );
            }

            const newReport = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                reportedAt: new Date().toISOString(),
                reportedBy: clientFingerprint, // Use fingerprint instead of IP for privacy
                reportedByIp: clientIp, // Store IP separately for admin review
                reason: reason.trim(),
            };

            updateData.reports = [...reports, newReport];
        }

        // Update message
        await messageRef.update({
            ...updateData,
            updatedAt: new Date().toISOString(),
        });

        // Get updated data
        const updatedDoc = await messageRef.get();
        const updatedData = updatedDoc.data();

        return NextResponse.json({
            success: true,
            data: {
                likeCount: updatedData?.likedBy?.length || 0,
                dislikeCount: updatedData?.dislikedBy?.length || 0,
                reportCount: updatedData?.reports?.length || 0,
                userLiked: updatedData?.likedBy?.includes(clientFingerprint) || false,
                userDisliked: updatedData?.dislikedBy?.includes(clientFingerprint) || false,
            },
            message: action === 'report' ? 'Şikayetiniz alındı' : 'İşlem başarılı',
        });
    } catch (error) {
        console.error('POST /api/messages/[id]/interactions error:', error);

        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error instanceof Error ? error.message : 'İşlem sırasında hata oluştu',
                },
            },
            { status: 500 }
        );
    }
}
