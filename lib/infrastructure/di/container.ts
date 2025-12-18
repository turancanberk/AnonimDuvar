/**
 * Dependency Injection Container
 * 
 * Manages dependency injection for the application.
 * Follows Dependency Inversion Principle and Singleton Pattern.
 */

import { IMessageRepository } from '@/lib/domain/repositories/IMessageRepository';
import { IMessageService } from '@/lib/domain/services/IMessageService';
import { FirestoreMessageRepository } from '@/lib/infrastructure/repositories/FirestoreMessageRepository';
import { MessageService } from '@/lib/application/services/MessageService';

/**
 * Dependency Injection Container
 * Provides singleton instances of services and repositories
 */
class DIContainer {
    private static instance: DIContainer;

    private _messageRepository: IMessageRepository | null = null;
    private _messageService: IMessageService | null = null;

    private constructor() {
        // Private constructor for Singleton pattern
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): DIContainer {
        if (!DIContainer.instance) {
            DIContainer.instance = new DIContainer();
        }
        return DIContainer.instance;
    }

    /**
     * Get Message Repository instance
     */
    public get messageRepository(): IMessageRepository {
        if (!this._messageRepository) {
            this._messageRepository = new FirestoreMessageRepository();
        }
        return this._messageRepository;
    }

    /**
     * Get Message Service instance
     */
    public get messageService(): IMessageService {
        if (!this._messageService) {
            this._messageService = new MessageService(this.messageRepository);
        }
        return this._messageService;
    }

    /**
     * Reset all instances (useful for testing)
     */
    public reset(): void {
        this._messageRepository = null;
        this._messageService = null;
    }
}

// Export singleton instance
export const container = DIContainer.getInstance();

// Export individual services for convenience
export const getMessageService = (): IMessageService => container.messageService;
export const getMessageRepository = (): IMessageRepository => container.messageRepository;
