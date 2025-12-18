/**
 * Message Type Definitions
 * 
 * Defines the structure of a message in the application.
 */

import { MessageStatus } from '@/lib/constants/messageStatus';
import { StickyNoteColorKey } from '@/lib/constants/colors';

/**
 * Message entity from database
 */
export interface Message {
    /**
     * Unique identifier
     */
    id: string;

    /**
     * Message content
     */
    content: string;

    /**
     * Sticky note color
     */
    color: StickyNoteColorKey;

    /**
     * Message status (PENDING, APPROVED, REJECTED)
     */
    status: MessageStatus;

    /**
     * IP address of the sender (for rate limiting)
     */
    ipAddress?: string;

    /**
     * User agent of the sender
     */
    userAgent?: string;

    /**
     * Creation timestamp
     */
    createdAt: Date;

    /**
     * Last update timestamp
     */
    updatedAt: Date;

    /**
     * Admin who approved/rejected the message
     */
    moderatedBy?: string;

    /**
     * Moderation timestamp
     */
    moderatedAt?: Date;

    /**
     * Reason for rejection (if status is REJECTED)
     */
    rejectionReason?: string;
}

/**
 * Data transfer object for creating a new message
 */
export interface CreateMessageDTO {
    content: string;
    color: StickyNoteColorKey;
    authorName?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: {
        ipAddress: string;
        userAgent: string;
    };
}

/**
 * Data transfer object for updating message status
 */
export interface UpdateMessageStatusDTO {
    status: MessageStatus;
    moderatedBy: string;
    rejectionReason?: string;
}

/**
 * Query options for fetching messages
 */
export interface MessageQueryOptions {
    /**
     * Filter by status
     */
    status?: MessageStatus;

    /**
     * Limit number of results
     */
    limit?: number;

    /**
     * Offset for pagination
     */
    offset?: number;

    /**
     * Order by field
     */
    orderBy?: 'createdAt' | 'updatedAt';

    /**
     * Order direction
     */
    orderDirection?: 'asc' | 'desc';

    /**
     * Search query
     */
    searchQuery?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
