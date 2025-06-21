/**
 * Community Node Metadata Cache Manager
 * Optimizes performance for community node discovery, validation, and integration
 * through multi-layered caching strategies with intelligent invalidation
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

// Core interfaces for community node metadata caching
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
export class CommunityNodeMetadataCache extends EventEmitter {
  private memoryCache: Map<string, CacheEntry<CommunityNodeMetadata>> = new Map();
  private diskCache: Map<string, string> = new Map(); // key -> file path
  private redisClient: any = null; // Redis client if available
  private config: CacheConfiguration;
  private stats: CacheStats;
  private performanceMetrics: CachePerformanceMetrics[] = [];
  private evictionQueue: string[] = [];
  private compressionCache: Map<string, Buffer> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private hitCount = 0;
  private missCount = 0;

  constructor(config: Partial<CacheConfiguration> = {}) {
    super();
    
    this.config = {
      maxMemoryMB: 256,
      defaultTTL: 30 * 60 * 1000, // 30 minutes
      compressionThreshold: 10 * 1024, // 10KB
      evictionStrategy: 'lru',
      persistToDisk: true,
      diskCachePath: './.cache/community-nodes',
      monitoring: {
        enabled: true,
        metricsInterval: 60000, // 1 minute
        performanceThreshold: 100 // 100ms
      },
      ...config
    };

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      compressionRatio: 0,
      avgResponseTime: 0,
      memoryUsage: 0
    };

    this.initializeCache();
  }

  /**
   * Initialize cache system
   */
  private async initializeCache(): Promise<void> {
    try {
      // Initialize disk cache directory
      if (this.config.persistToDisk) {
        await fs.mkdir(this.config.diskCachePath, { recursive: true });
        await this.loadDiskCacheIndex();
      }

      // Initialize Redis if configured
      if (this.config.redisConfig) {
        await this.initializeRedis();
      }

      // Start monitoring if enabled
      if (this.config.monitoring.enabled) {
        this.startMonitoring();
      }

      this.emit('initialized', {
        memoryCache: true,
        diskCache: this.config.persistToDisk,
        redis: !!this.redisClient,
        monitoring: this.config.monitoring.enabled
      });

    } catch (error) {
      this.emit('initializationError', error);
      throw error;
    }
  }

  /**
   * Get community node metadata from cache
   */
  async getNodeMetadata(nodeId: string): Promise<CommunityNodeMetadata | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('metadata', nodeId);

    try {
      // Try memory cache first (fastest)
      const memoryResult = await this.getFromMemoryCache(cacheKey);
      if (memoryResult) {
        this.recordPerformance('get', Date.now() - startTime, 'memory', true, this.getDataSize(memoryResult));
        this.updateStats('hit');
        return memoryResult;
      }

      // Try Redis cache (medium speed)
      if (this.redisClient) {
        const redisResult = await this.getFromRedisCache(cacheKey);
        if (redisResult) {
          // Store in memory for faster future access
          await this.setInMemoryCache(cacheKey, redisResult);
          this.recordPerformance('get', Date.now() - startTime, 'redis', true, this.getDataSize(redisResult));
          this.updateStats('hit');
          return redisResult;
        }
      }

      // Try disk cache (slowest)
      if (this.config.persistToDisk) {
        const diskResult = await this.getFromDiskCache(cacheKey);
        if (diskResult) {
          // Store in memory and Redis for faster future access
          await this.setInMemoryCache(cacheKey, diskResult);
          if (this.redisClient) {
            await this.setInRedisCache(cacheKey, diskResult);
          }
          this.recordPerformance('get', Date.now() - startTime, 'disk', true, this.getDataSize(diskResult));
          this.updateStats('hit');
          return diskResult;
        }
      }

      // Cache miss
      this.recordPerformance('get', Date.now() - startTime, 'memory', false, 0);
      this.updateStats('miss');
      return null;

    } catch (error) {
      this.emit('cacheError', { operation: 'get', key: cacheKey, error });
      this.recordPerformance('get', Date.now() - startTime, 'memory', false, 0);
      return null;
    }
  }

  /**
   * Set community node metadata in cache
   */
  async setNodeMetadata(nodeId: string, metadata: CommunityNodeMetadata): Promise<void> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey('metadata', nodeId);

    try {
      // Update cache timestamp
      metadata.cacheTimestamp = new Date();

      // Store in all available cache layers
      await Promise.all([
        this.setInMemoryCache(cacheKey, metadata),
        this.redisClient ? this.setInRedisCache(cacheKey, metadata) : Promise.resolve(),
        this.config.persistToDisk ? this.setInDiskCache(cacheKey, metadata) : Promise.resolve()
      ]);

      this.recordPerformance('set', Date.now() - startTime, 'memory', true, this.getDataSize(metadata));
      this.emit('metadataCached', { nodeId, cacheKey, size: this.getDataSize(metadata) });

    } catch (error) {
      this.emit('cacheError', { operation: 'set', key: cacheKey, error });
      this.recordPerformance('set', Date.now() - startTime, 'memory', false, 0);
      throw error;
    }
  }

  /**
   * Get multiple node metadata entries efficiently
   */
  async getMultipleNodeMetadata(nodeIds: string[]): Promise<Map<string, CommunityNodeMetadata>> {
    const results = new Map<string, CommunityNodeMetadata>();
    const startTime = Date.now();

    // Process in parallel for better performance
    const promises = nodeIds.map(async (nodeId) => {
      const metadata = await this.getNodeMetadata(nodeId);
      if (metadata) {
        results.set(nodeId, metadata);
      }
    });

    await Promise.all(promises);

    this.emit('bulkRetrieved', {
      requested: nodeIds.length,
      found: results.size,
      duration: Date.now() - startTime
    });

    return results;
  }

  /**
   * Cache validation results for nodes
   */
  async cacheValidationResult(nodeId: string, validationResult: any): Promise<void> {
    const cacheKey = this.generateCacheKey('validation', nodeId);
    await this.setCacheEntry(cacheKey, validationResult, this.config.defaultTTL * 0.5); // Shorter TTL for validation
  }

  /**
   * Get cached validation result
   */
  async getValidationResult(nodeId: string): Promise<any | null> {
    const cacheKey = this.generateCacheKey('validation', nodeId);
    return await this.getCacheEntry(cacheKey);
  }

  /**
   * Cache node compatibility information
   */
  async cacheCompatibilityInfo(nodeId: string, n8nVersion: string, compatibilityInfo: any): Promise<void> {
    const cacheKey = this.generateCacheKey('compatibility', `${nodeId}:${n8nVersion}`);
    await this.setCacheEntry(cacheKey, compatibilityInfo, this.config.defaultTTL * 2); // Longer TTL for compatibility
  }

  /**
   * Get cached compatibility information
   */
  async getCompatibilityInfo(nodeId: string, n8nVersion: string): Promise<any | null> {
    const cacheKey = this.generateCacheKey('compatibility', `${nodeId}:${n8nVersion}`);
    return await this.getCacheEntry(cacheKey);
  }

  /**
   * Cache node search results
   */
  async cacheSearchResults(query: string, filters: any, results: CommunityNodeMetadata[]): Promise<void> {
    const queryHash = this.hashObject({ query, filters });
    const cacheKey = this.generateCacheKey('search', queryHash);
    await this.setCacheEntry(cacheKey, results, this.config.defaultTTL * 0.25); // Short TTL for search results
  }

  /**
   * Get cached search results
   */
  async getSearchResults(query: string, filters: any): Promise<CommunityNodeMetadata[] | null> {
    const queryHash = this.hashObject({ query, filters });
    const cacheKey = this.generateCacheKey('search', queryHash);
    return await this.getCacheEntry(cacheKey);
  }

  /**
   * Invalidate cache entries for a specific node
   */
  async invalidateNode(nodeId: string): Promise<void> {
    const patterns = [
      this.generateCacheKey('metadata', nodeId),
      this.generateCacheKey('validation', nodeId),
      // Compatibility entries need pattern matching
    ];

    for (const pattern of patterns) {
      await this.deleteCacheEntry(pattern);
    }

    // Invalidate compatibility entries (requires pattern matching)
    await this.invalidateByPattern(`compatibility:${nodeId}:`);

    this.emit('nodeInvalidated', { nodeId, patterns });
  }

  /**
   * Invalidate all search results (when new nodes are added)
   */
  async invalidateSearchResults(): Promise<void> {
    await this.invalidateByPattern('search:');
    this.emit('searchResultsInvalidated');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateMemoryUsage();
    return { ...this.stats };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): CachePerformanceMetrics[] {
    return [...this.performanceMetrics];
  }

  /**
   * Clear all caches
   */
  async clearAll(): Promise<void> {
    const startTime = Date.now();

    try {
      // Clear memory cache
      this.memoryCache.clear();
      this.compressionCache.clear();

      // Clear Redis cache
      if (this.redisClient) {
        await this.redisClient.flushdb();
      }

      // Clear disk cache
      if (this.config.persistToDisk) {
        await this.clearDiskCache();
      }

      // Reset stats
      this.resetStats();

      this.emit('allCachesCleared', { duration: Date.now() - startTime });

    } catch (error) {
      this.emit('cacheError', { operation: 'clearAll', error });
      throw error;
    }
  }

  /**
   * Optimize cache performance
   */
  async optimize(): Promise<void> {
    const startTime = Date.now();

    try {
      // Remove expired entries
      await this.removeExpiredEntries();

      // Compress large entries
      await this.compressLargeEntries();

      // Optimize memory usage
      await this.optimizeMemoryUsage();

      // Defragment disk cache
      if (this.config.persistToDisk) {
        await this.defragmentDiskCache();
      }

      this.emit('cacheOptimized', {
        duration: Date.now() - startTime,
        entriesRemoved: this.stats.evictionCount,
        memoryFreed: this.calculateMemoryFreed()
      });

    } catch (error) {
      this.emit('optimizationError', error);
      throw error;
    }
  }

  /**
   * Shutdown cache manager
   */
  async shutdown(): Promise<void> {
    try {
      // Stop monitoring
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }

      // Persist critical data to disk
      if (this.config.persistToDisk) {
        await this.persistCriticalData();
      }

      // Close Redis connection
      if (this.redisClient) {
        await this.redisClient.quit();
      }

      this.emit('shutdown');

    } catch (error) {
      this.emit('shutdownError', error);
      throw error;
    }
  }

  // Private helper methods

  private generateCacheKey(type: string, identifier: string): string {
    return `community-node:${type}:${identifier}`;
  }

  private hashObject(obj: any): string {
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
  }

  private getDataSize(data: any): number {
    return Buffer.byteLength(JSON.stringify(data), 'utf8');
  }

  private async getFromMemoryCache(key: string): Promise<CommunityNodeMetadata | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    // Check TTL
    if (Date.now() - entry.timestamp.getTime() > entry.ttl) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = new Date();

    return entry.compressed ? this.decompress(entry.data as any) : entry.data;
  }

  private async setInMemoryCache(key: string, data: CommunityNodeMetadata): Promise<void> {
    const size = this.getDataSize(data);
    const shouldCompress = size > this.config.compressionThreshold;

    // Check memory limits and evict if necessary
    await this.ensureMemorySpace(size);

    const entry: CacheEntry<CommunityNodeMetadata> = {
      key,
      data: shouldCompress ? this.compress(data) as any : data,
      timestamp: new Date(),
      ttl: this.config.defaultTTL,
      hits: 0,
      lastAccessed: new Date(),
      compressed: shouldCompress,
      size
    };

    this.memoryCache.set(key, entry);
    this.updateEvictionQueue(key);
  }

  private async getFromRedisCache(key: string): Promise<CommunityNodeMetadata | null> {
    if (!this.redisClient) return null;

    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.emit('redisError', { operation: 'get', key, error });
      return null;
    }
  }

  private async setInRedisCache(key: string, data: CommunityNodeMetadata): Promise<void> {
    if (!this.redisClient) return;

    try {
      await this.redisClient.setex(key, Math.floor(this.config.defaultTTL / 1000), JSON.stringify(data));
    } catch (error) {
      this.emit('redisError', { operation: 'set', key, error });
    }
  }

  private async getFromDiskCache(key: string): Promise<CommunityNodeMetadata | null> {
    const filePath = this.diskCache.get(key);
    if (!filePath) return null;

    try {
      const data = await fs.readFile(filePath, 'utf8');
      const parsed = JSON.parse(data);
      
      // Check TTL
      if (Date.now() - new Date(parsed.cacheTimestamp).getTime() > this.config.defaultTTL) {
        await this.deleteDiskCacheFile(key, filePath);
        return null;
      }

      return parsed;
    } catch (error) {
      // File might be corrupted or deleted
      this.diskCache.delete(key);
      return null;
    }
  }

  private async setInDiskCache(key: string, data: CommunityNodeMetadata): Promise<void> {
    const fileName = `${this.hashObject(key)}.json`;
    const filePath = path.join(this.config.diskCachePath, fileName);

    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
      this.diskCache.set(key, filePath);
    } catch (error) {
      this.emit('diskCacheError', { operation: 'set', key, error });
    }
  }

  private async setCacheEntry(key: string, data: any, ttl?: number): Promise<void> {
    // Simplified version for generic cache entries
    const cacheData = {
      data,
      timestamp: new Date(),
      ttl: ttl || this.config.defaultTTL
    };

    // Store in memory
    this.memoryCache.set(key, cacheData as any);

    // Store in Redis if available
    if (this.redisClient) {
      try {
        await this.redisClient.setex(key, Math.floor((ttl || this.config.defaultTTL) / 1000), JSON.stringify(cacheData));
      } catch (error) {
        this.emit('redisError', { operation: 'set', key, error });
      }
    }
  }

  private async getCacheEntry(key: string): Promise<any | null> {
    // Try memory first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      const entryData = memoryEntry as any;
      if (Date.now() - entryData.timestamp.getTime() <= entryData.ttl) {
        return entryData.data;
      } else {
        this.memoryCache.delete(key);
      }
    }

    // Try Redis
    if (this.redisClient) {
      try {
        const redisData = await this.redisClient.get(key);
        if (redisData) {
          const parsed = JSON.parse(redisData);
          if (Date.now() - new Date(parsed.timestamp).getTime() <= parsed.ttl) {
            return parsed.data;
          }
        }
      } catch (error) {
        this.emit('redisError', { operation: 'get', key, error });
      }
    }

    return null;
  }

  private async deleteCacheEntry(key: string): Promise<void> {
    // Delete from memory
    this.memoryCache.delete(key);

    // Delete from Redis
    if (this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (error) {
        this.emit('redisError', { operation: 'del', key, error });
      }
    }

    // Delete from disk
    const filePath = this.diskCache.get(key);
    if (filePath) {
      await this.deleteDiskCacheFile(key, filePath);
    }
  }

  private async invalidateByPattern(pattern: string): Promise<void> {
    // Invalidate memory cache entries matching pattern
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate Redis entries matching pattern
    if (this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`*${pattern}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (error) {
        this.emit('redisError', { operation: 'pattern-delete', pattern, error });
      }
    }
  }

  private compress(data: any): Buffer {
    // Simple compression implementation - in production, use zlib
    const jsonString = JSON.stringify(data);
    return Buffer.from(jsonString, 'utf8');
  }

  private decompress(buffer: Buffer): any {
    // Simple decompression implementation
    return JSON.parse(buffer.toString('utf8'));
  }

  private async ensureMemorySpace(requiredSize: number): Promise<void> {
    const currentSize = this.calculateCurrentMemoryUsage();
    const maxSize = this.config.maxMemoryMB * 1024 * 1024;

    if (currentSize + requiredSize > maxSize) {
      await this.evictEntries(requiredSize);
    }
  }

  private calculateCurrentMemoryUsage(): number {
    let total = 0;
    for (const entry of this.memoryCache.values()) {
      total += entry.size;
    }
    return total;
  }

  private async evictEntries(spaceNeeded: number): Promise<void> {
    let freedSpace = 0;
    const entriesToEvict: string[] = [];

    // Sort by eviction strategy
    const sortedEntries = Array.from(this.memoryCache.entries()).sort((a, b) => {
      switch (this.config.evictionStrategy) {
        case 'lru':
          return a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime();
        case 'lfu':
          return a[1].hits - b[1].hits;
        case 'ttl':
          return a[1].timestamp.getTime() - b[1].timestamp.getTime();
        default:
          return 0;
      }
    });

    for (const [key, entry] of sortedEntries) {
      if (freedSpace >= spaceNeeded) break;
      
      entriesToEvict.push(key);
      freedSpace += entry.size;
    }

    // Evict selected entries
    for (const key of entriesToEvict) {
      this.memoryCache.delete(key);
      this.stats.evictionCount++;
    }

    this.emit('entriesEvicted', { count: entriesToEvict.length, spaceFreed: freedSpace });
  }

  private updateEvictionQueue(key: string): void {
    // Remove key if it already exists
    const index = this.evictionQueue.indexOf(key);
    if (index > -1) {
      this.evictionQueue.splice(index, 1);
    }
    
    // Add to end of queue
    this.evictionQueue.push(key);
  }

  private recordPerformance(
    operation: 'get' | 'set' | 'delete' | 'evict',
    duration: number,
    layer: 'memory' | 'disk' | 'redis',
    success: boolean,
    dataSize: number
  ): void {
    const metric: CachePerformanceMetrics = {
      operationType: operation,
      duration,
      cacheLayer: layer,
      success,
      dataSize,
      timestamp: new Date()
    };

    this.performanceMetrics.push(metric);

    // Keep only recent metrics (last 1000 operations)
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Emit performance warning if threshold exceeded
    if (duration > this.config.monitoring.performanceThreshold) {
      this.emit('performanceWarning', metric);
    }
  }

  private updateStats(type: 'hit' | 'miss'): void {
    if (type === 'hit') {
      this.stats.hitRate = (this.stats.hitRate + 1) / 2; // Simple moving average
    } else {
      this.stats.missRate = (this.stats.missRate + 1) / 2;
    }
  }

  private updateMemoryUsage(): void {
    this.stats.totalEntries = this.memoryCache.size;
    this.stats.totalSize = this.calculateCurrentMemoryUsage();
    this.stats.memoryUsage = this.stats.totalSize / (this.config.maxMemoryMB * 1024 * 1024);
  }

  private resetStats(): void {
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      compressionRatio: 0,
      avgResponseTime: 0,
      memoryUsage: 0
    };
  }

  private async loadDiskCacheIndex(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.diskCachePath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.config.diskCachePath, file);
          const hash = file.replace('.json', '');
          // We'd need to reverse-lookup the key from hash in a real implementation
          // For now, we'll build the index as files are accessed
        }
      }
    } catch (error) {
      // Directory doesn't exist or is empty
    }
  }

  private async deleteDiskCacheFile(key: string, filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      this.diskCache.delete(key);
    } catch (error) {
      // File already deleted or doesn't exist
    }
  }

  private async clearDiskCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.config.diskCachePath);
      await Promise.all(files.map(file => 
        fs.unlink(path.join(this.config.diskCachePath, file))
      ));
      this.diskCache.clear();
    } catch (error) {
      // Directory doesn't exist or is empty
    }
  }

  private async initializeRedis(): Promise<void> {
    try {
      // Redis client initialization would go here
      // For now, we'll simulate it
      this.redisClient = null; // Would be actual Redis client
    } catch (error) {
      this.emit('redisConnectionError', error);
    }
  }

  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateMemoryUsage();
      this.emit('metricsUpdated', this.getStats());
    }, this.config.monitoring.metricsInterval);
  }

  private async removeExpiredEntries(): Promise<void> {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp.getTime() > entry.ttl) {
        keysToRemove.push(key);
      }
    }

    for (const key of keysToRemove) {
      this.memoryCache.delete(key);
    }
  }

  private async compressLargeEntries(): Promise<void> {
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!entry.compressed && entry.size > this.config.compressionThreshold) {
        entry.data = this.compress(entry.data) as any;
        entry.compressed = true;
      }
    }
  }

  private async optimizeMemoryUsage(): Promise<void> {
    // Implement memory optimization strategies
    const currentUsage = this.calculateCurrentMemoryUsage();
    const targetUsage = this.config.maxMemoryMB * 1024 * 1024 * 0.8; // 80% target

    if (currentUsage > targetUsage) {
      await this.evictEntries(currentUsage - targetUsage);
    }
  }

  private async defragmentDiskCache(): Promise<void> {
    // Implement disk cache defragmentation
    // This would involve reorganizing files for better performance
  }

  private calculateMemoryFreed(): number {
    // Calculate memory freed during optimization
    return 0; // Placeholder
  }

  private async persistCriticalData(): Promise<void> {
    // Persist critical cache data before shutdown
    const criticalData = {
      stats: this.stats,
      performanceMetrics: this.performanceMetrics.slice(-100), // Last 100 metrics
      diskCacheIndex: Array.from(this.diskCache.entries())
    };

    const persistPath = path.join(this.config.diskCachePath, 'critical-data.json');
    await fs.writeFile(persistPath, JSON.stringify(criticalData, null, 2));
  }
}

/**
 * Factory function to create optimized cache manager
 */
export function createCommunityNodeMetadataCache(config?: Partial<CacheConfiguration>): CommunityNodeMetadataCache {
  return new CommunityNodeMetadataCache(config);
}

/**
 * Default cache configuration for different environments
 */
export const CacheConfigurations = {
  development: {
    maxMemoryMB: 128,
    defaultTTL: 15 * 60 * 1000, // 15 minutes
    persistToDisk: true,
    monitoring: { enabled: true, metricsInterval: 30000 }
  },
  
  production: {
    maxMemoryMB: 512,
    defaultTTL: 60 * 60 * 1000, // 1 hour
    persistToDisk: true,
    redisConfig: {
      host: 'localhost',
      port: 6379,
      db: 0
    },
    monitoring: { enabled: true, metricsInterval: 60000 }
  },
  
  testing: {
    maxMemoryMB: 64,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    persistToDisk: false,
    monitoring: { enabled: false, metricsInterval: 0 }
  }
}; 