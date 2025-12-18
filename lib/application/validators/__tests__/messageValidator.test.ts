/**
 * MessageValidator Unit Tests
 * 
 * Bu dosya mesaj validasyon kurallarını test eder.
 * - Content (içerik) kontrolü
 * - Color (renk) kontrolü
 * - Author name (yazar ismi) kontrolü
 * - Status (durum) kontrolü
 */

import { describe, it, expect } from 'vitest';
import { MessageValidator, ValidationError } from '../messageValidator';
import { STICKY_NOTE_COLORS } from '@/lib/constants/colors';

describe('MessageValidator', () => {

    // ============================================
    // Content Validation Tests (İçerik Kontrolü)
    // ============================================
    describe('validateContent', () => {
        it('boş içerik için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateContent('')).toThrow(ValidationError);
        });

        it('tek karakter içerik kabul etmeli (minimum uzunluk 1)', () => {
            // Minimum uzunluk 1 olduğundan tek karakter geçerli
            expect(() => MessageValidator.validateContent('a')).not.toThrow();
        });

        it('geçerli içerik için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateContent('Bu geçerli bir mesaj içeriğidir.')).not.toThrow();
        });

        it('sadece boşluk içeren metin için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateContent('     ')).toThrow(ValidationError);
        });

        it('null değer için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateContent(null as any)).toThrow(ValidationError);
        });

        it('undefined değer için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateContent(undefined as any)).toThrow(ValidationError);
        });

        it('çok uzun içerik için hata fırlatmalı', () => {
            const longContent = 'a'.repeat(1001);
            expect(() => MessageValidator.validateContent(longContent)).toThrow(ValidationError);
        });
    });

    // ============================================
    // Color Validation Tests (Renk Kontrolü)
    // ============================================
    describe('validateColor', () => {
        it('geçerli sarı renk için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateColor(STICKY_NOTE_COLORS.yellow.main)).not.toThrow();
        });

        it('geçerli pembe renk için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateColor(STICKY_NOTE_COLORS.pink.main)).not.toThrow();
        });

        it('geçerli mavi renk için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateColor(STICKY_NOTE_COLORS.blue.main)).not.toThrow();
        });

        it('geçersiz hex renk için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateColor('#INVALID')).toThrow(ValidationError);
        });

        it('izin verilmeyen renk için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateColor('#123456')).toThrow(ValidationError);
        });

        it('boş renk için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateColor('')).toThrow(ValidationError);
        });

        it('null renk için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateColor(null as any)).toThrow(ValidationError);
        });
    });

    // ============================================
    // Author Name Validation Tests (Yazar İsmi)
    // ============================================
    describe('validateAuthorName', () => {
        it('boş isim için hata fırlatmamalı (opsiyonel)', () => {
            expect(() => MessageValidator.validateAuthorName('')).not.toThrow();
        });

        it('undefined isim için hata fırlatmamalı (opsiyonel)', () => {
            expect(() => MessageValidator.validateAuthorName(undefined)).not.toThrow();
        });

        it('geçerli isim için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateAuthorName('Ahmet')).not.toThrow();
        });

        it('çok uzun isim için hata fırlatmalı', () => {
            const longName = 'a'.repeat(100);
            expect(() => MessageValidator.validateAuthorName(longName)).toThrow(ValidationError);
        });
    });

    // ============================================
    // Status Validation Tests (Durum Kontrolü)
    // ============================================
    describe('validateStatus', () => {
        it('PENDING durumu için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateStatus('PENDING')).not.toThrow();
        });

        it('APPROVED durumu için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateStatus('APPROVED')).not.toThrow();
        });

        it('REJECTED durumu için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateStatus('REJECTED')).not.toThrow();
        });

        it('geçersiz durum için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateStatus('INVALID')).toThrow(ValidationError);
        });

        it('küçük harfli durum için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateStatus('pending')).toThrow(ValidationError);
        });
    });

    // ============================================
    // Complete Message Validation (Tam Mesaj)
    // ============================================
    describe('validateCreateMessage', () => {
        it('geçerli mesaj verisi için hata fırlatmamalı', () => {
            expect(() => MessageValidator.validateCreateMessage({
                content: 'Bu geçerli bir mesajdır.',
                color: STICKY_NOTE_COLORS.yellow.main,
                authorName: 'Test Kullanıcı',
            })).not.toThrow();
        });

        it('isimsiz mesaj için hata fırlatmamalı (anonim)', () => {
            expect(() => MessageValidator.validateCreateMessage({
                content: 'Bu anonim bir mesajdır.',
                color: STICKY_NOTE_COLORS.pink.main,
            })).not.toThrow();
        });

        it('eksik içerik için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateCreateMessage({
                content: '',
                color: STICKY_NOTE_COLORS.yellow.main,
            })).toThrow(ValidationError);
        });

        it('eksik renk için hata fırlatmalı', () => {
            expect(() => MessageValidator.validateCreateMessage({
                content: 'Geçerli içerik',
                color: '',
            })).toThrow(ValidationError);
        });
    });
});
