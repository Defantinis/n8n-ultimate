/**
 * Test Suite for Community Node Cache Integration
 * Comprehensive testing of caching strategies for community node metadata
 */

import { CommunityNodeCacheIntegration, CacheIntegrationConfig } from './community-node-cache-integration';
import { CommunityNodeMetadataCache, CacheConfiguration } from './community-node-metadata-cache';
import { CommunityNodeRegistry } from '../community/community-node-registry';
import { CommunityNodeValidator } from '../community/community-node-validator';
import { CommunityNodeIntegrationManager } from '../community/community-node-integration-api';
import { DynamicNodeParser } from '../community/dynamic-node-parser';

/**
 * Test data generator for community node cache integration tests
 */
export class CommunityNodeCacheIntegrationTestData {
  static generateTestNodeMetadata(nodeId: string = 'test-node'): any {
    return {
      nodeId,
      packageName: `package-${nodeId}`,
      version: '1.0.0',
      name: nodeId,
      displayName: `Test ${nodeId}`,
      description: `Test community node ${nodeId}`,
      category: 'test',
      subcategory: 'automation',
      author: 'Test Author',
      license: 'MIT',
      keywords: ['test', 'automation', 'community'],
      compatibility: {
        n8nVersion: '1.0.0',
        nodeVersion: '1.0.0',
        apiVersion: '1.0.0'
      },
      features: ['feature1', 'feature2'],
      inputs: [
        { name: 'input1', type: 'string', required: true, description: 'Test input' }
      ],
      outputs: [
        { name: 'output1', type: 'object', description: 'Test output' }
      ],
      parameters: [
        { name: 'param1', type: 'string', required: false, default: 'test', description: 'Test parameter' }
      ],
      credentials: [
        { name: 'cred1', type: 'oauth2', required: true, description: 'Test credential' }
      ],
      dependencies: ['dep1', 'dep2'],
      performance: {
        avgExecutionTime: 150,
        memoryUsage: 2048,
        reliability: 0.98
      },
      popularity: {
        downloads: 1000,
        rating: 4.5,
        usage: 500
      },
      lastUpdated: new Date(),
      cacheTimestamp: new Date()
    };
  }

  static generateTestSearchOptions(query: string = 'test'): any {
    return {
      query,
      category: 'test',
      sortBy: 'popularity',
      limit: 10,
      filters: {
        minRating: 3.0,
        maxAge: 30
      }
    };
  }

  static generateTestValidationResult(nodeId: string = 'test-node'): any {
    return {
      nodeId,
      valid: true,
      score: 95,
      grade: 'A',
      issues: [],
      warnings: ['Minor warning'],
      recommendations: ['Update documentation'],
      timestamp: new Date()
    };
  }

  static generateTestCompatibilityResult(nodeId: string = 'test-node', n8nVersion: string = '1.0.0'): any {
    return {
      nodeId,
      n8nVersion,
      compatible: true,
      compatibilityScore: 0.95,
      issues: [],
      recommendations: [],
      timestamp: new Date()
    };
  }
}

/**
 * Mock implementations for testing
 */
class MockCommunityNodeRegistry {
  private mockNodes: any[] = [];

  constructor() {
    // Initialize with test data
    this.mockNodes = [
      { name: 'node1', packageName: 'package1', version: '1.0.0', popularity: 100 },
      { name: 'node2', packageName: 'package2', version: '1.1.0', popularity: 200 },
      { name: 'node3', packageName: 'package3', version: '2.0.0', popularity: 300 }
    ];
  }

  async discoverNodes(): Promise<void> {
    // Mock discovery
  }

  async searchNodes(options: any): Promise<any[]> {
    let results = [...this.mockNodes];
    
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    if (options.sortBy === 'popularity') {
      results.sort((a, b) => b.popularity - a.popularity);
    }
    
    return results;
  }

  on(event: string, callback: Function): void {
    // Mock event listener
  }
}

class MockCommunityNodeValidator {
  async validateCommunityNode(nodeDefinition: any, packageInfo: any): Promise<any> {
    return CommunityNodeCacheIntegrationTestData.generateTestValidationResult(nodeDefinition.name);
  }

  on(event: string, callback: Function): void {
    // Mock event listener
  }
}

class MockCommunityNodeIntegrationManager {
  async checkCompatibility(nodeId: string, n8nVersion: string): Promise<any> {
    return CommunityNodeCacheIntegrationTestData.generateTestCompatibilityResult(nodeId, n8nVersion);
  }

  async getNodeDetails(nodeId: string): Promise<any> {
    return CommunityNodeCacheIntegrationTestData.generateTestNodeMetadata(nodeId);
  }
}

class MockDynamicNodeParser {
  // Mock parser implementation
}

/**
 * Comprehensive test suite for community node cache integration
 */
export class CommunityNodeCacheIntegrationTest {
  private cacheIntegration: CommunityNodeCacheIntegration;
  private metadataCache: CommunityNodeMetadataCache;
  private mockRegistry: MockCommunityNodeRegistry;
  private mockValidator: MockCommunityNodeValidator;
  private mockIntegrationManager: MockCommunityNodeIntegrationManager;
  private mockParser: MockDynamicNodeParser;

  constructor() {
    // Initialize test environment
    this.setupTestEnvironment();
  }

  private setupTestEnvironment(): void {
    // Create cache with test configuration
    const cacheConfig: Partial<CacheConfiguration> = {
      maxMemoryMB: 64,
      defaultTTL: 5 * 60 * 1000, // 5 minutes for testing
      persistToDisk: false,
      monitoring: { enabled: false, metricsInterval: 0, performanceThreshold: 50 }
    };

    this.metadataCache = new CommunityNodeMetadataCache(cacheConfig);

    // Create mock dependencies
    this.mockRegistry = new MockCommunityNodeRegistry();
    this.mockValidator = new MockCommunityNodeValidator();
    this.mockIntegrationManager = new MockCommunityNodeIntegrationManager();
    this.mockParser = new MockDynamicNodeParser();

    // Create integration with test configuration
    const integrationConfig: Partial<CacheIntegrationConfig> = {
      enableMetadataCache: true,
      enableValidationCache: true,
      enableSearchCache: true,
      enableCompatibilityCache: true,
      cacheWarmupOnStartup: false,
      backgroundRefreshInterval: 0,
      performanceMonitoring: true
    };

    this.cacheIntegration = new CommunityNodeCacheIntegration(
      this.metadataCache,
      this.mockRegistry as any,
      this.mockValidator as any,
      this.mockIntegrationManager as any,
      this.mockParser as any,
      integrationConfig
    );
  }

  /**
   * Run all cache integration tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Community Node Cache Integration Tests...\n');

    try {
      await this.testMetadataCaching();
      await this.testValidationCaching();
      await this.testCompatibilityCaching();
      await this.testSearchResultsCaching();
      await this.testBulkMetadataRetrieval();
      await this.testCacheInvalidation();
      await this.testPerformanceMonitoring();
      await this.testCacheOptimization();
      await this.testEventEmission();
      await this.testErrorHandling();
      await this.testCacheWarmup();
      await this.testBackgroundRefresh();

      console.log('✅ All Community Node Cache Integration Tests Passed!\n');

    } catch (error) {
      console.error('❌ Test Failed:', error);
      throw error;
    }
  }

  /**
   * Test metadata caching functionality
   */
  private async testMetadataCaching(): Promise<void> {
    console.log('📋 Testing Metadata Caching...');

    const nodeId = 'test-metadata-node';

    // First call should miss cache and fetch from source
    const startTime1 = Date.now();
    const metadata1 = await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    const duration1 = Date.now() - startTime1;

    this.assert(metadata1 !== null, 'Metadata should be retrieved');
    this.assert(metadata1.nodeId === nodeId, 'Node ID should match');

    // Second call should hit cache and be faster
    const startTime2 = Date.now();
    const metadata2 = await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    const duration2 = Date.now() - startTime2;

    this.assert(metadata2 !== null, 'Cached metadata should be retrieved');
    this.assert(metadata2.nodeId === nodeId, 'Cached node ID should match');
    this.assert(duration2 < duration1, 'Cached retrieval should be faster');

    console.log(`   ✅ Metadata caching test completed (Cache speedup: ${duration1 - duration2}ms)`);
  }

  /**
   * Test validation result caching
   */
  private async testValidationCaching(): Promise<void> {
    console.log('🔍 Testing Validation Caching...');

    const nodeDefinition = { name: 'test-validation-node' };
    const packageInfo = { name: 'test-package' };

    // First validation should miss cache
    const startTime1 = Date.now();
    const result1 = await this.cacheIntegration.validateNodeWithCache(nodeDefinition, packageInfo);
    const duration1 = Date.now() - startTime1;

    this.assert(result1 !== null, 'Validation result should be retrieved');
    this.assert(result1.valid === true, 'Validation should pass');

    // Second validation should hit cache
    const startTime2 = Date.now();
    const result2 = await this.cacheIntegration.validateNodeWithCache(nodeDefinition, packageInfo);
    const duration2 = Date.now() - startTime2;

    this.assert(result2 !== null, 'Cached validation result should be retrieved');
    this.assert(result2.valid === true, 'Cached validation should pass');
    this.assert(duration2 < duration1, 'Cached validation should be faster');

    console.log(`   ✅ Validation caching test completed (Cache speedup: ${duration1 - duration2}ms)`);
  }

  /**
   * Test compatibility checking with caching
   */
  private async testCompatibilityCaching(): Promise<void> {
    console.log('🔧 Testing Compatibility Caching...');

    const nodeId = 'test-compatibility-node';
    const n8nVersion = '1.0.0';

    // First check should miss cache
    const startTime1 = Date.now();
    const result1 = await this.cacheIntegration.checkCompatibilityWithCache(nodeId, n8nVersion);
    const duration1 = Date.now() - startTime1;

    this.assert(result1 !== null, 'Compatibility result should be retrieved');
    this.assert(result1.compatible === true, 'Node should be compatible');

    // Second check should hit cache
    const startTime2 = Date.now();
    const result2 = await this.cacheIntegration.checkCompatibilityWithCache(nodeId, n8nVersion);
    const duration2 = Date.now() - startTime2;

    this.assert(result2 !== null, 'Cached compatibility result should be retrieved');
    this.assert(result2.compatible === true, 'Cached compatibility should be true');
    this.assert(duration2 < duration1, 'Cached compatibility check should be faster');

    console.log(`   ✅ Compatibility caching test completed (Cache speedup: ${duration1 - duration2}ms)`);
  }

  /**
   * Test search results caching
   */
  private async testSearchResultsCaching(): Promise<void> {
    console.log('🔍 Testing Search Results Caching...');

    const searchOptions = CommunityNodeCacheIntegrationTestData.generateTestSearchOptions();

    // First search should miss cache
    const startTime1 = Date.now();
    const results1 = await this.cacheIntegration.discoverNodesWithCache(searchOptions);
    const duration1 = Date.now() - startTime1;

    this.assert(Array.isArray(results1), 'Search results should be an array');
    this.assert(results1.length > 0, 'Search should return results');

    // Second search should hit cache
    const startTime2 = Date.now();
    const results2 = await this.cacheIntegration.discoverNodesWithCache(searchOptions);
    const duration2 = Date.now() - startTime2;

    this.assert(Array.isArray(results2), 'Cached search results should be an array');
    this.assert(results2.length === results1.length, 'Cached results should match original');
    this.assert(duration2 < duration1, 'Cached search should be faster');

    console.log(`   ✅ Search caching test completed (Cache speedup: ${duration1 - duration2}ms)`);
  }

  /**
   * Test bulk metadata retrieval with parallel caching
   */
  private async testBulkMetadataRetrieval(): Promise<void> {
    console.log('📦 Testing Bulk Metadata Retrieval...');

    const nodeIds = ['bulk-node-1', 'bulk-node-2', 'bulk-node-3', 'bulk-node-4', 'bulk-node-5'];

    // First bulk retrieval should miss cache for all nodes
    const startTime1 = Date.now();
    const results1 = await this.cacheIntegration.getBulkNodeMetadata(nodeIds);
    const duration1 = Date.now() - startTime1;

    this.assert(results1.size === nodeIds.length, 'Should retrieve all requested nodes');
    
    for (const nodeId of nodeIds) {
      this.assert(results1.has(nodeId), `Should have metadata for ${nodeId}`);
    }

    // Second bulk retrieval should hit cache for all nodes
    const startTime2 = Date.now();
    const results2 = await this.cacheIntegration.getBulkNodeMetadata(nodeIds);
    const duration2 = Date.now() - startTime2;

    this.assert(results2.size === nodeIds.length, 'Should retrieve all cached nodes');
    this.assert(duration2 < duration1, 'Cached bulk retrieval should be faster');

    // Test partial cache hit (mix of cached and new nodes)
    const mixedNodeIds = [...nodeIds.slice(0, 3), 'new-node-1', 'new-node-2'];
    const startTime3 = Date.now();
    const results3 = await this.cacheIntegration.getBulkNodeMetadata(mixedNodeIds);
    const duration3 = Date.now() - startTime3;

    this.assert(results3.size === mixedNodeIds.length, 'Should retrieve all mixed nodes');
    this.assert(duration3 < duration1, 'Partial cache hit should be faster than full miss');

    console.log(`   ✅ Bulk metadata retrieval test completed`);
    console.log(`      Full miss: ${duration1}ms, Full hit: ${duration2}ms, Partial hit: ${duration3}ms`);
  }

  /**
   * Test cache invalidation functionality
   */
  private async testCacheInvalidation(): Promise<void> {
    console.log('🗑️ Testing Cache Invalidation...');

    const nodeId = 'test-invalidation-node';

    // Cache a node first
    await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    
    // Verify it's cached (should be fast)
    const startTime1 = Date.now();
    const metadata1 = await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    const duration1 = Date.now() - startTime1;

    this.assert(metadata1 !== null, 'Node should be cached');

    // Invalidate the node cache
    await this.cacheIntegration.invalidateNodeCache(nodeId);

    // Next retrieval should be slower (cache miss)
    const startTime2 = Date.now();
    const metadata2 = await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    const duration2 = Date.now() - startTime2;

    this.assert(metadata2 !== null, 'Node should be retrieved after invalidation');
    this.assert(duration2 > duration1, 'Post-invalidation retrieval should be slower');

    // Test search cache invalidation
    const searchOptions = CommunityNodeCacheIntegrationTestData.generateTestSearchOptions();
    await this.cacheIntegration.discoverNodesWithCache(searchOptions);
    await this.cacheIntegration.invalidateSearchCaches();

    // Search should be slower after invalidation
    const startTime3 = Date.now();
    await this.cacheIntegration.discoverNodesWithCache(searchOptions);
    const duration3 = Date.now() - startTime3;

    this.assert(duration3 > 0, 'Search after invalidation should take time');

    console.log(`   ✅ Cache invalidation test completed`);
  }

  /**
   * Test performance monitoring functionality
   */
  private async testPerformanceMonitoring(): Promise<void> {
    console.log('📊 Testing Performance Monitoring...');

    // Perform several operations to generate performance data
    const nodeIds = ['perf-node-1', 'perf-node-2', 'perf-node-3'];
    
    for (const nodeId of nodeIds) {
      await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
      await this.cacheIntegration.validateNodeWithCache({ name: nodeId }, { name: 'test-package' });
      await this.cacheIntegration.checkCompatibilityWithCache(nodeId, '1.0.0');
    }

    // Get integration statistics
    const stats = this.cacheIntegration.getIntegrationStats();

    this.assert(typeof stats.cacheHitRate === 'number', 'Cache hit rate should be a number');
    this.assert(typeof stats.averageResponseTime === 'number', 'Average response time should be a number');
    this.assert(typeof stats.totalCacheSize === 'number', 'Total cache size should be a number');
    this.assert(stats.cacheHitRate >= 0 && stats.cacheHitRate <= 1, 'Cache hit rate should be between 0 and 1');

    console.log(`   ✅ Performance monitoring test completed`);
    console.log(`      Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%`);
    console.log(`      Average response time: ${stats.averageResponseTime.toFixed(1)}ms`);
    console.log(`      Total cache size: ${stats.totalCacheSize} bytes`);
  }

  /**
   * Test cache optimization functionality
   */
  private async testCacheOptimization(): Promise<void> {
    console.log('⚡ Testing Cache Optimization...');

    // Fill cache with test data
    const nodeIds = Array.from({ length: 20 }, (_, i) => `opt-node-${i}`);
    
    for (const nodeId of nodeIds) {
      await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    }

    // Get initial cache stats
    const initialStats = this.cacheIntegration.getIntegrationStats();

    // Optimize cache
    await this.cacheIntegration.optimizeCache();

    // Get optimized cache stats
    const optimizedStats = this.cacheIntegration.getIntegrationStats();

    this.assert(typeof optimizedStats.totalCacheSize === 'number', 'Optimized cache size should be a number');
    
    console.log(`   ✅ Cache optimization test completed`);
    console.log(`      Initial cache size: ${initialStats.totalCacheSize} bytes`);
    console.log(`      Optimized cache size: ${optimizedStats.totalCacheSize} bytes`);
  }

  /**
   * Test event emission functionality
   */
  private async testEventEmission(): Promise<void> {
    console.log('📡 Testing Event Emission...');

    let eventsReceived = 0;
    const expectedEvents = ['cacheHit', 'cacheMiss'];

    // Set up event listeners
    expectedEvents.forEach(event => {
      this.cacheIntegration.on(event, () => {
        eventsReceived++;
      });
    });

    // Perform operations that should trigger events
    const nodeId = 'event-test-node';
    
    // First call should trigger cacheMiss
    await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    
    // Second call should trigger cacheHit
    await this.cacheIntegration.getNodeMetadataWithCache(nodeId);

    this.assert(eventsReceived >= 2, 'Should have received cache events');

    console.log(`   ✅ Event emission test completed (${eventsReceived} events received)`);
  }

  /**
   * Test error handling in cache operations
   */
  private async testErrorHandling(): Promise<void> {
    console.log('🚨 Testing Error Handling...');

    let errorEventReceived = false;

    // Set up error event listener
    this.cacheIntegration.on('metadataError', () => {
      errorEventReceived = true;
    });

    // Test graceful handling of errors
    try {
      // This might cause an error in the mock system
      await this.cacheIntegration.getNodeMetadataWithCache('');
    } catch (error) {
      // Errors should be handled gracefully
    }

    // Test that cache continues to work after errors
    const nodeId = 'error-recovery-node';
    const metadata = await this.cacheIntegration.getNodeMetadataWithCache(nodeId);
    
    this.assert(metadata !== null, 'Cache should recover from errors');

    console.log(`   ✅ Error handling test completed`);
  }

  /**
   * Test cache warmup functionality
   */
  private async testCacheWarmup(): Promise<void> {
    console.log('🔥 Testing Cache Warmup...');

    // Create new integration with warmup enabled
    const warmupConfig: Partial<CacheIntegrationConfig> = {
      cacheWarmupOnStartup: true,
      backgroundRefreshInterval: 0,
      performanceMonitoring: false
    };

    let warmupCompleted = false;

    const warmupIntegration = new CommunityNodeCacheIntegration(
      this.metadataCache,
      this.mockRegistry as any,
      this.mockValidator as any,
      this.mockIntegrationManager as any,
      this.mockParser as any,
      warmupConfig
    );

    warmupIntegration.on('warmupCompleted', () => {
      warmupCompleted = true;
    });

    // Wait a bit for warmup to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    this.assert(warmupCompleted, 'Cache warmup should complete');

    console.log(`   ✅ Cache warmup test completed`);
  }

  /**
   * Test background refresh functionality
   */
  private async testBackgroundRefresh(): Promise<void> {
    console.log('🔄 Testing Background Refresh...');

    // Create integration with short refresh interval for testing
    const refreshConfig: Partial<CacheIntegrationConfig> = {
      backgroundRefreshInterval: 100, // 100ms for testing
      performanceMonitoring: false
    };

    let refreshCompleted = false;

    const refreshIntegration = new CommunityNodeCacheIntegration(
      this.metadataCache,
      this.mockRegistry as any,
      this.mockValidator as any,
      this.mockIntegrationManager as any,
      this.mockParser as any,
      refreshConfig
    );

    refreshIntegration.on('backgroundRefreshCompleted', () => {
      refreshCompleted = true;
    });

    // Wait for at least one refresh cycle
    await new Promise(resolve => setTimeout(resolve, 200));

    // Clean up
    await refreshIntegration.shutdown();

    this.assert(refreshCompleted, 'Background refresh should complete');

    console.log(`   ✅ Background refresh test completed`);
  }

  /**
   * Helper method for assertions
   */
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

/**
 * Export test runner function
 */
export async function runCommunityNodeCacheIntegrationTests(): Promise<void> {
  const testSuite = new CommunityNodeCacheIntegrationTest();
  await testSuite.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runCommunityNodeCacheIntegrationTests()
    .then(() => {
      console.log('🎉 All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    });
} 