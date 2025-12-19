/**
 * Message Entity
 * 
 * Core domain entity representing a sticky note message.
 */

export type MessageStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface MessageReport {
    id: string;
    reportedAt: Date | string;
    reportedBy: string; // IP address
    reason: string;
}

export interface Message {
    id: string;
    content: string;
    color: string;
    authorName?: string;
    status: MessageStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
    moderatedAt?: Date | string;
    moderatedBy?: string;
    rejectionReason?: string;
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
    };
    // Interaction tracking
    likedBy?: string[]; // Array of IP addresses
    dislikedBy?: string[]; // Array of IP addresses
    reports?: MessageReport[]; // Array of reports
    // Soft delete
    deletedAt?: Date | string;
    deletedBy?: string; // Admin email who deleted it
}
