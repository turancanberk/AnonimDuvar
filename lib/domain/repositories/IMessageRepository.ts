/**
 * Message Repository Interface
 * 
 * Defines the contract for message data access operations.
 * Follows Repository Pattern and Dependency Inversion Principle.
 */

import { Message } from '@/lib/domain/entities/Message';
import { UpdateMessageStatusDTO } from '@/lib/types/dtos';

export interface IMessageRepository {
    /**
     * Create a new message
     */
    create(data: Partial<Message>): Promise<Message>;

    /**
     * Find message by ID
     */
    findById(id: string): Promise<Message | null>;

    /**
     * Find all messages
     */
    findAll(limit?: number, offset?: number): Promise<Message[]>;

    /**
     * Find messages by status
     */
    findByStatus(
        status: 'PENDING' | 'APPROVED' | 'REJECTED',
        limit?: number,
        offset?: number
    ): Promise<Message[]>;

    /**
     * Update message status
     */
    updateStatus(id: string, data: UpdateMessageStatusDTO): Promise<Message>;

    /**
     * Delete a message
     */
    delete(id: string): Promise<void>;

    /**
     * Count messages by status
     */
    countByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<number>;

    /**
     * Check if message exists
     */
    exists(id: string): Promise<boolean>;

    /**
     * Count total messages
     */
    countTotal(): Promise<number>;

    /**
     * Find messages by IP in last 24 hours
     */
    findByIpInLast24Hours(ipAddress: string): Promise<Message[]>;

    /**
     * Search messages by content
     */
    searchByContent(searchQuery: string, limit?: number): Promise<Message[]>;

    /**
     * Find messages with query options (Optional helper for advanced queries)
     */
    findWithOptions?(options: any): Promise<any>;

    /**
     * Helper for finding approved messages
     */
    findApproved?(limit?: number, offset?: number): Promise<Message[]>;

    /**
     * Helper for finding pending messages
     */
    findPending?(limit?: number): Promise<Message[]>;
}
