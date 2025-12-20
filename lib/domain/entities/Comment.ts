/**
 * Comment Entity
 * 
 * Core domain entity representing a comment on a message.
 * Follows Single Responsibility Principle - only defines the comment structure.
 */

export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface CommentReport {
    id: string;
    reportedAt: Date | string;
    reportedBy: string; // IP address
    reason: string;
}

export interface CommentMetadata {
    ipAddress?: string;
    userAgent?: string;
}

export interface CommentModerationInfo {
    moderatedAt?: Date | string;
    moderatedBy?: string; // Admin email
    rejectionReason?: string;
}

export interface Comment {
    // Identity
    id: string;
    messageId: string; // Reference to the parent message

    // Content
    content: string;
    authorName?: string; // Optional - if not provided, comment is anonymous

    // Status
    status: CommentStatus;

    // Timestamps
    createdAt: Date | string;
    updatedAt: Date | string;

    // Moderation
    moderation?: CommentModerationInfo;

    // Metadata
    metadata?: CommentMetadata;

    // Interaction tracking
    likedBy?: string[]; // Array of IP addresses
    dislikedBy?: string[]; // Array of IP addresses
    reports?: CommentReport[]; // Array of reports

    // Soft delete
    deletedAt?: Date | string;
    deletedBy?: string; // Admin email who deleted it

    // Reply support (for future nested comments)
    parentCommentId?: string; // Optional - for nested replies
    replyCount?: number; // Number of replies to this comment
}

/**
 * Type guard to check if a comment is anonymous
 */
export const isAnonymousComment = (comment: Comment): boolean => {
    return !comment.authorName || comment.authorName.trim() === '';
};

/**
 * Type guard to check if a comment is deleted
 */
export const isDeletedComment = (comment: Comment): boolean => {
    return !!comment.deletedAt;
};

/**
 * Type guard to check if a comment is approved
 */
export const isApprovedComment = (comment: Comment): boolean => {
    return comment.status === 'APPROVED';
};

/**
 * Type guard to check if a comment is pending
 */
export const isPendingComment = (comment: Comment): boolean => {
    return comment.status === 'PENDING';
};

/**
 * Type guard to check if a comment is rejected
 */
export const isRejectedComment = (comment: Comment): boolean => {
    return comment.status === 'REJECTED';
};

/**
 * Get display name for a comment author
 */
export const getCommentAuthorDisplayName = (comment: Comment): string => {
    if (isAnonymousComment(comment)) {
        return 'Anonim';
    }

    const name = comment.authorName!.trim();
    return name.startsWith('@') ? name : `@${name}`;
};
