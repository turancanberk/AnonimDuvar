/**
 * Comment Constants
 * 
 * Centralized configuration for comment-related constraints and limits.
 * Follows DRY principle - single source of truth for all comment constants.
 */

export const COMMENT_CONSTRAINTS = {
    // Content length
    MIN_CONTENT_LENGTH: 1,
    MAX_CONTENT_LENGTH: 500,

    // Author name
    MAX_AUTHOR_NAME_LENGTH: 50,
    MIN_AUTHOR_NAME_LENGTH: 2,

    // Rate limiting
    MAX_COMMENTS_PER_USER_PER_10_MIN: 5,
    MAX_COMMENTS_PER_MESSAGE_PER_HOUR: 3,
    COOLDOWN_PERIOD_MS: 10 * 1000, // 10 seconds between comments

    // Moderation
    AUTO_REJECT_THRESHOLD: 3, // Auto-reject after 3 reports
    MAX_REPORTS_PER_USER_PER_DAY: 10,

    // Pagination
    DEFAULT_COMMENTS_PER_PAGE: 20,
    MAX_COMMENTS_PER_PAGE: 50,
} as const;

export const COMMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

export const COMMENT_REJECTION_REASONS = {
    SPAM: 'Spam içerik',
    PROFANITY: 'Küfür/Hakaret',
    OFF_TOPIC: 'Konu dışı',
    INAPPROPRIATE: 'Uygunsuz içerik',
    DUPLICATE: 'Tekrarlayan içerik',
    OTHER: 'Diğer',
} as const;

export const COMMENT_REPORT_REASONS = {
    SPAM: 'Spam',
    HARASSMENT: 'Taciz/Hakaret',
    INAPPROPRIATE: 'Uygunsuz içerik',
    MISINFORMATION: 'Yanlış bilgi',
    OTHER: 'Diğer',
} as const;

export const COMMENT_VALIDATION_MESSAGES = {
    CONTENT_TOO_SHORT: `Yorum en az ${COMMENT_CONSTRAINTS.MIN_CONTENT_LENGTH} karakter olmalıdır`,
    CONTENT_TOO_LONG: `Yorum en fazla ${COMMENT_CONSTRAINTS.MAX_CONTENT_LENGTH} karakter olabilir`,
    AUTHOR_NAME_TOO_SHORT: `Rumuz en az ${COMMENT_CONSTRAINTS.MIN_AUTHOR_NAME_LENGTH} karakter olmalıdır`,
    AUTHOR_NAME_TOO_LONG: `Rumuz en fazla ${COMMENT_CONSTRAINTS.MAX_AUTHOR_NAME_LENGTH} karakter olabilir`,
    INVALID_AUTHOR_NAME: 'Rumuz geçersiz karakterler içeriyor',
    RATE_LIMIT_EXCEEDED: 'Çok fazla yorum gönderdiniz. Lütfen bekleyin',
    MESSAGE_NOT_FOUND: 'Mesaj bulunamadı',
    COMMENT_NOT_FOUND: 'Yorum bulunamadı',
    UNAUTHORIZED: 'Bu işlem için yetkiniz yok',
} as const;

export const COMMENT_SUCCESS_MESSAGES = {
    CREATED: 'Yorumunuz başarıyla gönderildi! Admin onayından sonra yayınlanacak',
    APPROVED: 'Yorum onaylandı',
    REJECTED: 'Yorum reddedildi',
    DELETED: 'Yorum silindi',
    REPORTED: 'Şikayetiniz alındı. Teşekkür ederiz',
} as const;

/**
 * Firestore collection names
 */
export const COMMENT_COLLECTIONS = {
    COMMENTS: 'comments',
} as const;

/**
 * Cache keys for comment-related data
 */
export const COMMENT_CACHE_KEYS = {
    COMMENTS_BY_MESSAGE: (messageId: string) => `comments:message:${messageId}`,
    COMMENT_BY_ID: (commentId: string) => `comment:${commentId}`,
    COMMENT_COUNT_BY_MESSAGE: (messageId: string) => `comments:count:${messageId}`,
    PENDING_COMMENTS_COUNT: 'comments:pending:count',
} as const;

/**
 * Comment sorting options
 */
export const COMMENT_SORT_OPTIONS = {
    NEWEST_FIRST: 'newest',
    OLDEST_FIRST: 'oldest',
    MOST_LIKED: 'most_liked',
} as const;

export type CommentSortOption = typeof COMMENT_SORT_OPTIONS[keyof typeof COMMENT_SORT_OPTIONS];
