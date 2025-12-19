/**
 * Message Service Interface
 * 
 * Defines the contract for message business logic operations.
 * This interface follows the Dependency Inversion Principle (SOLID).
 */

import { Message } from '@/lib/domain/entities/Message';
import { CreateMessageDTO, UpdateMessageStatusDTO } from '@/lib/types/dtos';

export interface IMessageService {
    /**
     * Create a new message (PENDING status)
     */
    createMessage(data: CreateMessageDTO): Promise<Message>;

    /**
     * Get all approved messages for public display
     */
    getApprovedMessages(limit?: number, offset?: number): Promise<Message[]>;

    /**
     * Get all messages (admin only)
     */
    getAllMessages(
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        limit?: number,
        offset?: number
    ): Promise<Message[]>;

    /**
     * Get a single message by ID
     */
    getMessageById(id: string): Promise<Message | null>;

    /**
     * Update message status (admin only)
     */
    updateMessageStatus(id: string, data: UpdateMessageStatusDTO): Promise<Message>;

    /**
     * Soft delete a message (admin only)
     */
    deleteMessage(id: string, deletedBy: string): Promise<void>;

    /**
     * Restore a deleted message (admin only)
     */
    restoreMessage(id: string): Promise<Message>;

    /**
     * Get deleted messages (admin only)
     */
    getDeletedMessages(limit?: number, offset?: number): Promise<Message[]>;

    /**
     * Get message statistics
     */
    getMessageStats(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    }>;
}
