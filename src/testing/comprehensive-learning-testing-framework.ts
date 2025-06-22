/**
 * Comprehensive Learning Testing Framework
 * 
 * This framework systematically collects, analyzes, and applies learnings from
 * workflow testing to continuously improve our n8n workflow generation system.
 * 
 * Key Features:
 * 1. Persistent storage of test results and patterns
 * 2. Automated pattern recognition across multiple test runs
 * 3. Integration with existing knowledge management system
 * 4. Systematic improvement suggestions and auto-application
 * 5. Version tracking and performance analytics
 */

import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
import { KnowledgeStorageManager } from '../integration/knowledge-storage-system';
import { LearningIntegrationManager, TestingEventGenerator } from '../integration/learning-integration-system';
import { 
  KnowledgeEntry, 
  KnowledgeType, 
  KnowledgeCategory, 
  KnowledgeSource,
  TestingFrameworkLearning 
} from '../integration/knowledge-management-system';
import { RealWorldTestingFramework } from './real-world-testing-framework';

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

export interface TestSession {
  id: string;
  timestamp: string;
  workflowName: string;
  workflowVersion: string;
  frameworkVersion: string;
  testResults: TestExecutionResult[];
  performanceMetrics: PerformanceMetrics;
  learningInsights: LearningInsight[];
  improvements: ImprovementSuggestion[];
}

export interface TestExecutionResult {
  stepName: string;
  stepType: 'http_request' | 'data_extraction' | 'validation' | 'processing' | 'error_handling';
  success: boolean;
  executionTime: number;
  errorDetails?: ErrorDetails;
  dataQuality?: DataQualityMetrics;
  consoleOutput: string[];
}

export interface PerformanceMetrics {
  totalExecutionTime: number;
  averageStepTime: number;
  successRate: number;
  dataExtractionEfficiency: number;
  errorRecoveryRate: number;
  resourceUtilization: ResourceMetrics;
}

export interface ResourceMetrics {
  memoryPeak: number;
  cpuAverage: number;
  networkRequests: number;
  networkLatency: number;
}

export interface ErrorDetails {
  errorType: string;
  errorMessage: string;
  errorCode?: string | number;
  context: any;
  recoverable: boolean;
  resolution?: string;
}

export interface DataQualityMetrics {
  completeness: number; // 0-1
  accuracy: number; // 0-1
  consistency: number; // 0-1
  validItems: number;
  totalItems: number;
  fieldCompleteness: Record<string, number>;
}

export interface LearningInsight {
  type: 'pattern' | 'optimization' | 'error_pattern' | 'improvement';
  category: string;
  description: string;
  confidence: number; // 0-1
  frequency: number; // How often this pattern occurs
  impact: 'high' | 'medium' | 'low';
  evidence: any[];
}

export interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'reliability' | 'usability' | 'automation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  expectedImpact: string;
  implementation: string;
  autoApplicable: boolean;
}

export interface LearningPattern {
  patternId: string;
  patternType: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  confidence: number;
  evidence: any[];
  relatedPatterns: string[];
}

// ============================================================================
// MAIN TESTING FRAMEWORK CLASS
// ============================================================================

export class ComprehensiveLearningTestingFramework extends EventEmitter {
  private knowledgeStorage: KnowledgeStorageManager;
  private learningManager: LearningIntegrationManager;
  private eventGenerator: TestingEventGenerator;
  private realWorldFramework: RealWorldTestingFramework;
  
  private testSessions: Map<string, TestSession> = new Map();
  private learningPatterns: Map<string, LearningPattern> = new Map();
  private currentSession?: TestSession;
  
  private readonly STORAGE_PATH: string;
  private readonly PATTERNS_PATH: string;
  private readonly REPORTS_PATH: string;

  constructor(
    private projectRoot: string,
    knowledgeStorage?: KnowledgeStorageManager,
    learningManager?: LearningIntegrationManager
  ) {
    super();
    
    // Initialize storage paths
    this.STORAGE_PATH = path.join(projectRoot, '.taskmaster', 'testing', 'sessions');
    this.PATTERNS_PATH = path.join(projectRoot, '.taskmaster', 'testing', 'patterns');
    this.REPORTS_PATH = path.join(projectRoot, '.taskmaster', 'testing', 'reports');
    
    // Initialize knowledge and learning systems
    this.knowledgeStorage = knowledgeStorage || new KnowledgeStorageManager({
      storageType: 'file',
      connectionString: path.join(projectRoot, '.taskmaster', 'knowledge'),
      enableCaching: true
    });
    
    this.learningManager = learningManager || new LearningIntegrationManager(this.knowledgeStorage);
    this.eventGenerator = new TestingEventGenerator(this.learningManager);
    this.realWorldFramework = new RealWorldTestingFramework(projectRoot);
    
    this.initializeFramework();
  }

  // ============================================================================
  // INITIALIZATION & SETUP
  // ============================================================================

  private async initializeFramework(): Promise<void> {
    try {
      // Create necessary directories
      await fs.mkdir(this.STORAGE_PATH, { recursive: true });
      await fs.mkdir(this.PATTERNS_PATH, { recursive: true });
      await fs.mkdir(this.REPORTS_PATH, { recursive: true });
      
      // Initialize knowledge storage
      await this.knowledgeStorage.initialize();
      
      // Load existing patterns
      await this.loadLearningPatterns();
      
      console.log('✅ Comprehensive Learning Testing Framework initialized');
    } catch (error) {
      console.error('❌ Framework initialization failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // TEST SESSION MANAGEMENT
  // ============================================================================

  async startTestSession(workflowName: string, workflowVersion: string): Promise<string> {
    const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentSession = {
      id: sessionId,
      timestamp: new Date().toISOString(),
      workflowName,
      workflowVersion,
      frameworkVersion: '2.0.0',
      testResults: [],
      performanceMetrics: this.initializePerformanceMetrics(),
      learningInsights: [],
      improvements: []
    };
    
    this.testSessions.set(sessionId, this.currentSession);
    
    // Generate learning event
    await this.eventGenerator.generateTestStartedEvent({
      testName: workflowName,
      testType: 'workflow_execution',
      timestamp: new Date().toISOString(),
      metadata: { sessionId, workflowVersion }
    });
    
    console.log(`🧪 Test session started: ${sessionId}`);
    return sessionId;
  }

  async recordTestStep(
    stepName: string, 
    stepType: TestExecutionResult['stepType'],
    success: boolean,
    executionTime: number,
    consoleOutput: string[],
    errorDetails?: ErrorDetails,
    dataQuality?: DataQualityMetrics
  ): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active test session');
    }

    const result: TestExecutionResult = {
      stepName,
      stepType,
      success,
      executionTime,
      consoleOutput,
      errorDetails,
      dataQuality
    };

    this.currentSession.testResults.push(result);
    this.updatePerformanceMetrics(result);

    // Generate real-time learning event
    await this.eventGenerator.generateTestStepCompletedEvent({
      testName: this.currentSession.workflowName,
      stepName,
      success,
      executionTime,
      timestamp: new Date().toISOString()
    });

    console.log(`📊 Recorded test step: ${stepName} (${success ? 'SUCCESS' : 'FAILED'})`);
  }

  async finishTestSession(): Promise<TestSession> {
    if (!this.currentSession) {
      throw new Error('No active test session');
    }

    // Finalize performance metrics
    this.finalizePerformanceMetrics();

    // Generate learning insights
    await this.generateLearningInsights();

    // Generate improvement suggestions
    await this.generateImprovementSuggestions();

    // Store session data persistently
    await this.storeTestSession();

    // Update learning patterns
    await this.updateLearningPatterns();

    // Generate completion event
    await this.eventGenerator.generateTestCompletedEvent({
      testName: this.currentSession.workflowName,
      passed: this.currentSession.performanceMetrics.successRate > 0.8,
      executionTime: this.currentSession.performanceMetrics.totalExecutionTime,
      timestamp: new Date().toISOString(),
      assertions: this.currentSession.testResults.length,
      errors: this.currentSession.testResults.filter(r => !r.success).length
    });

    const completedSession = { ...this.currentSession };
    this.currentSession = undefined;

    console.log(`✅ Test session completed: ${completedSession.id}`);
    console.log(`   Success Rate: ${(completedSession.performanceMetrics.successRate * 100).toFixed(1)}%`);
    console.log(`   Insights Generated: ${completedSession.learningInsights.length}`);
    console.log(`   Improvements Suggested: ${completedSession.improvements.length}`);

    return completedSession;
  }

  // ============================================================================
  // LEARNING & PATTERN RECOGNITION
  // ============================================================================

  private async generateLearningInsights(): Promise<void> {
    if (!this.currentSession) return;

    const insights: LearningInsight[] = [];
    const results = this.currentSession.testResults;

    // Performance patterns
    const slowSteps = results.filter(r => r.executionTime > 5000);
    if (slowSteps.length > 0) {
      insights.push({
        type: 'optimization',
        category: 'performance',
        description: `${slowSteps.length} steps took longer than 5 seconds`,
        confidence: 0.9,
        frequency: slowSteps.length,
        impact: 'high',
        evidence: slowSteps.map(s => ({ step: s.stepName, time: s.executionTime }))
      });
    }

    // Error patterns
    const errorSteps = results.filter(r => !r.success);
    if (errorSteps.length > 0) {
      const errorTypes = errorSteps.reduce((acc, step) => {
        const type = step.errorDetails?.errorType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      insights.push({
        type: 'error_pattern',
        category: 'reliability',
        description: `Common error types: ${Object.keys(errorTypes).join(', ')}`,
        confidence: 0.8,
        frequency: errorSteps.length,
        impact: 'high',
        evidence: errorTypes
      });
    }

    // Data quality patterns
    const dataSteps = results.filter(r => r.dataQuality);
    if (dataSteps.length > 0) {
      const avgCompleteness = dataSteps.reduce((sum, step) => 
        sum + (step.dataQuality!.completeness || 0), 0) / dataSteps.length;
      
      if (avgCompleteness < 0.8) {
        insights.push({
          type: 'pattern',
          category: 'data_quality',
          description: `Low data completeness: ${(avgCompleteness * 100).toFixed(1)}%`,
          confidence: 0.85,
          frequency: dataSteps.length,
          impact: 'medium',
          evidence: dataSteps.map(s => ({
            step: s.stepName,
            completeness: s.dataQuality!.completeness
          }))
        });
      }
    }

    this.currentSession.learningInsights = insights;

    // Store insights in knowledge system
    for (const insight of insights) {
      await this.storeInsightAsKnowledge(insight);
    }
  }

  private async generateImprovementSuggestions(): Promise<void> {
    if (!this.currentSession) return;

    const suggestions: ImprovementSuggestion[] = [];
    const insights = this.currentSession.learningInsights;

    // Generate suggestions based on insights
    for (const insight of insights) {
      switch (insight.type) {
        case 'optimization':
          if (insight.category === 'performance') {
            suggestions.push({
              id: `perf_${Date.now()}`,
              title: 'Optimize Slow Operations',
              description: `Optimize steps that take longer than 5 seconds: ${insight.evidence.map((e: any) => e.step).join(', ')}`,
              category: 'performance',
              priority: 'high',
              effort: 'medium',
              expectedImpact: `Reduce execution time by 30-50%`,
              implementation: 'Add timeout settings, implement parallel processing, optimize HTTP requests',
              autoApplicable: true
            });
          }
          break;

        case 'error_pattern':
          suggestions.push({
            id: `error_${Date.now()}`,
            title: 'Improve Error Handling',
            description: `Add robust error handling for: ${Object.keys(insight.evidence).join(', ')}`,
            category: 'reliability',
            priority: 'critical',
            effort: 'medium',
            expectedImpact: 'Reduce failure rate by 60-80%',
            implementation: 'Add try-catch blocks, implement retry logic, improve error messages',
            autoApplicable: true
          });
          break;

        case 'pattern':
          if (insight.category === 'data_quality') {
            suggestions.push({
              id: `data_${Date.now()}`,
              title: 'Enhance Data Validation',
              description: `Improve data completeness from ${(insight.confidence * 100).toFixed(1)}%`,
              category: 'reliability',
              priority: 'medium',
              effort: 'low',
              expectedImpact: 'Increase data quality to 90%+',
              implementation: 'Add fallback selectors, improve CSS selector robustness',
              autoApplicable: true
            });
          }
          break;
      }
    }

    this.currentSession.improvements = suggestions;
  }

  // ============================================================================
  // PATTERN LEARNING & STORAGE
  // ============================================================================

  private async updateLearningPatterns(): Promise<void> {
    if (!this.currentSession) return;

    for (const insight of this.currentSession.learningInsights) {
      const patternId = `${insight.type}_${insight.category}_${this.hashString(insight.description)}`;
      
      let pattern = this.learningPatterns.get(patternId);
      
      if (pattern) {
        // Update existing pattern
        pattern.occurrences++;
        pattern.lastSeen = new Date().toISOString();
        pattern.confidence = Math.min(1.0, pattern.confidence + 0.1);
        pattern.evidence.push({
          sessionId: this.currentSession.id,
          timestamp: new Date().toISOString(),
          evidence: insight.evidence
        });
      } else {
        // Create new pattern
        pattern = {
          patternId,
          patternType: `${insight.type}_${insight.category}`,
          occurrences: 1,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          confidence: insight.confidence,
          evidence: [{
            sessionId: this.currentSession.id,
            timestamp: new Date().toISOString(),
            evidence: insight.evidence
          }],
          relatedPatterns: []
        };
      }
      
      this.learningPatterns.set(patternId, pattern);
    }

    // Save patterns to disk
    await this.saveLearningPatterns();
  }

  // ============================================================================
  // PERSISTENCE & STORAGE
  // ============================================================================

  private async storeTestSession(): Promise<void> {
    if (!this.currentSession) return;

    const sessionPath = path.join(this.STORAGE_PATH, `${this.currentSession.id}.json`);
    await fs.writeFile(sessionPath, JSON.stringify(this.currentSession, null, 2));

    // Also store in knowledge system
    const knowledgeEntry: KnowledgeEntry = {
      id: `test_session_${this.currentSession.id}`,
      type: KnowledgeType.TESTING_PATTERN,
      category: KnowledgeCategory.TESTING,
      source: KnowledgeSource.AUTOMATED_TESTING,
      title: `Test Session: ${this.currentSession.workflowName}`,
      description: `Test session results for ${this.currentSession.workflowName} v${this.currentSession.workflowVersion}`,
      content: JSON.stringify(this.currentSession),
      metadata: {
        sessionId: this.currentSession.id,
        workflowName: this.currentSession.workflowName,
        successRate: this.currentSession.performanceMetrics.successRate,
        executionTime: this.currentSession.performanceMetrics.totalExecutionTime,
        insightCount: this.currentSession.learningInsights.length,
        improvementCount: this.currentSession.improvements.length
      },
      timestamp: new Date().toISOString(),
      tags: ['test-session', 'workflow-testing', this.currentSession.workflowName],
      version: '1.0'
    };

    await this.knowledgeStorage.store(knowledgeEntry);
  }

  private async storeInsightAsKnowledge(insight: LearningInsight): Promise<void> {
    const knowledgeEntry: KnowledgeEntry = {
      id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: KnowledgeType.LEARNING_INSIGHT,
      category: KnowledgeCategory.OPTIMIZATION,
      source: KnowledgeSource.AUTOMATED_ANALYSIS,
      title: `${insight.type}: ${insight.description}`,
      description: insight.description,
      content: JSON.stringify(insight),
      metadata: {
        insightType: insight.type,
        category: insight.category,
        confidence: insight.confidence,
        frequency: insight.frequency,
        impact: insight.impact
      },
      timestamp: new Date().toISOString(),
      tags: [insight.type, insight.category, 'learning-insight'],
      version: '1.0'
    };

    await this.knowledgeStorage.store(knowledgeEntry);
  }

  private async saveLearningPatterns(): Promise<void> {
    const patternsPath = path.join(this.PATTERNS_PATH, 'learning-patterns.json');
    const patternsArray = Array.from(this.learningPatterns.values());
    await fs.writeFile(patternsPath, JSON.stringify(patternsArray, null, 2));
  }

  private async loadLearningPatterns(): Promise<void> {
    try {
      const patternsPath = path.join(this.PATTERNS_PATH, 'learning-patterns.json');
      const patternsData = await fs.readFile(patternsPath, 'utf8');
      const patterns: LearningPattern[] = JSON.parse(patternsData);
      
      for (const pattern of patterns) {
        this.learningPatterns.set(pattern.patternId, pattern);
      }
      
      console.log(`📚 Loaded ${patterns.length} learning patterns`);
    } catch (error) {
      // File doesn't exist yet, that's ok
      console.log('📚 No existing learning patterns found, starting fresh');
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async generateAnalyticsReport(): Promise<any> {
    const sessions = Array.from(this.testSessions.values());
    const patterns = Array.from(this.learningPatterns.values());

    const report = {
      summary: {
        totalSessions: sessions.length,
        totalPatterns: patterns.length,
        averageSuccessRate: sessions.reduce((sum, s) => sum + s.performanceMetrics.successRate, 0) / sessions.length,
        totalImprovements: sessions.reduce((sum, s) => sum + s.improvements.length, 0),
        commonIssues: this.identifyCommonIssues(patterns)
      },
      trends: {
        performanceTrend: this.calculatePerformanceTrend(sessions),
        errorTrend: this.calculateErrorTrend(sessions),
        improvementImpact: this.calculateImprovementImpact(sessions)
      },
      recommendations: await this.generateSystemRecommendations()
    };

    // Save report
    const reportPath = path.join(this.REPORTS_PATH, `analytics-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      totalExecutionTime: 0,
      averageStepTime: 0,
      successRate: 0,
      dataExtractionEfficiency: 0,
      errorRecoveryRate: 0,
      resourceUtilization: {
        memoryPeak: 0,
        cpuAverage: 0,
        networkRequests: 0,
        networkLatency: 0
      }
    };
  }

  private updatePerformanceMetrics(result: TestExecutionResult): void {
    if (!this.currentSession) return;

    const metrics = this.currentSession.performanceMetrics;
    const results = this.currentSession.testResults;

    metrics.totalExecutionTime += result.executionTime;
    metrics.averageStepTime = metrics.totalExecutionTime / results.length;
    metrics.successRate = results.filter(r => r.success).length / results.length;

    if (result.dataQuality) {
      metrics.dataExtractionEfficiency = result.dataQuality.completeness;
    }
  }

  private finalizePerformanceMetrics(): void {
    if (!this.currentSession) return;

    const results = this.currentSession.testResults;
    const errorResults = results.filter(r => !r.success);
    
    // Calculate error recovery rate (how many errors were recoverable)
    const recoverableErrors = errorResults.filter(r => r.errorDetails?.recoverable).length;
    this.currentSession.performanceMetrics.errorRecoveryRate = 
      errorResults.length > 0 ? recoverableErrors / errorResults.length : 1.0;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private identifyCommonIssues(patterns: LearningPattern[]): any[] {
    return patterns
      .filter(p => p.occurrences >= 3)
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 5)
      .map(p => ({
        pattern: p.patternType,
        occurrences: p.occurrences,
        confidence: p.confidence
      }));
  }

  private calculatePerformanceTrend(sessions: TestSession[]): any {
    const sorted = sessions.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return {
      executionTimeImprovement: this.calculateTrendImprovement(
        sorted.map(s => s.performanceMetrics.totalExecutionTime)
      ),
      successRateImprovement: this.calculateTrendImprovement(
        sorted.map(s => s.performanceMetrics.successRate)
      )
    };
  }

  private calculateErrorTrend(sessions: TestSession[]): any {
    const sorted = sessions.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    return {
      errorRateReduction: this.calculateTrendImprovement(
        sorted.map(s => 1 - s.performanceMetrics.successRate)
      )
    };
  }

  private calculateImprovementImpact(sessions: TestSession[]): any {
    return {
      totalSuggestions: sessions.reduce((sum, s) => sum + s.improvements.length, 0),
      criticalSuggestions: sessions.reduce((sum, s) => 
        sum + s.improvements.filter(i => i.priority === 'critical').length, 0
      ),
      autoApplicableSuggestions: sessions.reduce((sum, s) => 
        sum + s.improvements.filter(i => i.autoApplicable).length, 0
      )
    };
  }

  private calculateTrendImprovement(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    return ((last - first) / first) * 100;
  }

  private async generateSystemRecommendations(): Promise<string[]> {
    const patterns = Array.from(this.learningPatterns.values());
    const recommendations = [];

    // Analyze patterns and generate system-level recommendations
    const performancePatterns = patterns.filter(p => p.patternType.includes('performance'));
    if (performancePatterns.length > 0) {
      recommendations.push('Consider implementing performance optimization patterns automatically');
    }

    const errorPatterns = patterns.filter(p => p.patternType.includes('error'));
    if (errorPatterns.length > 0) {
      recommendations.push('Enhance error handling in workflow generation');
    }

    return recommendations;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  async getCurrentSession(): Promise<TestSession | undefined> {
    return this.currentSession;
  }

  async getTestSessions(): Promise<TestSession[]> {
    return Array.from(this.testSessions.values());
  }

  async getLearningPatterns(): Promise<LearningPattern[]> {
    return Array.from(this.learningPatterns.values());
  }

  async getImprovementSuggestions(): Promise<ImprovementSuggestion[]> {
    const sessions = Array.from(this.testSessions.values());
    return sessions.flatMap(s => s.improvements);
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

export function createComprehensiveLearningTestingFramework(
  projectRoot: string,
  knowledgeStorage?: KnowledgeStorageManager,
  learningManager?: LearningIntegrationManager
): ComprehensiveLearningTestingFramework {
  return new ComprehensiveLearningTestingFramework(projectRoot, knowledgeStorage, learningManager);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  TestSession,
  TestExecutionResult,
  PerformanceMetrics,
  LearningInsight,
  ImprovementSuggestion,
  LearningPattern
}; 