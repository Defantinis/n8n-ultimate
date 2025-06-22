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
import { KnowledgeStorageManager } from '../integration/knowledge-storage-system.js';
import { LearningIntegrationManager, TestingEventGenerator } from '../integration/learning-integration-system.js';
import { KnowledgeType, KnowledgeCategory, KnowledgeSource } from '../integration/knowledge-management-system.js';
import { RealWorldTestingFramework } from './real-world-testing-framework.js';
// ============================================================================
// MAIN TESTING FRAMEWORK CLASS
// ============================================================================
export class ComprehensiveLearningTestingFramework extends EventEmitter {
    projectRoot;
    knowledgeStorage;
    learningManager;
    eventGenerator;
    realWorldFramework;
    testSessions = new Map();
    learningPatterns = new Map();
    currentSession;
    STORAGE_PATH;
    PATTERNS_PATH;
    REPORTS_PATH;
    constructor(projectRoot, knowledgeStorage, learningManager) {
        super();
        this.projectRoot = projectRoot;
        // Initialize storage paths
        this.STORAGE_PATH = path.join(projectRoot, '.taskmaster', 'testing', 'sessions');
        this.PATTERNS_PATH = path.join(projectRoot, '.taskmaster', 'testing', 'patterns');
        this.REPORTS_PATH = path.join(projectRoot, '.taskmaster', 'testing', 'reports');
        // Initialize knowledge and learning systems
        this.knowledgeStorage = knowledgeStorage || new KnowledgeStorageManager();
        this.learningManager = learningManager || new LearningIntegrationManager(this.knowledgeStorage);
        this.eventGenerator = new TestingEventGenerator(this.learningManager);
        this.realWorldFramework = new RealWorldTestingFramework(projectRoot);
        this.initializeFramework();
    }
    // ============================================================================
    // INITIALIZATION & SETUP
    // ============================================================================
    async initializeFramework() {
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
        }
        catch (error) {
            console.error('❌ Framework initialization failed:', error);
            throw error;
        }
    }
    // ============================================================================
    // TEST SESSION MANAGEMENT
    // ============================================================================
    async startTestSession(workflowName, workflowVersion) {
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
        console.log(`🧪 Test session started: ${sessionId}`);
        return sessionId;
    }
    async recordTestStep(stepName, stepType, success, executionTime, consoleOutput, errorDetails, dataQuality) {
        if (!this.currentSession) {
            throw new Error('No active test session');
        }
        const result = {
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
        const testResult = {
            id: this.currentSession.id,
            name: this.currentSession.workflowName,
            status: success ? 'passed' : 'failed',
            duration: executionTime,
            errors: errorDetails ? [errorDetails.errorMessage] : [],
            warnings: [],
            assertions: [],
            performance: this.currentSession.performanceMetrics
        };
        await this.eventGenerator.generateTestCompletedEvent(testResult);
    }
    async finishTestSession() {
        if (!this.currentSession) {
            throw new Error('No active test session');
        }
        this.finalizePerformanceMetrics();
        await this.generateLearningInsights();
        await this.generateImprovementSuggestions();
        await this.updateLearningPatterns();
        await this.storeTestSession();
        console.log(`🏁 Test session finished: ${this.currentSession.id}`);
        const finishedSession = { ...this.currentSession };
        this.currentSession = undefined;
        return finishedSession;
    }
    // ============================================================================
    // LEARNING & PATTERN RECOGNITION
    // ============================================================================
    async generateLearningInsights() {
        if (!this.currentSession)
            return;
        const insights = [];
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
            const errorTypes = {};
            errorSteps.forEach(result => {
                if (result.errorDetails) {
                    const type = result.errorDetails.errorType;
                    errorTypes[type] = (errorTypes[type] || 0) + 1;
                }
            });
            if (Object.keys(errorTypes).length > 0) {
                const insight = {
                    type: 'error_pattern',
                    category: 'reliability',
                    description: 'Recurring error patterns detected in test session',
                    confidence: 0.75,
                    frequency: Object.values(errorTypes).reduce((a, b) => a + b, 0),
                    impact: 'medium',
                    evidence: [errorTypes]
                };
                this.currentSession.learningInsights.push(insight);
                await this.storeInsightAsKnowledge(insight);
            }
        }
        // Data quality patterns
        const dataSteps = results.filter(r => r.dataQuality);
        if (dataSteps.length > 0) {
            const avgCompleteness = dataSteps.reduce((sum, step) => sum + (step.dataQuality.completeness || 0), 0) / dataSteps.length;
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
                        completeness: s.dataQuality.completeness
                    }))
                });
            }
        }
        this.currentSession.learningInsights = insights;
    }
    async generateImprovementSuggestions() {
        if (!this.currentSession)
            return;
        const suggestions = [];
        const insights = this.currentSession.learningInsights;
        // Generate suggestions based on insights
        for (const insight of insights) {
            switch (insight.type) {
                case 'optimization':
                    if (insight.category === 'performance') {
                        suggestions.push({
                            id: `perf_${Date.now()}`,
                            title: 'Optimize Slow Operations',
                            description: `Optimize steps that take longer than 5 seconds: ${insight.evidence.map((e) => e.step).join(', ')}`,
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
    async updateLearningPatterns() {
        if (!this.currentSession)
            return;
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
            }
            else {
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
    async storeTestSession() {
        if (!this.currentSession)
            return;
        const knowledgeEntry = {
            id: `test_session_${this.currentSession.id}`,
            type: KnowledgeType.TESTING_PATTERN,
            category: KnowledgeCategory.TESTING,
            source: KnowledgeSource.AUTOMATED_TESTING,
            title: `Test Session: ${this.currentSession.workflowName}`,
            description: `Test session results for ${this.currentSession.workflowName} v${this.currentSession.workflowVersion}`,
            metadata: {
                ...this.currentSession
            },
            timestamp: new Date(),
            tags: ['test-session', 'workflow-testing', this.currentSession.workflowName],
            confidence: this.currentSession.performanceMetrics.successRate,
            usageCount: 1,
            lastAccessed: new Date(),
        };
        await this.knowledgeStorage.create(knowledgeEntry);
    }
    async storeInsightAsKnowledge(insight) {
        const knowledgeEntry = {
            id: `insight_${Date.now()}`,
            type: KnowledgeType.LEARNING_INSIGHT,
            category: KnowledgeCategory.TESTING,
            title: insight.description,
            description: `Insight of type ${insight.type} with impact ${insight.impact}`,
            metadata: {
                confidence: insight.confidence,
                frequency: insight.frequency,
                impact: insight.impact
            },
            timestamp: new Date(),
            tags: [insight.type, insight.category, 'learning-insight'],
            source: KnowledgeSource.AUTOMATED_ANALYSIS,
            confidence: insight.confidence,
            usageCount: 0,
            lastAccessed: new Date(),
        };
        await this.knowledgeStorage.create(knowledgeEntry);
    }
    async saveLearningPatterns() {
        const patternsPath = path.join(this.PATTERNS_PATH, 'learning-patterns.json');
        const patternsArray = Array.from(this.learningPatterns.values());
        await fs.writeFile(patternsPath, JSON.stringify(patternsArray, null, 2));
    }
    async loadLearningPatterns() {
        try {
            const patternsPath = path.join(this.PATTERNS_PATH, 'learning-patterns.json');
            const patternsData = await fs.readFile(patternsPath, 'utf8');
            const patterns = JSON.parse(patternsData);
            for (const pattern of patterns) {
                this.learningPatterns.set(pattern.patternId, pattern);
            }
            console.log(`📚 Loaded ${patterns.length} learning patterns`);
        }
        catch (error) {
            // File doesn't exist yet, that's ok
            console.log('📚 No existing learning patterns found, starting fresh');
        }
    }
    // ============================================================================
    // ANALYTICS & REPORTING
    // ============================================================================
    async generateAnalyticsReport() {
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
    initializePerformanceMetrics() {
        return {
            executionTime: 0,
            memoryUsage: 0,
            nodeExecutionTimes: {},
            dataTransferSizes: {}
        };
    }
    updatePerformanceMetrics(result) {
        if (!this.currentSession)
            return;
        this.currentSession.performanceMetrics.executionTime += result.executionTime;
        // other metrics would be updated here
    }
    finalizePerformanceMetrics() {
        if (!this.currentSession)
            return;
        const results = this.currentSession.testResults;
        const metrics = this.currentSession.performanceMetrics;
        metrics.successRate = results.filter(r => r.success).length / results.length;
    }
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }
    identifyCommonIssues(patterns) {
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
    calculatePerformanceTrend(sessions) {
        const sorted = sessions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return {
            executionTimeImprovement: this.calculateTrendImprovement(sorted.map(s => s.performanceMetrics.executionTime)),
            successRateImprovement: this.calculateTrendImprovement(sorted.map(s => s.performanceMetrics.successRate))
        };
    }
    calculateErrorTrend(sessions) {
        const sorted = sessions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        return {
            errorRateReduction: this.calculateTrendImprovement(sorted.map(s => 1 - s.performanceMetrics.successRate))
        };
    }
    calculateImprovementImpact(sessions) {
        return {
            totalSuggestions: sessions.reduce((sum, s) => sum + s.improvements.length, 0),
            criticalSuggestions: sessions.reduce((sum, s) => sum + s.improvements.filter(i => i.priority === 'critical').length, 0),
            autoApplicableSuggestions: sessions.reduce((sum, s) => sum + s.improvements.filter(i => i.autoApplicable).length, 0)
        };
    }
    calculateTrendImprovement(values) {
        if (values.length < 2)
            return 0;
        const first = values[0];
        const last = values[values.length - 1];
        return ((last - first) / first) * 100;
    }
    async generateSystemRecommendations() {
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
    async getCurrentSession() {
        return this.currentSession;
    }
    async getTestSessions() {
        return Array.from(this.testSessions.values());
    }
    async getLearningPatterns() {
        return Array.from(this.learningPatterns.values());
    }
    async getImprovementSuggestions() {
        const sessions = Array.from(this.testSessions.values());
        return sessions.flatMap(s => s.improvements);
    }
}
// ============================================================================
// FACTORY FUNCTION
// ============================================================================
export function createComprehensiveLearningTestingFramework(projectRoot, knowledgeStorage, learningManager) {
    return new ComprehensiveLearningTestingFramework(projectRoot, knowledgeStorage, learningManager);
}
//# sourceMappingURL=comprehensive-learning-testing-framework.js.map