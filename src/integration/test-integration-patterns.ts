/**
 * Test suite for n8n Integration Patterns
 * 
 * This test validates all integration patterns and best practices
 * implementations to ensure they work correctly.
 */

import {
  N8nIntegrationManager,
  N8nTestUtils,
  ConsoleLogger,
  DEFAULT_INTEGRATION_CONFIG
} from './integration-patterns.js';

/**
 * Integration Patterns Test Suite
 */
export class IntegrationPatternsTestSuite {
  private integrationManager: N8nIntegrationManager;
  private testUtils: N8nTestUtils;
  private logger: ConsoleLogger;

  constructor() {
    // Use test configuration
    const testConfig = {
      ...DEFAULT_INTEGRATION_CONFIG,
      n8nBaseUrl: 'http://localhost:5678',
      logLevel: 'debug' as const,
      enableCaching: true,
      enableMetrics: true,
      timeout: 5000,
      retryAttempts: 2
    };

    this.integrationManager = new N8nIntegrationManager(testConfig);
    this.testUtils = new N8nTestUtils(this.integrationManager);
    this.logger = new ConsoleLogger('debug');
  }

  /**
   * Run all integration pattern tests
   */
  async runAllTests(): Promise<{
    passed: number;
    failed: number;
    results: Array<{ test: string; passed: boolean; error?: string }>;
  }> {
    const results: Array<{ test: string; passed: boolean; error?: string }> = [];
    
    const tests = [
      { name: 'Authentication Manager', test: () => this.testAuthManager() },
      { name: 'Error Handler', test: () => this.testErrorHandler() },
      { name: 'Performance Optimizer', test: () => this.testPerformanceOptimizer() },
      { name: 'Monitor', test: () => this.testMonitor() },
      { name: 'Webhook Handler', test: () => this.testWebhookHandler() },
      { name: 'Workflow Validation', test: () => this.testWorkflowValidation() },
      { name: 'Mock Workflow Creation', test: () => this.testMockWorkflowCreation() },
      { name: 'Integration Manager', test: () => this.testIntegrationManager() }
    ];

    for (const { name, test } of tests) {
      try {
        await test();
        results.push({ test: name, passed: true });
        this.logger.info(`✅ ${name} test passed`);
      } catch (error) {
        results.push({
          test: name,
          passed: false,
          error: error instanceof Error ? error.message : String(error)
        });
        this.logger.error(`❌ ${name} test failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    this.logger.info(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

    return { passed, failed, results };
  }

  /**
   * Test Authentication Manager
   */
  private async testAuthManager(): Promise<void> {
    const auth = this.integrationManager.getAuth();

    // Test header generation with API key
    const headers = auth.getAuthHeaders();
    if (!headers['Content-Type']) {
      throw new Error('Content-Type header not set');
    }

    // Test header generation with token
    const headersWithToken = auth.getAuthHeaders('test-token');
    if (headersWithToken['Authorization'] !== 'Bearer test-token') {
      throw new Error('Authorization header not set correctly');
    }

    this.logger.debug('Auth manager tests passed');
  }

  /**
   * Test Error Handler
   */
  private async testErrorHandler(): Promise<void> {
    const errorHandler = this.integrationManager.getErrorHandler();

    // Test error categorization
    const networkError = errorHandler.categorizeError({ code: 'ECONNREFUSED' });
    if (networkError.type !== 'network' || !networkError.recoverable) {
      throw new Error('Network error not categorized correctly');
    }

    const authError = errorHandler.categorizeError({ status: 401 });
    if (authError.type !== 'authentication' || !authError.recoverable) {
      throw new Error('Authentication error not categorized correctly');
    }

    const validationError = errorHandler.categorizeError({ status: 400 });
    if (validationError.type !== 'validation' || validationError.recoverable) {
      throw new Error('Validation error not categorized correctly');
    }

    // Test retry mechanism (should succeed immediately)
    let attempts = 0;
    await errorHandler.withRetry(async () => {
      attempts++;
      return 'success';
    }, 'test operation');

    if (attempts !== 1) {
      throw new Error('Retry mechanism failed for successful operation');
    }

    this.logger.debug('Error handler tests passed');
  }

  /**
   * Test Performance Optimizer
   */
  private async testPerformanceOptimizer(): Promise<void> {
    const optimizer = this.integrationManager.getOptimizer();

    // Test caching
    let callCount = 0;
    const cachedOperation = () => {
      callCount++;
      return Promise.resolve(`result-${callCount}`);
    };

    const result1 = await optimizer.withCache('test-key', cachedOperation, 1);
    const result2 = await optimizer.withCache('test-key', cachedOperation, 1);

    if (result1 !== result2 || callCount !== 1) {
      throw new Error('Caching not working correctly');
    }

    // Test batch processing
    const items = [1, 2, 3, 4, 5];
    const batchResults = await optimizer.batchProcess(
      items,
      async (item) => item * 2,
      2
    );

    if (batchResults.length !== 5 || batchResults[0] !== 2) {
      throw new Error('Batch processing failed');
    }

    // Test parallel processing
    const parallelResults = await optimizer.parallelProcess(
      items,
      async (item) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return item * 3;
      },
      2
    );

    if (parallelResults.length !== 5 || parallelResults[0] !== 3) {
      throw new Error('Parallel processing failed');
    }

    // Test cache clearing
    optimizer.clearCache();

    this.logger.debug('Performance optimizer tests passed');
  }

  /**
   * Test Monitor
   */
  private async testMonitor(): Promise<void> {
    const monitor = this.integrationManager.getMonitor();

    // Test execution tracking
    monitor.trackExecution('test-workflow', 1000, true);
    monitor.trackExecution('test-workflow', 2000, false);

    const metrics = monitor.getWorkflowMetrics('test-workflow');
    
    if (metrics.executions !== 2) {
      throw new Error('Execution count not tracked correctly');
    }

    if (metrics.successes !== 1 || metrics.failures !== 1) {
      throw new Error('Success/failure tracking not working');
    }

    if (metrics.successRate !== 50) {
      throw new Error('Success rate calculation incorrect');
    }

    if (metrics.averageDuration !== 1500) {
      throw new Error('Average duration calculation incorrect');
    }

    // Test monitored execution
    const result = await monitor.monitorExecution('test-workflow-2', async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return 'success';
    });

    if (result !== 'success') {
      throw new Error('Monitored execution failed');
    }

    this.logger.debug('Monitor tests passed');
  }

  /**
   * Test Webhook Handler
   */
  private async testWebhookHandler(): Promise<void> {
    const webhookHandler = this.integrationManager.getWebhookHandler();

    // Test webhook signature validation
    const payload = '{"test": "data"}';
    const secret = 'test-secret';
    const { createHmac } = await import('crypto');
    const signature = createHmac('sha256', secret).update(payload).digest('hex');
    
    const isValid = webhookHandler.validateWebhookSignature(
      payload,
      `sha256=${signature}`,
      secret
    );

    if (!isValid) {
      throw new Error('Webhook signature validation failed');
    }

    // Test webhook config creation
    const config = webhookHandler.createWebhookConfig('test-workflow', 'test-path');
    
    if (!config.url.includes('webhook/test-path')) {
      throw new Error('Webhook config URL not generated correctly');
    }

    if (config.headers['X-Workflow-ID'] !== 'test-workflow') {
      throw new Error('Webhook config headers not set correctly');
    }

    // Test webhook processing
    const mockRequest = {
      headers: { 'content-type': 'application/json' },
      body: { test: 'data' }
    };

    const result = await webhookHandler.processWebhook(mockRequest, async (data) => {
      return { processed: data.test };
    });

    if (!result.success || result.data?.processed !== 'data') {
      throw new Error('Webhook processing failed');
    }

    this.logger.debug('Webhook handler tests passed');
  }

  /**
   * Test Workflow Validation
   */
  private async testWorkflowValidation(): Promise<void> {
    // Test valid workflow
    const validWorkflow = this.testUtils.createMockWorkflow(3);
    const validResult = await this.integrationManager.validateWorkflow(validWorkflow);

    if (!validResult.valid) {
      throw new Error(`Valid workflow failed validation: ${validResult.errors.join(', ')}`);
    }

    if (validResult.compatibilityScore < 90) {
      throw new Error('Valid workflow compatibility score too low');
    }

    // Test invalid workflow (no nodes)
    const invalidWorkflow = {
      ...validWorkflow,
      nodes: []
    };

    const invalidResult = await this.integrationManager.validateWorkflow(invalidWorkflow);

    if (invalidResult.valid) {
      throw new Error('Invalid workflow passed validation');
    }

    if (invalidResult.errors.length === 0) {
      throw new Error('Invalid workflow had no errors');
    }

    this.logger.debug('Workflow validation tests passed');
  }

  /**
   * Test Mock Workflow Creation
   */
  private async testMockWorkflowCreation(): Promise<void> {
    const workflow = this.testUtils.createMockWorkflow(5);

    if (workflow.nodes.length !== 5) {
      throw new Error('Mock workflow node count incorrect');
    }

    if (!workflow.nodes[0].type.includes('start')) {
      throw new Error('First node should be start node');
    }

    if (workflow.nodes[1].typeVersion !== 1) {
      throw new Error('Node typeVersion not set correctly');
    }

    // Test workflow validation with mock
    const isValid = await this.testUtils.testWorkflowValidation(workflow);
    if (!isValid) {
      throw new Error('Mock workflow should be valid');
    }

    this.logger.debug('Mock workflow creation tests passed');
  }

  /**
   * Test Integration Manager
   */
  private async testIntegrationManager(): Promise<void> {
    // Test that all components are accessible
    const auth = this.integrationManager.getAuth();
    const errorHandler = this.integrationManager.getErrorHandler();
    const optimizer = this.integrationManager.getOptimizer();
    const monitor = this.integrationManager.getMonitor();
    const webhookHandler = this.integrationManager.getWebhookHandler();
    const logger = this.integrationManager.getLogger();

    if (!auth || !errorHandler || !optimizer || !monitor || !webhookHandler || !logger) {
      throw new Error('Integration manager components not accessible');
    }

    // Test workflow validation through integration manager
    const mockWorkflow = this.testUtils.createMockWorkflow(2);
    const result = await this.integrationManager.validateWorkflow(mockWorkflow);

    if (!result.valid) {
      throw new Error('Integration manager workflow validation failed');
    }

    this.logger.debug('Integration manager tests passed');
  }

  /**
   * Performance benchmark test
   */
  async runPerformanceBenchmark(): Promise<{
    cachePerformance: { withCache: number; withoutCache: number; improvement: string };
    batchPerformance: { sequential: number; batch: number; improvement: string };
    parallelPerformance: { sequential: number; parallel: number; improvement: string };
  }> {
    const optimizer = this.integrationManager.getOptimizer();
    const iterations = 100;

    // Cache performance test
    const slowOperation = () => new Promise(resolve => 
      setTimeout(() => resolve(Math.random()), 10)
    );

    // Without cache
    const startWithoutCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      await slowOperation();
    }
    const withoutCache = Date.now() - startWithoutCache;

    // With cache
    optimizer.clearCache();
    const startWithCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      await optimizer.withCache('perf-test', slowOperation, 1);
    }
    const withCache = Date.now() - startWithCache;

    // Batch processing test
    const items = Array.from({ length: 50 }, (_, i) => i);
    const processor = async (item: number) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return item * 2;
    };

    // Sequential processing
    const startSequential = Date.now();
    const sequentialResults = [];
    for (const item of items) {
      sequentialResults.push(await processor(item));
    }
    const sequential = Date.now() - startSequential;

    // Batch processing
    const startBatch = Date.now();
    await optimizer.batchProcess(items, processor, 10);
    const batch = Date.now() - startBatch;

    // Parallel processing
    const startParallel = Date.now();
    await optimizer.parallelProcess(items, processor, 5);
    const parallel = Date.now() - startParallel;

    const cacheImprovement = ((withoutCache - withCache) / withoutCache * 100).toFixed(1);
    const batchImprovement = ((sequential - batch) / sequential * 100).toFixed(1);
    const parallelImprovement = ((sequential - parallel) / sequential * 100).toFixed(1);

    this.logger.info(`\n🚀 Performance Benchmark Results:`);
    this.logger.info(`Cache: ${withoutCache}ms → ${withCache}ms (${cacheImprovement}% improvement)`);
    this.logger.info(`Batch: ${sequential}ms → ${batch}ms (${batchImprovement}% improvement)`);
    this.logger.info(`Parallel: ${sequential}ms → ${parallel}ms (${parallelImprovement}% improvement)`);

    return {
      cachePerformance: {
        withCache,
        withoutCache,
        improvement: `${cacheImprovement}%`
      },
      batchPerformance: {
        sequential,
        batch,
        improvement: `${batchImprovement}%`
      },
      parallelPerformance: {
        sequential,
        parallel,
        improvement: `${parallelImprovement}%`
      }
    };
  }
}

/**
 * Run the integration patterns test suite
 */
export async function runIntegrationPatternsTests(): Promise<void> {
  console.log('🧪 Starting n8n Integration Patterns Test Suite...\n');
  
  const testSuite = new IntegrationPatternsTestSuite();
  
  try {
    // Run functional tests
    const results = await testSuite.runAllTests();
    
    // Run performance benchmark
    console.log('\n🔬 Running Performance Benchmark...');
    await testSuite.runPerformanceBenchmark();
    
    // Summary
    console.log('\n📋 Test Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Total: ${results.passed + results.failed}`);
    
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.results
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }
    
    console.log('\n🎉 Integration Patterns Test Suite Complete!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    throw error;
  }
}

// Export for direct execution
// Run tests if this is the main module
runIntegrationPatternsTests().catch(console.error); 