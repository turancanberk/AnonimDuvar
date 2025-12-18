/**
 * StickyNoteWall Component - İtiraf Duvarı Dark Theme
 * 
 * Masonry-style grid layout for confession cards.
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '@/lib/domain/entities/Message';
import { StickyNote } from './StickyNote';

export interface StickyNoteWallProps {
    messages: Message[];
    isLoading?: boolean;
    mode?: 'grid' | 'fullscreen' | 'masonry';
}

// Skeleton loader cards
const SkeletonCard: React.FC<{ rotate: string }> = ({ rotate }) => (
    <div className={`break-inside-avoid rounded-xl bg-[#282e39] border border-gray-700 p-5 opacity-40 hover:opacity-100 transition-opacity ${rotate}`}>
        <div className="flex justify-between mb-4">
            <div className="h-8 w-8 rounded-full bg-gray-700"></div>
            <div className="h-2 w-10 bg-gray-700 rounded mt-2"></div>
        </div>
        <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
        <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
        <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
    </div>
);

export const StickyNoteWall: React.FC<StickyNoteWallProps> = ({
    messages,
    isLoading = false,
    mode = 'masonry'
}) => {
    if (isLoading) {
        return (
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                {[...Array(10)].map((_, i) => (
                    <SkeletonCard key={i} rotate={i % 2 === 0 ? 'rotate-1' : '-rotate-1'} />
                ))}
            </div>
        );
    }

    if (messages.length === 0) {
        if (mode === 'fullscreen' || mode === 'masonry') {
            // Show some placeholder skeleton cards even when empty
            return (
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <SkeletonCard key={i} rotate={i % 2 === 0 ? 'rotate-1' : '-rotate-2'} />
                    ))}
                </div>
            );
        }

        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <svg
                        className="mx-auto h-24 w-24 text-gray-600 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">
                        Henüz itiraf yok
                    </h3>
                    <p className="text-gray-500">
                        İlk itirafı sen gönder ve duvara yapıştır!
                    </p>
                </div>
            </div>
        );
    }

    // Masonry mode (default for İtiraf Duvarı)
    return (
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            <AnimatePresence mode="popLayout">
                {messages.map((message, index) => (
                    <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                        className="break-inside-avoid"
                    >
                        <StickyNote message={message} index={index} />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Filler skeleton cards for visual density */}
            <div className="break-inside-avoid rounded-xl bg-[#282e39] border border-gray-700 p-5 opacity-60 hover:opacity-100 transition-opacity rotate-1">
                <div className="h-2 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-2 w-3/4 bg-gray-700 rounded"></div>
            </div>
            <div className="break-inside-avoid rounded-xl bg-[#282e39] border border-gray-700 p-5 opacity-40 hover:opacity-100 transition-opacity -rotate-3">
                <div className="flex justify-between mb-4">
                    <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                    <div className="h-2 w-10 bg-gray-700 rounded mt-2"></div>
                </div>
                <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-2 w-full bg-gray-700 rounded mb-2"></div>
                <div className="h-2 w-1/2 bg-gray-700 rounded"></div>
            </div>
        </div>
    );
};
