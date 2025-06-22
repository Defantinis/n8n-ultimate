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
import { KnowledgeType, KnowledgeCategory, KnowledgeSource } from './knowledge-management-system';
// ============================================================================
// CORE LEARNING EVENTS AND INTERFACES
// ============================================================================
/**
 * Types of learning events that can be generated
 */
export var LearningEventType;
(function (LearningEventType) {
    // Workflow Events
    LearningEventType["WORKFLOW_GENERATED"] = "workflow_generated";
    LearningEventType["WORKFLOW_VALIDATED"] = "workflow_validated";
    LearningEventType["WORKFLOW_EXECUTED"] = "workflow_executed";
    LearningEventType["WORKFLOW_FAILED"] = "workflow_failed";
    // AI Events
    LearningEventType["AI_OPERATION_COMPLETED"] = "ai_operation_completed";
    LearningEventType["AI_PATTERN_DISCOVERED"] = "ai_pattern_discovered";
    LearningEventType["AI_PERFORMANCE_METRIC"] = "ai_performance_metric";
    LearningEventType["AI_ERROR_ENCOUNTERED"] = "ai_error_encountered";
    // Testing Events
    LearningEventType["TEST_COMPLETED"] = "test_completed";
    LearningEventType["TEST_PATTERN_IDENTIFIED"] = "test_pattern_identified";
    LearningEventType["VALIDATION_INSIGHT"] = "validation_insight";
    LearningEventType["PERFORMANCE_BENCHMARK"] = "performance_benchmark";
    // Documentation Events
    LearningEventType["DOCUMENTATION_ACCESSED"] = "documentation_accessed";
    LearningEventType["KNOWLEDGE_GAP_IDENTIFIED"] = "knowledge_gap_identified";
    LearningEventType["USER_FEEDBACK_RECEIVED"] = "user_feedback_received";
    LearningEventType["DOCUMENTATION_IMPROVED"] = "documentation_improved";
    // Integration Events
    LearningEventType["INTEGRATION_SUCCESS"] = "integration_success";
    LearningEventType["INTEGRATION_FAILURE"] = "integration_failure";
    LearningEventType["PATTERN_REUSED"] = "pattern_reused";
    LearningEventType["OPTIMIZATION_APPLIED"] = "optimization_applied";
})(LearningEventType || (LearningEventType = {}));
// ============================================================================
// EVENT-DRIVEN LEARNING MANAGER
// ============================================================================
/**
 * Central learning integration manager using Observer pattern
 */
export class LearningIntegrationManager extends EventEmitter {
    observers = new Map();
    eventBuffer = [];
    processingQueue = [];
    knowledgeStorage;
    config;
    insights = new Map();
    metrics;
    isProcessing = false;
    constructor(knowledgeStorage, config = {}) {
        super();
        this.knowledgeStorage = knowledgeStorage;
        this.config = { ...defaultLearningConfig, ...config };
        this.metrics = this.initializeMetrics();
        // Set up event processing intervals
        this.setupEventProcessing();
    }
    /**
     * Register a learning observer
     */
    registerObserver(observer) {
        this.observers.set(observer.id, observer);
        this.emit('observer_registered', { observerId: observer.id, type: observer.type });
    }
    /**
     * Unregister a learning observer
     */
    unregisterObserver(observerId) {
        if (this.observers.delete(observerId)) {
            this.emit('observer_unregistered', { observerId });
        }
    }
    /**
     * Emit a learning event to all observers
     */
    async emitLearningEvent(event) {
        // Add to buffer for batch processing
        this.eventBuffer.push(event);
        this.metrics.eventsReceived++;
        // Process immediately if high priority
        if (event.priority === 'critical' || event.priority === 'high') {
            await this.processEvent(event);
        }
        // Emit to system listeners
        this.emit('learning_event', event);
    }
    /**
     * Process learning events and notify observers
     */
    async processEvent(event) {
        const startTime = Date.now();
        try {
            // Notify all relevant observers
            const promises = Array.from(this.observers.values())
                .filter(observer => this.shouldNotifyObserver(observer, event))
                .map(observer => this.notifyObserver(observer, event));
            await Promise.allSettled(promises);
            // Generate insights from event
            await this.generateInsights(event);
            // Store event-derived knowledge
            await this.storeEventKnowledge(event);
            this.metrics.eventsProcessed++;
            this.metrics.avgProcessingTime = this.updateAverage(this.metrics.avgProcessingTime, Date.now() - startTime, this.metrics.eventsProcessed);
        }
        catch (error) {
            this.metrics.processingErrors++;
            this.emit('processing_error', { event, error });
        }
    }
    /**
     * Notify individual observer with error handling
     */
    async notifyObserver(observer, event) {
        try {
            await observer.onLearningEvent(event);
        }
        catch (error) {
            this.emit('observer_error', { observerId: observer.id, event, error });
        }
    }
    /**
     * Determine if observer should be notified for event
     */
    shouldNotifyObserver(observer, event) {
        // AI observer should get AI-related events
        if (observer.type === 'ai' && event.source === KnowledgeSource.AI_PATTERNS) {
            return true;
        }
        // Testing observer should get testing-related events
        if (observer.type === 'testing' && event.source === KnowledgeSource.TESTING_FRAMEWORK) {
            return true;
        }
        // Documentation observer should get doc-related events
        if (observer.type === 'documentation' && event.source === KnowledgeSource.DOCUMENTATION_SYSTEM) {
            return true;
        }
        // General observers get all events
        if (observer.type === 'general') {
            return true;
        }
        return false;
    }
    /**
     * Generate insights from learning events
     */
    async generateInsights(event) {
        const insights = await this.analyzeEvent(event);
        for (const insight of insights) {
            this.insights.set(insight.id, insight);
            this.emit('insight_generated', insight);
            // Store high-impact insights as knowledge
            if (insight.impact === 'high' && insight.actionable) {
                await this.storeInsightAsKnowledge(insight);
            }
        }
    }
    /**
     * Analyze event to generate insights
     */
    async analyzeEvent(event) {
        const insights = [];
        switch (event.type) {
            case LearningEventType.WORKFLOW_EXECUTED:
                insights.push(...await this.analyzeWorkflowExecution(event));
                break;
            case LearningEventType.AI_OPERATION_COMPLETED:
                insights.push(...await this.analyzeAIOperation(event));
                break;
            case LearningEventType.TEST_COMPLETED:
                insights.push(...await this.analyzeTestResult(event));
                break;
            case LearningEventType.VALIDATION_INSIGHT:
                insights.push(...await this.analyzeValidationResult(event));
                break;
        }
        return insights;
    }
    /**
     * Analyze workflow execution for insights
     */
    async analyzeWorkflowExecution(event) {
        const insights = [];
        const { performance, workflow } = event.data;
        // Performance insight
        if (performance && performance.executionTime > 5000) { // >5 seconds
            insights.push({
                id: `perf-${event.id}`,
                type: 'optimization',
                title: 'Slow Workflow Execution Detected',
                description: `Workflow executed in ${performance.executionTime}ms, consider optimization`,
                confidence: 0.8,
                impact: 'medium',
                actionable: true,
                recommendations: [
                    'Review node configurations for performance bottlenecks',
                    'Consider caching frequently accessed data',
                    'Optimize data transformations'
                ],
                data: { performance, workflow },
                relatedEvents: [event.id],
                createdAt: new Date()
            });
        }
        return insights;
    }
    /**
     * Analyze AI operation for insights
     */
    async analyzeAIOperation(event) {
        const insights = [];
        const { provider, model, tokens, cost, latency, success } = event.data;
        // Cost optimization insight
        if (cost > 0.1) { // High cost operation
            insights.push({
                id: `cost-${event.id}`,
                type: 'optimization',
                title: 'High AI Operation Cost',
                description: `AI operation cost $${cost.toFixed(4)}, consider optimization`,
                confidence: 0.9,
                impact: 'medium',
                actionable: true,
                recommendations: [
                    'Consider using a more cost-effective model',
                    'Implement response caching',
                    'Optimize prompt length'
                ],
                data: { provider, model, tokens, cost },
                relatedEvents: [event.id],
                createdAt: new Date()
            });
        }
        return insights;
    }
    /**
     * Analyze test results for insights
     */
    async analyzeTestResult(event) {
        const insights = [];
        const testResult = event.data.testResult;
        // Test failure pattern insight
        if (testResult.status === 'failed' && testResult.errors.length > 0) {
            insights.push({
                id: `test-fail-${event.id}`,
                type: 'issue',
                title: 'Test Failure Pattern Detected',
                description: `Test ${testResult.name} failed with ${testResult.errors.length} errors`,
                confidence: 0.9,
                impact: 'high',
                actionable: true,
                recommendations: [
                    'Review test assertions for accuracy',
                    'Check workflow configuration',
                    'Validate input data formats'
                ],
                data: { testResult },
                relatedEvents: [event.id],
                createdAt: new Date()
            });
        }
        return insights;
    }
    /**
     * Analyze validation results for insights
     */
    async analyzeValidationResult(event) {
        const insights = [];
        const validationResult = event.data.validationResult;
        // Validation pattern insight
        if (validationResult.errors.length > 0) {
            const commonErrors = this.findCommonErrorPatterns(validationResult.errors);
            for (const pattern of commonErrors) {
                insights.push({
                    id: `validation-${event.id}-${pattern.code}`,
                    type: 'pattern',
                    title: `Common Validation Error: ${pattern.code}`,
                    description: `Validation error "${pattern.code}" occurs frequently`,
                    confidence: 0.8,
                    impact: 'medium',
                    actionable: true,
                    recommendations: [
                        'Create validation rule template',
                        'Add to workflow generation best practices',
                        'Update documentation'
                    ],
                    data: { pattern, validationResult },
                    relatedEvents: [event.id],
                    createdAt: new Date()
                });
            }
        }
        return insights;
    }
    /**
     * Store event-derived knowledge
     */
    async storeEventKnowledge(event) {
        const knowledge = this.convertEventToKnowledge(event);
        if (knowledge) {
            await this.knowledgeStorage.create(knowledge);
        }
    }
    /**
     * Convert learning event to knowledge entry
     */
    convertEventToKnowledge(event) {
        switch (event.type) {
            case LearningEventType.WORKFLOW_EXECUTED:
                return this.createWorkflowKnowledge(event);
            case LearningEventType.AI_OPERATION_COMPLETED:
                return this.createAIKnowledge(event);
            case LearningEventType.TEST_COMPLETED:
                return this.createTestKnowledge(event);
            default:
                return null;
        }
    }
    /**
     * Create workflow knowledge from event
     */
    createWorkflowKnowledge(event) {
        const { workflow, performance } = event.data;
        return {
            id: `workflow-${event.id}`,
            timestamp: event.timestamp,
            type: KnowledgeType.WORKFLOW_PATTERN,
            category: KnowledgeCategory.WORKFLOW_GENERATION,
            title: `Workflow Execution: ${workflow.name}`,
            description: `Learned from workflow execution with ${performance.executionTime}ms runtime`,
            metadata: {
                workflow,
                performance,
                context: event.context
            },
            tags: ['workflow', 'execution', 'performance'],
            source: event.source,
            confidence: event.confidence,
            usageCount: 0,
            lastAccessed: new Date()
        };
    }
    /**
     * Create AI knowledge from event
     */
    createAIKnowledge(event) {
        const { provider, model, tokens, cost, latency } = event.data;
        return {
            id: `ai-${event.id}`,
            timestamp: event.timestamp,
            type: KnowledgeType.PERFORMANCE_METRIC,
            category: KnowledgeCategory.AI_INTEGRATION,
            title: `AI Operation: ${provider} ${model}`,
            description: `AI operation performance metrics`,
            metadata: {
                provider,
                model,
                tokens,
                cost,
                latency,
                context: event.context
            },
            tags: ['ai', 'performance', 'cost'],
            source: event.source,
            confidence: event.confidence,
            usageCount: 0,
            lastAccessed: new Date()
        };
    }
    /**
     * Create test knowledge from event
     */
    createTestKnowledge(event) {
        const { testResult } = event.data;
        return {
            id: `test-${event.id}`,
            timestamp: event.timestamp,
            type: KnowledgeType.BEST_PRACTICE,
            category: KnowledgeCategory.TESTING,
            title: `Test Result: ${testResult.name}`,
            description: `Test execution results and insights`,
            metadata: {
                testResult,
                context: event.context
            },
            tags: ['testing', 'validation', 'quality'],
            source: event.source,
            confidence: event.confidence,
            usageCount: 0,
            lastAccessed: new Date()
        };
    }
    /**
     * Store insight as knowledge entry
     */
    async storeInsightAsKnowledge(insight) {
        const knowledge = {
            id: `insight-${insight.id}`,
            timestamp: insight.createdAt,
            type: KnowledgeType.SYSTEM_INSIGHT,
            category: KnowledgeCategory.PERFORMANCE,
            title: insight.title,
            description: insight.description,
            metadata: {
                insight,
                recommendations: insight.recommendations
            },
            tags: ['insight', 'automated', insight.type],
            source: KnowledgeSource.PERFORMANCE_MONITOR,
            confidence: insight.confidence,
            usageCount: 0,
            lastAccessed: new Date()
        };
        await this.knowledgeStorage.create(knowledge);
    }
    /**
     * Set up event processing intervals
     */
    setupEventProcessing() {
        // Process buffered events every 5 seconds
        setInterval(() => {
            this.processBatchEvents();
        }, this.config.batchProcessingInterval);
        // Clean up old insights every hour
        setInterval(() => {
            this.cleanupOldInsights();
        }, this.config.insightCleanupInterval);
    }
    /**
     * Process events in batches
     */
    async processBatchEvents() {
        if (this.isProcessing || this.eventBuffer.length === 0) {
            return;
        }
        this.isProcessing = true;
        try {
            const eventsToProcess = this.eventBuffer.splice(0, this.config.maxBatchSize);
            for (const event of eventsToProcess) {
                if (event.priority !== 'critical' && event.priority !== 'high') {
                    await this.processEvent(event);
                }
            }
        }
        finally {
            this.isProcessing = false;
        }
    }
    /**
     * Clean up old insights
     */
    cleanupOldInsights() {
        const cutoffDate = new Date(Date.now() - this.config.insightRetentionPeriod);
        for (const [id, insight] of this.insights.entries()) {
            if (insight.createdAt < cutoffDate) {
                this.insights.delete(id);
            }
        }
    }
    /**
     * Get learning insights
     */
    getInsights(filter) {
        let insights = Array.from(this.insights.values());
        if (filter) {
            if (filter.type) {
                insights = insights.filter(i => i.type === filter.type);
            }
            if (filter.impact) {
                insights = insights.filter(i => i.impact === filter.impact);
            }
            if (filter.actionable !== undefined) {
                insights = insights.filter(i => i.actionable === filter.actionable);
            }
            if (filter.limit) {
                insights = insights.slice(0, filter.limit);
            }
        }
        return insights.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    /**
     * Get observer metrics
     */
    getObserverMetrics() {
        const metrics = new Map();
        for (const [id, observer] of this.observers.entries()) {
            metrics.set(id, observer.getObserverMetrics());
        }
        return metrics;
    }
    /**
     * Get learning manager metrics
     */
    getManagerMetrics() {
        return { ...this.metrics };
    }
    // Helper methods
    findCommonErrorPatterns(errors) {
        // Implementation to identify common error patterns
        const errorMap = new Map();
        errors.forEach(error => {
            const count = errorMap.get(error.code) || 0;
            errorMap.set(error.code, count + 1);
        });
        return Array.from(errorMap.entries())
            .filter(([_, count]) => count > 1)
            .map(([code, count]) => ({ code, count }));
    }
    updateAverage(currentAvg, newValue, count) {
        return ((currentAvg * (count - 1)) + newValue) / count;
    }
    initializeMetrics() {
        return {
            eventsReceived: 0,
            eventsProcessed: 0,
            processingErrors: 0,
            avgProcessingTime: 0,
            insightsGenerated: 0,
            observersRegistered: 0,
            knowledgeEntriesCreated: 0,
            startTime: new Date()
        };
    }
}
// ============================================================================
// LEARNING OBSERVERS
// ============================================================================
/**
 * AI Learning Observer - learns from AI operations
 */
export class AILearningObserver {
    id = 'ai-observer';
    type = 'ai';
    metrics;
    aiMonitor;
    constructor(aiMonitor) {
        this.aiMonitor = aiMonitor;
        this.metrics = {
            eventsProcessed: 0,
            avgProcessingTime: 0,
            errorRate: 0,
            lastProcessed: new Date()
        };
    }
    async onLearningEvent(event) {
        const startTime = Date.now();
        try {
            if (event.source === KnowledgeSource.AI_PATTERNS) {
                await this.processAIEvent(event);
            }
            this.updateMetrics(Date.now() - startTime, true);
        }
        catch (error) {
            this.updateMetrics(Date.now() - startTime, false);
            throw error;
        }
    }
    async processAIEvent(event) {
        switch (event.type) {
            case LearningEventType.AI_OPERATION_COMPLETED:
                const { provider, model, tokens, cost, latency, success } = event.data;
                this.aiMonitor.trackAIOperation(provider, model, tokens, cost, latency, success);
                break;
            case LearningEventType.AI_PERFORMANCE_METRIC:
                // Process AI performance metrics
                break;
        }
    }
    updateMetrics(processingTime, success) {
        this.metrics.eventsProcessed++;
        this.metrics.avgProcessingTime = this.updateAverage(this.metrics.avgProcessingTime, processingTime, this.metrics.eventsProcessed);
        if (!success) {
            this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.eventsProcessed - 1) + 1) / this.metrics.eventsProcessed;
        }
        this.metrics.lastProcessed = new Date();
    }
    updateAverage(currentAvg, newValue, count) {
        return ((currentAvg * (count - 1)) + newValue) / count;
    }
    getObserverMetrics() {
        return { ...this.metrics };
    }
}
/**
 * Testing Learning Observer - learns from test executions
 */
export class TestingLearningObserver {
    id = 'testing-observer';
    type = 'testing';
    metrics;
    testPatterns = new Map();
    constructor() {
        this.metrics = {
            eventsProcessed: 0,
            avgProcessingTime: 0,
            errorRate: 0,
            lastProcessed: new Date()
        };
    }
    async onLearningEvent(event) {
        const startTime = Date.now();
        try {
            if (event.source === KnowledgeSource.TESTING_FRAMEWORK) {
                await this.processTestingEvent(event);
            }
            this.updateMetrics(Date.now() - startTime, true);
        }
        catch (error) {
            this.updateMetrics(Date.now() - startTime, false);
            throw error;
        }
    }
    async processTestingEvent(event) {
        switch (event.type) {
            case LearningEventType.TEST_COMPLETED:
                await this.analyzeTestResult(event.data.testResult);
                break;
            case LearningEventType.VALIDATION_INSIGHT:
                await this.analyzeValidationResult(event.data.validationResult);
                break;
        }
    }
    async analyzeTestResult(testResult) {
        // Track test patterns
        const pattern = `${testResult.status}-${testResult.errors.length > 0 ? 'with-errors' : 'clean'}`;
        const count = this.testPatterns.get(pattern) || 0;
        this.testPatterns.set(pattern, count + 1);
    }
    async analyzeValidationResult(validationResult) {
        // Track validation patterns
        const pattern = `validation-score-${Math.floor(validationResult.score / 10) * 10}`;
        const count = this.testPatterns.get(pattern) || 0;
        this.testPatterns.set(pattern, count + 1);
    }
    updateMetrics(processingTime, success) {
        this.metrics.eventsProcessed++;
        this.metrics.avgProcessingTime = this.updateAverage(this.metrics.avgProcessingTime, processingTime, this.metrics.eventsProcessed);
        if (!success) {
            this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.eventsProcessed - 1) + 1) / this.metrics.eventsProcessed;
        }
        this.metrics.lastProcessed = new Date();
    }
    updateAverage(currentAvg, newValue, count) {
        return ((currentAvg * (count - 1)) + newValue) / count;
    }
    getObserverMetrics() {
        return { ...this.metrics };
    }
    getTestPatterns() {
        return new Map(this.testPatterns);
    }
}
/**
 * Documentation Learning Observer - learns from documentation interactions
 */
export class DocumentationLearningObserver {
    id = 'documentation-observer';
    type = 'documentation';
    metrics;
    knowledgeGaps = new Set();
    accessPatterns = new Map();
    constructor() {
        this.metrics = {
            eventsProcessed: 0,
            avgProcessingTime: 0,
            errorRate: 0,
            lastProcessed: new Date()
        };
    }
    async onLearningEvent(event) {
        const startTime = Date.now();
        try {
            if (event.source === KnowledgeSource.DOCUMENTATION_SYSTEM) {
                await this.processDocumentationEvent(event);
            }
            this.updateMetrics(Date.now() - startTime, true);
        }
        catch (error) {
            this.updateMetrics(Date.now() - startTime, false);
            throw error;
        }
    }
    async processDocumentationEvent(event) {
        switch (event.type) {
            case LearningEventType.DOCUMENTATION_ACCESSED:
                this.trackDocumentationAccess(event.data.resource);
                break;
            case LearningEventType.KNOWLEDGE_GAP_IDENTIFIED:
                this.trackKnowledgeGap(event.data.gap);
                break;
            case LearningEventType.USER_FEEDBACK_RECEIVED:
                await this.processUserFeedback(event.data.feedback);
                break;
        }
    }
    trackDocumentationAccess(resource) {
        const count = this.accessPatterns.get(resource) || 0;
        this.accessPatterns.set(resource, count + 1);
    }
    trackKnowledgeGap(gap) {
        this.knowledgeGaps.add(gap);
    }
    async processUserFeedback(feedback) {
        // Process user feedback for documentation improvements
        if (feedback.type === 'missing_info') {
            this.knowledgeGaps.add(feedback.topic);
        }
    }
    updateMetrics(processingTime, success) {
        this.metrics.eventsProcessed++;
        this.metrics.avgProcessingTime = this.updateAverage(this.metrics.avgProcessingTime, processingTime, this.metrics.eventsProcessed);
        if (!success) {
            this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.eventsProcessed - 1) + 1) / this.metrics.eventsProcessed;
        }
        this.metrics.lastProcessed = new Date();
    }
    updateAverage(currentAvg, newValue, count) {
        return ((currentAvg * (count - 1)) + newValue) / count;
    }
    getObserverMetrics() {
        return { ...this.metrics };
    }
    getKnowledgeGaps() {
        return Array.from(this.knowledgeGaps);
    }
    getAccessPatterns() {
        return new Map(this.accessPatterns);
    }
}
// ============================================================================
// LEARNING EVENT GENERATORS
// ============================================================================
/**
 * Event generator for AI operations
 */
export class AIEventGenerator {
    learningManager;
    constructor(learningManager) {
        this.learningManager = learningManager;
    }
    async generateAIOperationEvent(provider, model, tokens, cost, latency, success, context = {}) {
        const event = {
            id: `ai-op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: LearningEventType.AI_OPERATION_COMPLETED,
            timestamp: new Date(),
            source: KnowledgeSource.AI_PATTERNS,
            category: KnowledgeCategory.AI_INTEGRATION,
            data: { provider, model, tokens, cost, latency, success },
            context: {
                environment: 'development',
                metadata: {},
                ...context
            },
            confidence: 0.9,
            priority: cost > 0.1 ? 'high' : 'medium',
            tags: ['ai', 'performance', 'cost']
        };
        await this.learningManager.emitLearningEvent(event);
    }
    async generateAIErrorEvent(provider, model, error, context = {}) {
        const event = {
            id: `ai-error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: LearningEventType.AI_ERROR_ENCOUNTERED,
            timestamp: new Date(),
            source: KnowledgeSource.AI_PATTERNS,
            category: KnowledgeCategory.AI_INTEGRATION,
            data: { provider, model, error: error.message, stack: error.stack },
            context: {
                environment: 'development',
                metadata: {},
                ...context
            },
            confidence: 1.0,
            priority: 'high',
            tags: ['ai', 'error', 'failure']
        };
        await this.learningManager.emitLearningEvent(event);
    }
}
/**
 * Event generator for testing operations
 */
export class TestingEventGenerator {
    learningManager;
    constructor(learningManager) {
        this.learningManager = learningManager;
    }
    async generateTestCompletedEvent(testResult, context = {}) {
        const event = {
            id: `test-${testResult.id}-${Date.now()}`,
            type: LearningEventType.TEST_COMPLETED,
            timestamp: new Date(),
            source: KnowledgeSource.TESTING_FRAMEWORK,
            category: KnowledgeCategory.TESTING,
            data: { testResult },
            context: {
                environment: 'development',
                metadata: {},
                ...context
            },
            confidence: 0.95,
            priority: testResult.status === 'failed' ? 'high' : 'medium',
            tags: ['testing', 'validation', testResult.status]
        };
        await this.learningManager.emitLearningEvent(event);
    }
    async generateValidationInsightEvent(validationResult, workflow, context = {}) {
        const event = {
            id: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: LearningEventType.VALIDATION_INSIGHT,
            timestamp: new Date(),
            source: KnowledgeSource.VALIDATION_SYSTEM,
            category: KnowledgeCategory.TESTING,
            data: { validationResult, workflow },
            context: {
                environment: 'development',
                workflowId: workflow.id,
                metadata: {},
                ...context
            },
            confidence: 0.9,
            priority: validationResult.errors.length > 0 ? 'high' : 'medium',
            tags: ['validation', 'workflow', 'quality']
        };
        await this.learningManager.emitLearningEvent(event);
    }
}
/**
 * Event generator for workflow operations
 */
export class WorkflowEventGenerator {
    learningManager;
    constructor(learningManager) {
        this.learningManager = learningManager;
    }
    async generateWorkflowExecutedEvent(workflow, performance, success, context = {}) {
        const event = {
            id: `workflow-exec-${workflow.id}-${Date.now()}`,
            type: LearningEventType.WORKFLOW_EXECUTED,
            timestamp: new Date(),
            source: KnowledgeSource.WORKFLOW_GENERATOR,
            category: KnowledgeCategory.WORKFLOW_GENERATION,
            data: { workflow, performance, success },
            context: {
                environment: 'development',
                workflowId: workflow.id,
                nodeTypes: Object.values(workflow.nodes).map(n => n.type),
                metadata: {},
                performance,
                ...context
            },
            confidence: 0.9,
            priority: performance.executionTime > 10000 ? 'high' : 'medium',
            tags: ['workflow', 'execution', 'performance']
        };
        await this.learningManager.emitLearningEvent(event);
    }
    async generateWorkflowGeneratedEvent(workflow, generationTime, context = {}) {
        const event = {
            id: `workflow-gen-${workflow.id}-${Date.now()}`,
            type: LearningEventType.WORKFLOW_GENERATED,
            timestamp: new Date(),
            source: KnowledgeSource.WORKFLOW_GENERATOR,
            category: KnowledgeCategory.WORKFLOW_GENERATION,
            data: { workflow, generationTime },
            context: {
                environment: 'development',
                workflowId: workflow.id,
                nodeTypes: Object.values(workflow.nodes).map(n => n.type),
                metadata: {},
                ...context
            },
            confidence: 0.8,
            priority: 'medium',
            tags: ['workflow', 'generation', 'creation']
        };
        await this.learningManager.emitLearningEvent(event);
    }
}
export const defaultLearningConfig = {
    batchProcessingInterval: 5000, // 5 seconds
    insightCleanupInterval: 3600000, // 1 hour
    insightRetentionPeriod: 86400000 * 7, // 7 days
    maxBatchSize: 50,
    enableInsightGeneration: true,
    enableKnowledgeStorage: true,
    logLevel: 'info'
};
// ============================================================================
// FACTORY CLASS FOR EASY SETUP
// ============================================================================
/**
 * Factory class for setting up the complete learning integration system
 */
export class LearningIntegrationFactory {
    static create(knowledgeStorage, aiMonitor, config = {}) {
        // Create manager
        const manager = new LearningIntegrationManager(knowledgeStorage, config);
        // Create observers
        const observers = {
            ai: new AILearningObserver(aiMonitor),
            testing: new TestingLearningObserver(),
            documentation: new DocumentationLearningObserver()
        };
        // Register observers
        Object.values(observers).forEach(observer => {
            manager.registerObserver(observer);
        });
        // Create event generators
        const generators = {
            ai: new AIEventGenerator(manager),
            testing: new TestingEventGenerator(manager),
            workflow: new WorkflowEventGenerator(manager)
        };
        return { manager, observers, generators };
    }
}
// Note: Classes are already exported inline above 
//# sourceMappingURL=learning-integration-system.js.map