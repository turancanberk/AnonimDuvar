/**
 * Input Component
 * 
 * Reusable input component with error states and labels.
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
        const hasError = Boolean(error);

        return (
            <div className={cn("grid gap-1.5", fullWidth && "w-full")}>
                {label && (
                    <label
                        className={cn(
                            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                            hasError ? "text-red-500" : "text-neutral-700 dark:text-neutral-300"
                        )}
                    >
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <input
                    ref={ref}
                    className={cn(
                        "flex h-11 w-full rounded-md border border-input bg-white dark:bg-neutral-800 px-3 py-1 text-sm text-neutral-900 dark:text-neutral-100 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        hasError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : "border-neutral-200 dark:border-neutral-600 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-400",
                        className
                    )}
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

Input.displayName = 'Input';
