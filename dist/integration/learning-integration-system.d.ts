/**
 * Learning Integration System for n8n Workflow Automation Project
 *
 * This module implements comprehensive learning integration using event-driven patterns
 * to connect AI patterns, testing frameworks, and documentation systems with the
 * knowledge management system for continuous improvement.
 *
 * Key Features:
 * 1. Observer Pattern for decoupled event handling
 * 2. Event-Driven Architecture for real-time feedback
 * 3. Publisher/Subscriber pattern for broadcasting insights
 * 4. Automated learning from all system components
 * 5. Continuous improvement feedback loops
 */
import { EventEmitter } from 'events';
import { KnowledgeCategory, KnowledgeSource } from './knowledge-management-system';
import { KnowledgeStorageManager } from './knowledge-storage-system';
import { AIPerformanceMonitorClass } from './ai-integration-patterns';
import { TestResult, ValidationResult } from './testing-patterns';
import { N8nWorkflow } from '../types/n8n-workflow';
/**
 * Types of learning events that can be generated
 */
export declare enum LearningEventType {
    WORKFLOW_GENERATED = "workflow_generated",
    WORKFLOW_VALIDATED = "workflow_validated",
    WORKFLOW_EXECUTED = "workflow_executed",
    WORKFLOW_FAILED = "workflow_failed",
    AI_OPERATION_COMPLETED = "ai_operation_completed",
    AI_PATTERN_DISCOVERED = "ai_pattern_discovered",
    AI_PERFORMANCE_METRIC = "ai_performance_metric",
    AI_ERROR_ENCOUNTERED = "ai_error_encountered",
    TEST_COMPLETED = "test_completed",
    TEST_PATTERN_IDENTIFIED = "test_pattern_identified",
    VALIDATION_INSIGHT = "validation_insight",
    PERFORMANCE_BENCHMARK = "performance_benchmark",
    DOCUMENTATION_ACCESSED = "documentation_accessed",
    KNOWLEDGE_GAP_IDENTIFIED = "knowledge_gap_identified",
    USER_FEEDBACK_RECEIVED = "user_feedback_received",
    DOCUMENTATION_IMPROVED = "documentation_improved",
    INTEGRATION_SUCCESS = "integration_success",
    INTEGRATION_FAILURE = "integration_failure",
    PATTERN_REUSED = "pattern_reused",
    OPTIMIZATION_APPLIED = "optimization_applied"
}
/**
 * Core learning event structure
 */
export interface LearningEvent {
    id: string;
    type: LearningEventType;
    timestamp: Date;
    source: KnowledgeSource;
    category: KnowledgeCategory;
    data: any;
    context: LearningContext;
    confidence: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
}
/**
 * Context information for learning events
 */
export interface LearningContext {
    workflowId?: string;
    nodeTypes?: string[];
    operationType?: string;
    userId?: string;
    sessionId?: string;
    environment: 'development' | 'staging' | 'production';
    performance?: {
        executionTime: number;
        memoryUsage: number;
        cpuUsage: number;
    };
    metadata: Record<string, any>;
}
/**
 * Learning observer interface
 */
export interface LearningObserver {
    id: string;
    type: string;
    onLearningEvent(event: LearningEvent): Promise<void>;
    getObserverMetrics(): ObserverMetrics;
}
export interface ObserverMetrics {
    eventsProcessed: number;
    avgProcessingTime: number;
    errorRate: number;
    lastProcessed: Date;
}
/**
 * Learning insight generated from events
 */
export interface LearningInsight {
    id: string;
    type: 'pattern' | 'optimization' | 'issue' | 'trend';
    title: string;
    description: string;
    confidence: number;
    impact: 'low' | 'medium' | 'high';
    actionable: boolean;
    recommendations: string[];
    data: any;
    relatedEvents: string[];
    createdAt: Date;
}
/**
 * Central learning integration manager using Observer pattern
 */
export declare class LearningIntegrationManager extends EventEmitter {
    private observers;
    private eventBuffer;
    private processingQueue;
    private knowledgeStorage;
    private config;
    private insights;
    private metrics;
    private isProcessing;
    constructor(knowledgeStorage: KnowledgeStorageManager, config?: Partial<LearningIntegrationConfig>);
    /**
     * Register a learning observer
     */
    registerObserver(observer: LearningObserver): void;
    /**
     * Unregister a learning observer
     */
    unregisterObserver(observerId: string): void;
    /**
     * Emit a learning event to all observers
     */
    emitLearningEvent(event: LearningEvent): Promise<void>;
    /**
     * Process learning events and notify observers
     */
    private processEvent;
    /**
     * Notify individual observer with error handling
     */
    private notifyObserver;
    /**
     * Determine if observer should be notified for event
     */
    private shouldNotifyObserver;
    /**
     * Generate insights from learning events
     */
    private generateInsights;
    /**
     * Analyze event to generate insights
     */
    private analyzeEvent;
    /**
     * Analyze workflow execution for insights
     */
    private analyzeWorkflowExecution;
    /**
     * Analyze AI operation for insights
     */
    private analyzeAIOperation;
    /**
     * Analyze test results for insights
     */
    private analyzeTestResult;
    /**
     * Analyze validation results for insights
     */
    private analyzeValidationResult;
    /**
     * Store event-derived knowledge
     */
    private storeEventKnowledge;
    /**
     * Convert learning event to knowledge entry
     */
    private convertEventToKnowledge;
    /**
     * Create workflow knowledge from event
     */
    private createWorkflowKnowledge;
    /**
     * Create AI knowledge from event
     */
    private createAIKnowledge;
    /**
     * Create test knowledge from event
     */
    private createTestKnowledge;
    /**
     * Store insight as knowledge entry
     */
    private storeInsightAsKnowledge;
    /**
     * Set up event processing intervals
     */
    private setupEventProcessing;
    /**
     * Process events in batches
     */
    private processBatchEvents;
    /**
     * Clean up old insights
     */
    private cleanupOldInsights;
    /**
     * Get learning insights
     */
    getInsights(filter?: {
        type?: string;
        impact?: string;
        actionable?: boolean;
        limit?: number;
    }): LearningInsight[];
    /**
     * Get observer metrics
     */
    getObserverMetrics(): Map<string, ObserverMetrics>;
    /**
     * Get learning manager metrics
     */
    getManagerMetrics(): LearningManagerMetrics;
    private findCommonErrorPatterns;
    private updateAverage;
    private initializeMetrics;
}
/**
 * AI Learning Observer - learns from AI operations
 */
export declare class AILearningObserver implements LearningObserver {
    id: string;
    type: string;
    private metrics;
    private aiMonitor;
    constructor(aiMonitor: AIPerformanceMonitorClass);
    onLearningEvent(event: LearningEvent): Promise<void>;
    private processAIEvent;
    private updateMetrics;
    private updateAverage;
    getObserverMetrics(): ObserverMetrics;
}
/**
 * Testing Learning Observer - learns from test executions
 */
export declare class TestingLearningObserver implements LearningObserver {
    id: string;
    type: string;
    private metrics;
    private testPatterns;
    constructor();
    onLearningEvent(event: LearningEvent): Promise<void>;
    private processTestingEvent;
    private analyzeTestResult;
    private analyzeValidationResult;
    private updateMetrics;
    private updateAverage;
    getObserverMetrics(): ObserverMetrics;
    getTestPatterns(): Map<string, number>;
}
/**
 * Documentation Learning Observer - learns from documentation interactions
 */
export declare class DocumentationLearningObserver implements LearningObserver {
    id: string;
    type: string;
    private metrics;
    private knowledgeGaps;
    private accessPatterns;
    constructor();
    onLearningEvent(event: LearningEvent): Promise<void>;
    private processDocumentationEvent;
    private trackDocumentationAccess;
    private trackKnowledgeGap;
    private processUserFeedback;
    private updateMetrics;
    private updateAverage;
    getObserverMetrics(): ObserverMetrics;
    getKnowledgeGaps(): string[];
    getAccessPatterns(): Map<string, number>;
}
/**
 * Event generator for AI operations
 */
export declare class AIEventGenerator {
    private learningManager;
    constructor(learningManager: LearningIntegrationManager);
    generateAIOperationEvent(provider: string, model: string, tokens: number, cost: number, latency: number, success: boolean, context?: Partial<LearningContext>): Promise<void>;
    generateAIErrorEvent(provider: string, model: string, error: Error, context?: Partial<LearningContext>): Promise<void>;
}
/**
 * Event generator for testing operations
 */
export declare class TestingEventGenerator {
    private learningManager;
    constructor(learningManager: LearningIntegrationManager);
    generateTestCompletedEvent(testResult: TestResult, context?: Partial<LearningContext>): Promise<void>;
    generateValidationInsightEvent(validationResult: ValidationResult, workflow: N8nWorkflow, context?: Partial<LearningContext>): Promise<void>;
}
/**
 * Event generator for workflow operations
 */
export declare class WorkflowEventGenerator {
    private learningManager;
    constructor(learningManager: LearningIntegrationManager);
    generateWorkflowExecutedEvent(workflow: N8nWorkflow, performance: {
        executionTime: number;
        memoryUsage: number;
        cpuUsage: number;
    }, success: boolean, context?: Partial<LearningContext>): Promise<void>;
    generateWorkflowGeneratedEvent(workflow: N8nWorkflow, generationTime: number, context?: Partial<LearningContext>): Promise<void>;
}
export interface LearningIntegrationConfig {
    batchProcessingInterval: number;
    insightCleanupInterval: number;
    insightRetentionPeriod: number;
    maxBatchSize: number;
    enableInsightGeneration: boolean;
    enableKnowledgeStorage: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export declare const defaultLearningConfig: LearningIntegrationConfig;
export interface LearningManagerMetrics {
    eventsReceived: number;
    eventsProcessed: number;
    processingErrors: number;
    avgProcessingTime: number;
    insightsGenerated: number;
    observersRegistered: number;
    knowledgeEntriesCreated: number;
    startTime: Date;
}
/**
 * Factory class for setting up the complete learning integration system
 */
export declare class LearningIntegrationFactory {
    static create(knowledgeStorage: KnowledgeStorageManager, aiMonitor: AIPerformanceMonitorClass, config?: Partial<LearningIntegrationConfig>): {
        manager: LearningIntegrationManager;
        observers: {
            ai: AILearningObserver;
            testing: TestingLearningObserver;
            documentation: DocumentationLearningObserver;
        };
        generators: {
            ai: AIEventGenerator;
            testing: TestingEventGenerator;
            workflow: WorkflowEventGenerator;
        };
    };
}
//# sourceMappingURL=learning-integration-system.d.ts.map