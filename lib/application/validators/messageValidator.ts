/**
 * Message Validator
 * 
 * Validates message data according to business rules.
 * Follows Single Responsibility Principle (SOLID).
 * 
 * @module MessageValidator
 */

import { VALIDATION_RULES } from '@/lib/constants/validation';
import { ValidationError } from '@/lib/utils/errors';

export { ValidationError }; // Export ValidationError for consumers

export class MessageValidator {
    /**
     * Validate message content
     * 
     * @param content - Message content to validate
     * @throws ValidationError if content is invalid
     */
    static validateContent(content: string): void {
        // Check if content exists
        if (!content || typeof content !== 'string') {
            throw new ValidationError('Mesaj içeriği gereklidir', 'content');
        }

        // Trim whitespace
        const trimmedContent = content.trim();

        // Check minimum length
        if (trimmedContent.length < VALIDATION_RULES.MESSAGE.MIN_LENGTH) {
            throw new ValidationError(
                `Mesaj en az ${VALIDATION_RULES.MESSAGE.MIN_LENGTH} karakter olmalıdır`,
                'content'
            );
        }

        // Check maximum length
        if (trimmedContent.length > VALIDATION_RULES.MESSAGE.MAX_LENGTH) {
            throw new ValidationError(
                `Mesaj en fazla ${VALIDATION_RULES.MESSAGE.MAX_LENGTH} karakter olabilir`,
                'content'
            );
        }

        // Check for empty content (only whitespace)
        if (trimmedContent.length === 0) {
            throw new ValidationError('Mesaj boş olamaz', 'content');
        }
    }

    /**
     * Validate sticky note color
     * 
     * @param color - Color hex code to validate
     * @throws ValidationError if color is invalid
     */
    static validateColor(color: string): void {
        // Check if color exists
        if (!color || typeof color !== 'string') {
            throw new ValidationError('Renk seçimi gereklidir', 'color');
        }

        // Validate hex format - accept any valid hex color
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        if (!hexRegex.test(color)) {
            throw new ValidationError('Geçersiz renk formatı', 'color');
        }
    }

    /**
     * Validate author name (optional field)
     * 
     * @param authorName - Author name to validate
     * @throws ValidationError if author name is invalid
     */
    static validateAuthorName(authorName?: string): void {
        // Author name is optional
        if (!authorName) {
            return;
        }

        // Check type
        if (typeof authorName !== 'string') {
            throw new ValidationError('İsim geçersiz formatta', 'authorName');
        }

        // Trim whitespace
        const trimmedName = authorName.trim();

        // Check minimum length (if provided)
        if (trimmedName.length > 0 && trimmedName.length < VALIDATION_RULES.AUTHOR_NAME.MIN_LENGTH) {
            throw new ValidationError(
                `İsim en az ${VALIDATION_RULES.AUTHOR_NAME.MIN_LENGTH} karakter olmalıdır`,
                'authorName'
            );
        }

        // Check maximum length
        if (trimmedName.length > VALIDATION_RULES.AUTHOR_NAME.MAX_LENGTH) {
            throw new ValidationError(
                `İsim en fazla ${VALIDATION_RULES.AUTHOR_NAME.MAX_LENGTH} karakter olabilir`,
                'authorName'
            );
        }
    }

    /**
     * Validate message status
     * 
     * @param status - Message status to validate
     * @throws ValidationError if status is invalid
     */
    static validateStatus(status: string): void {
        const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

        if (!validStatuses.includes(status)) {
            throw new ValidationError('Geçersiz mesaj durumu', 'status');
        }
    }

    /**
     * Validate rejection reason (required when status is REJECTED)
     * 
     * @param status - Message status
     * @param rejectionReason - Rejection reason
     * @throws ValidationError if rejection reason is missing when required
     */
    static validateRejectionReason(status: string, rejectionReason?: string): void {
        if (status === 'REJECTED' && !rejectionReason) {
            throw new ValidationError('Red nedeni belirtilmelidir', 'rejectionReason');
        }

        if (rejectionReason && rejectionReason.length > VALIDATION_RULES.REJECTION_REASON.MAX_LENGTH) {
            throw new ValidationError(
                `Red nedeni en fazla ${VALIDATION_RULES.REJECTION_REASON.MAX_LENGTH} karakter olabilir`,
                'rejectionReason'
            );
        }
    }

    /**
     * Validate complete message creation data
     * 
     * @param data - Message creation data
     * @throws ValidationError if any field is invalid
     */
    static validateCreateMessage(data: {
        content: string;
        color: string;
        authorName?: string;
    }): void {
        this.validateContent(data.content);
        this.validateColor(data.color);
        this.validateAuthorName(data.authorName);
    }

    /**
     * Validate message status update data
     * 
     * @param data - Status update data
     * @throws ValidationError if any field is invalid
     */
    static validateUpdateStatus(data: {
        status: string;
        moderatedBy: string;
        rejectionReason?: string;
    }): void {
        this.validateStatus(data.status);
        this.validateRejectionReason(data.status, data.rejectionReason);

        if (!data.moderatedBy || data.moderatedBy.trim().length === 0) {
            throw new ValidationError('Moderatör bilgisi gereklidir', 'moderatedBy');
        }
    }
}
