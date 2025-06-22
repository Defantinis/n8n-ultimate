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
import { KnowledgeStorageManager } from '../integration/knowledge-storage-system.js';
import { LearningIntegrationManager } from '../integration/learning-integration-system.js';
import { PerformanceMetrics } from '../integration/testing-patterns.js';
interface TestSession {
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
interface TestExecutionResult {
    stepName: string;
    stepType: 'http_request' | 'data_extraction' | 'validation' | 'processing' | 'error_handling';
    success: boolean;
    executionTime: number;
    errorDetails?: ErrorDetails;
    dataQuality?: DataQualityMetrics;
    consoleOutput: string[];
}
interface ErrorDetails {
    errorType: string;
    errorMessage: string;
    errorCode?: string | number;
    context: any;
    recoverable: boolean;
    resolution?: string;
}
interface DataQualityMetrics {
    completeness: number;
    accuracy: number;
    consistency: number;
    validItems: number;
    totalItems: number;
    fieldCompleteness: Record<string, number>;
}
interface LearningInsight {
    type: 'pattern' | 'optimization' | 'error_pattern' | 'improvement';
    category: string;
    description: string;
    confidence: number;
    frequency: number;
    impact: 'high' | 'medium' | 'low';
    evidence: any[];
}
interface ImprovementSuggestion {
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
interface LearningPattern {
    patternId: string;
    patternType: string;
    occurrences: number;
    firstSeen: string;
    lastSeen: string;
    confidence: number;
    evidence: any[];
    relatedPatterns: string[];
}
export declare class ComprehensiveLearningTestingFramework extends EventEmitter {
    private projectRoot;
    private knowledgeStorage;
    private learningManager;
    private eventGenerator;
    private realWorldFramework;
    private testSessions;
    private learningPatterns;
    private currentSession?;
    private readonly STORAGE_PATH;
    private readonly PATTERNS_PATH;
    private readonly REPORTS_PATH;
    constructor(projectRoot: string, knowledgeStorage?: KnowledgeStorageManager, learningManager?: LearningIntegrationManager);
    private initializeFramework;
    startTestSession(workflowName: string, workflowVersion: string): Promise<string>;
    recordTestStep(stepName: string, stepType: TestExecutionResult['stepType'], success: boolean, executionTime: number, consoleOutput: string[], errorDetails?: ErrorDetails, dataQuality?: DataQualityMetrics): Promise<void>;
    finishTestSession(): Promise<TestSession>;
    private generateLearningInsights;
    private generateImprovementSuggestions;
    private updateLearningPatterns;
    private storeTestSession;
    private storeInsightAsKnowledge;
    private saveLearningPatterns;
    private loadLearningPatterns;
    generateAnalyticsReport(): Promise<any>;
    private initializePerformanceMetrics;
    private updatePerformanceMetrics;
    private finalizePerformanceMetrics;
    private hashString;
    private identifyCommonIssues;
    private calculatePerformanceTrend;
    private calculateErrorTrend;
    private calculateImprovementImpact;
    private calculateTrendImprovement;
    private generateSystemRecommendations;
    getCurrentSession(): Promise<TestSession | undefined>;
    getTestSessions(): Promise<TestSession[]>;
    getLearningPatterns(): Promise<LearningPattern[]>;
    getImprovementSuggestions(): Promise<ImprovementSuggestion[]>;
}
export declare function createComprehensiveLearningTestingFramework(projectRoot: string, knowledgeStorage?: KnowledgeStorageManager, learningManager?: LearningIntegrationManager): ComprehensiveLearningTestingFramework;
export { TestSession, TestExecutionResult, PerformanceMetrics, LearningInsight, ImprovementSuggestion, LearningPattern };
//# sourceMappingURL=comprehensive-learning-testing-framework.d.ts.map