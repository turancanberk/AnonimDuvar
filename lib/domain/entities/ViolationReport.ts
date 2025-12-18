/**
 * Violation Report Entity
 * 
 * Represents a general platform violation report submitted by users.
 * Separate from message-specific reports.
 */

export type ViolationReportType =
    | 'HATE_SPEECH'
    | 'VIOLENCE'
    | 'SPAM'
    | 'ILLEGAL'
    | 'PERSONAL_INFO'
    | 'ADULT_CONTENT'
    | 'OTHER';

export type ViolationReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED';

export interface ViolationReport {
    id: string;
    type: ViolationReportType;
    description: string;
    url?: string;
    messageId?: string;
    status: ViolationReportStatus;
    reportedBy: string; // client fingerprint
    reportedByIp: string;
    createdAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string; // admin email
    adminNotes?: string;
}

export const VIOLATION_REPORT_TYPE_LABELS: Record<ViolationReportType, string> = {
    HATE_SPEECH: 'Nefret Söylemi',
    VIOLENCE: 'Şiddet İçerik',
    SPAM: 'Spam / Reklam',
    ILLEGAL: 'Yasadışı İçerik',
    PERSONAL_INFO: 'Kişisel Bilgi Paylaşımı',
    ADULT_CONTENT: '18+ İçerik',
    OTHER: 'Diğer',
};
