/**
 * Message Service Tests
 * 
 * Vitest ile MessageValidator için kapsamlı testler.
 * 
 * @module MessageServiceTests
 */

import { describe, it, expect } from 'vitest';
import { MessageValidator, ValidationError } from '../../validators/messageValidator';
import { STICKY_NOTE_COLORS } from '@/lib/constants/colors';

describe('MessageValidator - Detaylı Testler', () => {

    // ========================================
    // Content Validation Tests
    // ========================================
    describe('validateContent', () => {
        it('geçerli içerik kabul etmeli', () => {
            expect(() => MessageValidator.validateContent('Bu geçerli bir mesajdır')).not.toThrow();
        });

        it('boş içerik reddetmeli', () => {
            expect(() => MessageValidator.validateContent('')).toThrow(ValidationError);
        });

        it('sadece boşluk içeren içerik reddetmeli', () => {
            expect(() => MessageValidator.validateContent('   ')).toThrow(ValidationError);
        });

        it('maksimum uzunluğu aşan içerik reddetmeli', () => {
            const longContent = 'a'.repeat(501);
            expect(() => MessageValidator.validateContent(longContent)).toThrow(ValidationError);
        });
    });

    // ========================================
    // Color Validation Tests
    // ========================================
    describe('validateColor', () => {
        it('paletteki geçerli renk kabul etmeli', () => {
            expect(() => MessageValidator.validateColor(STICKY_NOTE_COLORS.yellow.main)).not.toThrow();
        });

        it('geçersiz hex renk reddetmeli', () => {
            expect(() => MessageValidator.validateColor('#GGGGGG')).toThrow(ValidationError);
        });

        it('palette olmayan renk reddetmeli', () => {
            expect(() => MessageValidator.validateColor('#000000')).toThrow(ValidationError);
        });

        it('boş renk reddetmeli', () => {
            expect(() => MessageValidator.validateColor('')).toThrow(ValidationError);
        });
    });

    // ========================================
    // Author Name Validation Tests
    // ========================================
    describe('validateAuthorName', () => {
        it('geçerli yazar ismi kabul etmeli', () => {
            expect(() => MessageValidator.validateAuthorName('Ahmet')).not.toThrow();
        });

        it('undefined yazar ismi kabul etmeli (opsiyonel)', () => {
            expect(() => MessageValidator.validateAuthorName(undefined)).not.toThrow();
        });

        it('minimum uzunluktan kısa isim reddetmeli', () => {
            expect(() => MessageValidator.validateAuthorName('A')).toThrow(ValidationError);
        });

        it('maksimum uzunluğu aşan isim reddetmeli', () => {
            const longName = 'a'.repeat(51);
            expect(() => MessageValidator.validateAuthorName(longName)).toThrow(ValidationError);
        });
    });

    // ========================================
    // Status Validation Tests
    // ========================================
    describe('validateStatus', () => {
        it('PENDING durumu kabul etmeli', () => {
            expect(() => MessageValidator.validateStatus('PENDING')).not.toThrow();
        });

        it('APPROVED durumu kabul etmeli', () => {
            expect(() => MessageValidator.validateStatus('APPROVED')).not.toThrow();
        });

        it('REJECTED durumu kabul etmeli', () => {
            expect(() => MessageValidator.validateStatus('REJECTED')).not.toThrow();
        });

        it('geçersiz durum reddetmeli', () => {
            expect(() => MessageValidator.validateStatus('INVALID')).toThrow(ValidationError);
        });
    });

    // ========================================
    // Rejection Reason Validation Tests
    // ========================================
    describe('validateRejectionReason', () => {
        it('REJECTED durumunda red nedeni olmadan hata fırlatmalı', () => {
            expect(() => MessageValidator.validateRejectionReason('REJECTED', undefined)).toThrow(ValidationError);
        });

        it('REJECTED durumunda red nedeni kabul etmeli', () => {
            expect(() => MessageValidator.validateRejectionReason('REJECTED', 'Uygunsuz içerik')).not.toThrow();
        });

        it('APPROVED durumunda red nedeni gerektirmemeli', () => {
            expect(() => MessageValidator.validateRejectionReason('APPROVED', undefined)).not.toThrow();
        });
    });

    // ========================================
    // Complete Message Validation Tests
    // ========================================
    describe('validateCreateMessage', () => {
        it('geçerli mesaj oluşturma verisi kabul etmeli', () => {
            expect(() => MessageValidator.validateCreateMessage({
                content: 'Geçerli bir mesaj',
                color: STICKY_NOTE_COLORS.yellow.main,
                authorName: 'Ahmet',
            })).not.toThrow();
        });

        it('yazar ismi olmadan mesaj kabul etmeli (anonim)', () => {
            expect(() => MessageValidator.validateCreateMessage({
                content: 'Anonim mesaj',
                color: STICKY_NOTE_COLORS.pink.main,
            })).not.toThrow();
        });

        it('geçersiz içerik olan mesaj reddetmeli', () => {
            expect(() => MessageValidator.validateCreateMessage({
                content: '',
                color: STICKY_NOTE_COLORS.yellow.main,
            })).toThrow(ValidationError);
        });
    });

    // ========================================
    // Status Update Validation Tests
    // ========================================
    describe('validateUpdateStatus', () => {
        it('geçerli durum güncellemesi kabul etmeli', () => {
            expect(() => MessageValidator.validateUpdateStatus({
                status: 'APPROVED',
                moderatedBy: 'admin@example.com',
            })).not.toThrow();
        });

        it('red nedeni ile reddetme kabul etmeli', () => {
            expect(() => MessageValidator.validateUpdateStatus({
                status: 'REJECTED',
                moderatedBy: 'admin@example.com',
                rejectionReason: 'Spam içerik',
            })).not.toThrow();
        });

        it('moderatör olmadan güncelleme reddetmeli', () => {
            expect(() => MessageValidator.validateUpdateStatus({
                status: 'APPROVED',
                moderatedBy: '',
            })).toThrow(ValidationError);
        });
    });
});
