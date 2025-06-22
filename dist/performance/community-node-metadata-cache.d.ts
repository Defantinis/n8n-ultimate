/**
 * Community Node Metadata Cache Manager
 * Optimizes performance for community node discovery, validation, and integration
 * through multi-layered caching strategies with intelligent invalidation
 */
import { EventEmitter } from 'events';
export interface CommunityNodeMetadata {
    nodeId: string;
    packageName: string;
    version: string;
    name: string;
    displayName: string;
    description: string;
    category: string;
    subcategory?: string;
    author: string;
    license: string;
    keywords: string[];
    compatibility: {
        n8nVersion: string;
        nodeVersion: string;
        apiVersion: string;
    };
    features: string[];
    inputs: NodeInputMetadata[];
    outputs: NodeOutputMetadata[];
    parameters: NodeParameterMetadata[];
    credentials: NodeCredentialMetadata[];
    dependencies: string[];
    performance: {
        avgExecutionTime: number;
        memoryUsage: number;
        reliability: number;
    };
    popularity: {
        downloads: number;
        rating: number;
        usage: number;
    };
    lastUpdated: Date;
    cacheTimestamp: Date;
}
export interface NodeInputMetadata {
    name: string;
    type: string;
    required: boolean;
    description: string;
    schema?: any;
}
export interface NodeOutputMetadata {
    name: string;
    type: string;
    description: string;
    schema?: any;
}
export interface NodeParameterMetadata {
    name: string;
    type: string;
    required: boolean;
    default?: any;
    description: string;
    options?: any[];
    validation?: any;
}
export interface NodeCredentialMetadata {
    name: string;
    type: string;
    required: boolean;
    description: string;
}
export interface CacheEntry<T> {
    key: string;
    data: T;
    timestamp: Date;
    ttl: number;
    hits: number;
    lastAccessed: Date;
    compressed: boolean;
    size: number;
}
export interface CacheStats {
    totalEntries: number;
    totalSize: number;
    hitRate: number;
    missRate: number;
    evictionCount: number;
    compressionRatio: number;
    avgResponseTime: number;
    memoryUsage: number;
}
export interface CacheConfiguration {
    maxMemoryMB: number;
    defaultTTL: number;
    compressionThreshold: number;
    evictionStrategy: 'lru' | 'lfu' | 'ttl';
    persistToDisk: boolean;
    diskCachePath: string;
    redisConfig?: {
        host: string;
        port: number;
        password?: string;
        db: number;
    };
    monitoring: {
        enabled: boolean;
        metricsInterval: number;
        performanceThreshold: number;
    };
}
export interface CachePerformanceMetrics {
    operationType: 'get' | 'set' | 'delete' | 'evict';
    duration: number;
    cacheLayer: 'memory' | 'disk' | 'redis';
    success: boolean;
    dataSize: number;
    timestamp: Date;
}
/**
 * Multi-layered cache manager for community node metadata
 * Provides in-memory, disk, and Redis caching with intelligent eviction
 */
export declare class CommunityNodeMetadataCache extends EventEmitter {
    private memoryCache;
    private diskCache;
    private redisClient;
    private config;
    private stats;
    private performanceMetrics;
    private evictionQueue;
    private compressionCache;
    private monitoringInterval?;
    private hitCount;
    private missCount;
    constructor(config?: Partial<CacheConfiguration>);
    /**
     * Initialize cache system
     */
    private initializeCache;
    /**
     * Get community node metadata from cache
     */
    getNodeMetadata(nodeId: string): Promise<CommunityNodeMetadata | null>;
    /**
     * Set community node metadata in cache
     */
    setNodeMetadata(nodeId: string, metadata: CommunityNodeMetadata): Promise<void>;
    /**
     * Get multiple node metadata entries efficiently
     */
    getMultipleNodeMetadata(nodeIds: string[]): Promise<Map<string, CommunityNodeMetadata>>;
    /**
     * Cache validation results for nodes
     */
    cacheValidationResult(nodeId: string, validationResult: any): Promise<void>;
    /**
     * Get cached validation result
     */
    getValidationResult(nodeId: string): Promise<any | null>;
    /**
     * Cache node compatibility information
     */
    cacheCompatibilityInfo(nodeId: string, n8nVersion: string, compatibilityInfo: any): Promise<void>;
    /**
     * Get cached compatibility information
     */
    getCompatibilityInfo(nodeId: string, n8nVersion: string): Promise<any | null>;
    /**
     * Cache node search results
     */
    cacheSearchResults(query: string, filters: any, results: CommunityNodeMetadata[]): Promise<void>;
    /**
     * Get cached search results
     */
    getSearchResults(query: string, filters: any): Promise<CommunityNodeMetadata[] | null>;
    /**
     * Invalidate cache entries for a specific node
     */
    invalidateNode(nodeId: string): Promise<void>;
    /**
     * Invalidate all search results (when new nodes are added)
     */
    invalidateSearchResults(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): CachePerformanceMetrics[];
    /**
     * Clear all caches
     */
    clearAll(): Promise<void>;
    /**
     * Optimize cache performance
     */
    optimize(): Promise<void>;
    /**
     * Shutdown cache manager
     */
    shutdown(): Promise<void>;
    private generateCacheKey;
    private hashObject;
    private getDataSize;
    private getFromMemoryCache;
    private setInMemoryCache;
    private getFromRedisCache;
    private setInRedisCache;
    private getFromDiskCache;
    private setInDiskCache;
    private setCacheEntry;
    private getCacheEntry;
    private deleteCacheEntry;
    private invalidateByPattern;
    private compress;
    private decompress;
    private ensureMemorySpace;
    private calculateCurrentMemoryUsage;
    private evictEntries;
    private updateEvictionQueue;
    private recordPerformance;
    private updateStats;
    private updateMemoryUsage;
    private resetStats;
    private loadDiskCacheIndex;
    private deleteDiskCacheFile;
    private clearDiskCache;
    private initializeRedis;
    private startMonitoring;
    private removeExpiredEntries;
    private compressLargeEntries;
    private optimizeMemoryUsage;
    private defragmentDiskCache;
    private calculateMemoryFreed;
    private persistCriticalData;
}
/**
 * Factory function to create optimized cache manager
 */
export declare function createCommunityNodeMetadataCache(config?: Partial<CacheConfiguration>): CommunityNodeMetadataCache;
/**
 * Default cache configuration for different environments
 */
export declare const CacheConfigurations: {
    development: {
        maxMemoryMB: number;
        defaultTTL: number;
        persistToDisk: boolean;
        monitoring: {
            enabled: boolean;
            metricsInterval: number;
        };
    };
    production: {
        maxMemoryMB: number;
        defaultTTL: number;
        persistToDisk: boolean;
        redisConfig: {
            host: string;
            port: number;
            db: number;
        };
        monitoring: {
            enabled: boolean;
            metricsInterval: number;
        };
    };
    testing: {
        maxMemoryMB: number;
        defaultTTL: number;
        persistToDisk: boolean;
        monitoring: {
            enabled: boolean;
            metricsInterval: number;
        };
    };
};
//# sourceMappingURL=community-node-metadata-cache.d.ts.map