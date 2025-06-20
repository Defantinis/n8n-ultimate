/**
 * Test Suite for Community Node Registry System
 * Comprehensive testing of discovery, cataloging, and management of community nodes
 */

import {
  CommunityNodeRegistry,
  CommunityNodePackage,
  CommunityNodeDefinition,
  RegistrySearchOptions,
  RegistryStats
} from './community-node-registry';
import * as fs from 'fs/promises';
import * as path from 'path';

export class CommunityNodeRegistryTestSuite {
  private registry: CommunityNodeRegistry;
  private testRegistryPath: string;

  constructor() {
    this.testRegistryPath = path.join(__dirname, '../../test-data/community-registry-test.json');
    this.registry = new CommunityNodeRegistry(this.testRegistryPath);
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Community Node Registry Test Suite...\n');

    try {
      await this.testRegistryInitialization();
      await this.testNodeDiscovery();
      await this.testPackageProcessing();
      await this.testNodeSearch();
      await this.testRegistryStats();
      await this.testCacheManagement();
      await this.testCompatibilityValidation();
      await this.testErrorHandling();
      await this.testEventEmission();
      await this.testBatchProcessing();
      
      console.log('✅ All Community Node Registry tests passed!\n');
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Test registry initialization
   */
  private async testRegistryInitialization(): Promise<void> {
    console.log('Testing registry initialization...');

    // Test fresh initialization
    await this.registry.initialize();
    const stats = this.registry.getStats();
    
    if (stats.totalPackages !== 0 || stats.totalNodes !== 0) {
      throw new Error('Fresh registry should be empty');
    }

    console.log('✓ Registry initialization test passed');
  }

  /**
   * Test node discovery functionality
   */
  private async testNodeDiscovery(): Promise<void> {
    console.log('Testing node discovery...');

    let discoveryStarted = false;
    let discoveryCompleted = false;

    this.registry.on('discoveryStarted', () => {
      discoveryStarted = true;
    });

    this.registry.on('discoveryCompleted', (data) => {
      discoveryCompleted = true;
      console.log(`  - Discovered ${data.packagesFound} packages, ${data.totalNodes} nodes`);
    });

    // Test discovery
    await this.registry.discoverNodes(true);

    if (!discoveryStarted || !discoveryCompleted) {
      throw new Error('Discovery events not properly emitted');
    }

    const stats = this.registry.getStats();
    if (stats.totalPackages === 0) {
      throw new Error('No packages discovered');
    }

    console.log('✓ Node discovery test passed');
  }

  /**
   * Test package processing
   */
  private async testPackageProcessing(): Promise<void> {
    console.log('Testing package processing...');

    const stats = this.registry.getStats();
    
    // Test getting specific packages
    const packageNames = Array.from(this.registry['packages'].keys());
    if (packageNames.length === 0) {
      throw new Error('No packages available for testing');
    }

    const testPackage = this.registry.getPackage(packageNames[0]);
    if (!testPackage) {
      throw new Error('Failed to retrieve package');
    }

    // Validate package structure
    if (!testPackage.name || !testPackage.version) {
      throw new Error('Package missing required fields');
    }

    // Test node extraction
    const nodeKeys = Array.from(this.registry['nodes'].keys());
    if (nodeKeys.length === 0) {
      throw new Error('No nodes extracted from packages');
    }

    const testNode = this.registry.getNode(nodeKeys[0]);
    if (!testNode) {
      throw new Error('Failed to retrieve node');
    }

    // Validate node structure
    if (!testNode.name || !testNode.displayName || !testNode.packageName) {
      throw new Error('Node missing required fields');
    }

    console.log('✓ Package processing test passed');
  }

  /**
   * Test node search functionality
   */
  private async testNodeSearch(): Promise<void> {
    console.log('Testing node search...');

    // Test basic search
    const allNodes = await this.registry.searchNodes();
    if (allNodes.length === 0) {
      throw new Error('No nodes returned from search');
    }

    // Test search with query
    const searchResults = await this.registry.searchNodes({ query: 'airtable' });
    if (searchResults.length === 0) {
      console.log('  - No Airtable nodes found (expected for mock data)');
    }

    // Test search with category filter
    const categories = this.registry.getCategories();
    if (categories.length > 0) {
      const categoryResults = await this.registry.searchNodes({ 
        category: categories[0] 
      });
      console.log(`  - Found ${categoryResults.length} nodes in category ${categories[0]}`);
    }

    // Test search with sorting
    const sortedResults = await this.registry.searchNodes({ 
      sortBy: 'popularity',
      limit: 5 
    });
    if (sortedResults.length > 1) {
      // Verify sorting (popularity should be descending)
      for (let i = 1; i < sortedResults.length; i++) {
        const pkgA = this.registry.getPackage(sortedResults[i-1].packageName);
        const pkgB = this.registry.getPackage(sortedResults[i].packageName);
        if (pkgA && pkgB && (pkgA.popularity || 0) < (pkgB.popularity || 0)) {
          throw new Error('Search results not properly sorted by popularity');
        }
      }
    }

    // Test pagination
    const paginatedResults = await this.registry.searchNodes({ 
      limit: 1,
      offset: 0 
    });
    if (paginatedResults.length > 1) {
      throw new Error('Pagination limit not respected');
    }

    console.log('✓ Node search test passed');
  }

  /**
   * Test registry statistics
   */
  private async testRegistryStats(): Promise<void> {
    console.log('Testing registry statistics...');

    const stats = this.registry.getStats();
    
    // Validate stats structure
    if (typeof stats.totalPackages !== 'number' || 
        typeof stats.totalNodes !== 'number' ||
        !stats.categories ||
        !stats.lastUpdated ||
        !Array.isArray(stats.popularPackages) ||
        !Array.isArray(stats.recentlyUpdated)) {
      throw new Error('Invalid stats structure');
    }

    // Test categories
    const categories = this.registry.getCategories();
    if (categories.length !== Object.keys(stats.categories).length) {
      throw new Error('Categories mismatch between getCategories() and getStats()');
    }

    console.log(`  - ${stats.totalPackages} packages, ${stats.totalNodes} nodes`);
    console.log(`  - ${categories.length} categories: ${categories.join(', ')}`);

    console.log('✓ Registry statistics test passed');
  }

  /**
   * Test cache management
   */
  private async testCacheManagement(): Promise<void> {
    console.log('Testing cache management...');

    // Save current state
    await this.registry['saveToCache']();
    
    // Verify cache file exists
    try {
      await fs.access(this.testRegistryPath);
    } catch (error) {
      throw new Error('Cache file not created');
    }

    // Create new registry instance and load from cache
    const newRegistry = new CommunityNodeRegistry(this.testRegistryPath);
    await newRegistry.initialize();
    
    const originalStats = this.registry.getStats();
    const loadedStats = newRegistry.getStats();
    
    if (originalStats.totalPackages !== loadedStats.totalPackages ||
        originalStats.totalNodes !== loadedStats.totalNodes) {
      throw new Error('Cache loading failed - stats mismatch');
    }

    // Test cache clearing
    await newRegistry.clear();
    const clearedStats = newRegistry.getStats();
    
    if (clearedStats.totalPackages !== 0 || clearedStats.totalNodes !== 0) {
      throw new Error('Cache clearing failed');
    }

    console.log('✓ Cache management test passed');
  }

  /**
   * Test compatibility validation
   */
  private async testCompatibilityValidation(): Promise<void> {
    console.log('Testing compatibility validation...');

    const packageNames = Array.from(this.registry['packages'].keys());
    if (packageNames.length === 0) {
      console.log('  - No packages available for compatibility testing');
      return;
    }

    // Test valid package
    const validResult = await this.registry.validatePackageCompatibility(
      packageNames[0], 
      '1.0.0'
    );
    
    if (typeof validResult.compatible !== 'boolean' ||
        !Array.isArray(validResult.issues) ||
        !Array.isArray(validResult.warnings)) {
      throw new Error('Invalid compatibility result structure');
    }

    // Test non-existent package
    const invalidResult = await this.registry.validatePackageCompatibility(
      'non-existent-package',
      '1.0.0'
    );
    
    if (invalidResult.compatible !== false || 
        invalidResult.issues.length === 0) {
      throw new Error('Non-existent package should be incompatible');
    }

    console.log('✓ Compatibility validation test passed');
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('Testing error handling...');

    // Test concurrent discovery attempts
    const registry = new CommunityNodeRegistry('./temp-test-registry.json');
    
    // Start discovery
    const discovery1 = registry.discoverNodes(true);
    
    // Try to start another discovery - should throw
    try {
      await registry.discoverNodes(true);
      throw new Error('Concurrent discovery should throw error');
    } catch (error) {
      if (!error.message.includes('already in progress')) {
        throw new Error('Wrong error message for concurrent discovery');
      }
    }
    
    // Wait for first discovery to complete
    await discovery1;
    
    // Test invalid registry path
    const invalidRegistry = new CommunityNodeRegistry('/invalid/path/registry.json');
    try {
      await invalidRegistry.initialize();
      // Should not throw - should handle gracefully
    } catch (error) {
      throw new Error('Registry should handle invalid paths gracefully');
    }

    console.log('✓ Error handling test passed');
  }

  /**
   * Test event emission
   */
  private async testEventEmission(): Promise<void> {
    console.log('Testing event emission...');

    const registry = new CommunityNodeRegistry('./temp-event-test-registry.json');
    
    const events: string[] = [];
    
    registry.on('initialized', () => events.push('initialized'));
    registry.on('discoveryStarted', () => events.push('discoveryStarted'));
    registry.on('discoveryCompleted', () => events.push('discoveryCompleted'));
    registry.on('packageProcessed', () => events.push('packageProcessed'));
    registry.on('cleared', () => events.push('cleared'));

    await registry.initialize();
    await registry.discoverNodes(true);
    await registry.clear();

    const expectedEvents = ['initialized', 'discoveryStarted', 'packageProcessed', 'discoveryCompleted', 'cleared'];
    
    for (const expectedEvent of expectedEvents) {
      if (!events.includes(expectedEvent)) {
        throw new Error(`Event ${expectedEvent} was not emitted`);
      }
    }

    console.log('✓ Event emission test passed');
  }

  /**
   * Test batch processing
   */
  private async testBatchProcessing(): Promise<void> {
    console.log('Testing batch processing...');

    const registry = new CommunityNodeRegistry('./temp-batch-test-registry.json');
    
    // Create mock packages for batch testing
    const mockPackages: CommunityNodePackage[] = [
      {
        name: 'test-package-1',
        version: '1.0.0',
        keywords: ['n8n', 'test'],
        publishedAt: new Date(),
        lastUpdated: new Date(),
        n8n: {
          nodes: ['dist/TestNode1.node.js']
        }
      },
      {
        name: 'test-package-2',
        version: '1.1.0',
        keywords: ['n8n', 'test'],
        publishedAt: new Date(),
        lastUpdated: new Date(),
        n8n: {
          nodes: ['dist/TestNode2.node.js']
        }
      }
    ];

    // Process batch
    await registry['processBatch'](mockPackages);
    
    const stats = registry.getStats();
    if (stats.totalPackages < 2) {
      throw new Error('Batch processing failed - insufficient packages processed');
    }

    // Verify packages were stored
    const package1 = registry.getPackage('test-package-1');
    const package2 = registry.getPackage('test-package-2');
    
    if (!package1 || !package2) {
      throw new Error('Batch processed packages not found');
    }

    console.log('✓ Batch processing test passed');
  }

  /**
   * Test specific search scenarios
   */
  private async testAdvancedSearchScenarios(): Promise<void> {
    console.log('Testing advanced search scenarios...');

    // Test empty query
    const emptyResults = await this.registry.searchNodes({ query: '' });
    const allResults = await this.registry.searchNodes();
    
    if (emptyResults.length !== allResults.length) {
      throw new Error('Empty query should return all results');
    }

    // Test case-insensitive search
    const upperCaseResults = await this.registry.searchNodes({ query: 'AIRTABLE' });
    const lowerCaseResults = await this.registry.searchNodes({ query: 'airtable' });
    
    if (upperCaseResults.length !== lowerCaseResults.length) {
      throw new Error('Search should be case-insensitive');
    }

    // Test author search
    const authorResults = await this.registry.searchNodes({ author: 'community' });
    console.log(`  - Found ${authorResults.length} nodes by community authors`);

    // Test multiple filters
    const multiFilterResults = await this.registry.searchNodes({
      query: 'advanced',
      sortBy: 'name',
      limit: 10
    });
    
    if (multiFilterResults.length > 10) {
      throw new Error('Multiple filters not applied correctly');
    }

    console.log('✓ Advanced search scenarios test passed');
  }

  /**
   * Test version compatibility edge cases
   */
  private async testVersionCompatibilityEdgeCases(): Promise<void> {
    console.log('Testing version compatibility edge cases...');

    // Test various version formats
    const testCases = [
      { current: '1.0.0', required: '1.0.0', expected: true },
      { current: '1.1.0', required: '1.0.0', expected: true },
      { current: '1.0.0', required: '1.1.0', expected: false },
      { current: '2.0.0', required: '1.9.9', expected: true },
      { current: '1.0', required: '1.0.0', expected: true },
      { current: '1', required: '1.0.0', expected: true }
    ];

    for (const testCase of testCases) {
      const result = this.registry['isVersionCompatible'](testCase.current, testCase.required);
      if (result !== testCase.expected) {
        throw new Error(
          `Version compatibility test failed: ${testCase.current} vs ${testCase.required} ` +
          `expected ${testCase.expected}, got ${result}`
        );
      }
    }

    console.log('✓ Version compatibility edge cases test passed');
  }

  /**
   * Test registry performance with large datasets
   */
  private async testPerformance(): Promise<void> {
    console.log('Testing registry performance...');

    const startTime = Date.now();
    
    // Simulate large search
    const results = await this.registry.searchNodes({ limit: 1000 });
    
    const searchTime = Date.now() - startTime;
    console.log(`  - Search completed in ${searchTime}ms`);
    
    if (searchTime > 1000) { // 1 second threshold
      console.warn('  - Search performance may be suboptimal');
    }

    // Test stats generation performance
    const statsStartTime = Date.now();
    const stats = this.registry.getStats();
    const statsTime = Date.now() - statsStartTime;
    
    console.log(`  - Stats generation completed in ${statsTime}ms`);
    
    if (statsTime > 100) { // 100ms threshold
      console.warn('  - Stats generation performance may be suboptimal');
    }

    console.log('✓ Performance test passed');
  }

  /**
   * Clean up test files
   */
  private async cleanup(): Promise<void> {
    const testFiles = [
      this.testRegistryPath,
      './temp-test-registry.json',
      './temp-event-test-registry.json',
      './temp-batch-test-registry.json'
    ];

    for (const file of testFiles) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // File doesn't exist, ignore
      }
    }
  }

  /**
   * Generate test report
   */
  generateTestReport(): string {
    const stats = this.registry.getStats();
    
    return `
Community Node Registry Test Report
===================================

Registry Statistics:
- Total Packages: ${stats.totalPackages}
- Total Nodes: ${stats.totalNodes}
- Categories: ${Object.keys(stats.categories).length}
- Last Updated: ${stats.lastUpdated.toISOString()}

Categories Distribution:
${Object.entries(stats.categories)
  .map(([category, count]) => `- ${category}: ${count} nodes`)
  .join('\n')}

Popular Packages:
${stats.popularPackages
  .slice(0, 5)
  .map((pkg, i) => `${i + 1}. ${pkg.name} (${pkg.downloadCount} downloads)`)
  .join('\n')}

Recent Updates:
${stats.recentlyUpdated
  .slice(0, 3)
  .map(pkg => `- ${pkg.name}: ${pkg.lastUpdated.toDateString()}`)
  .join('\n')}

Test Status: ✅ All tests passed
Generated: ${new Date().toISOString()}
    `.trim();
  }
}

// Export for testing
export default CommunityNodeRegistryTestSuite;

// Run tests if called directly
if (require.main === module) {
  const testSuite = new CommunityNodeRegistryTestSuite();
  testSuite.runAllTests()
    .then(() => {
      console.log('\n' + testSuite.generateTestReport());
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
} 