/**
 * StickyNote Component - İtiraf Duvarı Dark Theme
 * 
 * Neon-glow confession cards with color-coded themes.
 */

'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/domain/entities/Message';
import { CommentForm } from '@/components/features/comment/CommentForm';
import { CommentList } from '@/components/features/comment/CommentList';
import { Toast } from '@/components/ui/Toast';

export interface StickyNoteProps {
    message: Message;
    index?: number;
}

// Neon color themes
const NEON_THEMES = {
    cyan: {
        color: '#00e5ff',
        bg: 'bg-[#00e5ff]/10',
        border: 'border-[#00e5ff]/20',
        text: 'text-[#00e5ff]',
        borderColor: 'border-[#00e5ff]/10',
        shadow: 'hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]',
    },
    pink: {
        color: '#ff0080',
        bg: 'bg-[#ff0080]/10',
        border: 'border-[#ff0080]/20',
        text: 'text-[#ff0080]',
        borderColor: 'border-[#ff0080]/10',
        shadow: 'hover:shadow-[0_0_20px_rgba(255,0,128,0.15)]',
    },
    purple: {
        color: '#7c3aed',
        bg: 'bg-[#7c3aed]/10',
        border: 'border-[#7c3aed]/20',
        text: 'text-[#7c3aed]',
        borderColor: 'border-[#7c3aed]/10',
        shadow: 'hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]',
    },
    green: {
        color: '#00ff9d',
        bg: 'bg-[#00ff9d]/10',
        border: 'border-[#00ff9d]/20',
        text: 'text-[#00ff9d]',
        borderColor: 'border-[#00ff9d]/10',
        shadow: 'hover:shadow-[0_0_20px_rgba(0,255,157,0.15)]',
    },
    yellow: {
        color: '#ffea00',
        bg: 'bg-[#ffea00]/10',
        border: 'border-[#ffea00]/20',
        text: 'text-[#ffea00]',
        borderColor: 'border-[#ffea00]/10',
        shadow: 'hover:shadow-[0_0_20px_rgba(255,234,0,0.15)]',
    },
    blue: {
        color: '#256af4',
        bg: 'bg-[#256af4]/10',
        border: 'border-[#256af4]/20',
        text: 'text-[#256af4]',
        borderColor: 'border-[#256af4]/10',
        shadow: 'hover:shadow-[0_0_20px_rgba(37,106,244,0.15)]',
    },
    orange: {
        color: '#ff6d00',
        bg: 'bg-[#ff6d00]/10',
        border: 'border-[#ff6d00]/20',
        text: 'text-[#ff6d00]',
        borderColor: 'border-[#ff6d00]/10',
        shadow: 'hover:shadow-[0_0_20px_rgba(255,109,0,0.15)]',
    },
};

const THEME_KEYS = Object.keys(NEON_THEMES) as (keyof typeof NEON_THEMES)[];

// Rotation classes for natural look
const ROTATIONS = ['-rotate-1', 'rotate-2', '-rotate-2', 'rotate-1', 'rotate-3', '-rotate-3'];

export const StickyNote: React.FC<StickyNoteProps> = ({ message, index = 0 }) => {
    const [likeCount, setLikeCount] = useState(message.likedBy?.length || 0);
    const [dislikeCount, setDislikeCount] = useState(message.dislikedBy?.length || 0);
    const [userLiked, setUserLiked] = useState(false);
    const [userDisliked, setUserDisliked] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Comment section state
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Update counts when message changes (e.g., after page refresh)
    useEffect(() => {
        setLikeCount(message.likedBy?.length || 0);
        setDislikeCount(message.dislikedBy?.length || 0);
    }, [message.likedBy, message.dislikedBy]);

    // Load user's interaction state from localStorage on mount
    useEffect(() => {
        const likedMessages = JSON.parse(localStorage.getItem('likedMessages') || '[]');
        const dislikedMessages = JSON.parse(localStorage.getItem('dislikedMessages') || '[]');

        setUserLiked(likedMessages.includes(message.id));
        setUserDisliked(dislikedMessages.includes(message.id));
    }, [message.id]);

    // Fetch approved comment count
    useEffect(() => {
        const fetchCommentCount = async () => {
            try {
                const response = await fetch(`/api/comments?messageId=${message.id}&status=APPROVED&limit=1`);
                const data = await response.json();
                if (data.success) {
                    setCommentCount(data.pagination.total || 0);
                }
            } catch (error) {
                console.error('Error fetching comment count:', error);
            }
        };

        fetchCommentCount();
    }, [message.id, isCommentsExpanded]);

    // Get theme based on message color or index
    const theme = useMemo(() => {
        // Try to match message color to a theme
        if (message.color) {
            const colorLower = message.color.toLowerCase();
            const matchedTheme = THEME_KEYS.find(key =>
                colorLower.includes(NEON_THEMES[key].color.toLowerCase()) ||
                NEON_THEMES[key].color.toLowerCase() === colorLower
            );
            if (matchedTheme) return NEON_THEMES[matchedTheme];
        }

        // Otherwise use index-based selection
        return NEON_THEMES[THEME_KEYS[index % THEME_KEYS.length]];
    }, [message.color, index]);

    // Get rotation class
    const rotation = ROTATIONS[index % ROTATIONS.length];

    // Format date
    const formattedDate = useMemo(() => {
        const date = new Date(message.createdAt);
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
    }, [message.createdAt]);

    // Format author name
    const displayName = useMemo(() => {
        if (!message.authorName) return 'Anonim';
        // Add @ if not already present for rumuz style
        return message.authorName.startsWith('@') ? message.authorName : `@${message.authorName}`;
    }, [message.authorName]);

    // Handle interaction
    const handleInteraction = async (action: 'like' | 'dislike') => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/messages/${message.id}/interactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            if (data.success) {
                setLikeCount(data.data.likeCount);
                setDislikeCount(data.data.dislikeCount);
                setUserLiked(data.data.userLiked);
                setUserDisliked(data.data.userDisliked);

                // Update localStorage
                const likedMessages = JSON.parse(localStorage.getItem('likedMessages') || '[]');
                const dislikedMessages = JSON.parse(localStorage.getItem('dislikedMessages') || '[]');

                if (data.data.userLiked) {
                    if (!likedMessages.includes(message.id)) {
                        likedMessages.push(message.id);
                    }
                    const dislikedIndex = dislikedMessages.indexOf(message.id);
                    if (dislikedIndex > -1) {
                        dislikedMessages.splice(dislikedIndex, 1);
                    }
                } else {
                    const likedIndex = likedMessages.indexOf(message.id);
                    if (likedIndex > -1) {
                        likedMessages.splice(likedIndex, 1);
                    }
                }

                if (data.data.userDisliked) {
                    if (!dislikedMessages.includes(message.id)) {
                        dislikedMessages.push(message.id);
                    }
                    const likedIndex = likedMessages.indexOf(message.id);
                    if (likedIndex > -1) {
                        likedMessages.splice(likedIndex, 1);
                    }
                } else {
                    const dislikedIndex = dislikedMessages.indexOf(message.id);
                    if (dislikedIndex > -1) {
                        dislikedMessages.splice(dislikedIndex, 1);
                    }
                }

                localStorage.setItem('likedMessages', JSON.stringify(likedMessages));
                localStorage.setItem('dislikedMessages', JSON.stringify(dislikedMessages));
            }
        } catch (error) {
            console.error('Interaction error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle report
    const handleReport = async () => {
        if (!reportReason.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/messages/${message.id}/interactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'report', reason: reportReason }),
            });

            const data = await response.json();

            if (data.success) {
                setIsReportModalOpen(false);
                setReportReason('');
                alert('Şikayetiniz alındı. Teşekkür ederiz.');
            } else {
                alert(data.error?.message || 'Şikayet gönderilemedi');
            }
        } catch (error) {
            console.error('Report error:', error);
            alert('Bir hata oluştu');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <motion.div
                whileHover={{
                    scale: 1.02,
                    zIndex: 10,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                }}
                className={`
                    relative group rounded-xl p-5
                    ${theme.bg} border ${theme.border}
                    transition-transform duration-300
                    ${theme.shadow}
                    ${rotation}
                `}
            >
                {/* Quote icon for some cards */}
                {index % 3 === 0 && (
                    <span className={`absolute top-4 right-4 ${theme.text} opacity-50 text-xl`}>
                        ❝
                    </span>
                )}

                {/* Content */}
                <p className="text-white/90 text-sm leading-relaxed font-medium mb-3">
                    {message.content}
                </p>

                {/* Footer */}
                <div className={`flex items-center justify-between mt-2 pt-3 border-t ${theme.borderColor}`}>
                    <span className={`${theme.text} text-xs font-semibold`}>
                        {displayName}
                    </span>
                    <span className="text-gray-400 text-xs">
                        {formattedDate}
                    </span>
                </div>

                {/* Interaction Buttons */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
                    {/* Like Button */}
                    <button
                        onClick={() => handleInteraction('like')}
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
                        onClick={() => handleInteraction('dislike')}
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
                </div>

                {/* Comment Section - Inline */}
                <div className="mt-3 pt-3 border-t border-white/5">
                    <button
                        onClick={() => setIsCommentsExpanded(!isCommentsExpanded)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-sm text-gray-300 font-medium">
                                Yorum Yap {commentCount > 0 && `(${commentCount})`}
                            </span>
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 group-hover:text-primary transition-all ${isCommentsExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isCommentsExpanded && (
                        <div className="mt-3 space-y-3">
                            <CommentForm
                                messageId={message.id}
                                onSubmit={async (data) => {
                                    setIsSubmitting(true);
                                    try {
                                        const response = await fetch('/api/comments', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                messageId: message.id,
                                                content: data.content,
                                                authorName: data.authorName
                                            }),
                                        });
                                        const result = await response.json();

                                        if (result.success) {
                                            // Show success notification
                                            setToast({
                                                message: 'Yorumunuz gönderildi! Admin onayından sonra yayınlanacaktır. 🎉',
                                                type: 'success',
                                                isVisible: true,
                                            });
                                            // Don't increment count - only approved comments are counted
                                        } else {
                                            setToast({
                                                message: result.error?.message || 'Yorum gönderilemedi',
                                                type: 'error',
                                                isVisible: true,
                                            });
                                        }
                                    } catch (error) {
                                        console.error('Error:', error);
                                        setToast({
                                            message: 'Yorum gönderilirken bir hata oluştu',
                                            type: 'error',
                                            isVisible: true,
                                        });
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                }}
                                isSubmitting={isSubmitting}
                            />
                            <CommentList
                                messageId={message.id}
                                onLike={async (id) => { await fetch(`/api/comments/${id}/interactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'like' }) }); }}
                                onDislike={async (id) => { await fetch(`/api/comments/${id}/interactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'dislike' }) }); }}
                                onReport={async (id, reason) => { await fetch(`/api/comments/${id}/interactions`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'report', reason }) }); }}
                            />
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Report Modal */}
            <AnimatePresence>
                {isReportModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                        onClick={() => setIsReportModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1f2e] border border-gray-700 rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Mesajı Şikayet Et</h3>
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </>
    );
};
