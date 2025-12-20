/**
 * Firestore Comment Repository Implementation
 * 
 * Implements ICommentRepository using Firebase Admin SDK.
 * Follows Repository Pattern and SOLID principles.
 */

import {
    Timestamp,
    FieldValue,
    QueryDocumentSnapshot,
} from 'firebase-admin/firestore';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';
import { ICommentRepository, CommentFilters, CommentPaginationOptions, CommentListResult, CommentStatistics } from '@/lib/domain/repositories/ICommentRepository';
import { Comment, CommentStatus } from '@/lib/domain/entities/Comment';
import { COMMENT_COLLECTIONS, COMMENT_CONSTRAINTS, COMMENT_SORT_OPTIONS } from '@/lib/constants/commentConstants';

/**
 * Firestore implementation of Comment Repository
 * Follows Single Responsibility Principle - only handles data persistence
 */
export class FirestoreCommentRepository implements ICommentRepository {
    private db = adminDb;
    private readonly collectionName = COMMENT_COLLECTIONS.COMMENTS;

    /**
     * Convert Firestore document to Comment entity
     * Private helper method following DRY principle
     */
    private docToComment(doc: QueryDocumentSnapshot): Comment {
        const data = doc.data();

        return {
            id: doc.id,
            messageId: data.messageId,
            content: data.content,
            authorName: data.authorName,
            status: data.status as CommentStatus,

            // Handle Timestamp conversion
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),

            // Moderation info
            moderation: data.moderation ? {
                moderatedAt: data.moderation.moderatedAt?.toDate
                    ? data.moderation.moderatedAt.toDate()
                    : (data.moderation.moderatedAt ? new Date(data.moderation.moderatedAt) : undefined),
                moderatedBy: data.moderation.moderatedBy,
                rejectionReason: data.moderation.rejectionReason,
            } : undefined,

            // Metadata
            metadata: data.metadata || {},

            // Interactions
            likedBy: data.likedBy || [],
            dislikedBy: data.dislikedBy || [],
            reports: data.reports || [],

            // Soft delete
            deletedAt: data.deletedAt?.toDate
                ? data.deletedAt.toDate()
                : (data.deletedAt ? new Date(data.deletedAt) : undefined),
            deletedBy: data.deletedBy,

            // Reply support
            parentCommentId: data.parentCommentId,
            replyCount: data.replyCount || 0,
        };
    }

    /**
     * Sanitize data for Firestore (remove undefined values)
     * Private helper following DRY principle
     */
    private sanitizeData(data: Record<string, any>): Record<string, any> {
        return Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);
    }

    /**
     * Create a new comment
     */
    async create(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
        try {
            const now = Timestamp.now();

            const commentData = this.sanitizeData({
                messageId: comment.messageId,
                content: comment.content,
                authorName: comment.authorName,
                status: comment.status || 'PENDING',
                createdAt: now,
                updatedAt: now,
                moderation: comment.moderation,
                metadata: comment.metadata,
                likedBy: comment.likedBy || [],
                dislikedBy: comment.dislikedBy || [],
                reports: comment.reports || [],
                parentCommentId: comment.parentCommentId,
                replyCount: 0,
            });

            const docRef = await this.db.collection(this.collectionName).add(commentData);
            const newDoc = await docRef.get();

            return this.docToComment(newDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error creating comment:', error);
            throw new Error('Failed to create comment');
        }
    }

    /**
     * Find comment by ID
     */
    async findById(id: string): Promise<Comment | null> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return null;
            }

            return this.docToComment(docSnap as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error finding comment by ID:', error);
            throw new Error('Failed to find comment');
        }
    }

    /**
     * Find comments by message ID
     */
    async findByMessageId(
        messageId: string,
        options: CommentPaginationOptions = {}
    ): Promise<CommentListResult> {
        try {
            const limit = Math.min(
                options.limit || COMMENT_CONSTRAINTS.DEFAULT_COMMENTS_PER_PAGE,
                COMMENT_CONSTRAINTS.MAX_COMMENTS_PER_PAGE
            );
            const offset = options.offset || 0;
            const sortBy = options.sortBy || COMMENT_SORT_OPTIONS.NEWEST_FIRST;
            const status = options.status || 'APPROVED'; // Default to APPROVED for public API

            let query = this.db.collection(this.collectionName)
                .where('messageId', '==', messageId)
                .where('status', '==', status);

            // Apply sorting
            switch (sortBy) {
                case COMMENT_SORT_OPTIONS.NEWEST_FIRST:
                    query = query.orderBy('createdAt', 'desc');
                    break;
                case COMMENT_SORT_OPTIONS.OLDEST_FIRST:
                    query = query.orderBy('createdAt', 'asc');
                    break;
                case COMMENT_SORT_OPTIONS.MOST_LIKED:
                    // Note: Firestore doesn't support ordering by array length
                    // We'll fetch and sort in memory
                    query = query.orderBy('createdAt', 'desc');
                    break;
            }

            query = query.limit(limit * 2).offset(offset); // Fetch more to account for deleted

            const querySnapshot = await query.get();

            // Filter out deleted comments client-side
            let comments = querySnapshot.docs
                .map(doc => this.docToComment(doc))
                .filter(comment => !comment.deletedAt)
                .slice(0, limit); // Take only the limit we need

            // Sort by likes if needed
            if (sortBy === COMMENT_SORT_OPTIONS.MOST_LIKED) {
                comments = comments.sort((a, b) =>
                    (b.likedBy?.length || 0) - (a.likedBy?.length || 0)
                );
            }

            // Get total count excluding deleted comments
            // Note: We need to fetch and count client-side since Firestore doesn't support
            // count() with != null filter on deletedAt
            const countQuery = await this.db.collection(this.collectionName)
                .where('messageId', '==', messageId)
                .where('status', '==', status)
                .select('deletedAt') // Only fetch deletedAt field for efficiency
                .get();

            // Count only non-deleted comments
            const total = countQuery.docs.filter(doc => !doc.data().deletedAt).length;

            return {
                comments,
                total,
                hasMore: offset + comments.length < total,
            };
        } catch (error) {
            console.error('Error finding comments by message ID:', error);
            throw new Error('Failed to find comments');
        }
    }

    /**
     * Find comments with filters
     */
    async findWithFilters(
        filters: CommentFilters,
        options: CommentPaginationOptions = {}
    ): Promise<CommentListResult> {
        try {
            const limit = Math.min(
                options.limit || COMMENT_CONSTRAINTS.DEFAULT_COMMENTS_PER_PAGE,
                COMMENT_CONSTRAINTS.MAX_COMMENTS_PER_PAGE
            );
            const offset = options.offset || 0;

            let query = this.db.collection(this.collectionName) as FirebaseFirestore.Query;

            // Apply filters
            console.log('[FirestoreCommentRepository] findWithFilters called with:', filters);

            if (filters.messageId) {
                query = query.where('messageId', '==', filters.messageId);
                console.log('[FirestoreCommentRepository] Added messageId filter:', filters.messageId);
            }

            if (filters.status) {
                query = query.where('status', '==', filters.status);
                console.log('[FirestoreCommentRepository] Added status filter:', filters.status);
            }

            if (filters.authorName) {
                query = query.where('authorName', '==', filters.authorName);
            }

            if (filters.ipAddress) {
                query = query.where('metadata.ipAddress', '==', filters.ipAddress);
            }

            if (filters.moderatedBy) {
                query = query.where('moderation.moderatedBy', '==', filters.moderatedBy);
            }

            // Removed deletedAt filter to avoid Firestore composite index issues
            // Deleted comments will be filtered client-side if needed

            // Date range filters (requires composite index)
            if (filters.startDate) {
                query = query.where('createdAt', '>=', Timestamp.fromDate(filters.startDate));
            }

            if (filters.endDate) {
                query = query.where('createdAt', '<=', Timestamp.fromDate(filters.endDate));
            }

            // IMPORTANT: Firestore requires composite index for status + orderBy(createdAt)
            // To avoid this, we'll fetch without orderBy and sort client-side when status filter is present
            const needsClientSideSort = !!filters.status;

            if (needsClientSideSort) {
                // Fetch more to account for client-side sorting and pagination
                query = query.limit(limit * 3);
                console.log('[FirestoreCommentRepository] Using client-side sort (no orderBy in query)');
            } else {
                // Order and paginate normally
                query = query.orderBy('createdAt', 'desc').limit(limit).offset(offset);
                console.log('[FirestoreCommentRepository] Using server-side sort (orderBy in query)');
            }

            console.log('[FirestoreCommentRepository] Executing query...');
            const querySnapshot = await query.get();
            console.log('[FirestoreCommentRepository] Query returned', querySnapshot.docs.length, 'documents');

            let comments = querySnapshot.docs.map(doc => this.docToComment(doc));

            // Filter out deleted comments client-side if isDeleted filter was specified
            if (filters.isDeleted === false) {
                comments = comments.filter(c => !c.deletedAt);
                console.log('[FirestoreCommentRepository] After isDeleted=false filter:', comments.length);
            } else if (filters.isDeleted === true) {
                comments = comments.filter(c => !!c.deletedAt);
                console.log('[FirestoreCommentRepository] After isDeleted=true filter:', comments.length);
            }

            // Client-side sort and pagination if needed
            if (needsClientSideSort) {
                comments.sort((a, b) => {
                    const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
                    const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
                    return bTime - aTime;
                });
                comments = comments.slice(offset, offset + limit);
                console.log('[FirestoreCommentRepository] After client-side sort and pagination:', comments.length);
            }

            // Get total count with same filters
            let countQuery = this.db.collection(this.collectionName) as FirebaseFirestore.Query;

            if (filters.messageId) countQuery = countQuery.where('messageId', '==', filters.messageId);
            if (filters.status) countQuery = countQuery.where('status', '==', filters.status);
            // Removed deletedAt filter from count query to avoid index issues

            const totalSnapshot = await countQuery.count().get();
            const total = totalSnapshot.data().count;

            return {
                comments,
                total,
                hasMore: offset + comments.length < total,
            };
        } catch (error) {
            console.error('Error finding comments with filters:', error);
            throw new Error('Failed to find comments');
        }
    }

    /**
     * Update comment status
     */
    async updateStatus(
        id: string,
        status: CommentStatus,
        moderatedBy?: string,
        rejectionReason?: string
    ): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            const updateData = this.sanitizeData({
                status,
                'moderation.moderatedAt': Timestamp.now(),
                'moderation.moderatedBy': moderatedBy,
                'moderation.rejectionReason': rejectionReason,
                updatedAt: Timestamp.now(),
            });

            await docRef.update(updateData);

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found after update');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error updating comment status:', error);
            throw new Error('Failed to update comment status');
        }
    }

    /**
     * Update comment content
     */
    async updateContent(id: string, content: string): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            await docRef.update({
                content,
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found after update');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error updating comment content:', error);
            throw new Error('Failed to update comment content');
        }
    }

    /**
     * Soft delete comment
     */
    async softDelete(id: string, deletedBy: string): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            await docRef.update({
                deletedAt: Timestamp.now(),
                deletedBy,
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found after soft delete');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error soft deleting comment:', error);
            throw new Error('Failed to soft delete comment');
        }
    }

    /**
     * Hard delete comment (permanent)
     */
    async hardDelete(id: string): Promise<void> {
        try {
            await this.db.collection(this.collectionName).doc(id).delete();
        } catch (error) {
            console.error('Error hard deleting comment:', error);
            throw new Error('Failed to hard delete comment');
        }
    }

    /**
     * Restore soft-deleted comment
     */
    async restore(id: string): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            await docRef.update({
                deletedAt: FieldValue.delete(),
                deletedBy: FieldValue.delete(),
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found after restore');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error restoring comment:', error);
            throw new Error('Failed to restore comment');
        }
    }

    /**
     * Add like to comment
     */
    async addLike(id: string, ipAddress: string): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            await docRef.update({
                likedBy: FieldValue.arrayUnion(ipAddress),
                dislikedBy: FieldValue.arrayRemove(ipAddress), // Remove from dislikes if exists
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error adding like:', error);
            throw new Error('Failed to add like');
        }
    }

    /**
     * Remove like from comment
     */
    async removeLike(id: string, ipAddress: string): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            await docRef.update({
                likedBy: FieldValue.arrayRemove(ipAddress),
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error removing like:', error);
            throw new Error('Failed to remove like');
        }
    }

    /**
     * Add dislike to comment
     */
    async addDislike(id: string, ipAddress: string): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            await docRef.update({
                dislikedBy: FieldValue.arrayUnion(ipAddress),
                likedBy: FieldValue.arrayRemove(ipAddress), // Remove from likes if exists
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error adding dislike:', error);
            throw new Error('Failed to add dislike');
        }
    }

    /**
     * Remove dislike from comment
     */
    async removeDislike(id: string, ipAddress: string): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            await docRef.update({
                dislikedBy: FieldValue.arrayRemove(ipAddress),
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error removing dislike:', error);
            throw new Error('Failed to remove dislike');
        }
    }

    /**
     * Add report to comment
     */
    async addReport(id: string, report: { reportedBy: string; reason: string }): Promise<Comment> {
        try {
            const docRef = this.db.collection(this.collectionName).doc(id);

            const reportData = {
                id: `${id}_${Date.now()}`,
                reportedAt: Timestamp.now(),
                reportedBy: report.reportedBy,
                reason: report.reason,
            };

            await docRef.update({
                reports: FieldValue.arrayUnion(reportData),
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Comment not found');
            }

            return this.docToComment(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error adding report:', error);
            throw new Error('Failed to add report');
        }
    }

    /**
     * Get comment count by message ID
     */
    async getCountByMessageId(messageId: string): Promise<number> {
        try {
            // Fetch documents and filter client-side to exclude deleted comments
            const snapshot = await this.db.collection(this.collectionName)
                .where('messageId', '==', messageId)
                .where('status', '==', 'APPROVED')
                .select('deletedAt') // Only fetch deletedAt field for efficiency
                .get();

            // Count only non-deleted comments
            return snapshot.docs.filter(doc => !doc.data().deletedAt).length;
        } catch (error) {
            console.error('Error getting comment count:', error);
            return 0;
        }
    }

    /**
     * Get comment statistics
     */
    async getStatistics(filters: Partial<CommentFilters> = {}): Promise<CommentStatistics> {
        try {
            let baseQuery = this.db.collection(this.collectionName) as FirebaseFirestore.Query;

            // Apply base filters if provided
            if (filters.messageId) {
                baseQuery = baseQuery.where('messageId', '==', filters.messageId);
            }

            // Fetch all comments to count accurately (excluding deleted from status counts)
            const allDocsSnapshot = await baseQuery.select('status', 'deletedAt', 'reports', 'createdAt').get();

            let total = 0;
            let pending = 0;
            let approved = 0;
            let rejected = 0;
            let deleted = 0;
            let reported = 0;
            let todayCount = 0;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            allDocsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const isDeleted = !!data.deletedAt;

                total++;

                if (isDeleted) {
                    deleted++;
                } else {
                    // Only count non-deleted comments for status
                    switch (data.status) {
                        case 'PENDING':
                            pending++;
                            break;
                        case 'APPROVED':
                            approved++;
                            break;
                        case 'REJECTED':
                            rejected++;
                            break;
                    }
                }

                // Count reported (including deleted)
                if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
                    reported++;
                }

                // Count today's comments
                const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                if (createdAt >= today) {
                    todayCount++;
                }
            });

            return {
                total,
                pending,
                approved,
                rejected,
                reported,
                deletedCount: deleted,
                todayCount,
            };
        } catch (error) {
            console.error('Error getting comment statistics:', error);
            return {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
                reported: 0,
                deletedCount: 0,
                todayCount: 0,
            };
        }
    }

    /**
     * Batch approve comments
     */
    async batchApprove(ids: string[], moderatedBy: string): Promise<number> {
        try {
            const batch = this.db.batch();
            const now = Timestamp.now();

            ids.forEach(id => {
                const docRef = this.db.collection(this.collectionName).doc(id);
                batch.update(docRef, {
                    status: 'APPROVED',
                    'moderation.moderatedAt': now,
                    'moderation.moderatedBy': moderatedBy,
                    updatedAt: now,
                });
            });

            await batch.commit();
            return ids.length;
        } catch (error) {
            console.error('Error batch approving comments:', error);
            throw new Error('Failed to batch approve comments');
        }
    }

    /**
     * Batch reject comments
     */
    async batchReject(ids: string[], moderatedBy: string, reason: string): Promise<number> {
        try {
            const batch = this.db.batch();
            const now = Timestamp.now();

            ids.forEach(id => {
                const docRef = this.db.collection(this.collectionName).doc(id);
                batch.update(docRef, {
                    status: 'REJECTED',
                    'moderation.moderatedAt': now,
                    'moderation.moderatedBy': moderatedBy,
                    'moderation.rejectionReason': reason,
                    updatedAt: now,
                });
            });

            await batch.commit();
            return ids.length;
        } catch (error) {
            console.error('Error batch rejecting comments:', error);
            throw new Error('Failed to batch reject comments');
        }
    }

    /**
     * Batch delete comments
     */
    async batchDelete(ids: string[], deletedBy: string): Promise<number> {
        try {
            const batch = this.db.batch();
            const now = Timestamp.now();

            ids.forEach(id => {
                const docRef = this.db.collection(this.collectionName).doc(id);
                batch.update(docRef, {
                    deletedAt: now,
                    deletedBy,
                    updatedAt: now,
                });
            });

            await batch.commit();
            return ids.length;
        } catch (error) {
            console.error('Error batch deleting comments:', error);
            throw new Error('Failed to batch delete comments');
        }
    }

    /**
     * Get comments that need moderation
     */
    async getPendingModeration(options: CommentPaginationOptions = {}): Promise<CommentListResult> {
        return this.findWithFilters(
            { status: 'PENDING', isDeleted: false },
            options
        );
    }

    /**
     * Get reported comments
     */
    async getReported(options: CommentPaginationOptions = {}): Promise<CommentListResult> {
        try {
            const limit = Math.min(
                options.limit || COMMENT_CONSTRAINTS.DEFAULT_COMMENTS_PER_PAGE,
                COMMENT_CONSTRAINTS.MAX_COMMENTS_PER_PAGE
            );
            const offset = options.offset || 0;

            // Fetch comments and filter for those with reports client-side
            // This avoids Firestore composite index requirements
            const querySnapshot = await this.db.collection(this.collectionName)
                .orderBy('createdAt', 'desc')
                .limit(200) // Fetch more to find reported ones
                .get();

            // Filter for reported comments client-side
            let allReported = querySnapshot.docs
                .map(doc => this.docToComment(doc))
                .filter(comment => !comment.deletedAt && comment.reports && comment.reports.length > 0);

            // Sort by report count (most reported first)
            allReported.sort((a, b) => (b.reports?.length || 0) - (a.reports?.length || 0));

            const total = allReported.length;
            const comments = allReported.slice(offset, offset + limit);

            return {
                comments,
                total,
                hasMore: offset + comments.length < total,
            };
        } catch (error) {
            console.error('Error getting reported comments:', error);
            throw new Error('Failed to get reported comments');
        }
    }

    /**
     * Check if user has exceeded rate limit
     */
    async checkRateLimit(ipAddress: string, messageId?: string): Promise<{ allowed: boolean; remainingTime?: number }> {
        try {
            const now = new Date();
            const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

            // Check global rate limit (5 comments per 10 minutes)
            const globalQuery = await this.db.collection(this.collectionName)
                .where('metadata.ipAddress', '==', ipAddress)
                .where('createdAt', '>=', Timestamp.fromDate(tenMinutesAgo))
                .count()
                .get();

            const globalCount = globalQuery.data().count;

            if (globalCount >= COMMENT_CONSTRAINTS.MAX_COMMENTS_PER_USER_PER_10_MIN) {
                return {
                    allowed: false,
                    remainingTime: 10 * 60 * 1000, // 10 minutes in ms
                };
            }

            // Check per-message rate limit if messageId provided
            if (messageId) {
                const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

                const messageQuery = await this.db.collection(this.collectionName)
                    .where('messageId', '==', messageId)
                    .where('metadata.ipAddress', '==', ipAddress)
                    .where('createdAt', '>=', Timestamp.fromDate(oneHourAgo))
                    .count()
                    .get();

                const messageCount = messageQuery.data().count;

                if (messageCount >= COMMENT_CONSTRAINTS.MAX_COMMENTS_PER_MESSAGE_PER_HOUR) {
                    return {
                        allowed: false,
                        remainingTime: 60 * 60 * 1000, // 1 hour in ms
                    };
                }
            }

            return { allowed: true };
        } catch (error) {
            console.error('Error checking rate limit:', error);
            // On error, allow the comment (fail open)
            return { allowed: true };
        }
    }
}
