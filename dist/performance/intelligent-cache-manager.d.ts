/**
 * Intelligent Cache Manager
 *
 * Provides advanced caching capabilities for I/O operations including:
 * - LRU (Least Recently Used) eviction policy
 * - TTL (Time To Live) based expiration
 * - Intelligent cache warming and preloading
 * - Memory-efficient storage with compression
 * - Cache hit rate optimization
 */
import { EventEmitter } from 'events';
interface CacheConfig {
    maxSize: number;
    ttlMs: number;
    checkIntervalMs: number;
    enableCompression: boolean;
    compressionThreshold: number;
    memoryLimit: number;
    enableStats: boolean;
    warmupKeys: string[];
}
interface CacheStats {
    totalEntries: number;
    maxSize: number;
    memoryUsage: number;
    hitRate: number;
    totalHits: number;
    totalMisses: number;
    totalSets: number;
    totalDeletes: number;
    averageAge: number;
    compressionRatio: number;
}
interface CacheMetrics {
    size: number;
    maxSize: number;
    utilization: number;
    hitRate: number;
    memoryUsage: number;
    compressionSavings: number;
    averageAccessCount: number;
}
export declare class IntelligentCacheManager extends EventEmitter {
    private cache;
    private accessOrder;
    private config;
    private cleanupTimer;
    private stats;
    constructor(config?: Partial<CacheConfig>);
    private initialize;
    private startCleanupTimer;
    private warmupCache;
    set(key: string, value: any, skipCompression?: boolean): Promise<void>;
    get(key: string): Promise<any | null>;
    delete(key: string): Promise<boolean>;
    private updateAccessOrder;
    private removeFromAccessOrder;
    private evictLRU;
    private evictToMakeSpace;
    private performMaintenance;
    private compressData;
    private decompressData;
    private estimateSize;
    private getCurrentMemoryUsage;
    getStats(): CacheStats;
    getMetrics(): CacheMetrics;
    getTopKeys(limit?: number): Array<{
        key: string;
        hits: number;
        lastAccessed: number;
    }>;
    preload(keyValuePairs: Array<{
        key: string;
        value: any;
    }>): Promise<void>;
    clear(): void;
    close(): Promise<void>;
}
export default IntelligentCacheManager;
//# sourceMappingURL=intelligent-cache-manager.d.ts.map