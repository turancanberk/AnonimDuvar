/**
 * Comment Service
 * 
 * Business logic layer for comment operations.
 * Follows Single Responsibility Principle - handles comment business rules.
 * Depends on abstractions (ICommentRepository) following Dependency Inversion Principle.
 */

import { Comment, CommentStatus } from '@/lib/domain/entities/Comment';
import { ICommentRepository, CommentFilters, CommentPaginationOptions, CommentListResult, CommentStatistics } from '@/lib/domain/repositories/ICommentRepository';
import {
    CreateCommentValidator,
    CreateCommentInput,
    sanitizeCommentContent,
    sanitizeAuthorName
} from '@/lib/application/validators/commentValidator';
import {
    COMMENT_CONSTRAINTS,
    COMMENT_VALIDATION_MESSAGES,
    COMMENT_SUCCESS_MESSAGES,
    COMMENT_REJECTION_REASONS,
} from '@/lib/constants/commentConstants';

/**
 * Custom error class for comment-related errors
 */
export class CommentError extends Error {
    constructor(
        message: string,
        public code: string = 'COMMENT_ERROR',
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'CommentError';
    }
}

/**
 * Comment Service Interface
 * Defines the contract for comment business operations
 */
export interface ICommentService {
    createComment(input: CreateCommentInput, metadata: { ipAddress: string; userAgent?: string }): Promise<Comment>;
    getCommentsByMessageId(messageId: string, options?: CommentPaginationOptions): Promise<CommentListResult>;
    getCommentById(id: string): Promise<Comment>;
    approveComment(id: string, moderatedBy: string): Promise<Comment>;
    rejectComment(id: string, moderatedBy: string, reason: string): Promise<Comment>;
    deleteComment(id: string, deletedBy: string): Promise<Comment>;
    restoreComment(id: string): Promise<Comment>;
    likeComment(id: string, ipAddress: string): Promise<Comment>;
    dislikeComment(id: string, ipAddress: string): Promise<Comment>;
    reportComment(id: string, ipAddress: string, reason: string): Promise<Comment>;
    getCommentStatistics(filters?: Partial<CommentFilters>): Promise<CommentStatistics>;
    getPendingComments(options?: CommentPaginationOptions): Promise<CommentListResult>;
    getReportedComments(options?: CommentPaginationOptions): Promise<CommentListResult>;
    batchApproveComments(ids: string[], moderatedBy: string): Promise<number>;
    batchRejectComments(ids: string[], moderatedBy: string, reason: string): Promise<number>;
    batchDeleteComments(ids: string[], deletedBy: string): Promise<number>;
}

/**
 * Comment Service Implementation
 * Follows Dependency Inversion Principle - depends on ICommentRepository abstraction
 */
export class CommentService implements ICommentService {
    private validator: CreateCommentValidator;

    constructor(private commentRepository: ICommentRepository) {
        this.validator = new CreateCommentValidator();
    }

    /**
     * Create a new comment
     * Validates input, checks rate limits, sanitizes content
     */
    async createComment(
        input: CreateCommentInput,
        metadata: { ipAddress: string; userAgent?: string }
    ): Promise<Comment> {
        // Validate input
        const validationResult = this.validator.validate(input);
        if (!validationResult.isValid) {
            throw new CommentError(
                validationResult.errors.join(', '),
                'VALIDATION_ERROR',
                400
            );
        }

        // Check rate limit
        const rateLimitCheck = await this.commentRepository.checkRateLimit(
            metadata.ipAddress,
            input.messageId
        );

        if (!rateLimitCheck.allowed) {
            const remainingMinutes = Math.ceil((rateLimitCheck.remainingTime || 0) / 60000);
            throw new CommentError(
                `${COMMENT_VALIDATION_MESSAGES.RATE_LIMIT_EXCEEDED}. ${remainingMinutes} dakika sonra tekrar deneyin.`,
                'RATE_LIMIT_EXCEEDED',
                429
            );
        }

        // Sanitize content
        const sanitizedContent = sanitizeCommentContent(input.content);
        const sanitizedAuthorName = sanitizeAuthorName(input.authorName);

        // Create comment
        const comment = await this.commentRepository.create({
            messageId: input.messageId,
            content: sanitizedContent,
            authorName: sanitizedAuthorName,
            status: 'PENDING',
            metadata: {
                ipAddress: metadata.ipAddress,
                userAgent: metadata.userAgent,
            },
            likedBy: [],
            dislikedBy: [],
            reports: [],
        });

        return comment;
    }

    /**
     * Get comments by message ID
     */
    async getCommentsByMessageId(
        messageId: string,
        options?: CommentPaginationOptions
    ): Promise<CommentListResult> {
        if (!messageId || messageId.trim().length === 0) {
            throw new CommentError(
                COMMENT_VALIDATION_MESSAGES.MESSAGE_NOT_FOUND,
                'INVALID_MESSAGE_ID',
                400
            );
        }

        return this.commentRepository.findByMessageId(messageId, options);
    }

    /**
     * Get comment by ID
     */
    async getCommentById(id: string): Promise<Comment> {
        const comment = await this.commentRepository.findById(id);

        if (!comment) {
            throw new CommentError(
                COMMENT_VALIDATION_MESSAGES.COMMENT_NOT_FOUND,
                'COMMENT_NOT_FOUND',
                404
            );
        }

        return comment;
    }

    /**
     * Approve a comment
     * Only admins can approve comments
     */
    async approveComment(id: string, moderatedBy: string): Promise<Comment> {
        const comment = await this.getCommentById(id);

        if (comment.status === 'APPROVED') {
            throw new CommentError(
                'Yorum zaten onaylanmış',
                'ALREADY_APPROVED',
                400
            );
        }

        if (comment.deletedAt) {
            throw new CommentError(
                'Silinmiş yorum onaylanamaz',
                'COMMENT_DELETED',
                400
            );
        }

        return this.commentRepository.updateStatus(id, 'APPROVED', moderatedBy);
    }

    /**
     * Reject a comment
     * Only admins can reject comments
     */
    async rejectComment(id: string, moderatedBy: string, reason: string): Promise<Comment> {
        const comment = await this.getCommentById(id);

        if (comment.status === 'REJECTED') {
            throw new CommentError(
                'Yorum zaten reddedilmiş',
                'ALREADY_REJECTED',
                400
            );
        }

        // Reason validation removed - admins can provide any reason
        // Default reason is set in the API route if not provided


        return this.commentRepository.updateStatus(id, 'REJECTED', moderatedBy, reason);
    }

    /**
     * Delete a comment (soft delete)
     * Only admins can delete comments
     */
    async deleteComment(id: string, deletedBy: string): Promise<Comment> {
        const comment = await this.getCommentById(id);

        if (comment.deletedAt) {
            throw new CommentError(
                'Yorum zaten silinmiş',
                'ALREADY_DELETED',
                400
            );
        }

        return this.commentRepository.softDelete(id, deletedBy);
    }

    /**
     * Restore a deleted comment
     * Only admins can restore comments
     */
    async restoreComment(id: string): Promise<Comment> {
        const comment = await this.getCommentById(id);

        if (!comment.deletedAt) {
            throw new CommentError(
                'Yorum silinmemiş',
                'NOT_DELETED',
                400
            );
        }

        return this.commentRepository.restore(id);
    }

    /**
     * Like a comment
     * Users can toggle their like
     */
    async likeComment(id: string, ipAddress: string): Promise<Comment> {
        const comment = await this.getCommentById(id);

        if (comment.status !== 'APPROVED') {
            throw new CommentError(
                'Sadece onaylanmış yorumlar beğenilebilir',
                'COMMENT_NOT_APPROVED',
                400
            );
        }

        if (comment.deletedAt) {
            throw new CommentError(
                'Silinmiş yorum beğenilemez',
                'COMMENT_DELETED',
                400
            );
        }

        // Check if user already liked
        const hasLiked = comment.likedBy?.includes(ipAddress);

        if (hasLiked) {
            // Remove like (toggle)
            return this.commentRepository.removeLike(id, ipAddress);
        } else {
            // Add like (and remove dislike if exists)
            return this.commentRepository.addLike(id, ipAddress);
        }
    }

    /**
     * Dislike a comment
     * Users can toggle their dislike
     */
    async dislikeComment(id: string, ipAddress: string): Promise<Comment> {
        const comment = await this.getCommentById(id);

        if (comment.status !== 'APPROVED') {
            throw new CommentError(
                'Sadece onaylanmış yorumlar beğenilmeyebilir',
                'COMMENT_NOT_APPROVED',
                400
            );
        }

        if (comment.deletedAt) {
            throw new CommentError(
                'Silinmiş yorum beğenilmeyebilir',
                'COMMENT_DELETED',
                400
            );
        }

        // Check if user already disliked
        const hasDisliked = comment.dislikedBy?.includes(ipAddress);

        if (hasDisliked) {
            // Remove dislike (toggle)
            return this.commentRepository.removeDislike(id, ipAddress);
        } else {
            // Add dislike (and remove like if exists)
            return this.commentRepository.addDislike(id, ipAddress);
        }
    }

    /**
     * Report a comment
     * Users can report inappropriate comments
     */
    async reportComment(id: string, ipAddress: string, reason: string): Promise<Comment> {
        const comment = await this.getCommentById(id);

        if (comment.deletedAt) {
            throw new CommentError(
                'Silinmiş yorum raporlanamaz',
                'COMMENT_DELETED',
                400
            );
        }

        // Check if user already reported this comment
        const hasReported = comment.reports?.some(
            report => report.reportedBy === ipAddress
        );

        if (hasReported) {
            throw new CommentError(
                'Bu yorumu zaten raporladınız',
                'ALREADY_REPORTED',
                400
            );
        }

        // Add report
        const updatedComment = await this.commentRepository.addReport(id, {
            reportedBy: ipAddress,
            reason,
        });

        // Auto-reject if threshold reached
        if (updatedComment.reports &&
            updatedComment.reports.length >= COMMENT_CONSTRAINTS.AUTO_REJECT_THRESHOLD) {
            await this.commentRepository.updateStatus(
                id,
                'REJECTED',
                'system',
                'Otomatik red: Çok sayıda şikayet'
            );
        }

        return updatedComment;
    }

    /**
     * Get comment statistics
     */
    async getCommentStatistics(filters?: Partial<CommentFilters>): Promise<CommentStatistics> {
        return this.commentRepository.getStatistics(filters);
    }

    /**
     * Get pending comments for moderation
     */
    async getPendingComments(options?: CommentPaginationOptions): Promise<CommentListResult> {
        return this.commentRepository.getPendingModeration(options);
    }

    /**
     * Get reported comments
     */
    async getReportedComments(options?: CommentPaginationOptions): Promise<CommentListResult> {
        return this.commentRepository.getReported(options);
    }

    /**
     * Batch approve comments
     * Only admins can batch approve
     */
    async batchApproveComments(ids: string[], moderatedBy: string): Promise<number> {
        if (!ids || ids.length === 0) {
            throw new CommentError(
                'Hiç yorum seçilmedi',
                'NO_COMMENTS_SELECTED',
                400
            );
        }

        // Limit batch size
        if (ids.length > 50) {
            throw new CommentError(
                'Tek seferde en fazla 50 yorum onaylanabilir',
                'BATCH_SIZE_EXCEEDED',
                400
            );
        }

        return this.commentRepository.batchApprove(ids, moderatedBy);
    }

    /**
     * Batch reject comments
     * Only admins can batch reject
     */
    async batchRejectComments(ids: string[], moderatedBy: string, reason: string): Promise<number> {
        if (!ids || ids.length === 0) {
            throw new CommentError(
                'Hiç yorum seçilmedi',
                'NO_COMMENTS_SELECTED',
                400
            );
        }

        if (ids.length > 50) {
            throw new CommentError(
                'Tek seferde en fazla 50 yorum reddedilebilir',
                'BATCH_SIZE_EXCEEDED',
                400
            );
        }

        return this.commentRepository.batchReject(ids, moderatedBy, reason);
    }

    /**
     * Batch delete comments
     * Only admins can batch delete
     */
    async batchDeleteComments(ids: string[], deletedBy: string): Promise<number> {
        if (!ids || ids.length === 0) {
            throw new CommentError(
                'Hiç yorum seçilmedi',
                'NO_COMMENTS_SELECTED',
                400
            );
        }

        if (ids.length > 50) {
            throw new CommentError(
                'Tek seferde en fazla 50 yorum silinebilir',
                'BATCH_SIZE_EXCEEDED',
                400
            );
        }

        return this.commentRepository.batchDelete(ids, deletedBy);
    }
}
