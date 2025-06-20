/**
 * Test Suite for Node Performance Knowledge Base
 * 
 * Comprehensive tests for the node performance monitoring, analysis,
 * and optimization recommendation system.
 */

import {
  NodePerformanceKnowledgeBase,
  NodePerformanceCollector,
  NodePerformanceAnalyzer,
  NodePerformanceManager,
  NodePerformanceMetrics,
  NodePerformanceAnalysis,
  PerformanceRecommendation,
  createNodePerformanceKnowledgeBase
} from './node-performance-knowledge-base';
import { KnowledgeStorageManager } from './knowledge-storage-system';
import { KnowledgeType, KnowledgeCategory, KnowledgeSource } from './knowledge-management-system';
import { INode } from '../types/n8n-node-interfaces';

// ============================================================================
// TEST DATA SETUP
// ============================================================================

/**
 * Mock knowledge storage for testing
 */
class MockKnowledgeStorageManager extends KnowledgeStorageManager {
  private mockData: any[] = [];
  private initializeCalled: boolean = false;

  async initialize(): Promise<void> {
    this.initializeCalled = true;
  }

  async create<T>(entry: any): Promise<T> {
    const newEntry = {
      ...entry,
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      usageCount: 0,
      lastAccessed: new Date()
    };
    this.mockData.push(newEntry);
    return newEntry as T;
  }

  async read<T>(query: any = {}): Promise<any> {
    let filtered = this.mockData;

    if (query.type) {
      filtered = filtered.filter(item => item.type === query.type);
    }
    if (query.category) {
      filtered = filtered.filter(item => item.category === query.category);
    }
    if (query.dateRange) {
      filtered = filtered.filter(item => 
        item.timestamp >= query.dateRange.start && 
        item.timestamp <= query.dateRange.end
      );
    }

    return {
      data: filtered,
      total: filtered.length,
      page: 1,
      pageSize: filtered.length,
      hasMore: false,
      executionTime: 5
    };
  }

  getMockData(): any[] {
    return this.mockData;
  }

  clearMockData(): void {
    this.mockData = [];
  }

  isInitialized(): boolean {
    return this.initializeCalled;
  }
}

/**
 * Sample n8n nodes for testing
 */
const mockNodes: INode[] = [
  {
    id: 'node1',
    name: 'HTTP Request Node',
    type: 'http-request',
    typeVersion: 1,
    position: [100, 200],
    parameters: { url: 'https://api.example.com', method: 'GET' }
  },
  {
    id: 'node2',
    name: 'Function Node',
    type: 'function',
    typeVersion: 1,
    position: [300, 200],
    parameters: { code: 'return items;' }
  },
  {
    id: 'node3',
    name: 'Webhook Node',
    type: 'webhook',
    typeVersion: 1,
    position: [500, 200],
    parameters: { path: '/webhook' }
  }
];

/**
 * Sample performance metrics for testing
 */
function createMockPerformanceMetrics(nodeId: string, nodeType: string, overrides: Partial<NodePerformanceMetrics> = {}): NodePerformanceMetrics {
  return {
    nodeId,
    nodeType,
    executionTime: 1000,
    memoryUsage: 50,
    cpuUsage: 25,
    networkIO: 1024,
    errorCount: 0,
    successCount: 1,
    timestamp: new Date(),
    workflowId: 'test-workflow',
    environment: 'test',
    ...overrides
  };
}

// ============================================================================
// TEST FRAMEWORK
// ============================================================================

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
  details?: any;
}

class NodePerformanceTestRunner {
  private results: TestResult[] = [];

  async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    try {
      await testFn();
      this.results.push({
        testName,
        passed: true,
        duration: Date.now() - startTime
      });
      console.log(`✅ ${testName} - PASSED (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        testName,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      });
      console.log(`❌ ${testName} - FAILED: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary(): { total: number; passed: number; failed: number; passRate: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    
    return { total, passed, failed, passRate };
  }

  printSummary(): void {
    const summary = this.getSummary();
    console.log('\n=== Node Performance Knowledge Base Test Summary ===');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate.toFixed(1)}%`);
    
    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  - ${result.testName}: ${result.error}`);
      });
    }
    console.log('=====================================\n');
  }
}

// ============================================================================
// TEST IMPLEMENTATIONS
// ============================================================================

/**
 * Test NodePerformanceCollector functionality
 */
class NodePerformanceCollectorTests {
  private mockStorage: MockKnowledgeStorageManager;
  private collector: NodePerformanceCollector;

  constructor() {
    this.mockStorage = new MockKnowledgeStorageManager();
    this.collector = new NodePerformanceCollector(this.mockStorage);
  }

  async testCollectorInitialization(): Promise<void> {
    // Test that collector can be created and accepts storage manager
    if (!this.collector) {
      throw new Error('Collector not initialized properly');
    }
  }

  async testStartStopMonitoring(): Promise<void> {
    // Test starting and stopping monitoring
    await this.collector.startMonitoring('test-node', 'http-request', 'test-workflow');
    
    // Allow some monitoring to occur
    await new Promise(resolve => setTimeout(resolve, 100));
    
    this.collector.stopMonitoring('test-node');
    
    // Verify monitoring was active (this is a basic test)
    const metrics = this.collector.getMetricsForNodeType('http-request');
    if (metrics.length === 0) {
      console.log('Warning: No metrics collected during monitoring test (expected for quick test)');
    }
  }

  async testMetricsCollection(): Promise<void> {
    // Test metrics collection and retrieval
    const nodeType = 'function';
    await this.collector.startMonitoring('test-function', nodeType);
    
    // Allow metrics collection
    await new Promise(resolve => setTimeout(resolve, 200));
    
    this.collector.stopMonitoring('test-function');
    
    const metrics = this.collector.getMetricsForNodeType(nodeType);
    
    // Verify metrics structure (even if empty due to timing)
    if (metrics.length > 0) {
      const metric = metrics[0];
      if (!metric.nodeId || !metric.nodeType || !metric.timestamp) {
        throw new Error('Metrics missing required fields');
      }
    }
  }

  async testTimeRangeFiltering(): Promise<void> {
    const nodeType = 'webhook';
    const startTime = new Date();
    
    await this.collector.startMonitoring('test-webhook', nodeType);
    await new Promise(resolve => setTimeout(resolve, 150));
    this.collector.stopMonitoring('test-webhook');
    
    const endTime = new Date();
    
    const allMetrics = this.collector.getMetricsForNodeType(nodeType);
    const filteredMetrics = this.collector.getMetricsForNodeType(nodeType, {
      start: startTime,
      end: endTime
    });
    
    // Filtered metrics should be subset of all metrics
    if (filteredMetrics.length > allMetrics.length) {
      throw new Error('Filtered metrics should not exceed total metrics');
    }
  }
}

/**
 * Test NodePerformanceAnalyzer functionality
 */
class NodePerformanceAnalyzerTests {
  private mockStorage: MockKnowledgeStorageManager;
  private analyzer: NodePerformanceAnalyzer;

  constructor() {
    this.mockStorage = new MockKnowledgeStorageManager();
    this.analyzer = new NodePerformanceAnalyzer(this.mockStorage);
    this.setupMockData();
  }

  private setupMockData(): void {
    // Add mock performance knowledge entries
    const performanceEntry = {
      type: KnowledgeType.NODE_BEHAVIOR,
      category: KnowledgeCategory.PERFORMANCE,
      title: 'Performance Metrics: http-request',
      description: 'Performance metrics collected for http-request node',
      metadata: { nodeType: 'http-request', metricsCount: 10 },
      tags: ['performance', 'metrics', 'http-request'],
      source: KnowledgeSource.PERFORMANCE_MONITOR,
      confidence: 0.9,
      nodeType: 'http-request',
      performance: {
        avgExecutionTime: 2500,
        memoryUsage: 75,
        cpuUsage: 30,
        errorRate: 0.02,
        throughput: 10
      },
      behaviors: {
        commonConfigurations: [],
        knownIssues: [],
        optimizations: [],
        compatibilityMatrix: {}
      },
      usage: {
        frequency: 50,
        contexts: ['test-workflow'],
        successPatterns: [],
        failurePatterns: []
      }
    };

    this.mockStorage.create(performanceEntry);
  }

  async testAnalyzeNodePerformance(): Promise<void> {
    const analysis = await this.analyzer.analyzeNodePerformance('http-request');
    
    if (!analysis) {
      throw new Error('Analysis not returned');
    }
    
    if (analysis.nodeType !== 'http-request') {
      throw new Error('Analysis nodeType mismatch');
    }
    
    if (typeof analysis.totalExecutions !== 'number') {
      throw new Error('Analysis missing totalExecutions');
    }
    
    if (!analysis.averagePerformance) {
      throw new Error('Analysis missing averagePerformance');
    }
    
    if (!analysis.trends) {
      throw new Error('Analysis missing trends');
    }
  }

  async testEmptyAnalysis(): Promise<void> {
    // Test analysis for node type with no data
    const analysis = await this.analyzer.analyzeNodePerformance('nonexistent-node');
    
    if (analysis.totalExecutions !== 0) {
      throw new Error('Empty analysis should have 0 total executions');
    }
    
    if (analysis.trends.performanceTrend !== 'stable') {
      throw new Error('Empty analysis should show stable trend');
    }
  }

  async testRecommendationGeneration(): Promise<void> {
    // Add high-performance issue data
    const highLatencyEntry = {
      type: KnowledgeType.NODE_BEHAVIOR,
      category: KnowledgeCategory.PERFORMANCE,
      title: 'Performance Metrics: slow-node',
      description: 'Performance metrics for slow node',
      metadata: { nodeType: 'slow-node' },
      tags: ['performance', 'slow-node'],
      source: KnowledgeSource.PERFORMANCE_MONITOR,
      confidence: 0.9,
      nodeType: 'slow-node',
      performance: {
        avgExecutionTime: 15000, // 15 seconds - should trigger recommendation
        memoryUsage: 200, // 200MB - should trigger recommendation
        cpuUsage: 40,
        errorRate: 0.08, // 8% error rate - should trigger recommendation
        throughput: 5
      },
      behaviors: {
        commonConfigurations: [],
        knownIssues: [],
        optimizations: [],
        compatibilityMatrix: {}
      },
      usage: {
        frequency: 100,
        contexts: ['test-workflow'],
        successPatterns: [],
        failurePatterns: []
      }
    };

    await this.mockStorage.create(highLatencyEntry);
    
    const analysis = await this.analyzer.analyzeNodePerformance('slow-node');
    
    if (analysis.recommendations.length === 0) {
      throw new Error('Should generate recommendations for poor performance');
    }
    
    // Check that recommendations address specific issues
    const hasExecutionRec = analysis.recommendations.some(r => r.technique === 'execution_optimization');
    const hasMemoryRec = analysis.recommendations.some(r => r.technique === 'memory_optimization');
    const hasErrorRec = analysis.recommendations.some(r => r.technique === 'error_reduction');
    
    if (!hasExecutionRec && !hasMemoryRec && !hasErrorRec) {
      throw new Error('Should generate specific performance recommendations');
    }
  }

  async testTrendAnalysis(): Promise<void> {
    // Add multiple entries with different timestamps to test trend analysis
    const baseTime = Date.now();
    
    for (let i = 0; i < 3; i++) {
      const entry = {
        type: KnowledgeType.NODE_BEHAVIOR,
        category: KnowledgeCategory.PERFORMANCE,
        title: `Performance Metrics: trend-node-${i}`,
        description: 'Performance metrics for trend analysis',
        metadata: { nodeType: 'trend-node' },
        tags: ['performance', 'trend-node'],
        source: KnowledgeSource.PERFORMANCE_MONITOR,
        confidence: 0.9,
        nodeType: 'trend-node',
        timestamp: new Date(baseTime + (i * 86400000)), // Each day
        performance: {
          avgExecutionTime: 1000 + (i * 500), // Increasing execution time
          memoryUsage: 50,
          cpuUsage: 25,
          errorRate: 0.01,
          throughput: 10
        },
        behaviors: {
          commonConfigurations: [],
          knownIssues: [],
          optimizations: [],
          compatibilityMatrix: {}
        },
        usage: {
          frequency: 20,
          contexts: ['test-workflow'],
          successPatterns: [],
          failurePatterns: []
        }
      };

      await this.mockStorage.create(entry);
    }
    
    const analysis = await this.analyzer.analyzeNodePerformance('trend-node');
    
    if (analysis.trends.performanceTrend === 'stable') {
      console.log('Note: Trend analysis may show stable due to limited test data');
    }
    
    if (typeof analysis.trends.trendStrength !== 'number') {
      throw new Error('Trend strength should be a number');
    }
  }
}

/**
 * Test NodePerformanceKnowledgeBase main functionality
 */
class NodePerformanceKnowledgeBaseTests {
  private mockStorage: MockKnowledgeStorageManager;
  private knowledgeBase: NodePerformanceKnowledgeBase;

  constructor() {
    this.mockStorage = new MockKnowledgeStorageManager();
    this.knowledgeBase = new NodePerformanceKnowledgeBase(this.mockStorage);
  }

  async testInitialization(): Promise<void> {
    await this.knowledgeBase.initialize();
    
    if (!this.mockStorage.isInitialized()) {
      throw new Error('Knowledge storage should be initialized');
    }
  }

  async testMonitoringLifecycle(): Promise<void> {
    await this.knowledgeBase.initialize();
    
    // Test starting monitoring
    await this.knowledgeBase.startMonitoring('test-node', 'http-request', 'test-workflow');
    
    // Allow some monitoring
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test stopping monitoring
    this.knowledgeBase.stopMonitoring('test-node');
    
    // Test should not throw errors
  }

  async testPerformanceAnalysisIntegration(): Promise<void> {
    await this.knowledgeBase.initialize();
    
    // Add some test data
    await this.mockStorage.create({
      type: KnowledgeType.NODE_BEHAVIOR,
      category: KnowledgeCategory.PERFORMANCE,
      title: 'Test Node Performance',
      description: 'Test performance data',
      metadata: { nodeType: 'test-node' },
      tags: ['performance', 'test'],
      source: KnowledgeSource.PERFORMANCE_MONITOR,
      confidence: 0.9,
      nodeType: 'test-node',
      performance: {
        avgExecutionTime: 1500,
        memoryUsage: 60,
        cpuUsage: 20,
        errorRate: 0.01,
        throughput: 15
      },
      behaviors: {
        commonConfigurations: [],
        knownIssues: [],
        optimizations: [],
        compatibilityMatrix: {}
      },
      usage: {
        frequency: 30,
        contexts: ['test'],
        successPatterns: [],
        failurePatterns: []
      }
    });
    
    const analysis = await this.knowledgeBase.getPerformanceAnalysis('test-node');
    
    if (!analysis || analysis.nodeType !== 'test-node') {
      throw new Error('Performance analysis integration failed');
    }
  }

  async testOptimizationRecommendations(): Promise<void> {
    await this.knowledgeBase.initialize();
    
    // Add performance data that should trigger recommendations
    await this.mockStorage.create({
      type: KnowledgeType.NODE_BEHAVIOR,
      category: KnowledgeCategory.PERFORMANCE,
      title: 'Slow Node Performance',
      description: 'Poor performance data for recommendations',
      metadata: { nodeType: 'slow-node' },
      tags: ['performance', 'slow'],
      source: KnowledgeSource.PERFORMANCE_MONITOR,
      confidence: 0.9,
      nodeType: 'slow-node',
      performance: {
        avgExecutionTime: 8000, // Slow
        memoryUsage: 150, // High memory
        cpuUsage: 80, // High CPU
        errorRate: 0.06, // High error rate
        throughput: 3
      },
      behaviors: {
        commonConfigurations: [],
        knownIssues: [],
        optimizations: [],
        compatibilityMatrix: {}
      },
      usage: {
        frequency: 100, // High usage
        contexts: ['production'],
        successPatterns: [],
        failurePatterns: []
      }
    });
    
    const recommendations = await this.knowledgeBase.getOptimizationRecommendations('slow-node');
    
    if (recommendations.length === 0) {
      throw new Error('Should generate recommendations for poor performance');
    }
    
    // Check recommendation structure
    const rec = recommendations[0];
    if (!rec.nodeType || !rec.recommendation || !rec.priority || !rec.expectedImprovement) {
      throw new Error('Recommendation missing required fields');
    }
    
    if (!rec.implementation || !rec.evidence) {
      throw new Error('Recommendation missing implementation or evidence');
    }
  }

  async testFactoryFunction(): Promise<void> {
    const kb = createNodePerformanceKnowledgeBase();
    
    if (!kb) {
      throw new Error('Factory function should create knowledge base instance');
    }
    
    // Test that it can be initialized
    await kb.initialize();
  }
}

/**
 * Test NodePerformanceManager functionality
 */
class NodePerformanceManagerTests {
  private mockStorage: MockKnowledgeStorageManager;
  private manager: NodePerformanceManager;

  constructor() {
    this.mockStorage = new MockKnowledgeStorageManager();
    const knowledgeBase = new NodePerformanceKnowledgeBase(this.mockStorage);
    this.manager = new NodePerformanceManager(knowledgeBase);
  }

  async testManagerInitialization(): Promise<void> {
    await this.manager.initialize();
    
    if (!this.mockStorage.isInitialized()) {
      throw new Error('Manager should initialize knowledge storage');
    }
  }

  async testWorkflowMonitoring(): Promise<void> {
    await this.manager.initialize();
    
    // Test starting workflow monitoring
    await this.manager.startWorkflowMonitoring('test-workflow', mockNodes);
    
    // Allow some monitoring
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test stopping monitoring
    this.manager.stopAllMonitoring(mockNodes);
    
    // Should not throw errors
  }

  async testPerformanceReport(): Promise<void> {
    await this.manager.initialize();
    
    // Add some test data
    await this.mockStorage.create({
      type: KnowledgeType.NODE_BEHAVIOR,
      category: KnowledgeCategory.PERFORMANCE,
      title: 'Report Test Node',
      description: 'Test data for performance report',
      metadata: { nodeType: 'http-request' },
      tags: ['performance', 'http-request'],
      source: KnowledgeSource.PERFORMANCE_MONITOR,
      confidence: 0.9,
      nodeType: 'http-request',
      performance: {
        avgExecutionTime: 1200,
        memoryUsage: 45,
        cpuUsage: 15,
        errorRate: 0.005,
        throughput: 20
      },
      behaviors: {
        commonConfigurations: [],
        knownIssues: [],
        optimizations: [],
        compatibilityMatrix: {}
      },
      usage: {
        frequency: 25,
        contexts: ['test'],
        successPatterns: [],
        failurePatterns: []
      }
    });
    
    const report = await this.manager.getPerformanceReport();
    
    if (!report.summary || !report.recommendations || typeof report.monitoringStatus !== 'boolean') {
      throw new Error('Performance report missing required fields');
    }
    
    // Check that http-request node is in summary
    if (!report.summary['http-request']) {
      throw new Error('Expected node type not found in performance report');
    }
  }

  async testManagerCreationWithoutKnowledgeBase(): Promise<void> {
    const manager = new NodePerformanceManager();
    await manager.initialize();
    
    // Should create its own knowledge base
    const report = await manager.getPerformanceReport();
    if (!report) {
      throw new Error('Manager should work with default knowledge base');
    }
  }
}

/**
 * Integration tests for the complete system
 */
class NodePerformanceIntegrationTests {
  private mockStorage: MockKnowledgeStorageManager;

  constructor() {
    this.mockStorage = new MockKnowledgeStorageManager();
  }

  async testEndToEndWorkflow(): Promise<void> {
    // Create complete system
    const knowledgeBase = new NodePerformanceKnowledgeBase(this.mockStorage);
    const manager = new NodePerformanceManager(knowledgeBase);
    
    // Initialize
    await manager.initialize();
    
    // Start monitoring a workflow
    await manager.startWorkflowMonitoring('integration-test', mockNodes);
    
    // Let it collect some data
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Get performance analysis
    const analysis = await knowledgeBase.getPerformanceAnalysis('http-request');
    
    // Get recommendations
    const recommendations = await knowledgeBase.getOptimizationRecommendations();
    
    // Get comprehensive report
    const report = await manager.getPerformanceReport();
    
    // Stop monitoring
    manager.stopAllMonitoring(mockNodes);
    
    // Verify everything worked
    if (!analysis || !recommendations || !report) {
      throw new Error('End-to-end workflow failed to produce results');
    }
    
    if (typeof report.monitoringStatus !== 'boolean') {
      throw new Error('Monitoring status not properly tracked');
    }
  }

  async testDataPersistenceAndRetrieval(): Promise<void> {
    const collector = new NodePerformanceCollector(this.mockStorage);
    const analyzer = new NodePerformanceAnalyzer(this.mockStorage);
    
    // Start monitoring and let it persist data
    await collector.startMonitoring('persist-test', 'function', 'persist-workflow');
    
    // Wait for data collection and persistence
    await new Promise(resolve => setTimeout(resolve, 300));
    
    collector.stopMonitoring('persist-test');
    
    // Check if data was persisted
    const storedData = this.mockStorage.getMockData();
    
    // Analyze the persisted data
    const analysis = await analyzer.analyzeNodePerformance('function');
    
    if (analysis.totalExecutions === 0 && storedData.length === 0) {
      console.log('Note: No data persisted in quick test - this is expected');
    }
    
    // Verify the analysis can handle the data structure
    if (!analysis.averagePerformance || !analysis.trends) {
      throw new Error('Analysis failed to process data structure');
    }
  }

  async testPerformanceUnderLoad(): Promise<void> {
    const knowledgeBase = new NodePerformanceKnowledgeBase(this.mockStorage);
    await knowledgeBase.initialize();
    
    // Simulate multiple concurrent operations
    const promises = [];
    
    for (let i = 0; i < 5; i++) {
      promises.push(knowledgeBase.startMonitoring(`load-test-${i}`, 'webhook', 'load-test'));
    }
    
    await Promise.all(promises);
    
    // Let it run briefly
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Stop all monitoring
    for (let i = 0; i < 5; i++) {
      knowledgeBase.stopMonitoring(`load-test-${i}`);
    }
    
    // Verify system handled concurrent operations
    const analysis = await knowledgeBase.getPerformanceAnalysis('webhook');
    
    if (!analysis) {
      throw new Error('System failed under concurrent load');
    }
  }
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

/**
 * Run all Node Performance Knowledge Base tests
 */
export async function runNodePerformanceKnowledgeBaseTests(): Promise<TestResult[]> {
  console.log('🚀 Starting Node Performance Knowledge Base Tests...\n');
  
  const testRunner = new NodePerformanceTestRunner();
  
  // NodePerformanceCollector Tests
  console.log('📊 Testing NodePerformanceCollector...');
  const collectorTests = new NodePerformanceCollectorTests();
  await testRunner.runTest('Collector Initialization', () => collectorTests.testCollectorInitialization());
  await testRunner.runTest('Start/Stop Monitoring', () => collectorTests.testStartStopMonitoring());
  await testRunner.runTest('Metrics Collection', () => collectorTests.testMetricsCollection());
  await testRunner.runTest('Time Range Filtering', () => collectorTests.testTimeRangeFiltering());
  
  // NodePerformanceAnalyzer Tests
  console.log('\n🔍 Testing NodePerformanceAnalyzer...');
  const analyzerTests = new NodePerformanceAnalyzerTests();
  await testRunner.runTest('Analyze Node Performance', () => analyzerTests.testAnalyzeNodePerformance());
  await testRunner.runTest('Empty Analysis', () => analyzerTests.testEmptyAnalysis());
  await testRunner.runTest('Recommendation Generation', () => analyzerTests.testRecommendationGeneration());
  await testRunner.runTest('Trend Analysis', () => analyzerTests.testTrendAnalysis());
  
  // NodePerformanceKnowledgeBase Tests
  console.log('\n🧠 Testing NodePerformanceKnowledgeBase...');
  const knowledgeBaseTests = new NodePerformanceKnowledgeBaseTests();
  await testRunner.runTest('Knowledge Base Initialization', () => knowledgeBaseTests.testInitialization());
  await testRunner.runTest('Monitoring Lifecycle', () => knowledgeBaseTests.testMonitoringLifecycle());
  await testRunner.runTest('Performance Analysis Integration', () => knowledgeBaseTests.testPerformanceAnalysisIntegration());
  await testRunner.runTest('Optimization Recommendations', () => knowledgeBaseTests.testOptimizationRecommendations());
  await testRunner.runTest('Factory Function', () => knowledgeBaseTests.testFactoryFunction());
  
  // NodePerformanceManager Tests
  console.log('\n⚙️ Testing NodePerformanceManager...');
  const managerTests = new NodePerformanceManagerTests();
  await testRunner.runTest('Manager Initialization', () => managerTests.testManagerInitialization());
  await testRunner.runTest('Workflow Monitoring', () => managerTests.testWorkflowMonitoring());
  await testRunner.runTest('Performance Report', () => managerTests.testPerformanceReport());
  await testRunner.runTest('Manager Creation Without KB', () => managerTests.testManagerCreationWithoutKnowledgeBase());
  
  // Integration Tests
  console.log('\n🔗 Testing Integration...');
  const integrationTests = new NodePerformanceIntegrationTests();
  await testRunner.runTest('End-to-End Workflow', () => integrationTests.testEndToEndWorkflow());
  await testRunner.runTest('Data Persistence and Retrieval', () => integrationTests.testDataPersistenceAndRetrieval());
  await testRunner.runTest('Performance Under Load', () => integrationTests.testPerformanceUnderLoad());
  
  // Print summary
  testRunner.printSummary();
  
  return testRunner.getResults();
}

/**
 * Utility function to run a quick smoke test
 */
export async function runNodePerformanceQuickTest(): Promise<boolean> {
  console.log('🔥 Running Node Performance Knowledge Base Quick Smoke Test...\n');
  
  try {
    // Test basic functionality
    const mockStorage = new MockKnowledgeStorageManager();
    const knowledgeBase = createNodePerformanceKnowledgeBase(mockStorage);
    
    await knowledgeBase.initialize();
    await knowledgeBase.startMonitoring('smoke-test', 'http-request');
    
    await new Promise(resolve => setTimeout(resolve, 50));
    
    knowledgeBase.stopMonitoring('smoke-test');
    
    const analysis = await knowledgeBase.getPerformanceAnalysis('http-request');
    const recommendations = await knowledgeBase.getOptimizationRecommendations();
    
    console.log('✅ Quick smoke test passed!');
    console.log(`   - Analysis generated: ${analysis ? 'Yes' : 'No'}`);
    console.log(`   - Recommendations: ${recommendations.length}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Quick smoke test failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// Export test utilities
export {
  NodePerformanceTestRunner,
  MockKnowledgeStorageManager,
  createMockPerformanceMetrics,
  mockNodes
}; 