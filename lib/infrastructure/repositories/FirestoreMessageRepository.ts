/**
 * Firestore Message Repository Implementation (Server-Side)
 * 
 * Implements IMessageRepository using Firebase Admin SDK.
 * Handles all database operations for messages safely on the server.
 */

import {
    getFirestore,
    Timestamp,
    FieldValue,
    QueryDocumentSnapshot
} from 'firebase-admin/firestore';
import { adminDb } from '@/lib/infrastructure/firebase/adminApp';
import { IMessageRepository } from '@/lib/domain/repositories/IMessageRepository';
import { Message, MessageStatus } from '@/lib/domain/entities/Message';
import {
    CreateMessageDTO,
    UpdateMessageStatusDTO,
    MessageQueryOptions
} from '@/lib/types/dtos';

const MESSAGES_COLLECTION = 'messages';

export class FirestoreMessageRepository implements IMessageRepository {
    private db = adminDb;

    /**
     * Convert Firestore document to Message entity
     */
    private docToMessage(doc: QueryDocumentSnapshot): Message {
        const data = doc.data();
        return {
            id: doc.id,
            content: data.content,
            color: data.color,
            authorName: data.authorName,
            status: data.status as MessageStatus,
            // Handle metadata mapping
            metadata: {
                ipAddress: data.ipAddress, // Backward compatibility or direct mapping if changed
                userAgent: data.userAgent,
                ...(data.metadata || {})
            },
            // Handle Timestamp conversion
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt),
            moderatedBy: data.moderatedBy,
            moderatedAt: data.moderatedAt?.toDate ? data.moderatedAt.toDate() : (data.moderatedAt ? new Date(data.moderatedAt) : undefined),
            rejectionReason: data.rejectionReason,
            // Interaction fields
            likedBy: data.likedBy || [],
            dislikedBy: data.dislikedBy || [],
            reports: data.reports || [],
            // Soft delete fields
            deletedAt: data.deletedAt?.toDate ? data.deletedAt.toDate() : (data.deletedAt ? new Date(data.deletedAt) : undefined),
            deletedBy: data.deletedBy,
        };
    }

    /**
     * Find message by ID
     */
    async findById(id: string): Promise<Message | null> {
        try {
            const docRef = this.db.collection(MESSAGES_COLLECTION).doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                return null;
            }

            return this.docToMessage(docSnap as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error finding message by ID:', error);
            throw new Error('Failed to find message');
        }
    }

    /**
     * Find all messages
     */
    async findAll(limit?: number, offset?: number): Promise<Message[]> {
        try {
            let query = this.db.collection(MESSAGES_COLLECTION).orderBy('createdAt', 'desc');

            if (limit) query = query.limit(limit);
            if (offset) query = query.offset(offset);

            const querySnapshot = await query.get();
            return querySnapshot.docs.map((doc) => this.docToMessage(doc));
        } catch (error: any) {
            console.error('Error finding all messages:', error);
            throw new Error(error.message || 'Failed to fetch messages');
        }
    }

    /**
     * Create a new message
     */
    async create(data: Partial<Message>): Promise<Message> {
        try {
            const now = Timestamp.now();

            // Flatten generic metadata for Firestore if needed, or keep structured
            const messageData = {
                ...data,
                // Ensure status is set
                status: data.status || 'PENDING',
                createdAt: now,
                updatedAt: now,
                // Map flat fields back to root if your existing data uses flat structure
                ipAddress: data.metadata?.ipAddress,
                userAgent: data.metadata?.userAgent,
            };

            // Sanitize messageData
            const cleanMessageData = Object.entries(messageData).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            const docRef = await this.db.collection(MESSAGES_COLLECTION).add(cleanMessageData);
            const newDoc = await docRef.get();

            return this.docToMessage(newDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error creating message:', error);
            throw new Error('Failed to create message');
        }
    }

    /**
     * Update an existing message
     */
    async update(id: string, data: Partial<Message>): Promise<Message> {
        try {
            const docRef = this.db.collection(MESSAGES_COLLECTION).doc(id);

            // Sanitize data to remove undefined fields (Firestore Admin SDK throws on undefined)
            const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as Record<string, any>);

            await docRef.update({
                ...cleanData,
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Message not found after update');
            }

            return this.docToMessage(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error updating message:', error);
            throw new Error('Failed to update message');
        }
    }

    /**
     * Delete a message
     */
    async delete(id: string): Promise<void> {
        try {
            await this.db.collection(MESSAGES_COLLECTION).doc(id).delete();
        } catch (error) {
            console.error('Error deleting message:', error);
            throw new Error('Failed to delete message');
        }
    }

    /**
     * Check if message exists
     */
    async exists(id: string): Promise<boolean> {
        try {
            const docSnap = await this.db.collection(MESSAGES_COLLECTION).doc(id).get();
            return docSnap.exists;
        } catch (error) {
            console.error('Error checking message existence:', error);
            return false;
        }
    }

    /**
     * Find messages with query options (Internal helper)
     */
    async findWithOptions(options: MessageQueryOptions): Promise<{ data: Message[], total: number }> {
        try {
            let query = this.db.collection(MESSAGES_COLLECTION) as FirebaseFirestore.Query;

            // Filter by status
            if (options.status) {
                query = query.where('status', '==', options.status);
            }

            // Order by
            const orderByField = options.orderBy || 'createdAt';
            const orderDirection = options.orderDirection || 'desc';
            query = query.orderBy(orderByField, orderDirection);

            // Pagination
            const limit = options.limit || 20;
            const offset = options.offset || 0;

            query = query.limit(limit).offset(offset);

            const querySnapshot = await query.get();
            const messages = querySnapshot.docs.map((doc) => this.docToMessage(doc));

            // Get total count (separate query)
            let totalQuery = this.db.collection(MESSAGES_COLLECTION) as FirebaseFirestore.Query;
            if (options.status) {
                totalQuery = totalQuery.where('status', '==', options.status);
            }
            const totalSnapshot = await totalQuery.count().get();
            const total = totalSnapshot.data().count;

            return { data: messages, total };
        } catch (error: any) {
            console.error('Error finding messages with options:', error);
            throw new Error(error.message || 'Failed to fetch messages');
        }
    }

    /**
     * Find messages by status
     */
    async findByStatus(status: MessageStatus, limit?: number, offset?: number): Promise<Message[]> {
        try {
            let query = this.db.collection(MESSAGES_COLLECTION)
                .where('status', '==', status)
                .orderBy('createdAt', 'desc');

            if (limit) query = query.limit(limit);
            if (offset) query = query.offset(offset);

            const querySnapshot = await query.get();
            return querySnapshot.docs.map((doc) => this.docToMessage(doc));
        } catch (error: any) {
            console.error('Error finding messages by status:', error);
            throw new Error(error.message || 'Failed to fetch messages');
        }
    }

    /**
     * Find approved messages (public view helper)
     */
    async getApprovedMessages(limit: number = 50, offset: number = 0): Promise<Message[]> {
        return this.findByStatus('APPROVED', limit, offset);
    }

    /**
     * Update message status (approve/reject)
     */
    async updateStatus(id: string, data: UpdateMessageStatusDTO): Promise<Message> {
        return this.update(id, {
            status: data.status,
            moderatedBy: data.moderatedBy,
            moderatedAt: new Date(), // Will be converted to Timestamp in basic update
            rejectionReason: data.rejectionReason,
        });
    }

    async countByStatus(status: MessageStatus): Promise<number> {
        try {
            const snapshot = await this.db.collection(MESSAGES_COLLECTION)
                .where('status', '==', status)
                .count()
                .get();
            return snapshot.data().count;
        } catch (error) {
            console.error('Error counting messages by status:', error);
            return 0;
        }
    }

    /**
     * Count total messages
     */
    async countTotal(): Promise<number> {
        try {
            const snapshot = await this.db.collection(MESSAGES_COLLECTION).count().get();
            return snapshot.data().count;
        } catch (error) {
            console.error('Error counting total messages:', error);
            return 0;
        }
    }

    /**
     * Get messages created by IP address in last 24 hours
     */
    async findByIpInLast24Hours(ipAddress: string): Promise<Message[]> {
        try {
            const yesterday = new Date();
            yesterday.setHours(yesterday.getHours() - 24);

            const querySnapshot = await this.db.collection(MESSAGES_COLLECTION)
                .where('metadata.ipAddress', '==', ipAddress) // Check nested field if strict structure
                // OR check legacy root field depending on how you save it:
                // .where('ipAddress', '==', ipAddress) 
                .where('createdAt', '>=', Timestamp.fromDate(yesterday))
                .get();

            // Note: If you have mixed data (root ipAddress vs metadata.ipAddress), complex query needed
            // For now assuming metadata.ipAddress as per Create method

            return querySnapshot.docs.map((doc) => this.docToMessage(doc));
        } catch (error) {
            console.error('Error finding messages by IP:', error);
            return [];
        }
    }

    /**
     * Search messages by content (Basic Implementation)
     */
    async searchByContent(searchQuery: string, limit?: number): Promise<Message[]> {
        try {
            // Fetch all approved messages and filter in memory
            const query = this.db.collection(MESSAGES_COLLECTION)
                .where('status', '==', 'APPROVED')
                .orderBy('createdAt', 'desc');

            const querySnapshot = await query.get();

            const messages = querySnapshot.docs
                .map((doc) => this.docToMessage(doc))
                .filter((message) =>
                    message.content.toLowerCase().includes(searchQuery.toLowerCase())
                );

            return limit ? messages.slice(0, limit) : messages;
        } catch (error) {
            console.error('Error searching messages:', error);
            return [];
        }
    }

    /**
     * Soft delete a message (mark as deleted without removing from database)
     */
    async softDelete(id: string, deletedBy: string): Promise<Message> {
        try {
            const docRef = this.db.collection(MESSAGES_COLLECTION).doc(id);

            await docRef.update({
                deletedAt: Timestamp.now(),
                deletedBy: deletedBy,
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Message not found after soft delete');
            }

            return this.docToMessage(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error soft deleting message:', error);
            throw new Error('Failed to soft delete message');
        }
    }

    /**
     * Restore a soft-deleted message
     */
    async restore(id: string): Promise<Message> {
        try {
            const docRef = this.db.collection(MESSAGES_COLLECTION).doc(id);

            await docRef.update({
                deletedAt: FieldValue.delete(),
                deletedBy: FieldValue.delete(),
                updatedAt: Timestamp.now(),
            });

            const updatedDoc = await docRef.get();
            if (!updatedDoc.exists) {
                throw new Error('Message not found after restore');
            }

            return this.docToMessage(updatedDoc as QueryDocumentSnapshot);
        } catch (error) {
            console.error('Error restoring message:', error);
            throw new Error('Failed to restore message');
        }
    }

    /**
     * Find all deleted messages
     */
    async findDeleted(limit?: number, offset?: number): Promise<Message[]> {
        try {
            let query = this.db.collection(MESSAGES_COLLECTION)
                .where('deletedAt', '!=', null)
                .orderBy('deletedAt', 'desc');

            if (limit) query = query.limit(limit);
            if (offset) query = query.offset(offset);

            const querySnapshot = await query.get();
            return querySnapshot.docs.map((doc) => this.docToMessage(doc));
        } catch (error: any) {
            console.error('Error finding deleted messages:', error);
            throw new Error(error.message || 'Failed to fetch deleted messages');
        }
    }
}
