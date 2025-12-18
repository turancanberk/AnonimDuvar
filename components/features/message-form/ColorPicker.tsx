/**
 * ColorPicker Component
 * 
 * Color picker for sticky note colors.
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { STICKY_NOTE_COLORS, StickyNoteColorKey } from '@/lib/constants/colors';

export interface ColorPickerProps {
    selectedColor: string;
    onColorChange: (color: string, colorKey: StickyNoteColorKey) => void;
    label?: string;
    error?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    selectedColor,
    onColorChange,
    label = 'Renk Seçin',
    error,
}) => {
    const colors = Object.entries(STICKY_NOTE_COLORS);

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    {label}
                </label>
            )}

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {colors.map(([key, colorConfig]) => {
                    const isSelected = selectedColor === colorConfig.main;

                    return (
                        <motion.button
                            key={key}
                            type="button"
                            onClick={() => onColorChange(colorConfig.main, key as StickyNoteColorKey)}
                            className={`
                relative w-full aspect-square rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400
                ${isSelected ? 'ring-4 ring-primary-500 ring-offset-2' : 'hover:scale-110'}
              `}
                            style={{
                                backgroundColor: colorConfig.main,
                                borderColor: colorConfig.border,
                                borderWidth: '2px',
                            }}
                            whileHover={{ scale: isSelected ? 1 : 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label={`${colorConfig.name} rengi seç`}
                            title={colorConfig.name}
                        >
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    <svg
                                        className="w-6 h-6 text-neutral-800"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </motion.div>
                            )}
                        </motion.button>
                    );
                })}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    );
};
