/**
 * Admin Message List Component
 * 
 * Displays messages with approve/reject actions.
 */

'use client';

import React, { useState } from 'react';
import { Message } from '@/lib/domain/entities/Message';
import { Button } from '@/components/ui/Button';

interface AdminMessageListProps {
    messages: Message[];
    onApprove: (id: string) => Promise<void>;
    onReject: (id: string, reason?: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export const AdminMessageList: React.FC<AdminMessageListProps> = ({
    messages,
    onApprove,
    onReject,
    onDelete,
}) => {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const handleApprove = async (id: string) => {
        setLoadingId(id);
        try {
            await onApprove(id);
        } finally {
            setLoadingId(null);
        }
    };

    const handleReject = async (id: string) => {
        setLoadingId(id);
        try {
            await onReject(id, rejectionReason || undefined);
            setRejectingId(null);
            setRejectionReason('');
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) return;

        setLoadingId(id);
        try {
            await onDelete(id);
        } finally {
            setLoadingId(null);
        }
    };

    if (messages.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-neutral-500">Henüz mesaj yok</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    {/* Message Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {/* Status Badge */}
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${message.status === 'PENDING'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : message.status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                >
                                    {message.status === 'PENDING' && '⏳ Beklemede'}
                                    {message.status === 'APPROVED' && '✅ Onaylandı'}
                                    {message.status === 'REJECTED' && '❌ Reddedildi'}
                                </span>

                                {/* Color Indicator */}
                                <div
                                    className="w-6 h-6 rounded border-2"
                                    style={{ backgroundColor: message.color }}
                                    title="Not rengi"
                                />
                            </div>

                            <p className="text-sm text-neutral-500">
                                {message.authorName || 'Anonim'} •{' '}
                                {new Date(message.createdAt).toLocaleString('tr-TR')}
                            </p>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="mb-4">
                        <p className="text-neutral-800 whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {/* Metadata */}
                    {message.metadata && (
                        <div className="mb-4 p-3 bg-neutral-50 rounded text-xs text-neutral-600">
                            <p>IP: {message.metadata.ipAddress || 'N/A'}</p>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {message.status === 'REJECTED' && message.rejectionReason && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">
                                <strong>Ret Nedeni:</strong> {message.rejectionReason}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {message.status === 'PENDING' && (
                            <>
                                <Button
                                    onClick={() => handleApprove(message.id)}
                                    variant="primary"
                                    size="sm"
                                    isLoading={loadingId === message.id}
                                    disabled={loadingId !== null}
                                >
                                    ✅ Onayla
                                </Button>
                                <Button
                                    onClick={() => setRejectingId(message.id)}
                                    variant="danger"
                                    size="sm"
                                    disabled={loadingId !== null}
                                >
                                    ❌ Reddet
                                </Button>
                            </>
                        )}

                        <Button
                            onClick={() => handleDelete(message.id)}
                            variant="ghost"
                            size="sm"
                            disabled={loadingId !== null}
                        >
                            🗑️ Sil
                        </Button>
                    </div>

                    {/* Rejection Modal */}
                    {rejectingId === message.id && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                            <label className="block text-sm font-medium text-red-800 mb-2">
                                Ret Nedeni (Opsiyonel)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-red-400"
                                rows={3}
                                placeholder="Neden reddedildiğini açıklayın..."
                            />
                            <div className="flex gap-2 mt-3">
                                <Button
                                    onClick={() => handleReject(message.id)}
                                    variant="danger"
                                    size="sm"
                                    isLoading={loadingId === message.id}
                                >
                                    Reddet
                                </Button>
                                <Button
                                    onClick={() => {
                                        setRejectingId(null);
                                        setRejectionReason('');
                                    }}
                                    variant="ghost"
                                    size="sm"
                                >
                                    İptal
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
