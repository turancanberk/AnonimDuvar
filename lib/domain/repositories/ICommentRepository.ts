/**
 * Comment Repository Interface
 * 
 * Defines the contract for comment data access.
 * Follows Interface Segregation Principle and Dependency Inversion Principle.
 * Implementations can be swapped without affecting business logic.
 */

import { Comment, CommentStatus } from '@/lib/domain/entities/Comment';
import { CommentSortOption } from '@/lib/constants/commentConstants';

export interface CommentFilters {
    messageId?: string;
    status?: CommentStatus;
    authorName?: string;
    ipAddress?: string;
    moderatedBy?: string;
    startDate?: Date;
    endDate?: Date;
    isDeleted?: boolean;
}

export interface CommentPaginationOptions {
    limit?: number;
    offset?: number;
    sortBy?: CommentSortOption;
    status?: CommentStatus; // Filter by status
}

export interface CommentListResult {
    comments: Comment[];
    total: number;
    hasMore: boolean;
}

export interface CommentStatistics {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    reported: number;
    deletedCount: number;
    todayCount: number;
}

/**
 * Repository interface for Comment entity
 * Following Repository Pattern and Interface Segregation Principle
 */
export interface ICommentRepository {
    /**
     * Create a new comment
     */
    create(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment>;

    /**
     * Find comment by ID
     */
    findById(id: string): Promise<Comment | null>;

    /**
     * Find comments by message ID
     */
    findByMessageId(
        messageId: string,
        options?: CommentPaginationOptions
    ): Promise<CommentListResult>;

    /**
     * Find comments with filters
     */
    findWithFilters(
        filters: CommentFilters,
        options?: CommentPaginationOptions
    ): Promise<CommentListResult>;

    /**
     * Update comment status
     */
    updateStatus(
        id: string,
        status: CommentStatus,
        moderatedBy?: string,
        rejectionReason?: string
    ): Promise<Comment>;

    /**
     * Update comment content
     */
    updateContent(id: string, content: string): Promise<Comment>;

    /**
     * Soft delete comment
     */
    softDelete(id: string, deletedBy: string): Promise<Comment>;

    /**
     * Hard delete comment (permanent)
     */
    hardDelete(id: string): Promise<void>;

    /**
     * Restore soft-deleted comment
     */
    restore(id: string): Promise<Comment>;

    /**
     * Add like to comment
     */
    addLike(id: string, ipAddress: string): Promise<Comment>;

    /**
     * Remove like from comment
     */
    removeLike(id: string, ipAddress: string): Promise<Comment>;

    /**
     * Add dislike to comment
     */
    addDislike(id: string, ipAddress: string): Promise<Comment>;

    /**
     * Remove dislike from comment
     */
    removeDislike(id: string, ipAddress: string): Promise<Comment>;

    /**
     * Add report to comment
     */
    addReport(id: string, report: {
        reportedBy: string;
        reason: string;
    }): Promise<Comment>;

    /**
     * Get comment count by message ID
     */
    getCountByMessageId(messageId: string): Promise<number>;

    /**
     * Get comment statistics
     */
    getStatistics(filters?: Partial<CommentFilters>): Promise<CommentStatistics>;

    /**
     * Batch approve comments
     */
    batchApprove(ids: string[], moderatedBy: string): Promise<number>;

    /**
     * Batch reject comments
     */
    batchReject(ids: string[], moderatedBy: string, reason: string): Promise<number>;

    /**
     * Batch delete comments
     */
    batchDelete(ids: string[], deletedBy: string): Promise<number>;

    /**
     * Get comments that need moderation (pending + reported)
     */
    getPendingModeration(options?: CommentPaginationOptions): Promise<CommentListResult>;

    /**
     * Get reported comments
     */
    getReported(options?: CommentPaginationOptions): Promise<CommentListResult>;

    /**
     * Check if user has exceeded rate limit
     */
    checkRateLimit(ipAddress: string, messageId?: string): Promise<{
        allowed: boolean;
        remainingTime?: number;
    }>;
}
