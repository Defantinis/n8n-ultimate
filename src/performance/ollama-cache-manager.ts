/**
 * Ollama API Response Cache Manager
 * 
 * Implements intelligent caching for Ollama API responses to improve performance
 * and reduce API call latency for the n8n-ultimate workflow generation system.
 */

import crypto from 'crypto';

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
  defaultTtl: number; // in milliseconds
  cleanupInterval: number; // in milliseconds
  enablePerformanceTracking: boolean;
  compressionEnabled: boolean;
  persistToDisk: boolean;
  diskCachePath?: string;
}

/**
 * Ollama Cache Manager for optimizing API response caching
 */
export class OllamaCacheManager {
  private cache = new Map<string, CacheEntry>();
  private stats = {
    totalHits: 0,
    totalMisses: 0,
    responseTimeSum: 0,
    responseTimeCount: 0
  };
  private cleanupTimer?: NodeJS.Timeout;
  private readonly config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxEntries: 1000,
      defaultTtl: 30 * 60 * 1000, // 30 minutes
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      enablePerformanceTracking: true,
      compressionEnabled: true,
      persistToDisk: false,
      ...config
    };

    this.startCleanupTimer();
  }

  /**
   * Generate cache key from prompt parameters
   */
  private generateCacheKey(
    prompt: string,
    model: string,
    temperature: number,
    topP: number,
    numPredict: number
  ): string {
    const input = JSON.stringify({
      prompt: this.normalizePrompt(prompt),
      model,
      temperature: Math.round(temperature * 1000) / 1000, // Round to 3 decimal places
      topP: Math.round(topP * 1000) / 1000,
      numPredict
    });
    
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
  }

  /**
   * Normalize prompt for consistent caching
   */
  private normalizePrompt(prompt: string): string {
    return prompt.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  /**
   * Check if cache entry is valid
   */
  private isValidEntry(entry: CacheEntry): boolean {
    const now = Date.now();
    return (now - entry.timestamp) < entry.ttl;
  }

  /**
   * Get cached response if available and valid
   */
  async getCachedResponse(
    prompt: string,
    model: string,
    temperature: number = 0.3,
    topP: number = 0.9,
    numPredict: number = 2000
  ): Promise<string | null> {
    const cacheKey = this.generateCacheKey(prompt, model, temperature, topP, numPredict);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.stats.totalMisses++;
      return null;
    }

    if (!this.isValidEntry(entry)) {
      this.cache.delete(cacheKey);
      this.stats.totalMisses++;
      return null;
    }

    // Update access statistics
    entry.hitCount++;
    entry.lastAccessed = Date.now();
    this.stats.totalHits++;

    if (this.config.enablePerformanceTracking) {
      console.log(`🎯 Cache HIT for model ${model} (key: ${cacheKey})`);
    }

    return entry.response;
  }

  /**
   * Store response in cache
   */
  async setCachedResponse(
    prompt: string,
    response: string,
    model: string,
    temperature: number = 0.3,
    topP: number = 0.9,
    numPredict: number = 2000,
    customTtl?: number
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(prompt, model, temperature, topP, numPredict);
    const now = Date.now();
    const promptHash = crypto.createHash('md5').update(prompt).digest('hex').substring(0, 8);

    // Ensure we don't exceed max entries
    if (this.cache.size >= this.config.maxEntries) {
      await this.evictOldestEntries(Math.floor(this.config.maxEntries * 0.1)); // Remove 10%
    }

    const entry: CacheEntry = {
      response: this.config.compressionEnabled ? this.compressResponse(response) : response,
      timestamp: now,
      ttl: customTtl || this.config.defaultTtl,
      hitCount: 0,
      lastAccessed: now,
      promptHash,
      model,
      temperature,
      topP,
      numPredict
    };

    this.cache.set(cacheKey, entry);

    if (this.config.enablePerformanceTracking) {
      console.log(`💾 Cache STORE for model ${model} (key: ${cacheKey})`);
    }
  }

  /**
   * Simple compression for response strings
   */
  private compressResponse(response: string): string {
    // Simple compression: remove extra whitespace and normalize
    return response.replace(/\s+/g, ' ').trim();
  }

  /**
   * Evict oldest entries to make room
   */
  private async evictOldestEntries(count: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed)
      .slice(0, count);

    for (const [key] of entries) {
      this.cache.delete(key);
    }

    if (this.config.enablePerformanceTracking) {
      console.log(`🗑️ Evicted ${count} oldest cache entries`);
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidEntry(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (this.config.enablePerformanceTracking && cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    
    const timestamps = entries.map(e => e.timestamp);
    const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : now;
    const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : now;
    
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    const hitRate = totalRequests > 0 ? (this.stats.totalHits / totalRequests) * 100 : 0;
    
    const memoryUsage = this.estimateMemoryUsage();
    const averageResponseTime = this.stats.responseTimeCount > 0 
      ? this.stats.responseTimeSum / this.stats.responseTimeCount 
      : 0;

    // Cache efficiency score based on hit rate and memory efficiency
    const cacheEfficiencyScore = hitRate * 0.7 + (Math.min(memoryUsage / 1024 / 1024, 100) / 100) * 0.3;

    return {
      totalEntries: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: Math.round(memoryUsage),
      oldestEntry,
      newestEntry,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      cacheEfficiencyScore: Math.round(cacheEfficiencyScore * 100) / 100
    };
  }

  /**
   * Estimate memory usage of cache
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += entry.response.length * 2;
      totalSize += entry.promptHash.length * 2;
      totalSize += entry.model.length * 2;
      totalSize += 64; // Approximate overhead for numbers and metadata
    }
    
    return totalSize;
  }

  /**
   * Clear all cache entries
   */
  clearCache(): void {
    this.cache.clear();
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      responseTimeSum: 0,
      responseTimeCount: 0
    };

    if (this.config.enablePerformanceTracking) {
      console.log('🗑️ Cache cleared');
    }
  }

  /**
   * Get cache entries for debugging
   */
  getCacheEntries(): Array<{ key: string; entry: CacheEntry }> {
    return Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry }));
  }

  /**
   * Preload common prompts (for warming up cache)
   */
  async preloadCommonPrompts(prompts: Array<{
    prompt: string;
    response: string;
    model: string;
    temperature?: number;
    topP?: number;
    numPredict?: number;
  }>): Promise<void> {
    for (const item of prompts) {
      await this.setCachedResponse(
        item.prompt,
        item.response,
        item.model,
        item.temperature || 0.3,
        item.topP || 0.9,
        item.numPredict || 2000
      );
    }

    if (this.config.enablePerformanceTracking) {
      console.log(`🔥 Preloaded ${prompts.length} common prompts into cache`);
    }
  }

  /**
   * Record response time for performance tracking
   */
  recordResponseTime(responseTime: number): void {
    if (this.config.enablePerformanceTracking) {
      this.stats.responseTimeSum += responseTime;
      this.stats.responseTimeCount++;
    }
  }

  /**
   * Dispose of the cache manager
   */
  dispose(): void {
    this.stopCleanupTimer();
    this.clearCache();
  }
}

/**
 * Global cache manager instance
 */
export const ollamaCacheManager = new OllamaCacheManager({
  maxEntries: 1000,
  defaultTtl: 30 * 60 * 1000, // 30 minutes
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
  enablePerformanceTracking: true,
  compressionEnabled: true,
  persistToDisk: false
}); 