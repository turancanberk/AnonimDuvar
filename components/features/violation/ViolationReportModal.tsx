/**
 * Violation Report Modal Component
 * 
 * Modal form for submitting violation reports
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VIOLATION_REPORT_TYPE_LABELS, ViolationReportType } from '@/lib/domain/entities/ViolationReport';

interface ViolationReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ViolationReportModal({ isOpen, onClose, onSuccess }: ViolationReportModalProps) {
    const [type, setType] = useState<ViolationReportType>('OTHER');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!description.trim()) {
            setError('Lütfen bir açıklama girin');
            return;
        }

        if (description.length > 1000) {
            setError('Açıklama çok uzun (maksimum 1000 karakter)');
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch('/api/violation-reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    description: description.trim(),
                    url: url.trim() || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                onSuccess();
                handleClose();
            } else {
                setError(data.error?.message || 'Bildirim gönderilemedi');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setType('OTHER');
        setDescription('');
        setUrl('');
        setError('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#1b1f27] border border-[#282e39] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-[#1b1f27] border-b border-[#282e39] p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <span className="text-2xl">🚩</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">İhlal Bildir</h2>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        İhlal Türü *
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as ViolationReportType)}
                                        className="w-full bg-[#0a0e14] border border-[#282e39] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        required
                                    >
                                        {Object.entries(VIOLATION_REPORT_TYPE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Açıklama * <span className="text-gray-500 text-xs">({description.length}/1000)</span>
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Lütfen ihlali detaylı bir şekilde açıklayın..."
                                        className="w-full bg-[#0a0e14] border border-[#282e39] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
                                        rows={5}
                                        maxLength={1000}
                                        required
                                    />
                                </div>

                                {/* URL (Optional) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        URL veya Mesaj Linki (Opsiyonel)
                                    </label>
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-[#0a0e14] border border-[#282e39] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                        <p className="text-red-400 text-sm">{error}</p>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                    <p className="text-blue-400 text-sm">
                                        <span className="font-medium">Not:</span> Bildiriminiz anonim olarak gönderilecek ve en kısa sürede incelenecektir.
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-3 bg-[#282e39] text-white rounded-lg hover:bg-[#3b4354] transition-colors font-medium"
                                        disabled={isSubmitting}
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Gönderiliyor...
                                            </>
                                        ) : (
                                            'Bildir'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
