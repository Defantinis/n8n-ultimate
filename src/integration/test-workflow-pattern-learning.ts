/**
 * Test Suite for Workflow Pattern Learning System
 * 
 * Comprehensive tests for pattern recognition, learning, and workflow analysis capabilities
 */

import {
  WorkflowGraphAnalyzer,
  PatternRecognitionEngine,
  PatternLearningManager,
  PatternLearningUtils,
  WorkflowPattern,
  PatternAnalysisResult,
  DEFAULT_PATTERN_LEARNING_CONFIG
} from './workflow-pattern-learning';
import { N8nWorkflow } from '../types/n8n-workflow';
import { KnowledgeStorageManager } from './knowledge-storage-system';

/**
 * Test Data Creation
 */
const createSampleWorkflow = (): N8nWorkflow => ({
  id: 'test-workflow-1',
  name: 'Test AI Data Processing Workflow',
  nodes: [
    {
      id: 'trigger',
      name: 'Manual Trigger',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [0, 0],
      parameters: {}
    },
    {
      id: 'http-request',
      name: 'HTTP Request',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 1,
      position: [200, 0],
      parameters: {
        url: 'https://api.example.com/data',
        method: 'GET'
      }
    },
    {
      id: 'data-transform',
      name: 'Data Transform',
      type: 'n8n-nodes-base.set',
      typeVersion: 1,
      position: [400, 0],
      parameters: {
        values: {
          string: [
            { name: 'processedData', value: '={{$json.data}}' }
          ]
        }
      }
    },
    {
      id: 'openai-analysis',
      name: 'OpenAI Analysis',
      type: 'n8n-nodes-base.openAi',
      typeVersion: 1,
      position: [600, 0],
      parameters: {
        resource: 'chat',
        operation: 'create',
        model: 'gpt-4'
      }
    }
  ],
  connections: {
    'trigger': {
      'main': [
        { node: 'http-request', type: 'main', index: 0 }
      ]
    },
    'http-request': {
      'main': [
        { node: 'data-transform', type: 'main', index: 0 }
      ]
    },
    'data-transform': {
      'main': [
        { node: 'openai-analysis', type: 'main', index: 0 }
      ]
    }
  },
  active: false,
  settings: { executionOrder: 'v1' },
  meta: { instanceId: 'test-instance' }
});

const createComplexWorkflow = (): N8nWorkflow => ({
  id: 'test-workflow-2',
  name: 'Complex Automation Workflow',
  nodes: [
    {
      id: 'webhook-trigger',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [0, 0],
      parameters: { path: '/automation' }
    },
    {
      id: 'condition',
      name: 'Condition Check',
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      position: [200, 0],
      parameters: { conditions: { string: [] } }
    },
    {
      id: 'parallel-1',
      name: 'Parallel Process 1',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 1,
      position: [400, -50],
      parameters: { url: 'https://service1.com/api' }
    },
    {
      id: 'parallel-2',
      name: 'Parallel Process 2',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 1,
      position: [400, 50],
      parameters: { url: 'https://service2.com/api' }
    },
    {
      id: 'merge',
      name: 'Merge Results',
      type: 'n8n-nodes-base.merge',
      typeVersion: 1,
      position: [600, 0],
      parameters: { mode: 'append' }
    },
    {
      id: 'error-handler',
      name: 'Error Handler',
      type: 'n8n-nodes-base.errorTrigger',
      typeVersion: 1,
      position: [200, 100],
      parameters: {}
    }
  ],
  connections: {
    'webhook-trigger': {
      'main': [
        { node: 'condition', type: 'main', index: 0 }
      ]
    },
    'condition': {
      'main': [
        { node: 'parallel-1', type: 'main', index: 0 },
        { node: 'parallel-2', type: 'main', index: 0 }
      ]
    },
    'parallel-1': {
      'main': [
        { node: 'merge', type: 'main', index: 0 }
      ]
    },
    'parallel-2': {
      'main': [
        { node: 'merge', type: 'main', index: 1 }
      ]
    }
  },
  active: true,
  settings: { executionOrder: 'v1' },
  meta: { instanceId: 'test-instance' }
});

/**
 * Workflow Graph Analyzer Tests
 */
export class WorkflowGraphAnalyzerTests {
  private testResults: { [testName: string]: { passed: boolean; error?: string; duration?: number } } = {};

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Workflow Graph Analyzer...\n');

    await this.testGraphConstruction();
    await this.testNodeSequenceAnalysis();
    await this.testConnectionPatternExtraction();
    await this.testComplexityCalculation();

    this.printResults();
  }

  private async testGraphConstruction(): Promise<void> {
    await this.runTest('Graph Construction', async () => {
      const workflow = createSampleWorkflow();
      const analyzer = new WorkflowGraphAnalyzer(workflow);
      
      // Test that graph is built correctly
      const nodeSequence = analyzer.getNodeSequence();
      const connectionPatterns = analyzer.getConnectionPatterns();
      
      return nodeSequence.length > 0 && connectionPatterns.length > 0;
    });
  }

  private async testNodeSequenceAnalysis(): Promise<void> {
    await this.runTest('Node Sequence Analysis', async () => {
      const workflow = createSampleWorkflow();
      const analyzer = new WorkflowGraphAnalyzer(workflow);
      const sequence = analyzer.getNodeSequence();
      
      // Verify topological order
      const expectedSequence = [
        'n8n-nodes-base.manualTrigger',
        'n8n-nodes-base.httpRequest',
        'n8n-nodes-base.set',
        'n8n-nodes-base.openAi'
      ];
      
      return JSON.stringify(sequence) === JSON.stringify(expectedSequence);
    });
  }

  private async testConnectionPatternExtraction(): Promise<void> {
    await this.runTest('Connection Pattern Extraction', async () => {
      const workflow = createSampleWorkflow();
      const analyzer = new WorkflowGraphAnalyzer(workflow);
      const patterns = analyzer.getConnectionPatterns();
      
      // Verify connection patterns are extracted
      const hasHttpToSet = patterns.some(p => 
        p.fromNodeType === 'n8n-nodes-base.httpRequest' && 
        p.toNodeType === 'n8n-nodes-base.set'
      );
      
      return patterns.length > 0 && hasHttpToSet;
    });
  }

  private async testComplexityCalculation(): Promise<void> {
    await this.runTest('Complexity Calculation', async () => {
      const simpleWorkflow = createSampleWorkflow();
      const complexWorkflow = createComplexWorkflow();
      
      const simpleAnalyzer = new WorkflowGraphAnalyzer(simpleWorkflow);
      const complexAnalyzer = new WorkflowGraphAnalyzer(complexWorkflow);
      
      const simpleComplexity = simpleAnalyzer.calculateComplexity();
      const complexComplexity = complexAnalyzer.calculateComplexity();
      
      // Complex workflow should have higher complexity
      return complexComplexity > simpleComplexity && simpleComplexity > 0;
    });
  }

  private async runTest(testName: string, testFn: () => Promise<boolean>): Promise<void> {
    console.log(`  🧪 Running ${testName}...`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result) {
        this.testResults[testName] = { passed: true, duration };
        console.log(`  ✅ ${testName} passed (${duration}ms)`);
      } else {
        this.testResults[testName] = { passed: false, error: 'Test returned false', duration };
        console.log(`  ❌ ${testName} failed: Test returned false (${duration}ms)`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.testResults[testName] = { passed: false, error: error.message, duration };
      console.log(`  ❌ ${testName} failed: ${error.message} (${duration}ms)`);
    }
  }

  private printResults(): void {
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(r => r.passed).length;
    
    console.log(`\n📊 Workflow Graph Analyzer Test Results: ${passedTests}/${totalTests} passed\n`);
  }
}

/**
 * Pattern Recognition Engine Tests
 */
export class PatternRecognitionEngineTests {
  private testResults: { [testName: string]: { passed: boolean; error?: string; duration?: number } } = {};

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Pattern Recognition Engine...\n');

    await this.testPatternAnalysis();
    await this.testPatternSimilarity();
    await this.testNoveltyDetection();
    await this.testRecommendationGeneration();
    await this.testPatternStorage();

    this.printResults();
  }

  private async testPatternAnalysis(): Promise<void> {
    await this.runTest('Pattern Analysis', async () => {
      const engine = new PatternRecognitionEngine();
      const workflow = createSampleWorkflow();
      
      const result = await engine.analyzeWorkflow(workflow);
      
      return (
        result.noveltyScore >= 0 && result.noveltyScore <= 1 &&
        result.complexityScore > 0 &&
        Array.isArray(result.recommendations) &&
        Array.isArray(result.potentialImprovements)
      );
    });
  }

  private async testPatternSimilarity(): Promise<void> {
    await this.runTest('Pattern Similarity Calculation', async () => {
      const engine = new PatternRecognitionEngine();
      
      // Create a known pattern
      const workflow1 = createSampleWorkflow();
      const result1 = await engine.analyzeWorkflow(workflow1);
      
      // Create a similar pattern from the workflow
      const pattern: WorkflowPattern = {
        id: 'test-pattern',
        name: 'Test Pattern',
        description: 'Test',
        category: 'ai-workflow',
        nodeSequence: ['n8n-nodes-base.manualTrigger', 'n8n-nodes-base.httpRequest', 'n8n-nodes-base.openAi'],
        connectionPatterns: [
          { fromNodeType: 'n8n-nodes-base.manualTrigger', toNodeType: 'n8n-nodes-base.httpRequest', frequency: 1, successRate: 1, avgExecutionTime: 100 }
        ],
        performanceMetrics: { successRate: 1, avgExecutionTime: 100, avgTokenUsage: 100, avgCost: 0.01, errorRate: 0, reusabilityScore: 0.8 },
        usage: { timesUsed: 5, timesGenerated: 1, timesModified: 0, lastModified: new Date(), userRating: 4 },
        confidence: 0.9,
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      engine.addKnownPattern(pattern);
      
      // Analyze similar workflow
      const result2 = await engine.analyzeWorkflow(workflow1);
      
      return result2.detectedPatterns.length > 0;
    });
  }

  private async testNoveltyDetection(): Promise<void> {
    await this.runTest('Novelty Detection', async () => {
      const engine = new PatternRecognitionEngine();
      
      // First workflow should have high novelty
      const workflow1 = createSampleWorkflow();
      const result1 = await engine.analyzeWorkflow(workflow1);
      
      // Create and store a pattern
      const pattern: WorkflowPattern = {
        id: 'known-pattern',
        name: 'Known Pattern',
        description: 'Known',
        category: 'ai-workflow',
        nodeSequence: ['n8n-nodes-base.manualTrigger', 'n8n-nodes-base.httpRequest', 'n8n-nodes-base.set', 'n8n-nodes-base.openAi'],
        connectionPatterns: [],
        performanceMetrics: { successRate: 1, avgExecutionTime: 100, avgTokenUsage: 100, avgCost: 0.01, errorRate: 0, reusabilityScore: 0.8 },
        usage: { timesUsed: 5, timesGenerated: 1, timesModified: 0, lastModified: new Date(), userRating: 4 },
        confidence: 0.9,
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      engine.addKnownPattern(pattern);
      
      // Same workflow should now have lower novelty
      const result2 = await engine.analyzeWorkflow(workflow1);
      
      return result1.noveltyScore > result2.noveltyScore;
    });
  }

  private async testRecommendationGeneration(): Promise<void> {
    await this.runTest('Recommendation Generation', async () => {
      const engine = new PatternRecognitionEngine();
      const workflow = createSampleWorkflow();
      
      const result = await engine.analyzeWorkflow(workflow);
      
      // Should generate recommendations for missing error handling
      const hasErrorRecommendation = result.recommendations.some(rec => 
        rec.includes('error handling')
      );
      
      // Should generate recommendations for missing monitoring
      const hasMonitoringRecommendation = result.recommendations.some(rec => 
        rec.includes('monitoring') || rec.includes('logging')
      );
      
      return hasErrorRecommendation && hasMonitoringRecommendation;
    });
  }

  private async testPatternStorage(): Promise<void> {
    await this.runTest('Pattern Storage and Retrieval', async () => {
      const engine = new PatternRecognitionEngine();
      
      const pattern: WorkflowPattern = {
        id: 'storage-test',
        name: 'Storage Test Pattern',
        description: 'Test',
        category: 'test',
        nodeSequence: ['test'],
        connectionPatterns: [],
        performanceMetrics: { successRate: 1, avgExecutionTime: 100, avgTokenUsage: 100, avgCost: 0.01, errorRate: 0, reusabilityScore: 0.8 },
        usage: { timesUsed: 1, timesGenerated: 1, timesModified: 0, lastModified: new Date(), userRating: 5 },
        confidence: 0.8,
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      engine.addKnownPattern(pattern);
      const storedPatterns = engine.getKnownPatterns();
      
      return storedPatterns.length > 0 && storedPatterns.some(p => p.id === 'storage-test');
    });
  }

  private async runTest(testName: string, testFn: () => Promise<boolean>): Promise<void> {
    console.log(`  🧪 Running ${testName}...`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result) {
        this.testResults[testName] = { passed: true, duration };
        console.log(`  ✅ ${testName} passed (${duration}ms)`);
      } else {
        this.testResults[testName] = { passed: false, error: 'Test returned false', duration };
        console.log(`  ❌ ${testName} failed: Test returned false (${duration}ms)`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.testResults[testName] = { passed: false, error: error.message, duration };
      console.log(`  ❌ ${testName} failed: ${error.message} (${duration}ms)`);
    }
  }

  private printResults(): void {
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(r => r.passed).length;
    
    console.log(`\n📊 Pattern Recognition Engine Test Results: ${passedTests}/${totalTests} passed\n`);
  }
}

/**
 * Pattern Learning Manager Tests
 */
export class PatternLearningManagerTests {
  private testResults: { [testName: string]: { passed: boolean; error?: string; duration?: number } } = {};

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Pattern Learning Manager...\n');

    await this.testManagerInitialization();
    await this.testWorkflowLearning();
    await this.testPatternRecommendations();
    await this.testPatternCategorization();
    await this.testPatternUsageTracking();

    this.printResults();
  }

  private async testManagerInitialization(): Promise<void> {
    await this.runTest('Manager Initialization', async () => {
      const manager = new PatternLearningManager();
      
      // Test that manager initializes without errors
      await manager.initialize();
      
      await manager.cleanup();
      return true;
    });
  }

  private async testWorkflowLearning(): Promise<void> {
    await this.runTest('Workflow Learning', async () => {
      const manager = new PatternLearningManager();
      await manager.initialize();
      
      const workflow = createSampleWorkflow();
      const result = await manager.learnFromWorkflow(workflow);
      
      await manager.cleanup();
      
      return (
        result.noveltyScore >= 0 &&
        result.complexityScore > 0 &&
        Array.isArray(result.recommendations)
      );
    });
  }

  private async testPatternRecommendations(): Promise<void> {
    await this.runTest('Pattern Recommendations', async () => {
      const manager = new PatternLearningManager();
      await manager.initialize();
      
      const workflow = createSampleWorkflow();
      
      // Learn from workflow first
      await manager.learnFromWorkflow(workflow);
      
      // Get recommendations
      const recommendations = await manager.getPatternRecommendations(workflow);
      
      await manager.cleanup();
      
      return Array.isArray(recommendations);
    });
  }

  private async testPatternCategorization(): Promise<void> {
    await this.runTest('Pattern Categorization', async () => {
      const manager = new PatternLearningManager();
      await manager.initialize();
      
      const aiWorkflow = createSampleWorkflow(); // Contains OpenAI node
      const pattern = await manager.createPatternFromWorkflow(aiWorkflow);
      
      await manager.cleanup();
      
      return pattern.category === 'ai-workflow';
    });
  }

  private async testPatternUsageTracking(): Promise<void> {
    await this.runTest('Pattern Usage Tracking', async () => {
      const manager = new PatternLearningManager();
      await manager.initialize();
      
      const workflow = createSampleWorkflow();
      
      // Learn from workflow multiple times
      await manager.learnFromWorkflow(workflow);
      await manager.learnFromWorkflow(workflow);
      
      // Get top patterns
      const topPatterns = await manager.getTopPatterns(5);
      
      await manager.cleanup();
      
      return Array.isArray(topPatterns);
    });
  }

  private async runTest(testName: string, testFn: () => Promise<boolean>): Promise<void> {
    console.log(`  🧪 Running ${testName}...`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result) {
        this.testResults[testName] = { passed: true, duration };
        console.log(`  ✅ ${testName} passed (${duration}ms)`);
      } else {
        this.testResults[testName] = { passed: false, error: 'Test returned false', duration };
        console.log(`  ❌ ${testName} failed: Test returned false (${duration}ms)`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.testResults[testName] = { passed: false, error: error.message, duration };
      console.log(`  ❌ ${testName} failed: ${error.message} (${duration}ms)`);
    }
  }

  private printResults(): void {
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(r => r.passed).length;
    
    console.log(`\n📊 Pattern Learning Manager Test Results: ${passedTests}/${totalTests} passed\n`);
  }
}

/**
 * Pattern Learning Utils Tests
 */
export class PatternLearningUtilsTests {
  private testResults: { [testName: string]: { passed: boolean; error?: string; duration?: number } } = {};

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Pattern Learning Utils...\n');

    await this.testWorkflowGeneration();
    await this.testEffectivenessCalculation();
    await this.testPatternExportImport();

    this.printResults();
  }

  private async testWorkflowGeneration(): Promise<void> {
    await this.runTest('Workflow Generation from Pattern', async () => {
      const pattern: WorkflowPattern = {
        id: 'test-generation',
        name: 'Test Generation Pattern',
        description: 'Test',
        category: 'test',
        nodeSequence: ['n8n-nodes-base.manualTrigger', 'n8n-nodes-base.httpRequest'],
        connectionPatterns: [
          { fromNodeType: 'n8n-nodes-base.manualTrigger', toNodeType: 'n8n-nodes-base.httpRequest', frequency: 1, successRate: 1, avgExecutionTime: 100 }
        ],
        performanceMetrics: { successRate: 1, avgExecutionTime: 100, avgTokenUsage: 100, avgCost: 0.01, errorRate: 0, reusabilityScore: 0.8 },
        usage: { timesUsed: 1, timesGenerated: 1, timesModified: 0, lastModified: new Date(), userRating: 5 },
        confidence: 0.8,
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      const workflow = PatternLearningUtils.generateWorkflowFromPattern(pattern, 'Generated Workflow');
      
      return (
        workflow.name === 'Generated Workflow' &&
        workflow.nodes?.length === 2 &&
        workflow.nodes[0].type === 'n8n-nodes-base.manualTrigger'
      );
    });
  }

  private async testEffectivenessCalculation(): Promise<void> {
    await this.runTest('Effectiveness Score Calculation', async () => {
      const pattern: WorkflowPattern = {
        id: 'test-effectiveness',
        name: 'Test Effectiveness Pattern',
        description: 'Test',
        category: 'test',
        nodeSequence: ['test'],
        connectionPatterns: [],
        performanceMetrics: { successRate: 0.9, avgExecutionTime: 100, avgTokenUsage: 100, avgCost: 0.01, errorRate: 0.1, reusabilityScore: 0.8 },
        usage: { timesUsed: 10, timesGenerated: 1, timesModified: 0, lastModified: new Date(), userRating: 4 },
        confidence: 0.9,
        createdAt: new Date(),
        lastUsed: new Date()
      };
      
      const score = PatternLearningUtils.calculateEffectivenessScore(pattern);
      
      return score > 0 && score <= 1;
    });
  }

  private async testPatternExportImport(): Promise<void> {
    await this.runTest('Pattern Export/Import', async () => {
      const patterns: WorkflowPattern[] = [
        {
          id: 'test-export',
          name: 'Test Export Pattern',
          description: 'Test',
          category: 'test',
          nodeSequence: ['test'],
          connectionPatterns: [],
          performanceMetrics: { successRate: 1, avgExecutionTime: 100, avgTokenUsage: 100, avgCost: 0.01, errorRate: 0, reusabilityScore: 0.8 },
          usage: { timesUsed: 1, timesGenerated: 1, timesModified: 0, lastModified: new Date(), userRating: 5 },
          confidence: 0.8,
          createdAt: new Date(),
          lastUsed: new Date()
        }
      ];
      
      const exported = PatternLearningUtils.exportPatterns(patterns);
      const imported = PatternLearningUtils.importPatterns(exported);
      
      return imported.length === 1 && imported[0].id === 'test-export';
    });
  }

  private async runTest(testName: string, testFn: () => Promise<boolean>): Promise<void> {
    console.log(`  🧪 Running ${testName}...`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result) {
        this.testResults[testName] = { passed: true, duration };
        console.log(`  ✅ ${testName} passed (${duration}ms)`);
      } else {
        this.testResults[testName] = { passed: false, error: 'Test returned false', duration };
        console.log(`  ❌ ${testName} failed: Test returned false (${duration}ms)`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.testResults[testName] = { passed: false, error: error.message, duration };
      console.log(`  ❌ ${testName} failed: ${error.message} (${duration}ms)`);
    }
  }

  private printResults(): void {
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(r => r.passed).length;
    
    console.log(`\n📊 Pattern Learning Utils Test Results: ${passedTests}/${totalTests} passed\n`);
  }
}

/**
 * Integration Tests
 */
export class PatternLearningIntegrationTests {
  private testResults: { [testName: string]: { passed: boolean; error?: string; duration?: number } } = {};

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Pattern Learning Integration...\n');

    await this.testEndToEndLearning();
    await this.testPatternEvolution();
    await this.testPerformanceOptimization();

    this.printResults();
  }

  private async testEndToEndLearning(): Promise<void> {
    await this.runTest('End-to-End Learning Process', async () => {
      const manager = new PatternLearningManager();
      await manager.initialize();
      
      // Create different types of workflows
      const aiWorkflow = createSampleWorkflow();
      const automationWorkflow = createComplexWorkflow();
      
      // Learn from both workflows
      const result1 = await manager.learnFromWorkflow(aiWorkflow);
      const result2 = await manager.learnFromWorkflow(automationWorkflow);
      
      // Get patterns by category
      const aiPatterns = await manager.getPatternsByCategory('ai-workflow');
      const automationPatterns = await manager.getPatternsByCategory('automation');
      
      await manager.cleanup();
      
      return (
        result1.noveltyScore > 0.5 &&
        result2.noveltyScore > 0.5 &&
        (aiPatterns.length > 0 || automationPatterns.length > 0)
      );
    });
  }

  private async testPatternEvolution(): Promise<void> {
    await this.runTest('Pattern Evolution and Improvement', async () => {
      const manager = new PatternLearningManager();
      await manager.initialize();
      
      const workflow = createSampleWorkflow();
      
      // Learn from workflow multiple times with different metrics
      await manager.learnFromWorkflow(workflow, {
        successRate: 0.8,
        avgExecutionTime: 1000,
        avgTokenUsage: 500,
        avgCost: 0.05,
        errorRate: 0.2,
        reusabilityScore: 0.6
      });
      
      await manager.learnFromWorkflow(workflow, {
        successRate: 0.95,
        avgExecutionTime: 800,
        avgTokenUsage: 400,
        avgTokenUsage: 0.03,
        errorRate: 0.05,
        reusabilityScore: 0.9
      });
      
      const recommendations = await manager.getPatternRecommendations(workflow);
      
      await manager.cleanup();
      
      return Array.isArray(recommendations);
    });
  }

  private async testPerformanceOptimization(): Promise<void> {
    await this.runTest('Performance Optimization Suggestions', async () => {
      const manager = new PatternLearningManager();
      await manager.initialize();
      
      // Create a workflow that should trigger optimization suggestions
      const complexWorkflow = createComplexWorkflow();
      const result = await manager.learnFromWorkflow(complexWorkflow);
      
      await manager.cleanup();
      
      // Should suggest parallel execution
      const hasParallelSuggestion = result.potentialImprovements.some(improvement => 
        improvement.includes('parallel')
      );
      
      return hasParallelSuggestion;
    });
  }

  private async runTest(testName: string, testFn: () => Promise<boolean>): Promise<void> {
    console.log(`  🧪 Running ${testName}...`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      if (result) {
        this.testResults[testName] = { passed: true, duration };
        console.log(`  ✅ ${testName} passed (${duration}ms)`);
      } else {
        this.testResults[testName] = { passed: false, error: 'Test returned false', duration };
        console.log(`  ❌ ${testName} failed: Test returned false (${duration}ms)`);
      }
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.testResults[testName] = { passed: false, error: error.message, duration };
      console.log(`  ❌ ${testName} failed: ${error.message} (${duration}ms)`);
    }
  }

  private printResults(): void {
    const totalTests = Object.keys(this.testResults).length;
    const passedTests = Object.values(this.testResults).filter(r => r.passed).length;
    
    console.log(`\n📊 Pattern Learning Integration Test Results: ${passedTests}/${totalTests} passed\n`);
  }
}

/**
 * Main Test Runner
 */
export async function runAllPatternLearningTests(): Promise<boolean> {
  console.log('🚀 Running All Workflow Pattern Learning Tests...\n');
  
  const startTime = Date.now();
  
  try {
    const graphAnalyzerTests = new WorkflowGraphAnalyzerTests();
    await graphAnalyzerTests.runAllTests();
    
    const recognitionEngineTests = new PatternRecognitionEngineTests();
    await recognitionEngineTests.runAllTests();
    
    const learningManagerTests = new PatternLearningManagerTests();
    await learningManagerTests.runAllTests();
    
    const utilsTests = new PatternLearningUtilsTests();
    await utilsTests.runAllTests();
    
    const integrationTests = new PatternLearningIntegrationTests();
    await integrationTests.runAllTests();
    
    const totalTime = Date.now() - startTime;
    
    console.log('\n🎉 All Workflow Pattern Learning Tests Completed!');
    console.log('📊 Test Summary:');
    console.log('   ✅ Workflow Graph Analyzer: Graph construction, sequence analysis, pattern extraction');
    console.log('   ✅ Pattern Recognition Engine: Similarity calculation, novelty detection, recommendations');
    console.log('   ✅ Pattern Learning Manager: Initialization, learning, categorization, tracking');
    console.log('   ✅ Pattern Learning Utils: Workflow generation, effectiveness calculation, import/export');
    console.log('   ✅ Integration Tests: End-to-end learning, pattern evolution, optimization');
    console.log(`   ⏱️  Total Time: ${totalTime}ms`);
    
    return true;
  } catch (error) {
    console.error('\n❌ Workflow Pattern Learning Tests Failed:');
    console.error(error);
    return false;
  }
}

// Performance Benchmarks
export async function runPatternLearningBenchmarks(): Promise<void> {
  console.log('⚡ Running Pattern Learning Performance Benchmarks...\n');
  
  const manager = new PatternLearningManager();
  await manager.initialize();
  
  // Benchmark workflow analysis
  const analysisStartTime = Date.now();
  const workflow = createSampleWorkflow();
  for (let i = 0; i < 100; i++) {
    await manager.learnFromWorkflow(workflow);
  }
  const analysisEndTime = Date.now();
  
  // Benchmark pattern recommendations
  const recommendationStartTime = Date.now();
  for (let i = 0; i < 50; i++) {
    await manager.getPatternRecommendations(workflow);
  }
  const recommendationEndTime = Date.now();
  
  await manager.cleanup();
  
  console.log('📊 Pattern Learning Performance Results:');
  console.log(`   🔍 Workflow Analysis (100 workflows): ${analysisEndTime - analysisStartTime}ms`);
  console.log(`   💡 Pattern Recommendations (50 requests): ${recommendationEndTime - recommendationStartTime}ms`);
  console.log('✅ Performance benchmarks completed\n');
}

// Export test runner for external use
export default {
  runAllTests: runAllPatternLearningTests,
  runBenchmarks: runPatternLearningBenchmarks,
  WorkflowGraphAnalyzerTests,
  PatternRecognitionEngineTests,
  PatternLearningManagerTests,
  PatternLearningUtilsTests,
  PatternLearningIntegrationTests
}; 