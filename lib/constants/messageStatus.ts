/**
 * Message Status Enum
 * 
 * Defines the possible states of a message in the moderation workflow.
 */

export enum MessageStatus {
    /**
     * Message is waiting for admin approval
     */
    PENDING = 'PENDING',

    /**
     * Message has been approved by admin and is visible to public
     */
    APPROVED = 'APPROVED',

    /**
     * Message has been rejected by admin and is not visible to public
     */
    REJECTED = 'REJECTED',
}

/**
 * Message status constant (for backward compatibility)
 */
export const MESSAGE_STATUS = MessageStatus;

/**
 * Message status labels in Turkish
 */
export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
    [MessageStatus.PENDING]: 'Beklemede',
    [MessageStatus.APPROVED]: 'Onaylandı',
    [MessageStatus.REJECTED]: 'Reddedildi',
};

/**
 * Message status colors for UI
 */
export const MESSAGE_STATUS_COLORS: Record<MessageStatus, { bg: string; text: string; border: string }> = {
    [MessageStatus.PENDING]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
    },
    [MessageStatus.APPROVED]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
    },
    [MessageStatus.REJECTED]: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
    },
};

/**
 * Check if a status is valid
 */
export const isValidStatus = (status: string): status is MessageStatus => {
    return Object.values(MessageStatus).includes(status as MessageStatus);
};
