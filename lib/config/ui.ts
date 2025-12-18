/**
 * UI Configuration
 * 
 * Defines UI-related constants and settings.
 */

/**
 * Layout configuration
 */
export const LAYOUT_CONFIG = {
    /**
     * Maximum width of the main container
     */
    MAX_CONTAINER_WIDTH: '1400px',

    /**
     * Padding for main container
     */
    CONTAINER_PADDING: {
        mobile: '1rem',
        tablet: '2rem',
        desktop: '3rem',
    },

    /**
     * Header height
     */
    HEADER_HEIGHT: '80px',

    /**
     * Footer height
     */
    FOOTER_HEIGHT: '60px',
} as const;

/**
 * Sticky note grid configuration
 */
export const GRID_CONFIG = {
    /**
     * Number of columns for different screen sizes
     */
    COLUMNS: {
        mobile: 1,
        tablet: 2,
        desktop: 3,
        wide: 4,
    },

    /**
     * Gap between sticky notes
     */
    GAP: {
        mobile: '1rem',
        tablet: '1.5rem',
        desktop: '2rem',
    },

    /**
     * Sticky note dimensions
     */
    NOTE_SIZE: {
        width: '280px',
        minHeight: '200px',
        maxHeight: '400px',
    },
} as const;

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
    /**
     * Number of messages to load per page (public view)
     */
    MESSAGES_PER_PAGE: 12,

    /**
     * Number of messages to load per page (admin view)
     */
    ADMIN_MESSAGES_PER_PAGE: 20,

    /**
     * Number of messages to initially load
     */
    INITIAL_LOAD_COUNT: 12,
} as const;

/**
 * Toast notification configuration
 */
export const TOAST_CONFIG = {
    /**
     * Default duration for toast notifications (ms)
     */
    DURATION: 3000,

    /**
     * Position of toast notifications
     */
    POSITION: 'bottom-right' as const,

    /**
     * Maximum number of toasts to show at once
     */
    MAX_TOASTS: 3,
} as const;

/**
 * Loading state configuration
 */
export const LOADING_CONFIG = {
    /**
     * Minimum loading time to prevent flash (ms)
     */
    MIN_LOADING_TIME: 500,

    /**
     * Debounce time for search inputs (ms)
     */
    SEARCH_DEBOUNCE: 300,

    /**
     * Skeleton loader count
     */
    SKELETON_COUNT: 6,
} as const;

/**
 * Z-index layers
 */
export const Z_INDEX = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    toast: 50,
    tooltip: 60,
} as const;

/**
 * Breakpoints (matches Tailwind defaults)
 */
export const BREAKPOINTS = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;
