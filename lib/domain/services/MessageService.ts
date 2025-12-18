/**
 * Message Service Implementation
 * 
 * Implements business logic for message operations.
 * Handles validation, rate limiting, and moderation.
 */

import { IMessageService } from './IMessageService';
import { IMessageRepository } from '../repositories/IMessageRepository';
import { Message } from '@/lib/domain/entities/Message';
import { CreateMessageDTO, UpdateMessageStatusDTO } from '@/lib/types/dtos';
import {
    validateMessage,
    hasInappropriateContent,
    MESSAGE_VALIDATION,
    VALIDATION_MESSAGES,
} from '@/lib/constants/validation';

export class MessageService implements IMessageService {
    constructor(private readonly messageRepository: IMessageRepository) { }

    /**
     * Get a message by ID
     */
    async getMessageById(id: string): Promise<Message | null> {
        if (!id || id.trim().length === 0) {
            throw new Error('Message ID is required');
        }

        return this.messageRepository.findById(id);
    }

    /**
     * Get all messages with optional filters
     */
    async getAllMessages(
        status?: 'PENDING' | 'APPROVED' | 'REJECTED',
        limit?: number,
        offset?: number
    ): Promise<Message[]> {
        if (status) {
            return this.messageRepository.findByStatus(status, limit, offset);
        }
        return this.messageRepository.findAll(limit, offset);
    }

    /**
     * Get approved messages (public view)
     */
    async getApprovedMessages(limit?: number, offset?: number): Promise<Message[]> {
        return this.messageRepository.findByStatus('APPROVED', limit, offset);
    }

    /**
     * Get pending messages (admin view)
     * (Helper wrapper for convenience)
     */
    async getPendingMessages(limit?: number): Promise<Message[]> {
        return this.messageRepository.findByStatus('PENDING', limit);
    }

    /**
     * Create a new message
     * Validates content and checks rate limits
     */
    async createMessage(data: CreateMessageDTO): Promise<Message> {
        // Validate message content
        const validation = validateMessage(data.content);
        if (!validation.isValid) {
            throw new Error(validation.error || VALIDATION_MESSAGES.GENERIC_ERROR);
        }

        // Check for inappropriate content
        if (hasInappropriateContent(data.content)) {
            throw new Error(VALIDATION_MESSAGES.MESSAGE_INVALID_CONTENT);
        }

        // Check rate limiting if IP address is provided
        if (data.metadata?.ipAddress) {
            const rateLimitCheck = await this.canSendMessage(data.metadata.ipAddress);
            if (!rateLimitCheck.canSend) {
                throw new Error(rateLimitCheck.reason || VALIDATION_MESSAGES.RATE_LIMIT_EXCEEDED);
            }
        }

        // Create the message using repository
        // Note: Partial<Message> allows passing what we have, repository handles ID and dates
        return this.messageRepository.create({
            content: data.content,
            color: data.color,
            authorName: data.authorName,
            status: 'PENDING',
            metadata: data.metadata
        });
    }

    /**
     * Update message status (admin only)
     * Generic method meeting interface requirement
     */
    async updateMessageStatus(id: string, data: UpdateMessageStatusDTO): Promise<Message> {
        return this.messageRepository.updateStatus(id, data);
    }

    /**
     * Approve a message (admin helper)
     */
    async approveMessage(id: string, moderatorEmail: string): Promise<Message> {
        // Check if message exists
        const message = await this.messageRepository.findById(id);
        if (!message) {
            throw new Error('Message not found');
        }

        // Check if already approved
        if (message.status === 'APPROVED') {
            throw new Error('Message is already approved');
        }

        // Update status
        return this.updateMessageStatus(id, {
            status: 'APPROVED',
            moderatedBy: moderatorEmail,
        });
    }

    /**
     * Reject a message (admin helper)
     */
    async rejectMessage(id: string, moderatorEmail: string, rejectionReason?: string): Promise<Message> {
        // Check if message exists
        const message = await this.messageRepository.findById(id);
        if (!message) {
            throw new Error('Message not found');
        }

        // Check if already rejected
        if (message.status === 'REJECTED') {
            throw new Error('Message is already rejected');
        }

        // Update status
        return this.updateMessageStatus(id, {
            status: 'REJECTED',
            moderatedBy: moderatorEmail,
            rejectionReason,
        });
    }

    /**
     * Delete a message (admin only)
     */
    async deleteMessage(id: string): Promise<void> {
        // Check if message exists
        const exists = await this.messageRepository.exists(id);
        if (!exists) {
            throw new Error('Message not found');
        }

        return this.messageRepository.delete(id);
    }

    /**
     * Get message statistics
     */
    async getMessageStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }> {
        const [total, pending, approved, rejected] = await Promise.all([
            this.messageRepository.countTotal(),
            this.messageRepository.countByStatus('PENDING'),
            this.messageRepository.countByStatus('APPROVED'),
            this.messageRepository.countByStatus('REJECTED'),
        ]);

        return {
            total,
            pending,
            approved,
            rejected,
        };
    }

    /**
     * Search messages by content
     */
    async searchMessages(query: string, limit?: number): Promise<Message[]> {
        if (!query || query.trim().length === 0) {
            return [];
        }

        // Minimum search query length
        if (query.trim().length < 2) {
            throw new Error('Search query must be at least 2 characters');
        }

        return this.messageRepository.searchByContent(query, limit);
    }

    /**
     * Check if IP address can send more messages (rate limiting)
     */
    async canSendMessage(ipAddress: string): Promise<{
        canSend: boolean;
        reason?: string;
        remainingMessages?: number;
    }> {
        // Get messages from this IP in the last 24 hours
        const recentMessages = await this.messageRepository.findByIpInLast24Hours(ipAddress);

        // Check daily limit
        if (recentMessages.length >= MESSAGE_VALIDATION.MAX_MESSAGES_PER_IP_PER_DAY) {
            return {
                canSend: false,
                reason: VALIDATION_MESSAGES.RATE_LIMIT_EXCEEDED,
                remainingMessages: 0,
            };
        }

        // Check cooldown period
        if (recentMessages.length > 0) {
            // Ensure createdAt is a Date object (handling potential string/timestamp issues)
            const lastMessage = recentMessages[0];
            const lastMsgDate = lastMessage.createdAt instanceof Date
                ? lastMessage.createdAt
                : new Date(lastMessage.createdAt);

            const timeSinceLastMessage = Date.now() - lastMsgDate.getTime();

            if (timeSinceLastMessage < MESSAGE_VALIDATION.COOLDOWN_MS) {
                const remainingCooldown = Math.ceil(
                    (MESSAGE_VALIDATION.COOLDOWN_MS - timeSinceLastMessage) / 1000
                );
                return {
                    canSend: false,
                    reason: `Lütfen ${remainingCooldown} saniye bekleyin.`,
                    remainingMessages: MESSAGE_VALIDATION.MAX_MESSAGES_PER_IP_PER_DAY - recentMessages.length,
                };
            }
        }

        return {
            canSend: true,
            remainingMessages: MESSAGE_VALIDATION.MAX_MESSAGES_PER_IP_PER_DAY - recentMessages.length,
        };
    }
}
