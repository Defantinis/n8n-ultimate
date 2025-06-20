/**
 * Test Suite for Learning Integration System
 * 
 * This module provides comprehensive testing for the Learning Integration System,
 * including unit tests for all components, integration tests, and mock implementations
 * for testing the event-driven learning architecture.
 */

import { EventEmitter } from 'events';
import {
  LearningIntegrationManager,
  AILearningObserver,
  TestingLearningObserver,
  DocumentationLearningObserver,
  AIEventGenerator,
  TestingEventGenerator,
  WorkflowEventGenerator,
  LearningIntegrationFactory,
  LearningEvent,
  LearningEventType,
  LearningContext,
  LearningInsight,
  LearningObserver,
  ObserverMetrics,
  LearningIntegrationConfig,
  defaultLearningConfig
} from './learning-integration-system';

import {
  KnowledgeEntry,
  KnowledgeType,
  KnowledgeCategory,
  KnowledgeSource
} from './knowledge-management-system';

import { KnowledgeStorageManager } from './knowledge-storage-system';
import { AIPerformanceMonitorClass } from './ai-integration-patterns';
import { TestResult, ValidationResult } from './testing-patterns';
import { N8nWorkflow } from '../types/n8n-workflow';

// ============================================================================
// MOCK IMPLEMENTATIONS
// ============================================================================

/**
 * Mock Knowledge Storage Manager for testing
 */
class MockKnowledgeStorageManager extends KnowledgeStorageManager {
  private storage = new Map<string, KnowledgeEntry>();
  private storeCallCount = 0;
  private queryCallCount = 0;

  constructor() {
    super({
      storageType: 'memory',
      connectionString: 'mock',
      enableCaching: false
    });
  }

  async store(entry: KnowledgeEntry): Promise<void> {
    this.storeCallCount++;
    this.storage.set(entry.id, { ...entry });
  }

  async query(criteria: any): Promise<KnowledgeEntry[]> {
    this.queryCallCount++;
    return Array.from(this.storage.values()).filter(entry => 
      !criteria.type || entry.type === criteria.type
    );
  }

  async update(id: string, updates: Partial<KnowledgeEntry>): Promise<void> {
    const existing = this.storage.get(id);
    if (existing) {
      this.storage.set(id, { ...existing, ...updates });
    }
  }

  async delete(id: string): Promise<void> {
    this.storage.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.storage.has(id);
  }

  // Test helpers
  getStoreCallCount(): number {
    return this.storeCallCount;
  }

  getQueryCallCount(): number {
    return this.queryCallCount;
  }

  getStoredEntries(): KnowledgeEntry[] {
    return Array.from(this.storage.values());
  }

  clear(): void {
    this.storage.clear();
    this.storeCallCount = 0;
    this.queryCallCount = 0;
  }
}

/**
 * Mock AI Performance Monitor for testing
 */
class MockAIPerformanceMonitor extends AIPerformanceMonitorClass {
  private operations: any[] = [];

  constructor() {
    super({
      n8nBaseUrl: 'http://localhost:5678',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableCaching: true,
      enableMetrics: true,
      logLevel: 'info'
    });
  }

  trackAIOperation(
    provider: string,
    model: string,
    tokens: number,
    cost: number,
    latency: number,
    success: boolean
  ): void {
    this.operations.push({
      provider,
      model,
      tokens,
      cost,
      latency,
      success,
      timestamp: Date.now()
    });
  }

  getTrackedOperations(): any[] {
    return [...this.operations];
  }

  clear(): void {
    this.operations = [];
  }
}

/**
 * Test Observer for testing observer pattern
 */
class TestObserver implements LearningObserver {
  id: string;
  type: string;
  private processedEvents: LearningEvent[] = [];
  private metrics: ObserverMetrics;
  private shouldThrowError = false;

  constructor(id: string, type: string) {
    this.id = id;
    this.type = type;
    this.metrics = {
      eventsProcessed: 0,
      avgProcessingTime: 0,
      errorRate: 0,
      lastProcessed: new Date()
    };
  }

  async onLearningEvent(event: LearningEvent): Promise<void> {
    const startTime = Date.now();
    
    if (this.shouldThrowError) {
      throw new Error(`Test error from ${this.id}`);
    }

    this.processedEvents.push({ ...event });
    this.metrics.eventsProcessed++;
    this.metrics.avgProcessingTime = 
      ((this.metrics.avgProcessingTime * (this.metrics.eventsProcessed - 1)) + 
       (Date.now() - startTime)) / this.metrics.eventsProcessed;
    this.metrics.lastProcessed = new Date();
  }

  getObserverMetrics(): ObserverMetrics {
    return { ...this.metrics };
  }

  getProcessedEvents(): LearningEvent[] {
    return [...this.processedEvents];
  }

  setThrowError(shouldThrow: boolean): void {
    this.shouldThrowError = shouldThrow;
  }

  clear(): void {
    this.processedEvents = [];
    this.metrics = {
      eventsProcessed: 0,
      avgProcessingTime: 0,
      errorRate: 0,
      lastProcessed: new Date()
    };
  }
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Test data factory for creating test objects
 */
class TestDataFactory {
  static createLearningEvent(overrides: Partial<LearningEvent> = {}): LearningEvent {
    return {
      id: `test-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: LearningEventType.WORKFLOW_EXECUTED,
      timestamp: new Date(),
      source: KnowledgeSource.WORKFLOW_GENERATOR,
      category: KnowledgeCategory.WORKFLOW_GENERATION,
      data: { test: 'data' },
      context: {
        environment: 'development',
        metadata: {}
      },
      confidence: 0.8,
      priority: 'medium',
      tags: ['test'],
      ...overrides
    };
  }

  static createTestResult(overrides: Partial<TestResult> = {}): TestResult {
    return {
      id: `test-${Date.now()}`,
      name: 'Test Workflow',
      status: 'passed',
      duration: 1000,
      errors: [],
      warnings: [],
      assertions: [],
      performance: {
        executionTime: 1000,
        memoryUsage: 50,
        nodeExecutionTimes: {},
        dataTransferSizes: {}
      },
      ...overrides
    };
  }

  static createValidationResult(overrides: Partial<ValidationResult> = {}): ValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [],
      score: 85,
      recommendations: [],
      ...overrides
    };
  }

  static createWorkflow(overrides: Partial<N8nWorkflow> = {}): N8nWorkflow {
    return {
      id: `workflow-${Date.now()}`,
      name: 'Test Workflow',
      nodes: {},
      connections: {},
      active: false,
      settings: {},
      meta: {},
      ...overrides
    };
  }
}

/**
 * Test runner class for organizing and running tests
 */
class TestRunner {
  private tests: Array<{ name: string; fn: () => Promise<void> }> = [];
  private beforeEachFn?: () => Promise<void>;
  private afterEachFn?: () => Promise<void>;

  beforeEach(fn: () => Promise<void>): void {
    this.beforeEachFn = fn;
  }

  afterEach(fn: () => Promise<void>): void {
    this.afterEachFn = fn;
  }

  test(name: string, fn: () => Promise<void>): void {
    this.tests.push({ name, fn });
  }

  async run(): Promise<{ passed: number; failed: number; results: any[] }> {
    const results: any[] = [];
    let passed = 0;
    let failed = 0;

    for (const test of this.tests) {
      try {
        if (this.beforeEachFn) {
          await this.beforeEachFn();
        }

        const startTime = Date.now();
        await test.fn();
        const duration = Date.now() - startTime;

        results.push({
          name: test.name,
          status: 'passed',
          duration,
          error: null
        });
        passed++;

        if (this.afterEachFn) {
          await this.afterEachFn();
        }
      } catch (error) {
        results.push({
          name: test.name,
          status: 'failed',
          duration: 0,
          error: error instanceof Error ? error.message : String(error)
        });
        failed++;
      }
    }

    return { passed, failed, results };
  }
}

// ============================================================================
// UNIT TESTS
// ============================================================================

/**
 * Unit tests for LearningIntegrationManager
 */
export class LearningIntegrationManagerTests {
  private mockStorage: MockKnowledgeStorageManager;
  private manager: LearningIntegrationManager;

  constructor() {
    this.mockStorage = new MockKnowledgeStorageManager();
    this.manager = new LearningIntegrationManager(this.mockStorage);
  }

  async runTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const runner = new TestRunner();

    runner.beforeEach(async () => {
      this.mockStorage.clear();
      this.manager = new LearningIntegrationManager(this.mockStorage);
    });

    runner.test('should register and unregister observers', async () => {
      const observer = new TestObserver('test-1', 'general');
      
      // Test registration
      this.manager.registerObserver(observer);
      const metrics = this.manager.getObserverMetrics();
      this.assert(metrics.has('test-1'), 'Observer should be registered');
      
      // Test unregistration
      this.manager.unregisterObserver('test-1');
      const metricsAfter = this.manager.getObserverMetrics();
      this.assert(!metricsAfter.has('test-1'), 'Observer should be unregistered');
    });

    runner.test('should emit learning events to appropriate observers', async () => {
      const aiObserver = new TestObserver('ai-test', 'ai');
      const testingObserver = new TestObserver('testing-test', 'testing');
      const generalObserver = new TestObserver('general-test', 'general');

      this.manager.registerObserver(aiObserver);
      this.manager.registerObserver(testingObserver);
      this.manager.registerObserver(generalObserver);

      // Create AI event
      const aiEvent = TestDataFactory.createLearningEvent({
        type: LearningEventType.AI_OPERATION_COMPLETED,
        source: KnowledgeSource.AI_PATTERNS
      });

      await this.manager.emitLearningEvent(aiEvent);
      
      // Wait for processing
      await this.sleep(100);

      // General observer should receive all events
      this.assert(generalObserver.getProcessedEvents().length === 1, 
        'General observer should receive AI event');
      
      // AI observer should receive AI events
      this.assert(aiObserver.getProcessedEvents().length === 1, 
        'AI observer should receive AI event');
      
      // Testing observer should not receive AI events
      this.assert(testingObserver.getProcessedEvents().length === 0, 
        'Testing observer should not receive AI event');
    });

    runner.test('should generate insights from events', async () => {
      const event = TestDataFactory.createLearningEvent({
        type: LearningEventType.WORKFLOW_EXECUTED,
        data: {
          workflow: { name: 'Test Workflow' },
          performance: { executionTime: 10000, memoryUsage: 100, cpuUsage: 50 }
        }
      });

      await this.manager.emitLearningEvent(event);
      await this.sleep(100);

      const insights = this.manager.getInsights();
      this.assert(insights.length > 0, 'Should generate insights for slow workflow');
      
      const perfInsight = insights.find(i => i.type === 'optimization');
      this.assert(perfInsight !== undefined, 'Should generate performance optimization insight');
    });

    runner.test('should store event knowledge', async () => {
      const event = TestDataFactory.createLearningEvent({
        type: LearningEventType.WORKFLOW_EXECUTED,
        data: {
          workflow: { name: 'Test Workflow' },
          performance: { executionTime: 1000, memoryUsage: 50, cpuUsage: 25 }
        }
      });

      await this.manager.emitLearningEvent(event);
      await this.sleep(100);

      const storedEntries = this.mockStorage.getStoredEntries();
      this.assert(storedEntries.length > 0, 'Should store knowledge entries');
      
      const workflowEntry = storedEntries.find(e => e.type === KnowledgeType.WORKFLOW_PATTERN);
      this.assert(workflowEntry !== undefined, 'Should store workflow knowledge');
    });

    runner.test('should handle observer errors gracefully', async () => {
      const errorObserver = new TestObserver('error-test', 'general');
      errorObserver.setThrowError(true);

      this.manager.registerObserver(errorObserver);

      let errorEmitted = false;
      this.manager.on('observer_error', () => {
        errorEmitted = true;
      });

      const event = TestDataFactory.createLearningEvent();
      await this.manager.emitLearningEvent(event);
      await this.sleep(100);

      this.assert(errorEmitted, 'Should emit observer error event');
    });

    runner.test('should process high priority events immediately', async () => {
      const observer = new TestObserver('priority-test', 'general');
      this.manager.registerObserver(observer);

      const criticalEvent = TestDataFactory.createLearningEvent({
        priority: 'critical'
      });

      const startTime = Date.now();
      await this.manager.emitLearningEvent(criticalEvent);
      const processingTime = Date.now() - startTime;

      // Should process immediately (within reasonable time)
      this.assert(processingTime < 1000, 'Critical events should process immediately');
      this.assert(observer.getProcessedEvents().length === 1, 
        'Critical event should be processed immediately');
    });

    runner.test('should filter insights correctly', async () => {
      // Generate multiple insights with different types and impacts
      const events = [
        TestDataFactory.createLearningEvent({
          type: LearningEventType.WORKFLOW_EXECUTED,
          data: {
            workflow: { name: 'Slow Workflow' },
            performance: { executionTime: 10000, memoryUsage: 100, cpuUsage: 50 }
          }
        }),
        TestDataFactory.createLearningEvent({
          type: LearningEventType.AI_OPERATION_COMPLETED,
          data: {
            provider: 'openai',
            model: 'gpt-4',
            tokens: 1000,
            cost: 0.15,
            latency: 2000,
            success: true
          }
        })
      ];

      for (const event of events) {
        await this.manager.emitLearningEvent(event);
      }
      await this.sleep(200);

      // Test filtering by type
      const optimizationInsights = this.manager.getInsights({ type: 'optimization' });
      this.assert(optimizationInsights.length >= 1, 'Should filter by type');

      // Test filtering by impact
      const mediumImpactInsights = this.manager.getInsights({ impact: 'medium' });
      this.assert(mediumImpactInsights.length >= 1, 'Should filter by impact');

      // Test filtering by actionable
      const actionableInsights = this.manager.getInsights({ actionable: true });
      this.assert(actionableInsights.length >= 1, 'Should filter by actionable status');

      // Test limit
      const limitedInsights = this.manager.getInsights({ limit: 1 });
      this.assert(limitedInsights.length === 1, 'Should respect limit');
    });

    return runner.run();
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Unit tests for AI Learning Observer
 */
export class AILearningObserverTests {
  private mockAIMonitor: MockAIPerformanceMonitor;
  private observer: AILearningObserver;

  constructor() {
    this.mockAIMonitor = new MockAIPerformanceMonitor();
    this.observer = new AILearningObserver(this.mockAIMonitor);
  }

  async runTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const runner = new TestRunner();

    runner.beforeEach(async () => {
      this.mockAIMonitor.clear();
      this.observer = new AILearningObserver(this.mockAIMonitor);
    });

    runner.test('should process AI events correctly', async () => {
      const aiEvent = TestDataFactory.createLearningEvent({
        type: LearningEventType.AI_OPERATION_COMPLETED,
        source: KnowledgeSource.AI_PATTERNS,
        data: {
          provider: 'openai',
          model: 'gpt-4',
          tokens: 1000,
          cost: 0.05,
          latency: 1500,
          success: true
        }
      });

      await this.observer.onLearningEvent(aiEvent);

      const trackedOps = this.mockAIMonitor.getTrackedOperations();
      this.assert(trackedOps.length === 1, 'Should track AI operation');
      
      const op = trackedOps[0];
      this.assert(op.provider === 'openai', 'Should track correct provider');
      this.assert(op.model === 'gpt-4', 'Should track correct model');
      this.assert(op.tokens === 1000, 'Should track correct tokens');
    });

    runner.test('should update metrics correctly', async () => {
      const event = TestDataFactory.createLearningEvent({
        source: KnowledgeSource.AI_PATTERNS
      });

      await this.observer.onLearningEvent(event);

      const metrics = this.observer.getObserverMetrics();
      this.assert(metrics.eventsProcessed === 1, 'Should increment events processed');
      this.assert(metrics.avgProcessingTime > 0, 'Should track processing time');
      this.assert(metrics.errorRate === 0, 'Should have no errors for successful processing');
    });

    runner.test('should ignore non-AI events', async () => {
      const testingEvent = TestDataFactory.createLearningEvent({
        type: LearningEventType.TEST_COMPLETED,
        source: KnowledgeSource.TESTING_FRAMEWORK
      });

      await this.observer.onLearningEvent(testingEvent);

      const trackedOps = this.mockAIMonitor.getTrackedOperations();
      this.assert(trackedOps.length === 0, 'Should not track non-AI operations');
    });

    return runner.run();
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

/**
 * Unit tests for Testing Learning Observer
 */
export class TestingLearningObserverTests {
  private observer: TestingLearningObserver;

  constructor() {
    this.observer = new TestingLearningObserver();
  }

  async runTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const runner = new TestRunner();

    runner.beforeEach(async () => {
      this.observer = new TestingLearningObserver();
    });

    runner.test('should process test completion events', async () => {
      const testResult = TestDataFactory.createTestResult({
        status: 'failed',
        errors: ['Test error 1', 'Test error 2']
      });

      const testEvent = TestDataFactory.createLearningEvent({
        type: LearningEventType.TEST_COMPLETED,
        source: KnowledgeSource.TESTING_FRAMEWORK,
        data: { testResult }
      });

      await this.observer.onLearningEvent(testEvent);

      const patterns = this.observer.getTestPatterns();
      this.assert(patterns.has('failed-with-errors'), 'Should track failed test pattern');
      this.assert(patterns.get('failed-with-errors') === 1, 'Should count pattern correctly');
    });

    runner.test('should process validation insight events', async () => {
      const validationResult = TestDataFactory.createValidationResult({
        score: 75
      });

      const validationEvent = TestDataFactory.createLearningEvent({
        type: LearningEventType.VALIDATION_INSIGHT,
        source: KnowledgeSource.TESTING_FRAMEWORK,
        data: { validationResult }
      });

      await this.observer.onLearningEvent(validationEvent);

      const patterns = this.observer.getTestPatterns();
      this.assert(patterns.has('validation-score-70'), 'Should track validation score pattern');
    });

    runner.test('should track multiple patterns', async () => {
      const events = [
        TestDataFactory.createLearningEvent({
          type: LearningEventType.TEST_COMPLETED,
          source: KnowledgeSource.TESTING_FRAMEWORK,
          data: { testResult: TestDataFactory.createTestResult({ status: 'passed' }) }
        }),
        TestDataFactory.createLearningEvent({
          type: LearningEventType.TEST_COMPLETED,
          source: KnowledgeSource.TESTING_FRAMEWORK,
          data: { testResult: TestDataFactory.createTestResult({ status: 'passed' }) }
        }),
        TestDataFactory.createLearningEvent({
          type: LearningEventType.TEST_COMPLETED,
          source: KnowledgeSource.TESTING_FRAMEWORK,
          data: { testResult: TestDataFactory.createTestResult({ status: 'failed', errors: ['error'] }) }
        })
      ];

      for (const event of events) {
        await this.observer.onLearningEvent(event);
      }

      const patterns = this.observer.getTestPatterns();
      this.assert(patterns.get('passed-clean') === 2, 'Should count passed tests correctly');
      this.assert(patterns.get('failed-with-errors') === 1, 'Should count failed tests correctly');
    });

    return runner.run();
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

/**
 * Unit tests for Event Generators
 */
export class EventGeneratorTests {
  private mockStorage: MockKnowledgeStorageManager;
  private manager: LearningIntegrationManager;
  private aiGenerator: AIEventGenerator;
  private testingGenerator: TestingEventGenerator;
  private workflowGenerator: WorkflowEventGenerator;

  constructor() {
    this.mockStorage = new MockKnowledgeStorageManager();
    this.manager = new LearningIntegrationManager(this.mockStorage);
    this.aiGenerator = new AIEventGenerator(this.manager);
    this.testingGenerator = new TestingEventGenerator(this.manager);
    this.workflowGenerator = new WorkflowEventGenerator(this.manager);
  }

  async runTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const runner = new TestRunner();

    runner.beforeEach(async () => {
      this.mockStorage.clear();
      this.manager = new LearningIntegrationManager(this.mockStorage);
      this.aiGenerator = new AIEventGenerator(this.manager);
      this.testingGenerator = new TestingEventGenerator(this.manager);
      this.workflowGenerator = new WorkflowEventGenerator(this.manager);
    });

    runner.test('AI Event Generator should generate AI operation events', async () => {
      let eventEmitted = false;
      this.manager.on('learning_event', (event: LearningEvent) => {
        if (event.type === LearningEventType.AI_OPERATION_COMPLETED) {
          eventEmitted = true;
        }
      });

      await this.aiGenerator.generateAIOperationEvent(
        'openai', 'gpt-4', 1000, 0.05, 1500, true
      );

      this.assert(eventEmitted, 'Should emit AI operation event');
    });

    runner.test('Testing Event Generator should generate test completion events', async () => {
      let eventEmitted = false;
      this.manager.on('learning_event', (event: LearningEvent) => {
        if (event.type === LearningEventType.TEST_COMPLETED) {
          eventEmitted = true;
        }
      });

      const testResult = TestDataFactory.createTestResult();
      await this.testingGenerator.generateTestCompletedEvent(testResult);

      this.assert(eventEmitted, 'Should emit test completion event');
    });

    runner.test('Workflow Event Generator should generate workflow execution events', async () => {
      let eventEmitted = false;
      this.manager.on('learning_event', (event: LearningEvent) => {
        if (event.type === LearningEventType.WORKFLOW_EXECUTED) {
          eventEmitted = true;
        }
      });

      const workflow = TestDataFactory.createWorkflow();
      const performance = { executionTime: 1000, memoryUsage: 50, cpuUsage: 25 };
      await this.workflowGenerator.generateWorkflowExecutedEvent(workflow, performance, true);

      this.assert(eventEmitted, 'Should emit workflow execution event');
    });

    return runner.run();
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

/**
 * Integration tests for the complete Learning Integration System
 */
export class LearningIntegrationSystemIntegrationTests {
  async runTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const runner = new TestRunner();

    runner.test('should create complete system using factory', async () => {
      const mockStorage = new MockKnowledgeStorageManager();
      const mockAIMonitor = new MockAIPerformanceMonitor();

      const system = LearningIntegrationFactory.create(mockStorage, mockAIMonitor);

      this.assert(system.manager instanceof LearningIntegrationManager, 'Should create manager');
      this.assert(system.observers.ai instanceof AILearningObserver, 'Should create AI observer');
      this.assert(system.observers.testing instanceof TestingLearningObserver, 'Should create testing observer');
      this.assert(system.observers.documentation instanceof DocumentationLearningObserver, 'Should create documentation observer');
      this.assert(system.generators.ai instanceof AIEventGenerator, 'Should create AI generator');
      this.assert(system.generators.testing instanceof TestingEventGenerator, 'Should create testing generator');
      this.assert(system.generators.workflow instanceof WorkflowEventGenerator, 'Should create workflow generator');
    });

    runner.test('should demonstrate end-to-end learning flow', async () => {
      const mockStorage = new MockKnowledgeStorageManager();
      const mockAIMonitor = new MockAIPerformanceMonitor();

      const system = LearningIntegrationFactory.create(mockStorage, mockAIMonitor);

      // Generate AI operation event
      await system.generators.ai.generateAIOperationEvent(
        'openai', 'gpt-4', 1000, 0.15, 2000, true
      );

      // Wait for processing
      await this.sleep(100);

      // Verify AI monitor received the tracking call
      const trackedOps = mockAIMonitor.getTrackedOperations();
      this.assert(trackedOps.length === 1, 'Should track AI operation');

      // Verify insights were generated
      const insights = system.manager.getInsights();
      this.assert(insights.length > 0, 'Should generate insights');

      // Verify knowledge was stored
      const storedEntries = mockStorage.getStoredEntries();
      this.assert(storedEntries.length > 0, 'Should store knowledge');
    });

    runner.test('should handle multiple concurrent events', async () => {
      const mockStorage = new MockKnowledgeStorageManager();
      const mockAIMonitor = new MockAIPerformanceMonitor();

      const system = LearningIntegrationFactory.create(mockStorage, mockAIMonitor);

      // Generate multiple events concurrently
      const promises = [
        system.generators.ai.generateAIOperationEvent('openai', 'gpt-4', 1000, 0.05, 1500, true),
        system.generators.testing.generateTestCompletedEvent(TestDataFactory.createTestResult()),
        system.generators.workflow.generateWorkflowExecutedEvent(
          TestDataFactory.createWorkflow(),
          { executionTime: 1000, memoryUsage: 50, cpuUsage: 25 },
          true
        )
      ];

      await Promise.all(promises);
      await this.sleep(200);

      // Verify all events were processed
      const metrics = system.manager.getManagerMetrics();
      this.assert(metrics.eventsReceived >= 3, 'Should receive all events');
      this.assert(metrics.eventsProcessed >= 3, 'Should process all events');
    });

    runner.test('should maintain system performance under load', async () => {
      const mockStorage = new MockKnowledgeStorageManager();
      const mockAIMonitor = new MockAIPerformanceMonitor();

      const system = LearningIntegrationFactory.create(mockStorage, mockAIMonitor, {
        maxBatchSize: 10,
        batchProcessingInterval: 100
      });

      // Generate many events quickly
      const eventPromises = [];
      for (let i = 0; i < 50; i++) {
        eventPromises.push(
          system.generators.ai.generateAIOperationEvent(
            'openai', 'gpt-4', 1000, 0.01, 1000, true
          )
        );
      }

      const startTime = Date.now();
      await Promise.all(eventPromises);
      await this.sleep(1000); // Wait for batch processing
      const totalTime = Date.now() - startTime;

      const metrics = system.manager.getManagerMetrics();
      this.assert(metrics.eventsReceived === 50, 'Should receive all events');
      this.assert(totalTime < 5000, 'Should process within reasonable time');
      this.assert(metrics.processingErrors === 0, 'Should have no processing errors');
    });

    return runner.run();
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

/**
 * Performance and load tests for the Learning Integration System
 */
export class LearningIntegrationPerformanceTests {
  async runTests(): Promise<{ passed: number; failed: number; results: any[] }> {
    const runner = new TestRunner();

    runner.test('should handle high event throughput', async () => {
      const mockStorage = new MockKnowledgeStorageManager();
      const mockAIMonitor = new MockAIPerformanceMonitor();

      const system = LearningIntegrationFactory.create(mockStorage, mockAIMonitor);

      const eventCount = 1000;
      const startTime = Date.now();

      // Generate events as fast as possible
      const promises = [];
      for (let i = 0; i < eventCount; i++) {
        promises.push(
          system.generators.ai.generateAIOperationEvent(
            'openai', 'gpt-4', 100, 0.001, 100, true
          )
        );
      }

      await Promise.all(promises);
      const generationTime = Date.now() - startTime;

      // Wait for processing to complete
      await this.sleep(2000);
      const totalTime = Date.now() - startTime;

      const metrics = system.manager.getManagerMetrics();
      
      this.assert(metrics.eventsReceived === eventCount, 'Should receive all events');
      this.assert(generationTime < 5000, 'Should generate events quickly');
      this.assert(totalTime < 10000, 'Should complete processing in reasonable time');
      
      const throughput = eventCount / (totalTime / 1000);
      this.assert(throughput > 100, 'Should achieve reasonable throughput (>100 events/sec)');
    });

    runner.test('should maintain memory efficiency', async () => {
      const mockStorage = new MockKnowledgeStorageManager();
      const mockAIMonitor = new MockAIPerformanceMonitor();

      const system = LearningIntegrationFactory.create(mockStorage, mockAIMonitor, {
        insightRetentionPeriod: 1000, // 1 second for testing
        insightCleanupInterval: 500   // 0.5 seconds for testing
      });

      // Generate events that create insights
      for (let i = 0; i < 100; i++) {
        await system.generators.workflow.generateWorkflowExecutedEvent(
          TestDataFactory.createWorkflow(),
          { executionTime: 10000, memoryUsage: 100, cpuUsage: 50 }, // Slow execution to trigger insights
          true
        );
      }

      // Wait for processing
      await this.sleep(1000);

      const initialInsightCount = system.manager.getInsights().length;

      // Wait for cleanup
      await this.sleep(2000);

      const finalInsightCount = system.manager.getInsights().length;

      this.assert(initialInsightCount > 0, 'Should generate insights');
      this.assert(finalInsightCount < initialInsightCount, 'Should clean up old insights');
    });

    return runner.run();
  }

  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// TEST SUITE RUNNER
// ============================================================================

/**
 * Comprehensive test suite runner for all Learning Integration System tests
 */
export class LearningIntegrationTestSuite {
  async runAll(): Promise<{
    totalPassed: number;
    totalFailed: number;
    suiteResults: Array<{
      suiteName: string;
      passed: number;
      failed: number;
      results: any[];
    }>;
  }> {
    console.log('🧪 Running Learning Integration System Test Suite...\n');

    const suites = [
      { name: 'LearningIntegrationManager Unit Tests', suite: new LearningIntegrationManagerTests() },
      { name: 'AILearningObserver Unit Tests', suite: new AILearningObserverTests() },
      { name: 'TestingLearningObserver Unit Tests', suite: new TestingLearningObserverTests() },
      { name: 'Event Generator Tests', suite: new EventGeneratorTests() },
      { name: 'Integration Tests', suite: new LearningIntegrationSystemIntegrationTests() },
      { name: 'Performance Tests', suite: new LearningIntegrationPerformanceTests() }
    ];

    const suiteResults = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (const { name, suite } of suites) {
      console.log(`📋 Running ${name}...`);
      const startTime = Date.now();
      
      try {
        const result = await suite.runTests();
        const duration = Date.now() - startTime;
        
        suiteResults.push({
          suiteName: name,
          passed: result.passed,
          failed: result.failed,
          results: result.results
        });
        
        totalPassed += result.passed;
        totalFailed += result.failed;
        
        console.log(`✅ ${name}: ${result.passed} passed, ${result.failed} failed (${duration}ms)\n`);
        
        if (result.failed > 0) {
          console.log('❌ Failed tests:');
          result.results
            .filter(r => r.status === 'failed')
            .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
          console.log();
        }
      } catch (error) {
        console.log(`💥 ${name} suite crashed: ${error}\n`);
        totalFailed++;
        suiteResults.push({
          suiteName: name,
          passed: 0,
          failed: 1,
          results: [{ name: 'Suite execution', status: 'failed', error: String(error) }]
        });
      }
    }

    console.log('📊 Test Suite Summary:');
    console.log(`   Total Tests: ${totalPassed + totalFailed}`);
    console.log(`   Passed: ${totalPassed}`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);

    return {
      totalPassed,
      totalFailed,
      suiteResults
    };
  }
}

// Export all test classes for individual use
export {
  MockKnowledgeStorageManager,
  MockAIPerformanceMonitor,
  TestObserver,
  TestDataFactory,
  TestRunner
}; 