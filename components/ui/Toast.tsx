/**
 * Toast Component
 * 
 * Notification toast with auto-dismiss and animations.
 */

'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose: () => void;
    isVisible: boolean;
}

const toastStyles: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
    success: {
        bg: 'bg-green-50 border-green-200',
        icon: '✓',
        iconColor: 'bg-green-500 text-white',
    },
    error: {
        bg: 'bg-red-50 border-red-200',
        icon: '✕',
        iconColor: 'bg-red-500 text-white',
    },
    warning: {
        bg: 'bg-yellow-50 border-yellow-200',
        icon: '⚠',
        iconColor: 'bg-yellow-500 text-white',
    },
    info: {
        bg: 'bg-blue-50 border-blue-200',
        icon: 'ℹ',
        iconColor: 'bg-blue-500 text-white',
    },
};

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    duration = 5000,
    onClose,
    isVisible,
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const styles = toastStyles[type];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className={`
            fixed top-4 right-4 z-50
            max-w-md w-full
            flex items-start gap-3
            p-4 rounded-lg border-2 shadow-lg
            ${styles.bg}
          `}
                >
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${styles.iconColor}`}>
                        {styles.icon}
                    </div>

                    <p className="flex-1 text-sm text-neutral-800 font-medium">{message}</p>

                    <button
                        onClick={onClose}
                        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label="Kapat"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
