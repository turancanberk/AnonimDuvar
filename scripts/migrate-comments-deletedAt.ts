/**
 * Migration Script: Add deletedAt field to existing comments
 * 
 * This script adds the missing 'deletedAt: null' field to all existing
 * comment documents in Firestore. This is required for the admin panel
 * queries to work correctly.
 * 
 * Run with: npx ts-node scripts/migrate-comments-deletedAt.ts
 * 
 * Make sure FIREBASE_SERVICE_ACCOUNT_KEY is set in your environment
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = admin.firestore();

async function migrateComments() {
    console.log('🚀 Starting migration: Adding deletedAt field to comments...\n');

    try {
        // Get all comments
        const commentsRef = db.collection('comments');
        const snapshot = await commentsRef.get();

        if (snapshot.empty) {
            console.log('❌ No comments found in the database.');
            return;
        }

        console.log(`📊 Found ${snapshot.size} comment(s) to migrate.\n`);

        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

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
                console.error(`❌ Error updating ${doc.id}:`, error);
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

        if (updatedCount > 0) {
            console.log('\n✨ Migration completed successfully!');
            console.log('🎉 Admin panel should now display all comments correctly.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
migrateComments()
    .then(() => {
        console.log('\n👋 Migration script finished.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration script failed:', error);
        process.exit(1);
    });
