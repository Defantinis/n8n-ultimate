/**
 * Ollama API Response Cache Manager
 *
 * Implements intelligent caching for Ollama API responses to improve performance
 * and reduce API call latency for the n8n-ultimate workflow generation system.
 */
export interface CacheEntry {
    response: string;
    timestamp: number;
    ttl: number;
    hitCount: number;
    lastAccessed: number;
    promptHash: string;
    model: string;
    temperature: number;
    topP: number;
    numPredict: number;
}
export interface CacheStats {
    totalEntries: number;
    hitRate: number;
    memoryUsage: number;
    oldestEntry: number;
    newestEntry: number;
    totalHits: number;
    totalMisses: number;
    averageResponseTime: number;
    cacheEfficiencyScore: number;
}
export interface CacheConfig {
    maxEntries: number;
    defaultTtl: number;
    cleanupInterval: number;
    enablePerformanceTracking: boolean;
    compressionEnabled: boolean;
    persistToDisk: boolean;
    diskCachePath?: string;
}
/**
 * Ollama Cache Manager for optimizing API response caching
 */
export declare class OllamaCacheManager {
    private cache;
    private stats;
    private cleanupTimer?;
    private readonly config;
    constructor(config?: Partial<CacheConfig>);
    /**
     * Generate cache key from prompt parameters
     */
    private generateCacheKey;
    /**
     * Normalize prompt for consistent caching
     */
    private normalizePrompt;
    /**
     * Check if cache entry is valid
     */
    private isValidEntry;
    /**
     * Get cached response if available and valid
     */
    getCachedResponse(prompt: string, model: string, temperature?: number, topP?: number, numPredict?: number): Promise<string | null>;
    /**
     * Store response in cache
     */
    setCachedResponse(prompt: string, response: string, model: string, temperature?: number, topP?: number, numPredict?: number, customTtl?: number): Promise<void>;
    /**
     * Simple compression for response strings
     */
    private compressResponse;
    /**
     * Evict oldest entries to make room
     */
    private evictOldestEntries;
    /**
     * Clean up expired entries
     */
    private cleanupExpiredEntries;
    /**
     * Start cleanup timer
     */
    private startCleanupTimer;
    /**
     * Stop cleanup timer
     */
    stopCleanupTimer(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): CacheStats;
    /**
     * Estimate memory usage of cache
     */
    private estimateMemoryUsage;
    /**
     * Clear all cache entries
     */
    clearCache(): void;
    /**
     * Get cache entries for debugging
     */
    getCacheEntries(): Array<{
        key: string;
        entry: CacheEntry;
    }>;
    /**
     * Preload common prompts (for warming up cache)
     */
    preloadCommonPrompts(prompts: Array<{
        prompt: string;
        response: string;
        model: string;
        temperature?: number;
        topP?: number;
        numPredict?: number;
    }>): Promise<void>;
    /**
     * Record response time for performance tracking
     */
    recordResponseTime(responseTime: number): void;
    /**
     * Dispose of the cache manager
     */
    dispose(): void;
}
/**
 * Global cache manager instance
 */
export declare const ollamaCacheManager: OllamaCacheManager;
//# sourceMappingURL=ollama-cache-manager.d.ts.map