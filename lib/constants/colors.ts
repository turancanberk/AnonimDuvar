/**
 * Color Constants
 * 
 * Defines the sticky note color palette and related types.
 */

/**
 * Sticky note color configuration
 */
export interface StickyNoteColor {
    /**
     * Main color (hex)
     */
    main: string;

    /**
     * Border color (hex)
     */
    border: string;

    /**
     * Text color (hex)
     */
    text: string;

    /**
     * Display name
     */
    name: string;
}

/**
 * Sticky note color palette
 * Based on pastel colors for a soft, friendly appearance
 */
export const STICKY_NOTE_COLORS = {
    yellow: {
        main: '#FFF9C4',
        border: '#FFF59D',
        text: '#F57F17',
        name: 'Sarı',
    },
    pink: {
        main: '#F8BBD0',
        border: '#F48FB1',
        text: '#880E4F',
        name: 'Pembe',
    },
    blue: {
        main: '#BBDEFB',
        border: '#90CAF9',
        text: '#0D47A1',
        name: 'Mavi',
    },
    green: {
        main: '#C8E6C9',
        border: '#A5D6A7',
        text: '#1B5E20',
        name: 'Yeşil',
    },
    purple: {
        main: '#E1BEE7',
        border: '#CE93D8',
        text: '#4A148C',
        name: 'Mor',
    },
    orange: {
        main: '#FFE0B2',
        border: '#FFCC80',
        text: '#E65100',
        name: 'Turuncu',
    },
    mint: {
        main: '#B2DFDB',
        border: '#80CBC4',
        text: '#004D40',
        name: 'Nane Yeşili',
    },
    peach: {
        main: '#FFCCBC',
        border: '#FFAB91',
        text: '#BF360C',
        name: 'Şeftali',
    },
} as const;

/**
 * Type for sticky note color keys
 */
export type StickyNoteColorKey = keyof typeof STICKY_NOTE_COLORS;

/**
 * Array of all available color keys
 */
export const STICKY_NOTE_COLOR_KEYS = Object.keys(STICKY_NOTE_COLORS) as StickyNoteColorKey[];

/**
 * Array of all available color values (hex codes)
 */
export const STICKY_NOTE_COLOR_VALUES = Object.values(STICKY_NOTE_COLORS).map(color => color.main);

/**
 * Get color configuration by key
 */
export const getColorByKey = (key: StickyNoteColorKey): StickyNoteColor => {
    return STICKY_NOTE_COLORS[key];
};

/**
 * Get color key by hex value
 */
export const getColorKeyByValue = (value: string): StickyNoteColorKey | undefined => {
    const entry = Object.entries(STICKY_NOTE_COLORS).find(
        ([, color]) => color.main === value
    );
    return entry ? (entry[0] as StickyNoteColorKey) : undefined;
};

/**
 * Check if a color value is valid
 */
export const isValidColor = (value: string): boolean => {
    return STICKY_NOTE_COLOR_VALUES.includes(value as any);
};

/**
 * Get a random color key
 */
export const getRandomColorKey = (): StickyNoteColorKey => {
    const keys = STICKY_NOTE_COLOR_KEYS;
    return keys[Math.floor(Math.random() * keys.length)];
};

/**
 * Get a random color value
 */
export const getRandomColorValue = (): string => {
    return getColorByKey(getRandomColorKey()).main;
};
