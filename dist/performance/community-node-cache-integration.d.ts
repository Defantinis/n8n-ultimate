/**
 * Community Node Cache Integration Manager
 * Integrates the metadata cache with existing community node systems
 * for optimal performance in discovery, validation, and integration
 */
import { EventEmitter } from 'events';
import { CommunityNodeMetadataCache, CommunityNodeMetadata } from './community-node-metadata-cache';
import { CommunityNodeRegistry } from '../community/community-node-registry';
import { CommunityNodeValidator } from '../community/community-node-validator';
import { CommunityNodeIntegrationManager } from '../community/community-node-integration-api';
import { DynamicNodeParser } from '../community/dynamic-node-parser';
export interface CacheIntegrationConfig {
    enableMetadataCache: boolean;
    enableValidationCache: boolean;
    enableSearchCache: boolean;
    enableCompatibilityCache: boolean;
    cacheWarmupOnStartup: boolean;
    backgroundRefreshInterval: number;
    performanceMonitoring: boolean;
}
export interface CacheIntegrationStats {
    cacheHitRate: number;
    averageResponseTime: number;
    totalCacheSize: number;
    backgroundRefreshCount: number;
    performanceGain: number;
}
/**
 * Manages integration between community node cache and existing systems
 */
export declare class CommunityNodeCacheIntegration extends EventEmitter {
    private metadataCache;
    private registry;
    private validator;
    private integrationManager;
    private parser;
    private config;
    private stats;
    private backgroundRefreshTimer?;
    private performanceBaseline;
    constructor(metadataCache: CommunityNodeMetadataCache, registry: CommunityNodeRegistry, validator: CommunityNodeValidator, integrationManager: CommunityNodeIntegrationManager, parser: DynamicNodeParser, config?: Partial<CacheIntegrationConfig>);
    /**
     * Initialize the cache integration system
     */
    private initializeIntegration;
    /**
     * Enhanced node discovery with caching
     */
    discoverNodesWithCache(searchOptions?: any): Promise<any[]>;
    /**
     * Enhanced node validation with caching
     */
    validateNodeWithCache(nodeDefinition: any, packageInfo: any): Promise<any>;
    /**
     * Enhanced compatibility checking with caching
     */
    checkCompatibilityWithCache(nodeId: string, n8nVersion: string): Promise<any>;
    /**
     * Enhanced node metadata retrieval with caching
     */
    getNodeMetadataWithCache(nodeId: string): Promise<CommunityNodeMetadata | null>;
    /**
     * Bulk metadata retrieval with parallel caching
     */
    getBulkNodeMetadata(nodeIds: string[]): Promise<Map<string, CommunityNodeMetadata>>;
    /**
     * Invalidate cache when nodes are updated
     */
    invalidateNodeCache(nodeId: string): Promise<void>;
    /**
     * Invalidate search caches when new nodes are discovered
     */
    invalidateSearchCaches(): Promise<void>;
    /**
     * Get integration statistics
     */
    getIntegrationStats(): CacheIntegrationStats;
    /**
     * Optimize cache performance
     */
    optimizeCache(): Promise<void>;
    /**
     * Shutdown integration system
     */
    shutdown(): Promise<void>;
    private setupCacheInvalidationListeners;
    private warmupCache;
    private startBackgroundRefresh;
    private performBackgroundRefresh;
    private setupPerformanceMonitoring;
    private generateSearchCacheKey;
    private convertToMetadata;
    private buildMetadataFromNodeDetails;
    private buildMetadataFromNode;
    private recordPerformanceMetric;
    private updateResponseTimeStats;
    private updatePerformanceMetrics;
    private calculatePerformanceGain;
}
/**
 * Factory function to create cache integration
 */
export declare function createCommunityNodeCacheIntegration(metadataCache: CommunityNodeMetadataCache, registry: CommunityNodeRegistry, validator: CommunityNodeValidator, integrationManager: CommunityNodeIntegrationManager, parser: DynamicNodeParser, config?: Partial<CacheIntegrationConfig>): CommunityNodeCacheIntegration;
//# sourceMappingURL=community-node-cache-integration.d.ts.map