/**
 * Migration API Route: Add deletedAt field to existing comments
 * 
 * This endpoint adds the missing 'deletedAt: null' field to all existing
 * comment documents in Firestore.
 * 
 * Usage: GET /api/admin/comments/migrate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/infrastructure/auth/nextAuthOptions';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';

export async function GET(request: NextRequest) {
    try {
        // Check admin authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized - Admin access required' },
                { status: 401 }
            );
        }

        console.log('🚀 Starting migration: Adding deletedAt field to comments...');

        // Get all comments
        const commentsRef = adminDb.collection('comments');
        const snapshot = await commentsRef.get();

        if (snapshot.empty) {
            return NextResponse.json({
                success: true,
                message: 'No comments found in the database',
                stats: {
                    total: 0,
                    updated: 0,
                    skipped: 0,
                    errors: 0
                }
            });
        }

        console.log(`📊 Found ${snapshot.size} comment(s) to migrate.`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        // Process each comment
        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Check if deletedAt already exists
            if (data.deletedAt !== undefined) {
                console.log(`⏭️  Skipping ${doc.id} - deletedAt already exists`);
                skippedCount++;
                continue;
            }

            try {
                // Add deletedAt: null field
                await doc.ref.update({
                    deletedAt: null
                });

                console.log(`✅ Updated ${doc.id} - Added deletedAt: null`);
                updatedCount++;
            } catch (error) {
                const errorMsg = `Error updating ${doc.id}: ${error}`;
                console.error(`❌ ${errorMsg}`);
                errors.push(errorMsg);
                errorCount++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📈 Migration Summary:');
        console.log('='.repeat(50));
        console.log(`Total comments:     ${snapshot.size}`);
        console.log(`✅ Updated:         ${updatedCount}`);
        console.log(`⏭️  Skipped:         ${skippedCount}`);
        console.log(`❌ Errors:          ${errorCount}`);
        console.log('='.repeat(50));

        return NextResponse.json({
            success: true,
            message: 'Migration completed successfully',
            stats: {
                total: snapshot.size,
                updated: updatedCount,
                skipped: skippedCount,
                errors: errorCount
            },
            errorDetails: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        return NextResponse.json(
            {
                error: 'Migration failed',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
