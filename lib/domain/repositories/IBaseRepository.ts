/**
 * Base Repository Interface
 * 
 * Generic repository interface following Repository Pattern.
 * Provides basic CRUD operations.
 */

export interface IBaseRepository<T, TId = string> {
    /**
     * Find entity by ID
     */
    findById(id: TId): Promise<T | null>;

    /**
     * Find all entities
     */
    findAll(): Promise<T[]>;

    /**
     * Create a new entity
     */
    create(data: Partial<T>): Promise<T>;

    /**
     * Update an existing entity
     */
    update(id: TId, data: Partial<T>): Promise<T>;

    /**
     * Delete an entity
     */
    delete(id: TId): Promise<void>;

    /**
     * Check if entity exists
     */
    exists(id: TId): Promise<boolean>;
}
