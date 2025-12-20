/**
 * Comment Validator
 * 
 * Validates comment data according to business rules.
 * Follows Single Responsibility Principle - only handles validation logic.
 */

import {
    COMMENT_CONSTRAINTS,
    COMMENT_VALIDATION_MESSAGES,
} from '@/lib/constants/commentConstants';

export interface CommentValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface CreateCommentInput {
    content: string;
    authorName?: string;
    messageId: string;
}

export interface UpdateCommentInput {
    content?: string;
    authorName?: string;
}

/**
 * Base validator class following Open/Closed Principle
 * Open for extension, closed for modification
 */
abstract class BaseValidator<T> {
    protected errors: string[] = [];

    abstract validate(data: T): CommentValidationResult;

    protected addError(error: string): void {
        this.errors.push(error);
    }

    protected resetErrors(): void {
        this.errors = [];
    }

    protected getResult(): CommentValidationResult {
        return {
            isValid: this.errors.length === 0,
            errors: [...this.errors],
        };
    }
}

/**
 * Content validator - validates comment content
 */
class ContentValidator {
    validate(content: string): string[] {
        const errors: string[] = [];

        if (!content || content.trim().length === 0) {
            errors.push(COMMENT_VALIDATION_MESSAGES.CONTENT_TOO_SHORT);
            return errors;
        }

        const trimmedContent = content.trim();

        if (trimmedContent.length < COMMENT_CONSTRAINTS.MIN_CONTENT_LENGTH) {
            errors.push(COMMENT_VALIDATION_MESSAGES.CONTENT_TOO_SHORT);
        }

        if (trimmedContent.length > COMMENT_CONSTRAINTS.MAX_CONTENT_LENGTH) {
            errors.push(COMMENT_VALIDATION_MESSAGES.CONTENT_TOO_LONG);
        }

        // Check for suspicious patterns (basic XSS prevention)
        if (this.containsSuspiciousPatterns(trimmedContent)) {
            errors.push('İçerik geçersiz karakterler içeriyor');
        }

        return errors;
    }

    private containsSuspiciousPatterns(content: string): boolean {
        // Check for script tags, event handlers, etc.
        const suspiciousPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /on\w+\s*=/gi, // onclick, onerror, etc.
            /javascript:/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
        ];

        return suspiciousPatterns.some(pattern => pattern.test(content));
    }
}

/**
 * Author name validator - validates author name (rumuz)
 */
class AuthorNameValidator {
    validate(authorName: string | undefined): string[] {
        const errors: string[] = [];

        // Author name is optional
        if (!authorName || authorName.trim().length === 0) {
            return errors;
        }

        const trimmedName = authorName.trim();

        // Remove @ prefix for length validation
        const nameWithoutAt = trimmedName.startsWith('@')
            ? trimmedName.substring(1)
            : trimmedName;

        if (nameWithoutAt.length < COMMENT_CONSTRAINTS.MIN_AUTHOR_NAME_LENGTH) {
            errors.push(COMMENT_VALIDATION_MESSAGES.AUTHOR_NAME_TOO_SHORT);
        }

        if (nameWithoutAt.length > COMMENT_CONSTRAINTS.MAX_AUTHOR_NAME_LENGTH) {
            errors.push(COMMENT_VALIDATION_MESSAGES.AUTHOR_NAME_TOO_LONG);
        }

        // Validate format: alphanumeric, underscore, dash only
        if (!this.isValidFormat(nameWithoutAt)) {
            errors.push(COMMENT_VALIDATION_MESSAGES.INVALID_AUTHOR_NAME);
        }

        return errors;
    }

    private isValidFormat(name: string): boolean {
        // Allow letters (including Turkish), numbers, underscore, dash
        const validPattern = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9_-]+$/;
        return validPattern.test(name);
    }
}

/**
 * Message ID validator
 */
class MessageIdValidator {
    validate(messageId: string): string[] {
        const errors: string[] = [];

        if (!messageId || messageId.trim().length === 0) {
            errors.push(COMMENT_VALIDATION_MESSAGES.MESSAGE_NOT_FOUND);
        }

        return errors;
    }
}

/**
 * Create comment validator - validates data for creating a new comment
 * Follows Dependency Inversion Principle - depends on abstractions (validators)
 */
export class CreateCommentValidator extends BaseValidator<CreateCommentInput> {
    private contentValidator: ContentValidator;
    private authorNameValidator: AuthorNameValidator;
    private messageIdValidator: MessageIdValidator;

    constructor() {
        super();
        this.contentValidator = new ContentValidator();
        this.authorNameValidator = new AuthorNameValidator();
        this.messageIdValidator = new MessageIdValidator();
    }

    validate(data: CreateCommentInput): CommentValidationResult {
        this.resetErrors();

        // Validate content
        const contentErrors = this.contentValidator.validate(data.content);
        contentErrors.forEach(error => this.addError(error));

        // Validate author name
        const authorNameErrors = this.authorNameValidator.validate(data.authorName);
        authorNameErrors.forEach(error => this.addError(error));

        // Validate message ID
        const messageIdErrors = this.messageIdValidator.validate(data.messageId);
        messageIdErrors.forEach(error => this.addError(error));

        return this.getResult();
    }
}

/**
 * Update comment validator - validates data for updating a comment
 */
export class UpdateCommentValidator extends BaseValidator<UpdateCommentInput> {
    private contentValidator: ContentValidator;
    private authorNameValidator: AuthorNameValidator;

    constructor() {
        super();
        this.contentValidator = new ContentValidator();
        this.authorNameValidator = new AuthorNameValidator();
    }

    validate(data: UpdateCommentInput): CommentValidationResult {
        this.resetErrors();

        // Validate content if provided
        if (data.content !== undefined) {
            const contentErrors = this.contentValidator.validate(data.content);
            contentErrors.forEach(error => this.addError(error));
        }

        // Validate author name if provided
        if (data.authorName !== undefined) {
            const authorNameErrors = this.authorNameValidator.validate(data.authorName);
            authorNameErrors.forEach(error => this.addError(error));
        }

        return this.getResult();
    }
}

/**
 * Sanitize comment content - removes potentially harmful content
 */
export const sanitizeCommentContent = (content: string): string => {
    return content
        .trim()
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .substring(0, COMMENT_CONSTRAINTS.MAX_CONTENT_LENGTH); // Enforce max length
};

/**
 * Sanitize author name
 */
export const sanitizeAuthorName = (authorName: string | undefined): string | undefined => {
    if (!authorName || authorName.trim().length === 0) {
        return undefined;
    }

    let sanitized = authorName.trim();

    // Remove @ prefix if exists, we'll add it back later
    if (sanitized.startsWith('@')) {
        sanitized = sanitized.substring(1);
    }

    // Remove invalid characters
    sanitized = sanitized.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9_-]/g, '');

    // Enforce max length
    sanitized = sanitized.substring(0, COMMENT_CONSTRAINTS.MAX_AUTHOR_NAME_LENGTH);

    return sanitized.length >= COMMENT_CONSTRAINTS.MIN_AUTHOR_NAME_LENGTH
        ? sanitized
        : undefined;
};
