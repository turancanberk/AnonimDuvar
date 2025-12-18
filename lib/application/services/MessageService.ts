/**
 * Message Service Implementation
 * 
 * Implements business logic for message operations.
 * Follows SOLID principles and Clean Architecture.
 * 
 * @class MessageService
 * @implements {IMessageService}
 */

import { IMessageService } from '@/lib/domain/services/IMessageService';
import { IMessageRepository } from '@/lib/domain/repositories/IMessageRepository';
import { Message } from '@/lib/domain/entities/Message';
import { CreateMessageDTO, UpdateMessageStatusDTO } from '@/lib/types/dtos';
import { MessageValidator, ValidationError } from '@/lib/application/validators/messageValidator';
import { MESSAGE_STATUS } from '@/lib/constants/messageStatus';

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class MessageService implements IMessageService {
    constructor(private readonly messageRepository: IMessageRepository) { }

    /**
     * Create a new message with PENDING status
     */
    async createMessage(data: CreateMessageDTO): Promise<Message> {
        // Validate input data
        MessageValidator.validateCreateMessage({
            content: data.content,
            color: data.color,
            authorName: data.authorName,
        });

        // Trim content and author name
        const trimmedContent = data.content.trim();
        const trimmedAuthorName = data.authorName?.trim();

        // Create message with PENDING status
        const messageData = {
            content: trimmedContent,
            color: data.color,
            authorName: trimmedAuthorName || undefined,
            status: MESSAGE_STATUS.PENDING as 'PENDING',
            metadata: data.metadata,
        };

        // Save to repository
        const message = await this.messageRepository.create(messageData);

        return message;
    }

    /**
     * Get all approved messages for public display
     */
    async getApprovedMessages(limit?: number, offset?: number): Promise<Message[]> {
        const messages = await this.messageRepository.findByStatus(
            MESSAGE_STATUS.APPROVED,
            limit,
            offset
        );

        return messages;
    }

    /**
     * Get all messages (admin only)
     */
    async getAllMessages(
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        limit?: number,
        offset?: number
    ): Promise<Message[]> {
        if (status) {
            // Validate status
            MessageValidator.validateStatus(status);
            return await this.messageRepository.findByStatus(status, limit, offset);
        }

        return await this.messageRepository.findAll(limit, offset);
    }

    /**
     * Get a single message by ID
     */
    async getMessageById(id: string): Promise<Message | null> {
        if (!id || id.trim().length === 0) {
            throw new ValidationError('Mesaj ID gereklidir', 'id');
        }

        const message = await this.messageRepository.findById(id);
        return message;
    }

    /**
     * Update message status (admin only)
     */
    async updateMessageStatus(id: string, data: UpdateMessageStatusDTO): Promise<Message> {
        // Validate input
        if (!id || id.trim().length === 0) {
            throw new ValidationError('Mesaj ID gereklidir', 'id');
        }

        MessageValidator.validateUpdateStatus({
            status: data.status,
            moderatedBy: data.moderatedBy,
            rejectionReason: data.rejectionReason,
        });

        // Check if message exists
        const existingMessage = await this.messageRepository.findById(id);
        if (!existingMessage) {
            throw new NotFoundError('Mesaj bulunamadı');
        }

        // Prevent updating already moderated messages (optional business rule)
        // Uncomment if you want to prevent re-moderation
        // if (existingMessage.status !== MESSAGE_STATUS.PENDING) {
        //   throw new ValidationError('Bu mesaj zaten moderasyon sürecinden geçmiş');
        // }

        // Update status
        const updatedMessage = await this.messageRepository.updateStatus(id, {
            status: data.status as 'APPROVED' | 'REJECTED',
            moderatedBy: data.moderatedBy,
            rejectionReason: data.rejectionReason,
        });

        return updatedMessage;
    }

    /**
     * Delete a message (admin only)
     */
    async deleteMessage(id: string): Promise<void> {
        if (!id || id.trim().length === 0) {
            throw new ValidationError('Mesaj ID gereklidir', 'id');
        }

        // Check if message exists
        const existingMessage = await this.messageRepository.findById(id);
        if (!existingMessage) {
            throw new NotFoundError('Mesaj bulunamadı');
        }

        await this.messageRepository.delete(id);
    }

    /**
     * Get message statistics
     */
    async getMessageStats(): Promise<{
        pending: number;
        approved: number;
        rejected: number;
        total: number;
    }> {
        const [pending, approved, rejected, all] = await Promise.all([
            this.messageRepository.countByStatus(MESSAGE_STATUS.PENDING),
            this.messageRepository.countByStatus(MESSAGE_STATUS.APPROVED),
            this.messageRepository.countByStatus(MESSAGE_STATUS.REJECTED),
            this.messageRepository.findAll(),
        ]);

        return {
            pending,
            approved,
            rejected,
            total: all.length,
        };
    }
}
