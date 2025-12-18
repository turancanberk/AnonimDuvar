/**
 * Textarea Component
 * 
 * Reusable textarea component with character count and error states.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
    showCharCount?: boolean;
    maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
            label,
            error,
            helperText,
            fullWidth = false,
            showCharCount = false,
            maxLength,
            className,
            value,
            ...props
        },
        ref
    ) => {
        const hasError = Boolean(error);
        const currentLength = typeof value === 'string' ? value.length : 0;

        return (
            <div className={cn("grid gap-1.5", fullWidth && "w-full")}>
                {label && (
                    <div className="flex items-center justify-between">
                        <label
                            className={cn(
                                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                hasError ? "text-red-500" : "text-neutral-700 dark:text-neutral-300"
                            )}
                        >
                            {label}
                            {props.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {showCharCount && maxLength && (
                            <span className={cn("text-xs", currentLength > maxLength ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400")}>
                                {currentLength}/{maxLength}
                            </span>
                        )}
                    </div>
                )}

                <textarea
                    ref={ref}
                    className={cn(
                        "flex min-h-[80px] w-full rounded-md border border-input bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 shadow-sm placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        hasError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-neutral-200 dark:border-neutral-600 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400",
                        className
                    )}
                    maxLength={maxLength}
                    value={value}
                    {...props}
                />

                {(error || helperText) && (
                    <p className={cn("text-xs font-medium", hasError ? "text-red-600 dark:text-red-400" : "text-neutral-500 dark:text-neutral-400")}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
