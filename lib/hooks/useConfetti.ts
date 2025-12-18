/**
 * useConfetti Hook
 * 
 * Konfeti animasyonu için custom hook.
 * Mesaj gönderildiğinde kutlama efekti.
 */

'use client';

import confetti from 'canvas-confetti';

export const useConfetti = () => {
    const fireConfetti = () => {
        // Orta noktadan başlayan konfeti
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 9999,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            });
        }

        // Çoklu patlama efekti
        fire(0.25, {
            spread: 26,
            startVelocity: 55,
            colors: ['#FFD700', '#FFA500', '#FF6347'],
        });

        fire(0.2, {
            spread: 60,
            colors: ['#87CEEB', '#98FB98', '#DDA0DD'],
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
            colors: ['#FFB6C1', '#FAFAD2', '#B0E0E6'],
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
            colors: ['#FF69B4', '#00CED1', '#9370DB'],
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
            colors: ['#FFC0CB', '#FFFFE0', '#E6E6FA'],
        });
    };

    // Özel Sticky Note temalı konfeti
    const fireStickyConfetti = () => {
        const stickyColors = ['#FFF9C4', '#F8BBD0', '#BBDEFB', '#C8E6C9', '#E1BEE7', '#FFE0B2'];

        // Sol taraftan
        confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.6 },
            colors: stickyColors,
            zIndex: 9999,
        });

        // Sağ taraftan
        confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.6 },
            colors: stickyColors,
            zIndex: 9999,
        });

        // Ortadan yukarı
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x: 0.5, y: 0.8 },
                colors: stickyColors,
                zIndex: 9999,
            });
        }, 150);
    };

    return { fireConfetti, fireStickyConfetti };
};
