/**
 * Knowledge Management System for n8n Workflow Automation Project
 *
 * This module defines the comprehensive requirements and interfaces for capturing,
 * storing, and utilizing learnings from our n8n workflow generation project.
 *
 * Key Requirements:
 * 1. Pattern Recognition - Identify successful workflow patterns
 * 2. Node Performance Tracking - Monitor node behaviors and optimizations
 * 3. Learning Integration - Connect with existing tools and capture insights
 * 4. Performance Metrics - Track system performance and improvements
 * 5. API Interface - Provide easy access to captured knowledge
 */
/**
 * Core knowledge entry representing a single piece of captured learning
 */
export interface KnowledgeEntry {
    id: string;
    timestamp: Date;
    type: KnowledgeType;
    category: KnowledgeCategory;
    title: string;
    description: string;
    metadata: Record<string, any>;
    tags: string[];
    source: KnowledgeSource;
    confidence: number;
    usageCount: number;
    lastAccessed: Date;
}
/**
 * Types of knowledge we capture
 */
export declare enum KnowledgeType {
    WORKFLOW_PATTERN = "workflow_pattern",
    NODE_BEHAVIOR = "node_behavior",
    PERFORMANCE_METRIC = "performance_metric",
    ERROR_PATTERN = "error_pattern",
    OPTIMIZATION = "optimization",
    BEST_PRACTICE = "best_practice",
    ANTI_PATTERN = "anti_pattern",
    USER_FEEDBACK = "user_feedback",
    SYSTEM_INSIGHT = "system_insight"
}
/**
 * Categories for organizing knowledge
 */
export declare enum KnowledgeCategory {
    WORKFLOW_GENERATION = "workflow_generation",
    NODE_INTEGRATION = "node_integration",
    PERFORMANCE = "performance",
    SECURITY = "security",
    TESTING = "testing",
    DOCUMENTATION = "documentation",
    USER_EXPERIENCE = "user_experience",
    AI_INTEGRATION = "ai_integration"
}
/**
 * Sources where knowledge originates
 */
export declare enum KnowledgeSource {
    WORKFLOW_GENERATOR = "workflow_generator",
    VALIDATION_SYSTEM = "validation_system",
    TESTING_FRAMEWORK = "testing_framework",
    AI_PATTERNS = "ai_patterns",
    DOCUMENTATION_SYSTEM = "documentation_system",
    USER_INTERACTION = "user_interaction",
    PERFORMANCE_MONITOR = "performance_monitor",
    ERROR_HANDLER = "error_handler"
}
/**
 * Workflow pattern knowledge entry
 */
export interface WorkflowPatternKnowledge extends KnowledgeEntry {
    type: KnowledgeType.WORKFLOW_PATTERN;
    pattern: {
        nodes: string[];
        connections: WorkflowConnection[];
        configuration: Record<string, any>;
        complexity: number;
        successRate: number;
        avgExecutionTime: number;
        commonUses: string[];
        variations: WorkflowPatternVariation[];
    };
}
export interface WorkflowConnection {
    from: string;
    to: string;
    type: string;
}
export interface WorkflowPatternVariation {
    description: string;
    modifications: Record<string, any>;
    performanceImpact: number;
    useCase: string;
}
/**
 * Node performance and behavior knowledge
 */
export interface NodePerformanceKnowledge extends KnowledgeEntry {
    type: KnowledgeType.NODE_BEHAVIOR;
    nodeType: string;
    performance: {
        avgExecutionTime: number;
        memoryUsage: number;
        cpuUsage: number;
        errorRate: number;
        throughput: number;
    };
    behaviors: {
        commonConfigurations: Record<string, any>[];
        knownIssues: NodeIssue[];
        optimizations: NodeOptimization[];
        compatibilityMatrix: Record<string, boolean>;
    };
    usage: {
        frequency: number;
        contexts: string[];
        successPatterns: string[];
        failurePatterns: string[];
    };
}
export interface NodeIssue {
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    workaround?: string;
    affectedVersions: string[];
    reportedCount: number;
}
export interface NodeOptimization {
    description: string;
    technique: string;
    performanceGain: number;
    applicableScenarios: string[];
    implementation: string;
}
/**
 * System performance metrics and insights
 */
export interface PerformanceMetricsKnowledge extends KnowledgeEntry {
    type: KnowledgeType.PERFORMANCE_METRIC;
    metrics: {
        generationTime: number;
        validationTime: number;
        memoryFootprint: number;
        throughput: number;
        errorRate: number;
        userSatisfaction: number;
    };
    context: {
        workflowComplexity: number;
        nodeCount: number;
        connectionCount: number;
        dataSize: number;
        environmentInfo: Record<string, any>;
    };
    trends: {
        improvementRate: number;
        regressionIndicators: string[];
        seasonalPatterns: Record<string, number>;
    };
}
/**
 * Integration points with existing tools
 */
export interface LearningIntegration {
    integrationPatterns: IntegrationPatternLearning;
    aiPatterns: AIPatternLearning;
    testingFramework: TestingFrameworkLearning;
    documentation: DocumentationLearning;
}
export interface IntegrationPatternLearning {
    successfulIntegrations: string[];
    failedIntegrations: string[];
    performanceImpacts: Record<string, number>;
    securityConsiderations: string[];
}
export interface AIPatternLearning {
    modelPerformance: Record<string, number>;
    promptEffectiveness: Record<string, number>;
    aiWorkflowOptimizations: string[];
    tokenUsagePatterns: Record<string, number>;
}
export interface TestingFrameworkLearning {
    testCoverage: Record<string, number>;
    commonFailures: string[];
    testExecutionTimes: Record<string, number>;
    qualityMetrics: Record<string, number>;
}
export interface DocumentationLearning {
    mostAccessedResources: string[];
    knowledgeGaps: string[];
    userFeedback: string[];
    improvementSuggestions: string[];
}
/**
 * Functional Requirements for the Knowledge Management System
 */
export interface KnowledgeManagementRequirements {
    dataCapture: {
        automaticCapture: boolean;
        manualEntry: boolean;
        batchImport: boolean;
        realTimeCapture: boolean;
        sourceTracking: boolean;
    };
    dataStorage: {
        persistentStorage: boolean;
        distributedStorage: boolean;
        backupAndRecovery: boolean;
        dataVersioning: boolean;
        encryption: boolean;
    };
    dataRetrieval: {
        queryInterface: boolean;
        searchCapabilities: boolean;
        filteringAndSorting: boolean;
        aggregationQueries: boolean;
        exportCapabilities: boolean;
    };
    analysis: {
        patternRecognition: boolean;
        trendAnalysis: boolean;
        performanceAnalysis: boolean;
        predictiveAnalysis: boolean;
        anomalyDetection: boolean;
    };
    integration: {
        toolIntegration: boolean;
        apiInterface: boolean;
        webhookSupport: boolean;
        eventStreaming: boolean;
        pluginArchitecture: boolean;
    };
    userInterface: {
        webInterface: boolean;
        cliInterface: boolean;
        restApi: boolean;
        graphqlApi: boolean;
        dashboards: boolean;
    };
    performance: {
        responseTime: number;
        throughput: number;
        availability: number;
        scalability: boolean;
        caching: boolean;
    };
    security: {
        authentication: boolean;
        authorization: boolean;
        dataEncryption: boolean;
        auditLogging: boolean;
        accessControl: boolean;
    };
}
/**
 * Non-Functional Requirements
 */
export interface NonFunctionalRequirements {
    scalability: {
        maxKnowledgeEntries: number;
        maxConcurrentUsers: number;
        maxDataSize: number;
        horizontalScaling: boolean;
    };
    reliability: {
        uptime: number;
        errorRate: number;
        recoveryTime: number;
        dataIntegrity: boolean;
    };
    usability: {
        learningCurve: string;
        userSatisfaction: number;
        accessibilty: boolean;
        internationalization: boolean;
    };
    maintainability: {
        codeQuality: boolean;
        documentation: boolean;
        testCoverage: number;
        modularity: boolean;
    };
}
/**
 * Implementation phases for the knowledge management system
 */
export interface ImplementationPlan {
    phase1: {
        name: 'Foundation and Data Models';
        duration: string;
        deliverables: string[];
        dependencies: string[];
    };
    phase2: {
        name: 'Data Storage and Retrieval Architecture';
        duration: string;
        deliverables: string[];
        dependencies: string[];
    };
    phase3: {
        name: 'Pattern Learning and Recognition';
        duration: string;
        deliverables: string[];
        dependencies: string[];
    };
    phase4: {
        name: 'Integration with Existing Tools';
        duration: string;
        deliverables: string[];
        dependencies: string[];
    };
    phase5: {
        name: 'API and User Interface Development';
        duration: string;
        deliverables: string[];
        dependencies: string[];
    };
    phase6: {
        name: 'Testing, Optimization, and Deployment';
        duration: string;
        deliverables: string[];
        dependencies: string[];
    };
}
/**
 * Configuration for the knowledge management system
 */
export declare const KNOWLEDGE_MANAGEMENT_CONFIG: KnowledgeManagementRequirements;
/**
 * Implementation roadmap with specific phases and timelines
 */
export declare const IMPLEMENTATION_ROADMAP: ImplementationPlan;
/**
 * Success metrics for evaluating the knowledge management system
 */
export interface SuccessMetrics {
    knowledgeCapture: {
        entriesPerDay: number;
        automaticCaptureRate: number;
        knowledgeAccuracy: number;
    };
    systemPerformance: {
        queryResponseTime: number;
        systemUptime: number;
        storageEfficiency: number;
    };
    userSatisfaction: {
        usageFrequency: number;
        knowledgeUtilization: number;
        developmentSpeedup: number;
    };
    businessImpact: {
        errorReduction: number;
        patternReuse: number;
        decisionSpeed: number;
    };
}
export declare const TARGET_SUCCESS_METRICS: SuccessMetrics;
//# sourceMappingURL=knowledge-management-system.d.ts.map