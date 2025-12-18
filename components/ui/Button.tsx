/**
 * Button Component
 * 
 * Reusable button component with variants and sizes.
 * Follows design system principles.
 * Refactored to match shadcn/ui styles.
 */

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Using standard shadcn naming where possible, but mapping old variants for compatibility
const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary-600 text-primary-foreground hover:bg-primary-700/90",
                primary: "bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm", // Modern primary
                secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200/80 shadow-sm",
                danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
                ghost: "hover:bg-neutral-100 hover:text-neutral-900",
                link: "text-primary underline-offset-4 hover:underline",
                outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                md: "h-11 rounded-md px-8 text-base", // Mapping old 'md' to bigger comfortable size
                lg: "h-12 rounded-md px-8 text-lg",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);

// Map old variant names to new cva variants if needed, or just extend the type
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'default' | 'outline' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'default';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children' | 'size'>,
    Omit<VariantProps<typeof buttonVariants>, 'size' | 'variant'> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    isLoading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    return (
        <motion.button
            className={cn(buttonVariants({ variant, size, fullWidth, className }))}
            disabled={disabled || isLoading}
            whileHover={!disabled && !isLoading ? { scale: 1.01 } : {}}
            whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </motion.button>
    );
};
