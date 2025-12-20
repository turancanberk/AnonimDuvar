/**
 * Admin Comments Section Component
 * 
 * Embedded comment management for admin dashboard.
 * Can be used standalone or embedded in admin page.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/lib/domain/entities/Comment';

interface CommentStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    reported: number;
    deletedCount: number;
    todayCount: number;
}

type CommentFilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPORTED';

interface AdminCommentsSectionProps {
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AdminCommentsSection: React.FC<AdminCommentsSectionProps> = ({ showToast }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [stats, setStats] = useState<CommentStats | null>(null);
    const [filterStatus, setFilterStatus] = useState<CommentFilterStatus>('PENDING');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());

    // Helper function to format IP addresses
    const formatIpAddress = (ip: string): string => {
        if (ip === '::1' || ip === '127.0.0.1') {
            return 'Localhost (Yerel)';
        }
        if (ip.startsWith('::ffff:')) {
            return ip.replace('::ffff:', '');
        }
        return ip;
    };

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'ALL') {
                if (filterStatus === 'REPORTED') {
                    params.append('reported', 'true');
                } else {
                    params.append('status', filterStatus);
                }
            }

            const response = await fetch(`/api/admin/comments?${params}`);
            const data = await response.json();

            if (data.success) {
                setComments(data.data);
            } else {
                showToast(data.error?.message || 'Yorumlar yüklenemedi', 'error');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            showToast('Yorumlar yüklenirken bir hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, showToast]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/comments/statistics');
            const data = await response.json();

            if (data.success) {
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, []);

    // Fetch on mount and filter change
    useEffect(() => {
        fetchComments();
        fetchStats();
    }, [fetchComments, fetchStats]);

    // Actions
    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/admin/comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Yorum onaylandı', 'success');
                fetchComments();
                fetchStats();
            } else {
                showToast(data.error?.message || 'Onaylama başarısız', 'error');
            }
        } catch (error) {
            console.error('Error approving comment:', error);
            showToast('Bir hata oluştu', 'error');
        }
    };

    const handleReject = async (id: string, reason?: string) => {
        try {
            const response = await fetch(`/api/admin/comments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', reason }),
            });

            const data = await response.json();

            if (data.success) {
                showToast('Yorum reddedildi', 'success');
                fetchComments();
                fetchStats();
            } else {
                showToast(data.error?.message || 'Reddetme başarısız', 'error');
            }
        } catch (error) {
            console.error('Error rejecting comment:', error);
            showToast('Bir hata oluştu', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

        try {
            const response = await fetch(`/api/admin/comments/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                showToast('Yorum silindi', 'success');
                fetchComments();
                fetchStats();
            } else {
                showToast(data.error?.message || 'Silme başarısız', 'error');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            showToast('Bir hata oluştu', 'error');
        }
    };

    const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
        if (selectedComments.size === 0) {
            showToast('Lütfen en az bir yorum seçin', 'warning');
            return;
        }

        const confirmMessage = `${selectedComments.size} yorumu ${action === 'approve' ? 'onaylamak' : action === 'reject' ? 'reddetmek' : 'silmek'
            } istediğinizden emin misiniz?`;

        if (!confirm(confirmMessage)) return;

        try {
            const response = await fetch('/api/admin/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    commentIds: Array.from(selectedComments),
                }),
            });

            const data = await response.json();

            if (data.success) {
                showToast(`${data.data.count} yorum işlendi`, 'success');
                setSelectedComments(new Set());
                fetchComments();
                fetchStats();
            } else {
                showToast(data.error?.message || 'Toplu işlem başarısız', 'error');
            }
        } catch (error) {
            console.error('Error in bulk action:', error);
            showToast('Bir hata oluştu', 'error');
        }
    };

    const toggleSelectComment = (id: string) => {
        const newSelected = new Set(selectedComments);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedComments(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedComments.size === comments.length) {
            setSelectedComments(new Set());
        } else {
            setSelectedComments(new Set(comments.map(c => c.id)));
        }
    };

    const getRelativeTime = (date: Date | string) => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(date).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        return `${diffDays} gün önce`;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-[#3b4354] p-4 rounded-xl">
                        <div className="text-gray-400 text-sm mb-1">Toplam</div>
                        <div className="text-2xl font-bold text-white">{stats.total}</div>
                    </div>
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-yellow-500/30 bg-yellow-500/5 p-4 rounded-xl">
                        <div className="text-yellow-400 text-sm mb-1">Bekleyen</div>
                        <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                    </div>
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-green-500/30 bg-green-500/5 p-4 rounded-xl">
                        <div className="text-green-400 text-sm mb-1">Onaylı</div>
                        <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                    </div>
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-red-500/30 bg-red-500/5 p-4 rounded-xl">
                        <div className="text-red-400 text-sm mb-1">Reddedildi</div>
                        <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                    </div>
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-orange-500/30 bg-orange-500/5 p-4 rounded-xl">
                        <div className="text-orange-400 text-sm mb-1">Raporlanan</div>
                        <div className="text-2xl font-bold text-orange-400">{stats.reported}</div>
                    </div>
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-purple-500/30 bg-purple-500/5 p-4 rounded-xl">
                        <div className="text-purple-400 text-sm mb-1">Bugün</div>
                        <div className="text-2xl font-bold text-purple-400">{stats.todayCount}</div>
                    </div>
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-gray-500/30 p-4 rounded-xl">
                        <div className="text-gray-400 text-sm mb-1">Silindi</div>
                        <div className="text-2xl font-bold text-gray-400">{stats.deletedCount}</div>
                    </div>
                </div>
            )}

            {/* Filters and Bulk Actions */}
            <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-[#3b4354] p-4 rounded-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'REPORTED'] as CommentFilterStatus[]).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg transition-all ${filterStatus === status
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {status === 'ALL' ? 'Tümü' :
                                    status === 'PENDING' ? 'Bekleyen' :
                                        status === 'APPROVED' ? 'Onaylı' :
                                            status === 'REJECTED' ? 'Reddedildi' : 'Raporlanan'}
                            </button>
                        ))}
                    </div>

                    {/* Bulk Actions */}
                    {selectedComments.size > 0 && (
                        <div className="flex gap-2">
                            <span className="text-gray-400 text-sm self-center">
                                {selectedComments.size} seçili
                            </span>
                            <button
                                onClick={() => handleBulkAction('approve')}
                                className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all"
                            >
                                ✓ Onayla
                            </button>
                            <button
                                onClick={() => handleBulkAction('reject')}
                                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all"
                            >
                                ✕ Reddet
                            </button>
                            <button
                                onClick={() => handleBulkAction('delete')}
                                className="px-3 py-1.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg text-sm transition-all"
                            >
                                🗑 Sil
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div>
                {isLoading ? (
                    <div className="text-center text-gray-400 py-12">Yükleniyor...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                        <div className="text-6xl mb-4">💬</div>
                        <div className="text-xl">Yorum bulunamadı</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Select All */}
                        <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-[#3b4354] p-3 rounded-lg flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={selectedComments.size === comments.length && comments.length > 0}
                                onChange={toggleSelectAll}
                                className="w-5 h-5 rounded border-gray-600 bg-white/5"
                            />
                            <span className="text-gray-400 text-sm">Tümünü Seç</span>
                        </div>

                        {/* Comment Cards */}
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className={`bg-[#1b1f27]/80 backdrop-blur-sm p-4 rounded-xl border transition-all ${selectedComments.has(comment.id)
                                    ? 'border-purple-500 bg-purple-500/5'
                                    : 'border-[#3b4354] hover:border-purple-500/30'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    {/* Checkbox */}
                                    <input
                                        type="checkbox"
                                        checked={selectedComments.has(comment.id)}
                                        onChange={() => toggleSelectComment(comment.id)}
                                        className="w-5 h-5 rounded border-gray-600 bg-white/5 mt-1"
                                    />

                                    {/* Content */}
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className="text-white font-medium">
                                                    🎭 {comment.authorName || 'Anonim'}
                                                </span>
                                                <span className="text-gray-500 text-sm ml-2">
                                                    {getRelativeTime(comment.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Status Badge */}
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${comment.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    comment.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                    {comment.status === 'PENDING' ? 'Bekliyor' :
                                                        comment.status === 'APPROVED' ? 'Onaylı' : 'Reddedildi'}
                                                </span>

                                                {/* Reports Badge */}
                                                {comment.reports && comment.reports.length > 0 && (
                                                    <span className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                                                        🚩 {comment.reports.length} Rapor
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comment Content */}
                                        <p className="text-gray-300 mb-3">{comment.content}</p>

                                        {/* Metadata */}
                                        <div className="space-y-2 mb-3">
                                            {/* Message Preview */}
                                            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                                                <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                                    <span>📝</span>
                                                    <span>Bağlı Mesaj:</span>
                                                </div>
                                                <p className="text-sm text-gray-300 italic line-clamp-2">
                                                    "{(comment as any).messagePreview || 'Yükleniyor...'}"
                                                </p>
                                                <a
                                                    href={`/?highlight=${comment.messageId}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-purple-400 hover:text-purple-300 underline mt-1 inline-block"
                                                >
                                                    Mesajı görüntüle →
                                                </a>
                                            </div>
                                            {comment.metadata?.ipAddress && (
                                                <div className="text-xs text-gray-500">
                                                    IP Adresi: <span className="font-mono text-gray-400">{formatIpAddress(comment.metadata.ipAddress)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {comment.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(comment.id)}
                                                        className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-sm transition-all"
                                                    >
                                                        ✓ Onayla
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(comment.id)}
                                                        className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-all"
                                                    >
                                                        ✕ Reddet
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="px-3 py-1.5 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg text-sm transition-all"
                                            >
                                                🗑 Sil
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
