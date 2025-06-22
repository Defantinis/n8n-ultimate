/**
 * Community Node Cache Integration Manager
 * Integrates the metadata cache with existing community node systems
 * for optimal performance in discovery, validation, and integration
 */
import { EventEmitter } from 'events';
/**
 * Manages integration between community node cache and existing systems
 */
export class CommunityNodeCacheIntegration extends EventEmitter {
    metadataCache;
    registry;
    validator;
    integrationManager;
    parser;
    config;
    stats;
    backgroundRefreshTimer;
    performanceBaseline = new Map();
    constructor(metadataCache, registry, validator, integrationManager, parser, config = {}) {
        super();
        this.metadataCache = metadataCache;
        this.registry = registry;
        this.validator = validator;
        this.integrationManager = integrationManager;
        this.parser = parser;
        this.config = {
            enableMetadataCache: true,
            enableValidationCache: true,
            enableSearchCache: true,
            enableCompatibilityCache: true,
            cacheWarmupOnStartup: true,
            backgroundRefreshInterval: 60 * 60 * 1000, // 1 hour
            performanceMonitoring: true,
            ...config
        };
        this.stats = {
            cacheHitRate: 0,
            averageResponseTime: 0,
            totalCacheSize: 0,
            backgroundRefreshCount: 0,
            performanceGain: 0
        };
        this.initializeIntegration();
    }
    /**
     * Initialize the cache integration system
     */
    async initializeIntegration() {
        try {
            // Set up event listeners for cache invalidation
            this.setupCacheInvalidationListeners();
            // Warm up cache if enabled
            if (this.config.cacheWarmupOnStartup) {
                await this.warmupCache();
            }
            // Start background refresh if enabled
            if (this.config.backgroundRefreshInterval > 0) {
                this.startBackgroundRefresh();
            }
            // Set up performance monitoring
            if (this.config.performanceMonitoring) {
                this.setupPerformanceMonitoring();
            }
            this.emit('integrationInitialized', {
                cacheEnabled: this.config,
                warmupCompleted: this.config.cacheWarmupOnStartup
            });
        }
        catch (error) {
            this.emit('integrationError', { phase: 'initialization', error });
            throw error;
        }
    }
    /**
     * Enhanced node discovery with caching
     */
    async discoverNodesWithCache(searchOptions = {}) {
        const startTime = Date.now();
        const cacheKey = this.generateSearchCacheKey(searchOptions);
        try {
            // Try cache first if enabled
            if (this.config.enableSearchCache) {
                const cachedResults = await this.metadataCache.getSearchResults(JSON.stringify(searchOptions), searchOptions);
                if (cachedResults) {
                    this.recordPerformanceMetric('discoverNodes', Date.now() - startTime, true);
                    this.emit('cacheHit', { operation: 'discoverNodes', cacheKey });
                    return cachedResults;
                }
            }
            // Fallback to registry discovery
            await this.registry.discoverNodes();
            const results = await this.registry.searchNodes(searchOptions);
            // Cache the results if enabled
            if (this.config.enableSearchCache && results.length > 0) {
                const metadata = await this.convertToMetadata(results);
                await this.metadataCache.cacheSearchResults(JSON.stringify(searchOptions), searchOptions, metadata);
            }
            this.recordPerformanceMetric('discoverNodes', Date.now() - startTime, false);
            this.emit('cacheMiss', { operation: 'discoverNodes', cacheKey });
            return results;
        }
        catch (error) {
            this.emit('discoveryError', { searchOptions, error });
            throw error;
        }
    }
    /**
     * Enhanced node validation with caching
     */
    async validateNodeWithCache(nodeDefinition, packageInfo) {
        const startTime = Date.now();
        const nodeId = `${packageInfo.name}:${nodeDefinition.name}`;
        try {
            // Try cache first if enabled
            if (this.config.enableValidationCache) {
                const cachedResult = await this.metadataCache.getValidationResult(nodeId);
                if (cachedResult) {
                    this.recordPerformanceMetric('validateNode', Date.now() - startTime, true);
                    this.emit('cacheHit', { operation: 'validateNode', nodeId });
                    return cachedResult;
                }
            }
            // Fallback to actual validation
            const validationResult = await this.validator.validateCommunityNode(nodeDefinition, packageInfo);
            // Cache the result if enabled
            if (this.config.enableValidationCache) {
                await this.metadataCache.cacheValidationResult(nodeId, validationResult);
            }
            this.recordPerformanceMetric('validateNode', Date.now() - startTime, false);
            this.emit('cacheMiss', { operation: 'validateNode', nodeId });
            return validationResult;
        }
        catch (error) {
            this.emit('validationError', { nodeId, error });
            throw error;
        }
    }
    /**
     * Enhanced compatibility checking with caching
     */
    async checkCompatibilityWithCache(nodeId, n8nVersion) {
        const startTime = Date.now();
        try {
            // Try cache first if enabled
            if (this.config.enableCompatibilityCache) {
                const cachedResult = await this.metadataCache.getCompatibilityInfo(nodeId, n8nVersion);
                if (cachedResult) {
                    this.recordPerformanceMetric('checkCompatibility', Date.now() - startTime, true);
                    this.emit('cacheHit', { operation: 'checkCompatibility', nodeId, n8nVersion });
                    return cachedResult;
                }
            }
            // Fallback to actual compatibility check
            const compatibilityResult = await this.integrationManager.checkCompatibility(nodeId, n8nVersion);
            // Cache the result if enabled
            if (this.config.enableCompatibilityCache) {
                await this.metadataCache.cacheCompatibilityInfo(nodeId, n8nVersion, compatibilityResult);
            }
            this.recordPerformanceMetric('checkCompatibility', Date.now() - startTime, false);
            this.emit('cacheMiss', { operation: 'checkCompatibility', nodeId, n8nVersion });
            return compatibilityResult;
        }
        catch (error) {
            this.emit('compatibilityError', { nodeId, n8nVersion, error });
            throw error;
        }
    }
    /**
     * Enhanced node metadata retrieval with caching
     */
    async getNodeMetadataWithCache(nodeId) {
        const startTime = Date.now();
        try {
            // Try cache first if enabled
            if (this.config.enableMetadataCache) {
                const cachedMetadata = await this.metadataCache.getNodeMetadata(nodeId);
                if (cachedMetadata) {
                    this.recordPerformanceMetric('getNodeMetadata', Date.now() - startTime, true);
                    this.emit('cacheHit', { operation: 'getNodeMetadata', nodeId });
                    return cachedMetadata;
                }
            }
            // Fallback to building metadata from registry and validation
            const nodeDetails = await this.integrationManager.getNodeDetails(nodeId);
            if (!nodeDetails) {
                this.recordPerformanceMetric('getNodeMetadata', Date.now() - startTime, false);
                return null;
            }
            const metadata = await this.buildMetadataFromNodeDetails(nodeDetails);
            // Cache the metadata if enabled
            if (this.config.enableMetadataCache && metadata) {
                await this.metadataCache.setNodeMetadata(nodeId, metadata);
            }
            this.recordPerformanceMetric('getNodeMetadata', Date.now() - startTime, false);
            this.emit('cacheMiss', { operation: 'getNodeMetadata', nodeId });
            return metadata;
        }
        catch (error) {
            this.emit('metadataError', { nodeId, error });
            throw error;
        }
    }
    /**
     * Bulk metadata retrieval with parallel caching
     */
    async getBulkNodeMetadata(nodeIds) {
        const startTime = Date.now();
        try {
            // Try to get all from cache first
            const cachedResults = await this.metadataCache.getMultipleNodeMetadata(nodeIds);
            const missingNodeIds = nodeIds.filter(id => !cachedResults.has(id));
            // If we have all cached, return immediately
            if (missingNodeIds.length === 0) {
                this.recordPerformanceMetric('getBulkNodeMetadata', Date.now() - startTime, true);
                this.emit('bulkCacheHit', { nodeIds, cachedCount: cachedResults.size });
                return cachedResults;
            }
            // Fetch missing metadata in parallel
            const missingMetadataPromises = missingNodeIds.map(async (nodeId) => {
                const metadata = await this.getNodeMetadataWithCache(nodeId);
                return { nodeId, metadata };
            });
            const missingResults = await Promise.all(missingMetadataPromises);
            // Combine cached and newly fetched results
            const allResults = new Map(cachedResults);
            for (const { nodeId, metadata } of missingResults) {
                if (metadata) {
                    allResults.set(nodeId, metadata);
                }
            }
            this.recordPerformanceMetric('getBulkNodeMetadata', Date.now() - startTime, false);
            this.emit('bulkCacheMiss', {
                nodeIds,
                cachedCount: cachedResults.size,
                fetchedCount: missingNodeIds.length
            });
            return allResults;
        }
        catch (error) {
            this.emit('bulkMetadataError', { nodeIds, error });
            throw error;
        }
    }
    /**
     * Invalidate cache when nodes are updated
     */
    async invalidateNodeCache(nodeId) {
        try {
            await this.metadataCache.invalidateNode(nodeId);
            this.emit('nodeInvalidated', { nodeId });
        }
        catch (error) {
            this.emit('invalidationError', { nodeId, error });
        }
    }
    /**
     * Invalidate search caches when new nodes are discovered
     */
    async invalidateSearchCaches() {
        try {
            await this.metadataCache.invalidateSearchResults();
            this.emit('searchCachesInvalidated');
        }
        catch (error) {
            this.emit('searchInvalidationError', { error });
        }
    }
    /**
     * Get integration statistics
     */
    getIntegrationStats() {
        const cacheStats = this.metadataCache.getStats();
        this.stats.cacheHitRate = cacheStats.hitRate;
        this.stats.averageResponseTime = cacheStats.avgResponseTime;
        this.stats.totalCacheSize = cacheStats.totalSize;
        this.stats.performanceGain = this.calculatePerformanceGain();
        return { ...this.stats };
    }
    /**
     * Optimize cache performance
     */
    async optimizeCache() {
        try {
            await this.metadataCache.optimize();
            this.emit('cacheOptimized');
        }
        catch (error) {
            this.emit('optimizationError', { error });
        }
    }
    /**
     * Shutdown integration system
     */
    async shutdown() {
        try {
            // Stop background refresh
            if (this.backgroundRefreshTimer) {
                clearInterval(this.backgroundRefreshTimer);
            }
            // Shutdown cache
            await this.metadataCache.shutdown();
            this.emit('integrationShutdown');
        }
        catch (error) {
            this.emit('shutdownError', { error });
        }
    }
    // Private helper methods
    setupCacheInvalidationListeners() {
        // Listen for registry updates
        this.registry.on('discoveryCompleted', () => {
            this.invalidateSearchCaches();
        });
        // Listen for node updates
        this.registry.on('nodeUpdated', (nodeId) => {
            this.invalidateNodeCache(nodeId);
        });
        // Listen for validation updates
        this.validator.on('validationCompleted', (data) => {
            // Validation results are cached with shorter TTL, so less aggressive invalidation
        });
    }
    async warmupCache() {
        try {
            this.emit('warmupStarted');
            // Get popular nodes for warmup
            const popularNodes = await this.registry.searchNodes({
                sortBy: 'popularity',
                limit: 50
            });
            // Warm up metadata cache
            const warmupPromises = popularNodes.map(async (node) => {
                try {
                    await this.getNodeMetadataWithCache(node.name);
                }
                catch (error) {
                    // Continue warming up other nodes even if one fails
                }
            });
            await Promise.all(warmupPromises);
            this.emit('warmupCompleted', { nodesWarmedUp: popularNodes.length });
        }
        catch (error) {
            this.emit('warmupError', { error });
        }
    }
    startBackgroundRefresh() {
        this.backgroundRefreshTimer = setInterval(async () => {
            try {
                await this.performBackgroundRefresh();
                this.stats.backgroundRefreshCount++;
            }
            catch (error) {
                this.emit('backgroundRefreshError', { error });
            }
        }, this.config.backgroundRefreshInterval);
    }
    async performBackgroundRefresh() {
        // Refresh popular nodes in background
        const popularNodes = await this.registry.searchNodes({
            sortBy: 'popularity',
            limit: 20
        });
        for (const node of popularNodes) {
            try {
                // Force refresh by invalidating first
                await this.invalidateNodeCache(node.name);
                await this.getNodeMetadataWithCache(node.name);
            }
            catch (error) {
                // Continue with other nodes
            }
        }
        this.emit('backgroundRefreshCompleted', { nodesRefreshed: popularNodes.length });
    }
    setupPerformanceMonitoring() {
        // Monitor cache performance metrics
        this.metadataCache.on('metricsUpdated', (stats) => {
            this.updatePerformanceMetrics(stats);
        });
        // Monitor performance warnings
        this.metadataCache.on('performanceWarning', (metric) => {
            this.emit('performanceWarning', metric);
        });
    }
    generateSearchCacheKey(searchOptions) {
        return `search:${JSON.stringify(searchOptions)}`;
    }
    async convertToMetadata(nodes) {
        const metadataPromises = nodes.map(async (node) => {
            try {
                return await this.buildMetadataFromNode(node);
            }
            catch (error) {
                return null;
            }
        });
        const results = await Promise.all(metadataPromises);
        return results.filter(metadata => metadata !== null);
    }
    async buildMetadataFromNodeDetails(nodeDetails) {
        // Build comprehensive metadata from node details
        return {
            nodeId: nodeDetails.nodeId,
            packageName: nodeDetails.packageName || 'unknown',
            version: nodeDetails.version || '1.0.0',
            name: nodeDetails.name || nodeDetails.nodeId,
            displayName: nodeDetails.displayName || nodeDetails.name || nodeDetails.nodeId,
            description: nodeDetails.description || 'Community node',
            category: nodeDetails.category || 'general',
            subcategory: nodeDetails.subcategory,
            author: nodeDetails.author || 'Unknown',
            license: nodeDetails.license || 'MIT',
            keywords: nodeDetails.keywords || [],
            compatibility: {
                n8nVersion: nodeDetails.n8nVersion || '1.0.0',
                nodeVersion: nodeDetails.version || '1.0.0',
                apiVersion: nodeDetails.apiVersion || '1.0.0'
            },
            features: nodeDetails.features || [],
            inputs: nodeDetails.inputs || [],
            outputs: nodeDetails.outputs || [],
            parameters: nodeDetails.parameters || [],
            credentials: nodeDetails.credentials || [],
            dependencies: nodeDetails.dependencies || [],
            performance: {
                avgExecutionTime: nodeDetails.avgExecutionTime || 100,
                memoryUsage: nodeDetails.memoryUsage || 1024,
                reliability: nodeDetails.reliability || 0.95
            },
            popularity: {
                downloads: nodeDetails.downloads || 0,
                rating: nodeDetails.rating || 3.5,
                usage: nodeDetails.usage || 0
            },
            lastUpdated: nodeDetails.lastUpdated || new Date(),
            cacheTimestamp: new Date()
        };
    }
    async buildMetadataFromNode(node) {
        // Simplified metadata builder for search results
        return {
            nodeId: node.name,
            packageName: node.packageName || 'unknown',
            version: node.version || '1.0.0',
            name: node.name,
            displayName: node.displayName || node.name,
            description: node.description || 'Community node',
            category: node.category || 'general',
            subcategory: node.subcategory,
            author: node.author || 'Unknown',
            license: node.license || 'MIT',
            keywords: node.keywords || [],
            compatibility: {
                n8nVersion: '1.0.0',
                nodeVersion: node.version || '1.0.0',
                apiVersion: '1.0.0'
            },
            features: node.features || [],
            inputs: node.inputs || [],
            outputs: node.outputs || [],
            parameters: node.parameters || [],
            credentials: node.credentials || [],
            dependencies: node.dependencies || [],
            performance: {
                avgExecutionTime: 100,
                memoryUsage: 1024,
                reliability: 0.95
            },
            popularity: {
                downloads: node.downloads || 0,
                rating: node.rating || 3.5,
                usage: node.usage || 0
            },
            lastUpdated: new Date(),
            cacheTimestamp: new Date()
        };
    }
    recordPerformanceMetric(operation, duration, fromCache) {
        // Record baseline if not cached
        if (!fromCache) {
            this.performanceBaseline.set(operation, duration);
        }
        // Update stats
        this.updateResponseTimeStats(duration);
    }
    updateResponseTimeStats(duration) {
        // Simple moving average for response time
        this.stats.averageResponseTime = (this.stats.averageResponseTime + duration) / 2;
    }
    updatePerformanceMetrics(cacheStats) {
        // Update integration stats based on cache stats
        this.stats.cacheHitRate = cacheStats.hitRate;
        this.stats.totalCacheSize = cacheStats.totalSize;
    }
    calculatePerformanceGain() {
        // Calculate performance gain based on cache hits vs baseline
        const totalOperations = Array.from(this.performanceBaseline.values()).length;
        if (totalOperations === 0)
            return 0;
        const baselineAvg = Array.from(this.performanceBaseline.values())
            .reduce((sum, time) => sum + time, 0) / totalOperations;
        if (baselineAvg === 0)
            return 0;
        return Math.max(0, (baselineAvg - this.stats.averageResponseTime) / baselineAvg);
    }
}
/**
 * Factory function to create cache integration
 */
export function createCommunityNodeCacheIntegration(metadataCache, registry, validator, integrationManager, parser, config) {
    return new CommunityNodeCacheIntegration(metadataCache, registry, validator, integrationManager, parser, config);
}
//# sourceMappingURL=community-node-cache-integration.js.map