/**
 * Data Transfer Objects (DTOs)
 * 
 * Type definitions for API requests and responses.
 */

import { MessageStatus } from '@/lib/domain/entities/Message';

/**
 * DTO for creating a new message
 */
export interface CreateMessageDTO {
    content: string;
    color: string;
    authorName?: string;
    metadata?: {
        ipAddress?: string;
        userAgent?: string;
    };
}

/**
 * DTO for updating message status
 */
export interface UpdateMessageStatusDTO {
    status: 'APPROVED' | 'REJECTED';
    moderatedBy: string;
    rejectionReason?: string;
}

/**
 * DTO for message query options
 */
export interface MessageQueryOptions {
    status?: MessageStatus;
    limit?: number;
    offset?: number;
    orderBy?: 'createdAt' | 'updatedAt';
    orderDirection?: 'asc' | 'desc';
}
