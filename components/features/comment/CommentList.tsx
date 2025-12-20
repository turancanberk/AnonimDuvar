/**
 * CommentList Component
 * 
 * Displays a list of comments with pagination/infinite scroll.
 * Follows component composition and clean code principles.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '@/lib/domain/entities/Comment';
import { CommentCard } from './CommentCard';
import { COMMENT_CONSTRAINTS } from '@/lib/constants/commentConstants';

export interface CommentListProps {
    messageId: string;
    onLike?: (commentId: string) => Promise<void>;
    onDislike?: (commentId: string) => Promise<void>;
    onReport?: (commentId: string, reason: string) => Promise<void>;
}

interface CommentListState {
    comments: Comment[];
    isLoading: boolean;
    hasMore: boolean;
    total: number;
    offset: number;
}

// Skeleton loader for comments
const CommentSkeleton: React.FC = () => (
    <div className="rounded-xl bg-[#282e39]/30 border border-gray-700/30 p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
            <div className="h-6 w-24 bg-gray-700 rounded-full"></div>
            <div className="h-4 w-16 bg-gray-700 rounded"></div>
        </div>
        <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-gray-700 rounded"></div>
            <div className="h-4 w-5/6 bg-gray-700 rounded"></div>
        </div>
        <div className="flex gap-3 pt-3 border-t border-white/5">
            <div className="h-8 w-16 bg-gray-700 rounded-lg"></div>
            <div className="h-8 w-16 bg-gray-700 rounded-lg"></div>
        </div>
    </div>
);

// Empty state component
const EmptyState: React.FC = () => (
    <div className="text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-white text-lg font-semibold mb-2">
            Henüz yorum yok
        </h3>
        <p className="text-gray-400 text-sm">
            İlk yorumu yapan sen ol!
        </p>
    </div>
);

export const CommentList: React.FC<CommentListProps> = ({
    messageId,
    onLike,
    onDislike,
    onReport,
}) => {
    const [state, setState] = useState<CommentListState>({
        comments: [],
        isLoading: true,
        hasMore: false,
        total: 0,
        offset: 0,
    });

    const [isLoadingMore, setIsLoadingMore] = useState(false);

    /**
     * Fetch comments from API
     */
    const fetchComments = async (offset: number = 0, append: boolean = false) => {
        try {
            if (!append) {
                setState(prev => ({ ...prev, isLoading: true }));
            } else {
                setIsLoadingMore(true);
            }

            const response = await fetch(
                `/api/comments?messageId=${messageId}&status=APPROVED&limit=${COMMENT_CONSTRAINTS.DEFAULT_COMMENTS_PER_PAGE}&offset=${offset}&sortBy=newest`
            );

            const data = await response.json();

            if (data.success) {
                setState(prev => ({
                    comments: append
                        ? [...prev.comments, ...data.data]
                        : data.data,
                    isLoading: false,
                    hasMore: data.pagination.hasMore,
                    total: data.pagination.total,
                    offset: offset + data.data.length,
                }));
            } else {
                throw new Error(data.error?.message || 'Yorumlar yüklenemedi');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            setState(prev => ({ ...prev, isLoading: false }));
        } finally {
            setIsLoadingMore(false);
        }
    };

    /**
     * Load more comments
     */
    const loadMore = () => {
        if (!isLoadingMore && state.hasMore) {
            fetchComments(state.offset, true);
        }
    };

    /**
     * Refresh comments (e.g., after posting a new comment)
     */
    const refresh = () => {
        fetchComments(0, false);
    };

    // Fetch comments on mount
    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageId]);

    return (
        <div className="space-y-4">
            {/* Header with count */}
            {state.total > 0 && !state.isLoading && (
                <div className="flex items-center justify-center">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                    <span className="px-4 text-gray-400 text-sm font-medium">
                        {state.total} Yorum
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                </div>
            )}

            {/* Loading state */}
            {state.isLoading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <CommentSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!state.isLoading && state.comments.length === 0 && (
                <EmptyState />
            )}

            {/* Comments list */}
            {!state.isLoading && state.comments.length > 0 && (
                <div className="space-y-3">
                    {state.comments.map((comment) => (
                        <CommentCard
                            key={comment.id}
                            comment={comment}
                            onLike={onLike}
                            onDislike={onDislike}
                            onReport={onReport}
                        />
                    ))}
                </div>
            )}

            {/* Load more button */}
            {state.hasMore && !state.isLoading && (
                <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="w-full py-3 px-4 rounded-lg border-2 border-dashed border-gray-600 text-gray-400 hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoadingMore ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Yükleniyor...
                        </span>
                    ) : (
                        <span>
                            Daha Fazla Yorum Yükle ({state.total - state.comments.length} kaldı)
                        </span>
                    )}
                </button>
            )}
        </div>
    );
};
