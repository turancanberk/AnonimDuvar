/**
 * Home Page - İtiraf Duvarı
 * 
 * Anonim itiraf paylaşım platformu ana sayfası.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageForm, MessageFormData } from '@/components/features/message-form/MessageForm';
import { StickyNoteWall } from '@/components/features/sticky-note/StickyNoteWall';
import { StickyNote } from '@/components/features/sticky-note/StickyNote';
import { Toast } from '@/components/ui/Toast';
import { Message } from '@/lib/domain/entities/Message';
import { useConfetti } from '@/lib/hooks/useConfetti';

// Skeleton loader cards
const SkeletonCard: React.FC = () => (
    <div className={`break-inside-avoid rounded-xl bg-[#282e39] border border-gray-700 p-5 opacity-40 hover:opacity-100 transition-opacity`}>
        <div className="flex justify-between mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-700"></div>
            <div className="h-2 w-10 bg-gray-700 rounded mt-2"></div>
        </div>
        <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
        <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
        <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
    </div>
);

export default function HomePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    // Confetti hook
    const { fireStickyConfetti } = useConfetti();

    // Fetch approved messages
    const fetchMessages = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/messages?limit=50');
            const data = await response.json();

            if (data.success) {
                setMessages(data.data);
            } else {
                console.error('API Error:', data.error);
                throw new Error(data.error?.message || 'Mesajlar alınamadı');
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            showToast(error instanceof Error ? error.message : 'Mesajlar yüklenirken bir hata oluştu', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    // Submit new message
    const handleSubmit = async (formData: MessageFormData) => {
        try {
            // Check cooldown (10 seconds)
            const lastSubmitTime = localStorage.getItem('lastMessageSubmitTime');
            if (lastSubmitTime) {
                const timeSinceLastSubmit = Date.now() - parseInt(lastSubmitTime);
                const cooldownMs = 10 * 1000; // 10 seconds

                if (timeSinceLastSubmit < cooldownMs) {
                    const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastSubmit) / 1000);
                    showToast(
                        `Lütfen ${remainingSeconds} saniye bekleyin ve tekrar deneyin.`,
                        'warning'
                    );
                    return;
                }
            }

            setIsSubmitting(true);

            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                // Save submission time
                localStorage.setItem('lastMessageSubmitTime', Date.now().toString());

                // 🎉 Konfeti patlasın!
                fireStickyConfetti();

                showToast(
                    data.message || 'Mesajınız başarıyla gönderildi! Admin onayından sonra yayınlanacak.',
                    'success'
                );
            } else {
                throw new Error(data.error?.message || 'Mesaj gönderilemedi');
            }
        } catch (error) {
            console.error('Error submitting message:', error);
            showToast(
                error instanceof Error ? error.message : 'Mesaj gönderilirken bir hata oluştu',
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };


    // Show toast notification
    const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    // Close toast
    const closeToast = () => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    };

    // Fetch messages on mount
    useEffect(() => {
        fetchMessages();

        // Detect mobile viewport
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Filter messages based on search query
    const filteredMessages = messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (message.authorName && message.authorName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background-dark text-white font-display relative selection:bg-primary selection:text-white w-full flex flex-col overflow-y-auto pb-20">
            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border-dark h-16 transition-all duration-300">
                <div className="w-full h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <div className="relative size-16">
                            <Image
                                src="/images/logo.png"
                                alt="Anonim Duvar Logo"
                                width={64}
                                height={64}
                                className="object-contain w-full h-full"
                            />
                        </div>
                        <h1 className="text-white text-xl font-bold tracking-tight hidden md:block neon-text-shadow">Anonim Duvar</h1>
                    </Link>

                    {/* Navigation Links */}
                    {/* Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/">
                            Ana Sayfa
                        </Link>
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/motivasyon">
                            Neden Yazmalısın?
                        </Link>
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/sss">
                            SSS
                        </Link>
                        <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors border-b-2 border-transparent hover:border-primary py-1" href="/kurallar">
                            Kurallar
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <div className="relative hidden sm:block group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                className="bg-[#282e39] border-none text-sm rounded-lg block w-40 pl-10 p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="Ara..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                suppressHydrationWarning
                            />
                        </div>
                    </div>
                </div>
            </header>
            {/* Main Content Area - 3 Column Layout (Flow) */}
            <main className="relative flex-1 w-full pt-16 bg-background-dark">
                <div className="w-full max-w-[1800px] mx-auto flex gap-4 px-4 pb-8">

                    {/* LEFT COLUMN: Sticky Notes */}
                    <div className="hidden lg:flex flex-1 flex-col gap-4 py-8">
                        {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
                            filteredMessages.filter((_, i) => i % 3 === 0).map((message, i) => (
                                <div key={message.id}><StickyNote message={message} index={i} /></div>
                            ))
                        }
                    </div>

                    {/* CENTER COLUMN: Notes + Form (Sticky) */}
                    <div className="flex-1 lg:flex-none lg:w-[600px] flex flex-col gap-8 py-8">
                        {/* Mobile/Tablet: Show first few notes before form */}
                        <div className="flex flex-col gap-4 lg:hidden">
                            {isLoading ? <SkeletonCard /> :
                                filteredMessages.slice(0, 3).map((message, i) => (
                                    <div key={message.id}><StickyNote message={message} index={i} /></div>
                                ))
                            }
                        </div>

                        {/* THE FORM - Part of the flow now */}
                        <div className="sticky top-24 z-40 my-4">
                            <div className="relative">
                                {/* Decorative "Shadow" Card behind form to give depth */}
                                <div className="absolute inset-0 bg-[#111318] rounded-3xl blur-xl scale-95 translate-y-4 opacity-80"></div>
                                <MessageForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
                            </div>
                        </div>

                        {/* Rest of the notes for Center Column */}
                        <div className="flex flex-col gap-4">
                            {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
                                filteredMessages.filter((_, i) => {
                                    // On mobile: show all remaining messages (skip first 3)
                                    // On desktop (3 cols): show only middle column (index % 3 === 1)
                                    if (isMobile) {
                                        return i >= 3; // Mobile: show all except first 3
                                    }
                                    return i % 3 === 1; // Desktop: middle column only
                                }).map((message, i) => (
                                    <div key={message.id}><StickyNote message={message} index={i} /></div>
                                ))
                            }
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Sticky Notes */}
                    <div className="hidden lg:flex flex-1 flex-col gap-4 py-8">
                        {isLoading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) :
                            filteredMessages.filter((_, i) => i % 3 === 2).map((message, i) => (
                                <div key={message.id}><StickyNote message={message} index={i} /></div>
                            ))
                        }
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-border-dark py-3">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                            </svg>
                            <span><strong className="text-white">{messages.length}</strong> itiraf duvarda</span>
                        </span>
                        <span className="hidden sm:inline text-gray-600">•</span>
                        <span className="hidden sm:flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span>Tamamen anonim</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <Link href="/sss" className="hover:text-white transition-colors">SSS</Link>
                        <Link href="/kurallar" className="hover:text-white transition-colors">Kurallar</Link>
                        <span className="text-gray-600">© 2025 Anonim Duvar</span>
                    </div>
                </div>
            </footer>

            {/* Toast Notification */}
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={closeToast}
            />
        </div>
    );
}
