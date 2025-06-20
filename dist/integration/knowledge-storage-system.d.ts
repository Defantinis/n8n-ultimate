/**
 * Knowledge Storage System for n8n Workflow Automation Project
 *
 * This module implements the data storage and retrieval architecture for our
 * knowledge management system. It provides persistent storage, query capabilities,
 * and data access layers for capturing and utilizing learnings.
 *
 * Architecture:
 * - SQLite for local development, PostgreSQL for production
 * - TypeORM for database abstraction and migrations
 * - Full-text search capabilities
 * - Caching layer for performance
 * - Backup and recovery mechanisms
 */
import { KnowledgeEntry, KnowledgeType, KnowledgeCategory, KnowledgeSource } from './knowledge-management-system';
/**
 * Database configuration interface
 */
export interface DatabaseConfig {
    type: 'sqlite' | 'postgresql' | 'mysql';
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database: string;
    synchronize?: boolean;
    logging?: boolean;
    ssl?: boolean;
    connectionTimeout?: number;
    maxConnections?: number;
}
/**
 * Default database configurations
 */
export declare const DATABASE_CONFIGS: Record<string, DatabaseConfig>;
/**
 * Base knowledge entry entity for database storage
 */
export interface KnowledgeEntryEntity {
    id: string;
    timestamp: Date;
    type: string;
    category: string;
    title: string;
    description: string;
    metadata: string;
    tags: string;
    source: string;
    confidence: number;
    usageCount: number;
    lastAccessed: Date;
    createdAt: Date;
    updatedAt: Date;
    version: number;
}
/**
 * Workflow pattern entity
 */
export interface WorkflowPatternEntity extends KnowledgeEntryEntity {
    type: 'workflow_pattern';
    patternData: string;
}
/**
 * Node performance entity
 */
export interface NodePerformanceEntity extends KnowledgeEntryEntity {
    type: 'node_behavior';
    nodeType: string;
    performanceData: string;
}
/**
 * Performance metrics entity
 */
export interface PerformanceMetricsEntity extends KnowledgeEntryEntity {
    type: 'performance_metric';
    metricsData: string;
}
/**
 * Base query interface for knowledge retrieval
 */
export interface KnowledgeQuery {
    type?: KnowledgeType | KnowledgeType[];
    category?: KnowledgeCategory | KnowledgeCategory[];
    source?: KnowledgeSource | KnowledgeSource[];
    tags?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    confidenceRange?: {
        min: number;
        max: number;
    };
    textSearch?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'confidence' | 'usageCount' | 'title';
    sortOrder?: 'asc' | 'desc';
}
/**
 * Advanced query options for complex searches
 */
export interface AdvancedQuery extends KnowledgeQuery {
    aggregations?: {
        groupBy: string[];
        functions: ('count' | 'avg' | 'sum' | 'min' | 'max')[];
    };
    joins?: {
        relatedTypes: KnowledgeType[];
        relationshipType: 'similar' | 'dependent' | 'sequential';
    };
    filters?: {
        customSQL?: string;
        metadata?: Record<string, any>;
    };
}
/**
 * Advanced query options for complex searches
 */
export interface AdvancedQuery extends KnowledgeQuery {
    aggregations?: {
        groupBy: string[];
        functions: ('count' | 'avg' | 'sum' | 'min' | 'max')[];
    };
    joins?: {
        relatedTypes: KnowledgeType[];
        relationshipType: 'similar' | 'dependent' | 'sequential';
    };
    filters?: {
        customSQL?: string;
        metadata?: Record<string, any>;
    };
}
/**
 * Query result interface
 */
export interface QueryResult<T = KnowledgeEntry> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
    executionTime: number;
    cacheHit: boolean;
}
/**
 * Main data access layer for knowledge management
 */
export declare class KnowledgeDataAccessLayer {
    private config;
    private connected;
    private cache;
    private cacheTimeout;
    constructor(config?: DatabaseConfig);
    /**
     * Initialize database connection and create tables
     */
    initialize(): Promise<void>;
    /**
     * Create database tables
     */
    private createTables;
    /**
     * Create database indexes for performance
     */
    private createIndexes;
    /**
     * Execute raw SQL commands
     */
    private executeSQL;
    /**
     * Create a new knowledge entry
     */
    create<T extends KnowledgeEntry>(entry: Omit<T, 'id' | 'timestamp' | 'usageCount' | 'lastAccessed'>): Promise<T>;
    /**
     * Read knowledge entries by query
     */
    read<T extends KnowledgeEntry>(query?: KnowledgeQuery): Promise<QueryResult<T>>;
    /**
     * Update an existing knowledge entry
     */
    update<T extends KnowledgeEntry>(id: string, updates: Partial<T>): Promise<T>;
    /**
     * Delete a knowledge entry
     */
    delete(id: string): Promise<boolean>;
    /**
     * Find knowledge entry by ID
     */
    findById<T extends KnowledgeEntry>(id: string): Promise<T | null>;
    /**
     * Execute advanced queries with aggregations and joins
     */
    advancedQuery<T extends KnowledgeEntry>(query: AdvancedQuery): Promise<QueryResult<T> & {
        aggregations?: any;
    }>;
    /**
     * Full-text search across knowledge entries
     */
    search<T extends KnowledgeEntry>(searchTerm: string, options?: Partial<KnowledgeQuery>): Promise<QueryResult<T>>;
    /**
     * Get knowledge entries by similarity
     */
    findSimilar<T extends KnowledgeEntry>(entryId: string, limit?: number): Promise<T[]>;
    /**
     * Get trending knowledge entries
     */
    getTrending<T extends KnowledgeEntry>(timeframe?: 'day' | 'week' | 'month' | 'year', limit?: number): Promise<T[]>;
    /**
     * Get knowledge analytics and statistics
     */
    getAnalytics(): Promise<KnowledgeAnalytics>;
    /**
     * Export knowledge data
     */
    export(format?: 'json' | 'csv' | 'xml', query?: KnowledgeQuery): Promise<string>;
    /**
     * Import knowledge data
     */
    import(data: string, format?: 'json' | 'csv' | 'xml'): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    /**
     * Create backup of knowledge database
     */
    createBackup(filePath?: string): Promise<string>;
    /**
     * Restore from backup
     */
    restoreFromBackup(backupPath: string): Promise<void>;
    private generateId;
    private generateCacheKey;
    private setCache;
    private getCache;
    private invalidateQueryCache;
    private insertEntry;
    private executeQuery;
    private updateEntry;
    private deleteEntry;
    private buildAdvancedSQL;
    private executeAdvancedSQL;
    private convertToCSV;
    private convertToXML;
    private parseCSV;
    private parseXML;
}
export interface KnowledgeAnalytics {
    totalEntries: number;
    entriesByType: Record<string, number>;
    entriesByCategory: Record<string, number>;
    entriesBySource: Record<string, number>;
    averageConfidence: number;
    totalUsage: number;
    topTags: {
        tag: string;
        count: number;
    }[];
    recentActivity: {
        daily: {
            date: string;
            count: number;
        }[];
        weekly: {
            week: string;
            count: number;
        }[];
        monthly: {
            month: string;
            count: number;
        }[];
    };
    qualityMetrics: {
        highConfidenceEntries: number;
        lowUsageEntries: number;
        outdatedEntries: number;
    };
}
/**
 * Factory function to create knowledge data access layer
 */
export declare function createKnowledgeDAL(environment?: string): KnowledgeDataAccessLayer;
/**
 * Knowledge storage manager for high-level operations
 */
export declare class KnowledgeStorageManager {
    private dal;
    private initialized;
    constructor(dal?: KnowledgeDataAccessLayer);
    initialize(): Promise<void>;
    ensureInitialized(): Promise<void>;
    create<T extends KnowledgeEntry>(entry: Omit<T, 'id' | 'timestamp' | 'usageCount' | 'lastAccessed'>): Promise<T>;
    read<T extends KnowledgeEntry>(query?: KnowledgeQuery): Promise<QueryResult<T>>;
    update<T extends KnowledgeEntry>(id: string, updates: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
    search<T extends KnowledgeEntry>(searchTerm: string, options?: Partial<KnowledgeQuery>): Promise<QueryResult<T>>;
    getAnalytics(): Promise<KnowledgeAnalytics>;
    export(format?: 'json' | 'csv' | 'xml', query?: KnowledgeQuery): Promise<string>;
    import(data: string, format?: 'json' | 'csv' | 'xml'): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
    createBackup(filePath?: string): Promise<string>;
    restoreFromBackup(backupPath: string): Promise<void>;
}
export default KnowledgeStorageManager;
//# sourceMappingURL=knowledge-storage-system.d.ts.map