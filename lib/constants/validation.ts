/**
 * Validation Rules and Constants
 * 
 * Defines validation rules for user inputs and data.
 */

/**
 * Message validation rules
 */
export const MESSAGE_VALIDATION = {
    /**
     * Minimum message length (characters)
     */
    MIN_LENGTH: 1,

    /**
     * Maximum message length (characters)
     */
    MAX_LENGTH: 280,

    /**
     * Minimum message length for meaningful content
     */
    MIN_MEANINGFUL_LENGTH: 3,

    /**
     * Maximum messages per IP per day (rate limiting)
     */
    MAX_MESSAGES_PER_IP_PER_DAY: 10,

    /**
     * Cooldown period between messages from same IP (milliseconds)
     */
    COOLDOWN_MS: 60000, // 1 minute
} as const;

/**
 * Author name validation rules
 */
export const AUTHOR_NAME_VALIDATION = {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
} as const;

/**
 * Rejection reason validation rules
 */
export const REJECTION_REASON_VALIDATION = {
    MAX_LENGTH: 200,
} as const;

/**
 * Combined validation rules for easy access
 */
export const VALIDATION_RULES = {
    MESSAGE: MESSAGE_VALIDATION,
    AUTHOR_NAME: AUTHOR_NAME_VALIDATION,
    REJECTION_REASON: REJECTION_REASON_VALIDATION,
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
    MESSAGE_TOO_SHORT: `Mesajınız en az ${MESSAGE_VALIDATION.MIN_MEANINGFUL_LENGTH} karakter olmalıdır.`,
    MESSAGE_TOO_LONG: `Mesajınız en fazla ${MESSAGE_VALIDATION.MAX_LENGTH} karakter olabilir.`,
    MESSAGE_EMPTY: 'Lütfen bir mesaj yazın.',
    MESSAGE_INVALID_CONTENT: 'Mesajınız uygunsuz içerik içeriyor.',
    RATE_LIMIT_EXCEEDED: 'Çok fazla mesaj gönderdiniz. Lütfen biraz bekleyin.',
    COLOR_INVALID: 'Geçersiz renk seçimi.',
    GENERIC_ERROR: 'Bir hata oluştu. Lütfen tekrar deneyin.',
} as const;

/**
 * Regex patterns for validation
 */
export const VALIDATION_PATTERNS = {
    /**
     * Pattern to detect URLs
     */
    URL: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi,

    /**
     * Pattern to detect email addresses
     */
    EMAIL: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,

    /**
     * Pattern to detect phone numbers
     */
    PHONE: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/gi,

    /**
     * Pattern to detect excessive special characters
     */
    EXCESSIVE_SPECIAL_CHARS: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,}/g,
} as const;

/**
 * Validate message content
 */
export const validateMessage = (content: string): { isValid: boolean; error?: string } => {
    // Check if empty
    if (!content || content.trim().length === 0) {
        return { isValid: false, error: VALIDATION_MESSAGES.MESSAGE_EMPTY };
    }

    // Check minimum length
    if (content.trim().length < MESSAGE_VALIDATION.MIN_MEANINGFUL_LENGTH) {
        return { isValid: false, error: VALIDATION_MESSAGES.MESSAGE_TOO_SHORT };
    }

    // Check maximum length
    if (content.length > MESSAGE_VALIDATION.MAX_LENGTH) {
        return { isValid: false, error: VALIDATION_MESSAGES.MESSAGE_TOO_LONG };
    }

    return { isValid: true };
};

/**
 * Check if content contains potentially inappropriate patterns
 */
export const hasInappropriateContent = (content: string): boolean => {
    // Check for excessive special characters
    if (VALIDATION_PATTERNS.EXCESSIVE_SPECIAL_CHARS.test(content)) {
        return true;
    }

    // Add more checks as needed (profanity filter, spam detection, etc.)

    return false;
};
