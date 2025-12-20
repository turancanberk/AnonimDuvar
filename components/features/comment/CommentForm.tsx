/**
 * CommentForm Component
 * 
 * Form for creating new comments on messages.
 * Supports anonymous and pseudonym (rumuz) modes.
 * Follows component composition and clean code principles.
 */

'use client';

import React, { useState } from 'react';
import { COMMENT_CONSTRAINTS } from '@/lib/constants/commentConstants';

export interface CommentFormData {
    content: string;
    authorName?: string;
}

export interface CommentFormProps {
    messageId: string;
    onSubmit: (data: CommentFormData) => Promise<void>;
    isSubmitting?: boolean;
}

type IdentityMode = 'anonymous' | 'pseudonym';

export const CommentForm: React.FC<CommentFormProps> = ({
    messageId,
    onSubmit,
    isSubmitting = false,
}) => {
    const [identityMode, setIdentityMode] = useState<IdentityMode>('anonymous');
    const [content, setContent] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [errors, setErrors] = useState<{ content?: string; authorName?: string }>({});

    const characterCount = content.length;
    const maxLength = COMMENT_CONSTRAINTS.MAX_CONTENT_LENGTH;
    const isNearLimit = characterCount > maxLength * 0.8;
    const isOverLimit = characterCount > maxLength;

    /**
     * Validate form data
     */
    const validate = (): boolean => {
        const newErrors: { content?: string; authorName?: string } = {};

        // Validate content
        if (content.trim().length < COMMENT_CONSTRAINTS.MIN_CONTENT_LENGTH) {
            newErrors.content = `Yorum en az ${COMMENT_CONSTRAINTS.MIN_CONTENT_LENGTH} karakter olmalıdır`;
        } else if (content.trim().length > COMMENT_CONSTRAINTS.MAX_CONTENT_LENGTH) {
            newErrors.content = `Yorum en fazla ${COMMENT_CONSTRAINTS.MAX_CONTENT_LENGTH} karakter olabilir`;
        }

        // Validate author name if in pseudonym mode
        if (identityMode === 'pseudonym' && authorName.trim().length > 0) {
            const nameWithoutAt = authorName.startsWith('@') ? authorName.substring(1) : authorName;

            if (nameWithoutAt.length < COMMENT_CONSTRAINTS.MIN_AUTHOR_NAME_LENGTH) {
                newErrors.authorName = `Rumuz en az ${COMMENT_CONSTRAINTS.MIN_AUTHOR_NAME_LENGTH} karakter olmalıdır`;
            } else if (nameWithoutAt.length > COMMENT_CONSTRAINTS.MAX_AUTHOR_NAME_LENGTH) {
                newErrors.authorName = `Rumuz en fazla ${COMMENT_CONSTRAINTS.MAX_AUTHOR_NAME_LENGTH} karakter olabilir`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate() || isSubmitting) {
            return;
        }

        const formData: CommentFormData = {
            content: content.trim(),
            authorName: identityMode === 'pseudonym' && authorName.trim().length > 0
                ? authorName.trim()
                : undefined,
        };

        try {
            await onSubmit(formData);

            // Reset form on success
            setContent('');
            setAuthorName('');
            setIdentityMode('anonymous');
            setErrors({});
        } catch (error) {
            // Error handling is done by parent component
            console.error('Error submitting comment:', error);
        }
    };

    /**
     * Handle content change
     */
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        if (errors.content) {
            setErrors(prev => ({ ...prev, content: undefined }));
        }
    };

    /**
     * Handle author name change
     */
    const handleAuthorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthorName(e.target.value);
        if (errors.authorName) {
            setErrors(prev => ({ ...prev, authorName: undefined }));
        }
    };

    const isFormValid = content.trim().length >= COMMENT_CONSTRAINTS.MIN_CONTENT_LENGTH &&
        !isOverLimit &&
        (identityMode === 'anonymous' || !authorName || authorName.trim().length >= COMMENT_CONSTRAINTS.MIN_AUTHOR_NAME_LENGTH);

    return (
        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-6 border border-border-dark">
            {/* Header */}
            <div className="mb-4">
                <h3 className="text-white text-lg font-bold">Yorum Yap</h3>
                <p className="text-gray-400 text-sm mt-1">
                    Anonim veya rumuz ile yorumunu paylaş
                </p>
            </div>

            {/* Identity Toggle */}
            <div className="identity-toggle mb-4">
                <button
                    type="button"
                    onClick={() => setIdentityMode('anonymous')}
                    className={`identity-toggle-option flex-1 ${identityMode === 'anonymous' ? 'active' : ''}`}
                    disabled={isSubmitting}
                >
                    🎭 Anonim
                </button>
                <button
                    type="button"
                    onClick={() => setIdentityMode('pseudonym')}
                    className={`identity-toggle-option flex-1 ${identityMode === 'pseudonym' ? 'active' : ''}`}
                    disabled={isSubmitting}
                >
                    ✍️ Rumuz
                </button>
            </div>

            {/* Author Name Input (shown only in pseudonym mode) */}
            {identityMode === 'pseudonym' && (
                <div className="mb-4">
                    <input
                        type="text"
                        value={authorName}
                        onChange={handleAuthorNameChange}
                        placeholder="@rumuzun (opsiyonel)"
                        className={`input-field ${errors.authorName ? 'ring-2 ring-red-500' : ''}`}
                        maxLength={COMMENT_CONSTRAINTS.MAX_AUTHOR_NAME_LENGTH + 1} // +1 for @ symbol
                        disabled={isSubmitting}
                    />
                    {errors.authorName && (
                        <p className="text-red-400 text-xs mt-1">{errors.authorName}</p>
                    )}
                </div>
            )}

            {/* Content Textarea */}
            <div className="mb-4 relative">
                <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Düşüncelerini paylaş..."
                    className={`textarea-field min-h-[120px] ${errors.content ? 'ring-2 ring-red-500' : ''}`}
                    disabled={isSubmitting}
                    rows={4}
                />

                {/* Character Counter */}
                <div className={`absolute bottom-3 right-3 text-xs ${isOverLimit ? 'text-red-400' :
                        isNearLimit ? 'text-yellow-400' :
                            'text-gray-500'
                    }`}>
                    {characterCount}/{maxLength}
                </div>

                {errors.content && (
                    <p className="text-red-400 text-xs mt-1">{errors.content}</p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Gönderiliyor...</span>
                    </>
                ) : (
                    <>
                        <span>Yorum Gönder</span>
                        <span>💬</span>
                    </>
                )}
            </button>

            {/* Helper Text */}
            <p className="text-gray-500 text-xs mt-3 text-center flex items-center justify-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Yorumun admin onayından sonra yayınlanacak</span>
            </p>
        </form>
    );
};
