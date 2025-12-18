/**
 * MessageForm Component - İtiraf Duvarı Dark Theme
 * 
 * Anonim itiraf gönderme formu.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MESSAGE_VALIDATION } from '@/lib/constants/validation';

export interface MessageFormData {
    content: string;
    color: string;
    authorName?: string;
}

export interface MessageFormProps {
    onSubmit: (data: MessageFormData) => Promise<void>;
    isSubmitting?: boolean;
}

// Neon renk paleti
const NEON_COLORS = [
    { name: 'cyan', color: '#00e5ff' },
    { name: 'pink', color: '#ff0080' },
    { name: 'purple', color: '#7c3aed' },
    { name: 'green', color: '#00ff9d' },
    { name: 'yellow', color: '#ffea00' },
    { name: 'orange', color: '#ff6d00' },
    { name: 'blue', color: '#256af4' },
];

export const MessageForm: React.FC<MessageFormProps> = ({ onSubmit, isSubmitting = false }) => {
    const [content, setContent] = useState('');
    const [identityMode, setIdentityMode] = useState<'anonim' | 'rumuz'>('anonim');
    const [authorName, setAuthorName] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [cooldownSeconds, setCooldownSeconds] = useState(0);

    // Check cooldown on mount and set up interval
    useEffect(() => {
        const checkCooldown = () => {
            const lastSubmitTime = localStorage.getItem('lastMessageSubmitTime');
            if (lastSubmitTime) {
                const timeSinceLastSubmit = Date.now() - parseInt(lastSubmitTime);
                const cooldownMs = 10 * 1000; // 10 seconds

                if (timeSinceLastSubmit < cooldownMs) {
                    const remaining = Math.ceil((cooldownMs - timeSinceLastSubmit) / 1000);
                    setCooldownSeconds(remaining);
                } else {
                    setCooldownSeconds(0);
                }
            }
        };

        checkCooldown();
        const interval = setInterval(checkCooldown, 1000);

        return () => clearInterval(interval);
    }, []);

    // Rastgele renk seç
    const getRandomColor = () => {
        return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)].color;
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate content
        if (!content.trim()) {
            newErrors.content = 'Mesaj içeriği gereklidir';
        } else if (content.trim().length < MESSAGE_VALIDATION.MIN_MEANINGFUL_LENGTH) {
            newErrors.content = `Mesaj en az ${MESSAGE_VALIDATION.MIN_MEANINGFUL_LENGTH} karakter olmalıdır`;
        } else if (content.length > MESSAGE_VALIDATION.MAX_LENGTH) {
            newErrors.content = `Mesaj en fazla ${MESSAGE_VALIDATION.MAX_LENGTH} karakter olabilir`;
        }

        // Validate rumuz if selected
        if (identityMode === 'rumuz' && !authorName.trim()) {
            newErrors.authorName = 'Rumuz gereklidir';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit({
                content: content.trim(),
                color: getRandomColor(),
                authorName: identityMode === 'rumuz' ? authorName.trim() : undefined,
            });

            // Start cooldown
            setCooldownSeconds(10);

            // Reset form on success
            setContent('');
            setAuthorName('');
            setErrors({});
        } catch (error) {
            // Error handling is done by parent component
            console.error('Form submission error:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
        >
            {/* Main Card Container */}
            <div className="relative bg-[#1b1f27]/85 backdrop-blur-xl border border-[#3b4354] rounded-2xl shadow-glass overflow-hidden">
                {/* Decorative Top Glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-5 relative z-10">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium mb-2">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            %100 Anonim & Güvenli
                        </div>
                        <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight neon-text-shadow">
                            İçini Dök, Rahatla.
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
                            Bazen içimizde biriktirdiklerimiz bizi boğar.
                            <span className="text-white/70"> Paylaşmak, yükü hafifletmenin ilk adımıdır.</span>
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Seni dinliyoruz
                            </div>
                            <div className="w-px h-4 bg-gray-700"></div>
                            <div className="text-xs text-gray-500">Yargılamadan, şartsız</div>
                        </div>
                    </div>

                    {/* Text Area */}
                    <div className="relative group">
                        <div className="absolute -top-2 left-4 px-2 bg-[#1b1f27] text-xs text-gray-500 z-10">
                            💭 Aklından geçenleri yaz...
                        </div>
                        <textarea
                            className="w-full min-h-[140px] bg-[#111318]/50 border border-[#282e39] focus:border-primary/50 text-white rounded-xl p-4 pt-5 text-base resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-gray-600 transition-all duration-300"
                            placeholder="Bugün seni ne rahatsız etti? Kime söyleyemedin? Ne hissediyorsun?..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            maxLength={MESSAGE_VALIDATION.MAX_LENGTH}
                            disabled={isSubmitting}
                        />
                        <div className="absolute bottom-3 right-3 text-xs text-gray-500 pointer-events-none">
                            {content.length}/{MESSAGE_VALIDATION.MAX_LENGTH}
                        </div>
                        {errors.content && (
                            <p className="mt-2 text-xs text-red-400">{errors.content}</p>
                        )}
                    </div>

                    {/* Rumuz Input (if rumuz mode) */}
                    {identityMode === 'rumuz' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="relative"
                        >
                            <input
                                type="text"
                                className="w-full bg-[#111318]/50 border border-[#282e39] focus:border-primary/50 text-white rounded-xl p-4 text-base focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder-gray-500 transition-all duration-300"
                                placeholder="@rumuzun (örn: @AşkTanesi)"
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                maxLength={30}
                                disabled={isSubmitting}
                            />
                            {errors.authorName && (
                                <p className="mt-2 text-xs text-red-400">{errors.authorName}</p>
                            )}
                        </motion.div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                        {/* Identity Toggle */}
                        <div className="bg-[#111318]/50 p-1 rounded-lg border border-[#282e39] flex w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={() => setIdentityMode('anonim')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all text-center ${identityMode === 'anonim'
                                    ? 'bg-[#282e39] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Anonim
                            </button>
                            <button
                                type="button"
                                onClick={() => setIdentityMode('rumuz')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all text-center ${identityMode === 'rumuz'
                                    ? 'bg-[#282e39] text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Rumuz
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting || cooldownSeconds > 0}
                            className="w-full sm:w-auto bg-primary hover:bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Gönderiliyor...</span>
                                </>
                            ) : cooldownSeconds > 0 ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{cooldownSeconds} saniye bekle</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <span>Duvara Yapıştır</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Floating hints below form */}
            <div className="text-center mt-5 space-y-3 animate-fade-in-delay">
                {/* Admin Approval Notice */}
                <div className="flex items-center justify-center gap-2 text-xs text-amber-400/80 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 max-w-fit mx-auto">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Mesajlarınız admin onayından sonra yayınlanacaktır</span>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-6 text-xs text-white/40">
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-green-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Uçtan uca şifreli
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                        IP gizli
                    </span>
                    <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        7/24 açık
                    </span>
                </div>

                {/* Motivational Quote */}
                <p className="text-white/25 text-xs italic max-w-sm mx-auto">
                    &ldquo;Konuşmak, ruhun nefes almasıdır.&rdquo;
                </p>
            </div>
        </motion.div>
    );
};
