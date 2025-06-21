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
import * as zlib from 'zlib';

interface CacheConfig {
    maxSize: number;
    ttlMs: number;
    checkIntervalMs: number;
    enableCompression: boolean;
    compressionThreshold: number; // bytes
    memoryLimit: number; // bytes
    enableStats: boolean;
    warmupKeys: string[];
}

interface CacheEntry {
    data: any;
    timestamp: number;
    hits: number;
    lastAccessed: number;
    size: number;
    compressed: boolean;
    accessCount: number;
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

export class IntelligentCacheManager extends EventEmitter {
    private cache: Map<string, CacheEntry> = new Map();
    private accessOrder: string[] = [];
    private config: CacheConfig;
    private cleanupTimer: NodeJS.Timeout | null = null;
    private stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        evictions: 0,
        compressions: 0,
        decompressions: 0
    };

    constructor(config: Partial<CacheConfig> = {}) {
        super();
        
        const defaultConfig: CacheConfig = {
            maxSize: 1000,
            ttlMs: 1800000, // 30 minutes
            checkIntervalMs: 60000, // 1 minute
            enableCompression: true,
            compressionThreshold: 1024, // 1KB
            memoryLimit: 100 * 1024 * 1024, // 100MB
            enableStats: true,
            warmupKeys: []
        };

        this.config = { ...defaultConfig, ...config };
        this.initialize();
    }

    private initialize(): void {
        if (this.config.checkIntervalMs > 0) {
            this.startCleanupTimer();
        }

        // Warm up cache with predefined keys if specified
        if (this.config.warmupKeys.length > 0) {
            this.warmupCache();
        }

        this.emit('initialized', {
            maxSize: this.config.maxSize,
            ttl: this.config.ttlMs,
            compression: this.config.enableCompression
        });
    }

    private startCleanupTimer(): void {
        this.cleanupTimer = setInterval(() => {
            this.performMaintenance();
        }, this.config.checkIntervalMs);
    }

    private async warmupCache(): Promise<void> {
        for (const key of this.config.warmupKeys) {
            // This would typically involve loading data for the key
            // For now, we'll just create placeholder entries
            this.set(key, null, true);
        }
        
        this.emit('cacheWarmedUp', { 
            keys: this.config.warmupKeys.length 
        });
    }

    public async set(key: string, value: any, skipCompression: boolean = false): Promise<void> {
        const now = Date.now();
        let processedValue = value;
        let compressed = false;
        let size = this.estimateSize(value);

        // Apply compression if enabled and value is large enough
        if (!skipCompression && 
            this.config.enableCompression && 
            size >= this.config.compressionThreshold) {
            try {
                const serialized = JSON.stringify(value);
                const compressedData = await this.compressData(serialized);
                if (compressedData.length < serialized.length) {
                    processedValue = compressedData;
                    compressed = true;
                    size = compressedData.length;
                    this.stats.compressions++;
                }
            } catch (error) {
                // Compression failed, use original value
                this.emit('compressionError', { key, error });
            }
        }

        // Check memory limit
        if (this.getCurrentMemoryUsage() + size > this.config.memoryLimit) {
            await this.evictToMakeSpace(size);
        }

        // Remove if at capacity and not updating existing entry
        if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
            this.evictLRU();
        }

        // Update access order
        this.updateAccessOrder(key);

        // Create or update cache entry
        const existingEntry = this.cache.get(key);
        const entry: CacheEntry = {
            data: processedValue,
            timestamp: now,
            hits: existingEntry?.hits || 0,
            lastAccessed: now,
            size,
            compressed,
            accessCount: existingEntry?.accessCount || 0
        };

        this.cache.set(key, entry);
        this.stats.sets++;

        this.emit('cacheSet', { 
            key, 
            size: this.cache.size,
            compressed,
            memoryUsage: this.getCurrentMemoryUsage()
        });
    }

    public async get(key: string): Promise<any | null> {
        const entry = this.cache.get(key);
        if (!entry) {
            this.stats.misses++;
            this.emit('cacheMiss', { key });
            return null;
        }

        // Check TTL
        const now = Date.now();
        if (now - entry.timestamp > this.config.ttlMs) {
            await this.delete(key);
            this.stats.misses++;
            this.emit('cacheExpired', { key, age: now - entry.timestamp });
            return null;
        }

        // Update access statistics
        entry.hits++;
        entry.lastAccessed = now;
        entry.accessCount++;
        this.stats.hits++;

        // Update access order
        this.updateAccessOrder(key);

        // Decompress if necessary
        let result = entry.data;
        if (entry.compressed) {
            try {
                const decompressed = await this.decompressData(entry.data);
                result = JSON.parse(decompressed);
                this.stats.decompressions++;
            } catch (error) {
                this.emit('decompressionError', { key, error });
                return null;
            }
        }

        this.emit('cacheHit', { 
            key, 
            hits: entry.hits,
            compressed: entry.compressed 
        });

        return result;
    }

    public async delete(key: string): Promise<boolean> {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.removeFromAccessOrder(key);
            this.stats.deletes++;
            this.emit('cacheDelete', { 
                key, 
                size: this.cache.size 
            });
        }
        return deleted;
    }

    private updateAccessOrder(key: string): void {
        this.removeFromAccessOrder(key);
        this.accessOrder.push(key);
    }

    private removeFromAccessOrder(key: string): void {
        const index = this.accessOrder.indexOf(key);
        if (index !== -1) {
            this.accessOrder.splice(index, 1);
        }
    }

    private evictLRU(): void {
        if (this.accessOrder.length === 0) return;
        
        const lruKey = this.accessOrder.shift()!;
        const entry = this.cache.get(lruKey);
        this.cache.delete(lruKey);
        this.stats.evictions++;
        
        this.emit('cacheEvicted', { 
            key: lruKey, 
            reason: 'LRU',
            age: entry ? Date.now() - entry.timestamp : 0
        });
    }

    private async evictToMakeSpace(requiredSpace: number): Promise<void> {
        let freedSpace = 0;
        const keysToEvict: string[] = [];

        // Find keys to evict based on LRU order
        for (const key of this.accessOrder) {
            const entry = this.cache.get(key);
            if (entry) {
                keysToEvict.push(key);
                freedSpace += entry.size;
                
                if (freedSpace >= requiredSpace) {
                    break;
                }
            }
        }

        // Evict the selected keys
        for (const key of keysToEvict) {
            await this.delete(key);
            this.emit('cacheEvicted', { 
                key, 
                reason: 'memory_limit',
                freedSpace 
            });
        }
    }

    private async performMaintenance(): Promise<void> {
        const now = Date.now();
        const expiredKeys: string[] = [];
        let totalMemory = 0;

        // Find expired entries and calculate memory usage
        for (const [key, entry] of this.cache) {
            totalMemory += entry.size;
            
            if (now - entry.timestamp > this.config.ttlMs) {
                expiredKeys.push(key);
            }
        }

        // Remove expired entries
        for (const key of expiredKeys) {
            await this.delete(key);
        }

        // Check memory limit and evict if necessary
        if (totalMemory > this.config.memoryLimit) {
            const excessMemory = totalMemory - this.config.memoryLimit;
            await this.evictToMakeSpace(excessMemory);
        }

        if (expiredKeys.length > 0) {
            this.emit('cacheCleanup', { 
                expiredCount: expiredKeys.length, 
                remainingSize: this.cache.size,
                memoryFreed: expiredKeys.reduce((sum, key) => {
                    const entry = this.cache.get(key);
                    return sum + (entry?.size || 0);
                }, 0)
            });
        }
    }

    private async compressData(data: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            zlib.gzip(Buffer.from(data), (err, compressed) => {
                if (err) reject(err);
                else resolve(compressed);
            });
        });
    }

    private async decompressData(data: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            zlib.gunzip(data, (err, decompressed) => {
                if (err) reject(err);
                else resolve(decompressed.toString());
            });
        });
    }

    private estimateSize(value: any): number {
        if (value === null || value === undefined) return 0;
        if (typeof value === 'string') return value.length * 2; // UTF-16
        if (typeof value === 'number') return 8;
        if (typeof value === 'boolean') return 4;
        if (Buffer.isBuffer(value)) return value.length;
        
        // For objects and arrays, estimate based on JSON serialization
        try {
            return JSON.stringify(value).length * 2;
        } catch {
            return 1024; // Default estimate
        }
    }

    private getCurrentMemoryUsage(): number {
        let total = 0;
        for (const entry of this.cache.values()) {
            total += entry.size;
        }
        return total;
    }

    public getStats(): CacheStats {
        const totalOperations = this.stats.hits + this.stats.misses;
        const hitRate = totalOperations > 0 ? this.stats.hits / totalOperations : 0;
        
        let totalAge = 0;
        let totalCompressedSize = 0;
        let totalUncompressedEstimate = 0;

        for (const entry of this.cache.values()) {
            totalAge += Date.now() - entry.timestamp;
            
            if (entry.compressed) {
                totalCompressedSize += entry.size;
                // Estimate original size (rough approximation)
                totalUncompressedEstimate += entry.size * 3; // Typical compression ratio
            }
        }

        const averageAge = this.cache.size > 0 ? totalAge / this.cache.size : 0;
        const compressionRatio = totalUncompressedEstimate > 0 ? 
            totalCompressedSize / totalUncompressedEstimate : 1;

        return {
            totalEntries: this.cache.size,
            maxSize: this.config.maxSize,
            memoryUsage: this.getCurrentMemoryUsage(),
            hitRate,
            totalHits: this.stats.hits,
            totalMisses: this.stats.misses,
            totalSets: this.stats.sets,
            totalDeletes: this.stats.deletes,
            averageAge,
            compressionRatio
        };
    }

    public getMetrics(): CacheMetrics {
        const stats = this.getStats();
        const totalHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hits, 0);
        const totalAccess = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.accessCount, 0);

        return {
            size: this.cache.size,
            maxSize: this.config.maxSize,
            utilization: this.cache.size / this.config.maxSize,
            hitRate: stats.hitRate,
            memoryUsage: stats.memoryUsage,
            compressionSavings: (1 - stats.compressionRatio) * 100,
            averageAccessCount: this.cache.size > 0 ? totalAccess / this.cache.size : 0
        };
    }

    public getTopKeys(limit: number = 10): Array<{key: string; hits: number; lastAccessed: number}> {
        return Array.from(this.cache.entries())
            .map(([key, entry]) => ({
                key,
                hits: entry.hits,
                lastAccessed: entry.lastAccessed
            }))
            .sort((a, b) => b.hits - a.hits)
            .slice(0, limit);
    }

    public async preload(keyValuePairs: Array<{key: string; value: any}>): Promise<void> {
        const promises = keyValuePairs.map(({ key, value }) => this.set(key, value));
        await Promise.all(promises);
        
        this.emit('cachePreloaded', { 
            count: keyValuePairs.length,
            memoryUsage: this.getCurrentMemoryUsage()
        });
    }

    public clear(): void {
        const clearedCount = this.cache.size;
        const memoryFreed = this.getCurrentMemoryUsage();
        
        this.cache.clear();
        this.accessOrder.length = 0;
        
        // Reset stats
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            evictions: 0,
            compressions: 0,
            decompressions: 0
        };

        this.emit('cacheClear', { 
            clearedCount,
            memoryFreed
        });
    }

    public async close(): Promise<void> {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = null;
        }

        const finalStats = this.getStats();
        this.clear();

        this.emit('closed', { 
            finalStats,
            timestamp: Date.now() 
        });
    }
}

export default IntelligentCacheManager; 