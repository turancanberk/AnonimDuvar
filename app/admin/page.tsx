/**
 * Admin Dashboard Page
 * 
 * Main admin panel for managing messages.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Message, MessageStatus } from '@/lib/domain/entities/Message';
import { AdminMessageList } from '@/components/features/admin/AdminMessageList';
import Link from 'next/link';
import { Toast } from '@/components/ui/Toast';

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [reportedMessages, setReportedMessages] = useState<Message[]>([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REPORTS'>('PENDING');
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Validating polling
    const pollingInterval = useRef<NodeJS.Timeout | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/admin/login');
        }
    }, [status, router]);

    // Fetch messages and stats
    const fetchData = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);

            // Fetch reports if on reports tab
            if (filter === 'REPORTS') {
                const reportsRes = await fetch('/api/admin/reports');
                const reportsData = await reportsRes.json();

                if (reportsData.success) {
                    setReportedMessages(reportsData.data);
                }
            } else {
                // Fetch messages
                const messagesUrl = filter === 'ALL'
                    ? '/api/admin/messages'
                    : `/api/admin/messages?status=${filter}`;

                const messagesRes = await fetch(messagesUrl);
                const messagesData = await messagesRes.json();

                if (messagesData.success) {
                    setMessages(messagesData.data);
                }
            }

            // Fetch stats
            const statsRes = await fetch('/api/admin/statistics');
            const statsData = await statsRes.json();

            if (statsData.success) {
                setStats(statsData.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            if (showLoading) showToast('Veriler yüklenirken hata oluştu', 'error');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();

            // Start Polling (Real-time updates) - Phase 12.3
            pollingInterval.current = setInterval(() => {
                fetchData(false); // Don't show loading spinner on poll
            }, 30000); // Poll every 30 seconds
        }

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [status, filter]);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const closeToast = () => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    };

    // Phase 12.4: Optimistic Updates
    const handleApprove = async (id: string) => {
        const previousMessages = [...messages];
        const previousStats = { ...stats };

        // Optimistically update UI
        setMessages((prev) => {
            if (filter === 'ALL') {
                return prev.map(m => m.id === id ? { ...m, status: 'APPROVED' as MessageStatus } : m);
            } else if (filter === 'PENDING' || filter === 'REJECTED') {
                return prev.filter(m => m.id !== id);
            }
            return prev;
        });

        // Optimistically update stats
        // Finding the message to know its previous status
        const message = messages.find(m => m.id === id);
        if (message) {
            setStats(prev => {
                const newStats = { ...prev };
                const oldStatus = message.status.toLowerCase() as keyof typeof stats;
                if (newStats[oldStatus] !== undefined && newStats.approved !== undefined) {
                    newStats[oldStatus] = Math.max(0, newStats[oldStatus] - 1);
                    newStats.approved += 1;
                }
                return newStats;
            });
        }

        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'APPROVED',
                    moderatedBy: session?.user?.email,
                }),
            });

            const data = await res.json();

            if (data.success) {
                showToast('Mesaj onaylandı!', 'success');
                // We're skipping immediate refetch to rely on optimistic update + polling
            } else {
                throw new Error(data.error?.message || 'Onaylama başarısız');
            }
        } catch (error) {
            // Revert changes on error
            setMessages(previousMessages);
            setStats(previousStats);
            showToast(error instanceof Error ? error.message : 'Bir hata oluştu', 'error');
        }
    };

    const handleReject = async (id: string, reason?: string) => {
        const previousMessages = [...messages];
        const previousStats = { ...stats };

        // Optimistically update UI
        setMessages((prev) => {
            if (filter === 'ALL') {
                return prev.map(m => m.id === id ? { ...m, status: 'REJECTED' as MessageStatus } : m);
            } else if (filter === 'PENDING' || filter === 'APPROVED') {
                return prev.filter(m => m.id !== id);
            }
            return prev;
        });

        // Optimistically update stats
        const message = messages.find(m => m.id === id);
        if (message) {
            setStats(prev => {
                const newStats = { ...prev };
                const oldStatus = message.status.toLowerCase() as keyof typeof stats;
                if (newStats[oldStatus] !== undefined && newStats.rejected !== undefined) {
                    newStats[oldStatus] = Math.max(0, newStats[oldStatus] - 1);
                    newStats.rejected += 1;
                }
                return newStats;
            });
        }

        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'REJECTED',
                    moderatedBy: session?.user?.email,
                    rejectionReason: reason,
                }),
            });

            const data = await res.json();

            if (data.success) {
                showToast('Mesaj reddedildi', 'success');
            } else {
                throw new Error(data.error?.message || 'Reddetme başarısız');
            }
        } catch (error) {
            // Revert
            setMessages(previousMessages);
            setStats(previousStats);
            showToast(error instanceof Error ? error.message : 'Bir hata oluştu', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        const previousMessages = [...messages];
        const previousStats = { ...stats };

        // Optimistically update
        setMessages((prev) => prev.filter(m => m.id !== id));

        const message = messages.find(m => m.id === id);
        if (message) {
            setStats(prev => {
                const newStats = { ...prev };
                const oldStatus = message.status.toLowerCase() as keyof typeof stats;
                if (newStats[oldStatus] !== undefined) {
                    newStats[oldStatus] = Math.max(0, newStats[oldStatus] - 1);
                }
                newStats.total = Math.max(0, newStats.total - 1);
                return newStats;
            });
        }

        try {
            const res = await fetch(`/api/admin/messages/${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (data.success) {
                showToast('Mesaj silindi', 'success');
            } else {
                throw new Error(data.error?.message || 'Silme başarısız');
            }
        } catch (error) {
            setMessages(previousMessages);
            setStats(previousStats);
            showToast(error instanceof Error ? error.message : 'Bir hata oluştu', 'error');
        }
    };

    if (status === 'loading' || status === 'unauthenticated') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e14]">
            {/* Toast */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={closeToast}
            />

            {/* Header */}
            <header className="bg-[#1b1f27]/95 backdrop-blur-xl border-b border-[#3b4354] sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                            <p className="text-sm text-gray-400">Hoş geldin, {session?.user?.name || 'Admin'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="px-4 py-2 text-gray-300 hover:bg-[#282e39] rounded-lg transition-colors"
                            >
                                Anasayfa
                            </Link>
                            <Link
                                href="/api/auth/signout"
                                className="px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Çıkış Yap
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-400 font-medium">Bekleyen</p>
                                <p className="text-3xl font-bold text-yellow-300">{stats.pending}</p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">⏳</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-green-500/20 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-400 font-medium">Onaylanan</p>
                                <p className="text-3xl font-bold text-green-300">{stats.approved}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">✅</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-400 font-medium">Reddedilen</p>
                                <p className="text-3xl font-bold text-red-300">{stats.rejected}</p>
                            </div>
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">❌</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-400 font-medium">Toplam</p>
                                <p className="text-3xl font-bold text-blue-300">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                <span className="text-2xl">📊</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-[#1b1f27]/80 backdrop-blur-sm border border-[#3b4354] rounded-lg shadow-sm p-2 mb-6 flex gap-2">
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'REPORTS'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-400 hover:bg-[#282e39] hover:text-white'
                                }`}
                        >
                            {status === 'ALL' && '📋 Tümü'}
                            {status === 'PENDING' && '⏳ Bekleyen'}
                            {status === 'APPROVED' && '✅ Onaylanan'}
                            {status === 'REJECTED' && '❌ Reddedilen'}
                            {status === 'REPORTS' && '🚩 Şikayetler'}
                        </button>
                    ))}
                </div>

                {/* Messages List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
                    </div>
                ) : filter === 'REPORTS' ? (
                    /* Reports View */
                    <div className="space-y-4">
                        {reportedMessages.length === 0 ? (
                            <div className="bg-white rounded-lg p-8 text-center">
                                <p className="text-gray-500">Şikayet edilen mesaj bulunmuyor</p>
                            </div>
                        ) : (
                            reportedMessages.map((message) => (
                                <div key={message.id} className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <p className="text-gray-800 mb-2">{message.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>Durum: <span className={`font-medium ${message.status === 'APPROVED' ? 'text-green-600' :
                                                    message.status === 'REJECTED' ? 'text-red-600' :
                                                        'text-yellow-600'
                                                    }`}>{message.status}</span></span>
                                                <span>Yazar: {message.authorName || 'Anonim'}</span>
                                                <span>Tarih: {new Date(message.createdAt).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {message.status !== 'APPROVED' && (
                                                <button
                                                    onClick={() => handleApprove(message.id)}
                                                    className="px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                                                >
                                                    Onayla
                                                </button>
                                            )}
                                            {message.status !== 'REJECTED' && (
                                                <button
                                                    onClick={() => handleReject(message.id, 'Şikayet nedeniyle reddedildi')}
                                                    className="px-3 py-1.5 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 transition-colors"
                                                >
                                                    Reddet
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(message.id)}
                                                className="px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                                            >
                                                Sil
                                            </button>
                                        </div>
                                    </div>

                                    {/* Reports Section */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <span className="text-red-500">🚩</span>
                                            Şikayetler ({message.reports?.length || 0})
                                        </h4>
                                        <div className="space-y-2">
                                            {message.reports?.map((report) => (
                                                <div key={report.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm text-gray-700 font-medium">Neden: {report.reason}</p>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(report.reportedAt).toLocaleString('tr-TR')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">IP: {report.reportedBy}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <AdminMessageList
                        messages={messages}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onDelete={handleDelete}
                    />
                )}
            </main>
        </div>
    );
}
