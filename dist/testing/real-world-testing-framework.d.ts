/**
 * Real-World n8n Testing Framework
 *
 * This framework enables iterative testing of generated n8n workflows in actual n8n platform,
 * collects feedback on manual configuration requirements, and continuously improves our
 * generation system based on real-world testing insights.
 */
import { EventEmitter } from 'events';
interface WorkflowTestCase {
    id: string;
    name: string;
    workflowPath: string;
    workflowType: 'scraper' | 'api' | 'data-processing' | 'automation' | 'integration';
    description: string;
    expectedOutcome: string;
    testingNotes: string;
    status: 'pending' | 'testing' | 'passed' | 'failed' | 'needs-fixes';
    createdAt: Date;
    lastTested?: Date;
}
interface TestingFeedback {
    testCaseId: string;
    timestamp: Date;
    tester: string;
    manualStepsRequired: ManualStep[];
    issues: TestingIssue[];
    performance: PerformanceObservation;
    deploymentReadiness: 1 | 2 | 3 | 4 | 5;
    notes: string;
    suggestedImprovements: string[];
}
interface ManualStep {
    step: string;
    category: 'credentials' | 'configuration' | 'connections' | 'parameters' | 'validation' | 'other';
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: number;
    canBeAutomated: boolean;
    automationIdeas?: string;
}
interface TestingIssue {
    type: 'error' | 'warning' | 'usability' | 'performance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    nodeId?: string;
    errorMessage?: string;
    workaround?: string;
    fixSuggestion?: string;
}
interface PerformanceObservation {
    executionTime?: number;
    memoryUsage?: number;
    nodeCount: number;
    connectionCount: number;
    complexity: 'low' | 'medium' | 'high';
    bottlenecks?: string[];
}
interface LearningPattern {
    id: string;
    workflowType: string;
    pattern: string;
    frequency: number;
    impact: 'low' | 'medium' | 'high';
    solution?: string;
    automatable: boolean;
    examples: string[];
}
export declare class RealWorldTestingFramework extends EventEmitter {
    private projectRoot;
    private testCases;
    private feedback;
    private learningPatterns;
    private testResultsPath;
    private learningPatternsPath;
    constructor(projectRoot: string);
    private initializeFramework;
    createTestCase(testCase: Omit<WorkflowTestCase, 'id' | 'createdAt'>): Promise<string>;
    updateTestCaseStatus(testCaseId: string, status: WorkflowTestCase['status']): Promise<void>;
    submitFeedback(feedback: Omit<TestingFeedback, 'timestamp'>): Promise<void>;
    private extractLearningPatterns;
    private updateLearningPattern;
    generateWorkflowEnhancements(workflowType: string): Promise<string[]>;
    generateTestingProtocol(workflowType: string): string;
    generateTestingReport(): any;
    private saveTestCases;
    private loadTestCases;
    private saveFeedback;
    private loadFeedback;
    private saveLearningPatterns;
    private loadLearningPatterns;
    getTestCases(): WorkflowTestCase[];
    getFeedback(): TestingFeedback[];
    getLearningPatterns(): LearningPattern[];
    getTestCase(id: string): WorkflowTestCase | undefined;
}
export {};
//# sourceMappingURL=real-world-testing-framework.d.ts.map