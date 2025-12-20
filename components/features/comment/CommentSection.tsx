/**
 * CommentSection Component
 * 
 * Complete comment section with form and list.
 * Integrates with StickyNote component.
 * Follows component composition and clean code principles.
 */

'use client';

import React, { useState } from 'react';
import { CommentForm, CommentFormData } from './CommentForm';
import { CommentList } from './CommentList';
import { Toast } from '@/components/ui/Toast';

export interface CommentSectionProps {
    messageId: string;
    initialCommentCount?: number;
    isExpanded?: boolean;
    onToggle?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
    messageId,
    initialCommentCount = 0,
    isExpanded = false,
    onToggle,
}) => {
    const [commentCount, setCommentCount] = useState(initialCommentCount);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // For forcing CommentList refresh
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    /**
     * Show toast notification
     */
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    /**
     * Close toast
     */
    const closeToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    /**
     * Handle comment submission
     */
    const handleSubmitComment = async (data: CommentFormData) => {
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messageId,
                    content: data.content,
                    authorName: data.authorName,
                }),
            });

            const result = await response.json();

            if (result.success) {
                showToast(
                    'Yorumunuz gönderildi! Admin onayından sonra yayınlanacaktır. 🎉',
                    'success'
                );

                // Don't increment count - only approved comments should be counted
                // Admin needs to approve first

                // Force refresh comment list by changing key
                setTimeout(() => {
                    setRefreshKey(prev => prev + 1);
                }, 500);
            } else {
                throw new Error(result.error?.message || 'Yorum gönderilemedi');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            showToast(
                error instanceof Error ? error.message : 'Yorum gönderilirken bir hata oluştu',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handle like action
     */
    const handleLike = async (commentId: string) => {
        try {
            const response = await fetch(`/api/comments/${commentId}/interactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'like' }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Beğeni işlemi başarısız');
            }
        } catch (error) {
            console.error('Error liking comment:', error);
            showToast('Beğeni işlemi sırasında bir hata oluştu', 'error');
        }
    };

    /**
     * Handle dislike action
     */
    const handleDislike = async (commentId: string) => {
        try {
            const response = await fetch(`/api/comments/${commentId}/interactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'dislike' }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Beğenmeme işlemi başarısız');
            }
        } catch (error) {
            console.error('Error disliking comment:', error);
            showToast('Beğenmeme işlemi sırasında bir hata oluştu', 'error');
        }
    };

    /**
     * Handle report action
     */
    const handleReport = async (commentId: string, reason: string) => {
        try {
            const response = await fetch(`/api/comments/${commentId}/interactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'report', reason }),
            });

            const result = await response.json();

            if (result.success) {
                showToast(result.message || 'Şikayetiniz alındı. Teşekkür ederiz.', 'success');
            } else {
                throw new Error(result.error?.message || 'Şikayet gönderilemedi');
            }
        } catch (error) {
            console.error('Error reporting comment:', error);
            showToast(
                error instanceof Error ? error.message : 'Şikayet gönderilirken bir hata oluştu',
                'error'
            );
        }
    };

    return (
        <>
            <div className="mt-3">
                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className="w-full glass-panel border border-border-dark rounded-xl px-4 py-3 flex items-center justify-between hover:border-primary/30 transition-all group"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">💬</span>
                        <span className="text-white font-medium">
                            Yorum Yap {commentCount > 0 && `(${commentCount})`}
                        </span>
                    </div>
                    <svg
                        className={`w-5 h-5 text-gray-400 group-hover:text-primary transition-all ${isExpanded ? 'rotate-180' : ''
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Expanded Content - Önce yorumlar, sonra form */}
                {isExpanded && (
                    <div className="mt-3 space-y-4 animate-in slide-in-from-top duration-300">
                        {/* Comment List - Yorumlar üstte */}
                        <CommentList
                            key={refreshKey}
                            messageId={messageId}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onReport={handleReport}
                        />

                        {/* Comment Form - Form altta */}
                        <CommentForm
                            messageId={messageId}
                            onSubmit={handleSubmitComment}
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}
            </div>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={closeToast}
            />
        </>
    );
};
