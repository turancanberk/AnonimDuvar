/**
 * CommentCard Component
 * 
 * Displays a single comment with interactions (like, dislike, report).
 * Follows component composition and clean code principles.
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Comment, getCommentAuthorDisplayName } from '@/lib/domain/entities/Comment';

export interface CommentCardProps {
    comment: Comment;
    onLike?: (commentId: string) => Promise<void>;
    onDislike?: (commentId: string) => Promise<void>;
    onReport?: (commentId: string, reason: string) => Promise<void>;
}

// Neon color themes for comment cards
const COMMENT_THEMES = {
    purple: {
        bg: 'bg-[#7c3aed]/10',
        border: 'border-[#7c3aed]/20',
        text: 'text-[#7c3aed]',
        shadow: 'hover:shadow-[0_0_15px_rgba(124,58,237,0.1)]',
    },
    cyan: {
        bg: 'bg-[#00e5ff]/10',
        border: 'border-[#00e5ff]/20',
        text: 'text-[#00e5ff]',
        shadow: 'hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]',
    },
    pink: {
        bg: 'bg-[#ff0080]/10',
        border: 'border-[#ff0080]/20',
        text: 'text-[#ff0080]',
        shadow: 'hover:shadow-[0_0_15px_rgba(255,0,128,0.1)]',
    },
    green: {
        bg: 'bg-[#00ff9d]/10',
        border: 'border-[#00ff9d]/20',
        text: 'text-[#00ff9d]',
        shadow: 'hover:shadow-[0_0_15px_rgba(0,255,157,0.1)]',
    },
};

const THEME_KEYS = Object.keys(COMMENT_THEMES) as (keyof typeof COMMENT_THEMES)[];

export const CommentCard: React.FC<CommentCardProps> = ({
    comment,
    onLike,
    onDislike,
    onReport,
}) => {
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userLiked, setUserLiked] = useState(false);
    const [userDisliked, setUserDisliked] = useState(false);
    const [likeCount, setLikeCount] = useState(comment.likedBy?.length || 0);
    const [dislikeCount, setDislikeCount] = useState(comment.dislikedBy?.length || 0);

    // Get theme based on comment ID (deterministic)
    const theme = useMemo(() => {
        const hash = comment.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return COMMENT_THEMES[THEME_KEYS[hash % THEME_KEYS.length]];
    }, [comment.id]);

    // Format relative time
    const formattedDate = useMemo(() => {
        const date = new Date(comment.createdAt);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays === 1) return 'Dün';
        if (diffDays < 7) return `${diffDays} gün önce`;

        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'short',
        }).format(date);
    }, [comment.createdAt]);

    // Get display name
    const displayName = getCommentAuthorDisplayName(comment);
    const isAnonymous = displayName === 'Anonim';

    /**
     * Handle like action
     */
    const handleLike = async () => {
        if (!onLike || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onLike(comment.id);
            // Toggle like state
            if (userLiked) {
                setUserLiked(false);
                setLikeCount(prev => Math.max(0, prev - 1));
            } else {
                setUserLiked(true);
                setLikeCount(prev => prev + 1);
                if (userDisliked) {
                    setUserDisliked(false);
                    setDislikeCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handle dislike action
     */
    const handleDislike = async () => {
        if (!onDislike || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onDislike(comment.id);
            // Toggle dislike state
            if (userDisliked) {
                setUserDisliked(false);
                setDislikeCount(prev => Math.max(0, prev - 1));
            } else {
                setUserDisliked(true);
                setDislikeCount(prev => prev + 1);
                if (userLiked) {
                    setUserLiked(false);
                    setLikeCount(prev => Math.max(0, prev - 1));
                }
            }
        } catch (error) {
            console.error('Error disliking comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Handle report submission
     */
    const handleReport = async () => {
        if (!onReport || !reportReason.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onReport(comment.id, reportReason);
            setIsReportModalOpen(false);
            setReportReason('');
        } catch (error) {
            console.error('Error reporting comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className={`
                rounded-xl p-4 border transition-all duration-300
                ${theme.bg} ${theme.border} ${theme.shadow}
                hover:scale-[1.01]
            `}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    {/* Author Badge */}
                    <div className={`
                        px-3 py-1 rounded-full text-xs font-medium
                        ${isAnonymous
                            ? 'bg-gray-700 text-gray-300'
                            : `${theme.bg} ${theme.text} border ${theme.border}`
                        }
                    `}>
                        {displayName}
                    </div>

                    {/* Timestamp */}
                    <span className="text-gray-500 text-xs">
                        {formattedDate}
                    </span>
                </div>

                {/* Content */}
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                    {comment.content}
                </p>

                {/* Footer - Interactions */}
                <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        disabled={isSubmitting}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${userLiked
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-green-400'
                            }`}
                    >
                        <svg className="w-4 h-4" fill={userLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className="text-xs font-medium">{likeCount}</span>
                    </button>

                    {/* Dislike Button */}
                    <button
                        onClick={handleDislike}
                        disabled={isSubmitting}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${userDisliked
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-red-400'
                            }`}
                    >
                        <svg className="w-4 h-4" fill={userDisliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                        <span className="text-xs font-medium">{dislikeCount}</span>
                    </button>

                    {/* Report Button */}
                    {onReport && (
                        <button
                            onClick={() => setIsReportModalOpen(true)}
                            disabled={isSubmitting}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-yellow-400 transition-all ml-auto"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                            </svg>
                            <span className="text-xs font-medium">Şikayet</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Report Modal */}
            {isReportModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setIsReportModalOpen(false)}
                >
                    <div
                        className="bg-[#1a1f2e] border border-gray-700 rounded-2xl p-6 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Yorumu Şikayet Et</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Lütfen şikayet nedeninizi belirtin:
                        </p>
                        <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full bg-[#282e39] border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
                            rows={4}
                            placeholder="Örn: Uygunsuz içerik, spam, hakaret vb."
                            maxLength={500}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleReport}
                                disabled={!reportReason.trim() || isSubmitting}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Gönderiliyor...' : 'Şikayet Et'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
