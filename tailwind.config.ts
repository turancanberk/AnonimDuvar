import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: 'class',
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Ana marka rengi
                "primary": "#256af4",
                // Arka plan renkleri
                "background-light": "#f5f6f8",
                "background-dark": "#101622",
                // Kart ve border renkleri
                "card-dark": "#1b1f27",
                "border-dark": "#282e39",
                // Neon renk paleti - sticky note'lar için
                neon: {
                    cyan: "#00e5ff",
                    pink: "#ff0080",
                    purple: "#7c3aed",
                    green: "#00ff9d",
                    yellow: "#ffea00",
                    orange: "#ff6d00",
                },
                // Pastel renk paleti (eski uyumluluk için)
                pastel: {
                    yellow: "#FFF9C4",
                    pink: "#F8BBD0",
                    blue: "#BBDEFB",
                    green: "#C8E6C9",
                    purple: "#E1BEE7",
                    orange: "#FFE0B2",
                    mint: "#B2DFDB",
                    peach: "#FFCCBC",
                },
                // Nötr renkler
                neutral: {
                    50: "#FAFAFA",
                    100: "#F5F5F5",
                    200: "#EEEEEE",
                    300: "#E0E0E0",
                    400: "#BDBDBD",
                    500: "#9E9E9E",
                    600: "#757575",
                    700: "#616161",
                    800: "#424242",
                    900: "#212121",
                },
            },
            fontFamily: {
                display: ["Inter", "sans-serif"],
                sans: ["var(--font-inter)", "system-ui", "sans-serif"],
                handwriting: ["var(--font-caveat)", "cursive"],
            },
            boxShadow: {
                'neon': '0 0 15px rgba(37, 106, 244, 0.3)',
                'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.15)',
                'neon-pink': '0 0 20px rgba(255, 0, 128, 0.15)',
                'neon-purple': '0 0 20px rgba(124, 58, 237, 0.15)',
                'neon-green': '0 0 20px rgba(0, 255, 157, 0.15)',
                'neon-yellow': '0 0 20px rgba(255, 234, 0, 0.15)',
                'neon-orange': '0 0 20px rgba(255, 109, 0, 0.15)',
                sticky: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                "sticky-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                "glass": "0 35px 60px -15px rgba(0, 0, 0, 0.8)",
            },
            animation: {
                "fade-in": "fadeIn 0.3s ease-in-out",
                "scale-in": "scaleIn 0.3s ease-in-out",
                "slide-up": "slideUp 0.3s ease-in-out",
                "fade-in-delay": "fadeIn 1s ease-in forwards 1s",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(-10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.9)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(10px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
            },
        },
    },
    plugins: [],
};

export default config;
