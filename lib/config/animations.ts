/**
 * Animation Configuration
 * 
 * Defines animation settings for Framer Motion.
 */

import { Variants } from 'framer-motion';

/**
 * Animation duration constants (seconds)
 */
export const ANIMATION_DURATION = {
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
} as const;

/**
 * Animation easing functions
 */
export const ANIMATION_EASING = {
    easeOut: [0.0, 0.0, 0.2, 1],
    easeIn: [0.4, 0.0, 1, 1],
    easeInOut: [0.4, 0.0, 0.2, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
    bounce: { type: 'spring', stiffness: 400, damping: 10 },
} as const;

/**
 * Sticky note entrance animation
 */
export const stickyNoteEntranceVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
        y: 20,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: ANIMATION_DURATION.normal,
            ease: ANIMATION_EASING.easeOut,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.8,
        transition: {
            duration: ANIMATION_DURATION.fast,
        },
    },
};

/**
 * Sticky note hover animation
 */
export const stickyNoteHoverVariants: Variants = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    hover: {
        scale: 1.05,
        y: -8,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: {
            duration: ANIMATION_DURATION.fast,
            ease: ANIMATION_EASING.easeOut,
        },
    },
};

/**
 * Stagger animation for multiple items
 */
export const staggerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

/**
 * Fade in animation
 */
export const fadeInVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: ANIMATION_DURATION.normal,
        },
    },
};

/**
 * Slide in from bottom animation
 */
export const slideInFromBottomVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 50,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: ANIMATION_DURATION.normal,
            ease: ANIMATION_EASING.easeOut,
        },
    },
};

/**
 * Slide in from top animation
 */
export const slideInFromTopVariants: Variants = {
    hidden: {
        opacity: 0,
        y: -50,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: ANIMATION_DURATION.normal,
            ease: ANIMATION_EASING.easeOut,
        },
    },
};

/**
 * Scale animation
 */
export const scaleVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: ANIMATION_DURATION.normal,
            ease: ANIMATION_EASING.easeOut,
        },
    },
};

/**
 * Button press animation
 */
export const buttonPressVariants: Variants = {
    rest: { scale: 1 },
    pressed: {
        scale: 0.95,
        transition: {
            duration: ANIMATION_DURATION.fast,
        },
    },
};

/**
 * Modal/Dialog animation
 */
export const modalVariants: Variants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
    },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: ANIMATION_DURATION.normal,
            ease: ANIMATION_EASING.easeOut,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
            duration: ANIMATION_DURATION.fast,
        },
    },
};

/**
 * Toast notification animation
 */
export const toastVariants: Variants = {
    hidden: {
        opacity: 0,
        x: 100,
        scale: 0.8,
    },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: ANIMATION_DURATION.normal,
            ease: ANIMATION_EASING.easeOut,
        },
    },
    exit: {
        opacity: 0,
        x: 100,
        transition: {
            duration: ANIMATION_DURATION.fast,
        },
    },
};

/**
 * Generate random rotation for sticky notes (-4° to 4°)
 */
export const getRandomRotation = (): number => {
    return Math.random() * 8 - 4; // Random between -4 and 4
};

/**
 * Page transition variants
 */
export const pageTransitionVariants: Variants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: ANIMATION_DURATION.normal,
            ease: ANIMATION_EASING.easeOut,
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: ANIMATION_DURATION.fast,
        },
    },
};
