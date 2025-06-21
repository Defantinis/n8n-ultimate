/**
 * Real-World n8n Testing Framework
 * 
 * This framework enables iterative testing of generated n8n workflows in actual n8n platform,
 * collects feedback on manual configuration requirements, and continuously improves our
 * generation system based on real-world testing insights.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { EventEmitter } from 'events';

// Types for our testing framework
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
    
    // Manual configuration requirements
    manualStepsRequired: ManualStep[];
    
    // Issues encountered
    issues: TestingIssue[];
    
    // Performance observations
    performance: PerformanceObservation;
    
    // Overall assessment
    deploymentReadiness: 1 | 2 | 3 | 4 | 5; // 1=needs major work, 5=copy-paste ready
    notes: string;
    
    // Suggested improvements
    suggestedImprovements: string[];
}

interface ManualStep {
    step: string;
    category: 'credentials' | 'configuration' | 'connections' | 'parameters' | 'validation' | 'other';
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: number; // minutes
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
    executionTime?: number; // seconds
    memoryUsage?: number; // MB
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

export class RealWorldTestingFramework extends EventEmitter {
    private testCases: Map<string, WorkflowTestCase> = new Map();
    private feedback: TestingFeedback[] = [];
    private learningPatterns: Map<string, LearningPattern> = new Map();
    private testResultsPath: string;
    private learningPatternsPath: string;

    constructor(private projectRoot: string) {
        super();
        this.testResultsPath = path.join(projectRoot, '.taskmaster', 'testing', 'results');
        this.learningPatternsPath = path.join(projectRoot, '.taskmaster', 'testing', 'patterns');
        this.initializeFramework();
    }

    private async initializeFramework(): Promise<void> {
        // Create testing directories
        await fs.mkdir(this.testResultsPath, { recursive: true });
        await fs.mkdir(this.learningPatternsPath, { recursive: true });
        
        // Load existing data
        await this.loadTestCases();
        await this.loadFeedback();
        await this.loadLearningPatterns();
        
        console.log('🧪 Real-World Testing Framework initialized');
    }

    // Test Case Management
    public async createTestCase(testCase: Omit<WorkflowTestCase, 'id' | 'createdAt'>): Promise<string> {
        const id = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const fullTestCase: WorkflowTestCase = {
            id,
            ...testCase,
            createdAt: new Date()
        };

        this.testCases.set(id, fullTestCase);
        await this.saveTestCases();
        
        this.emit('testCaseCreated', fullTestCase);
        console.log(`✅ Created test case: ${fullTestCase.name} (${id})`);
        
        return id;
    }

    public async updateTestCaseStatus(testCaseId: string, status: WorkflowTestCase['status']): Promise<void> {
        const testCase = this.testCases.get(testCaseId);
        if (!testCase) {
            throw new Error(`Test case ${testCaseId} not found`);
        }

        testCase.status = status;
        testCase.lastTested = new Date();
        
        await this.saveTestCases();
        this.emit('testCaseStatusUpdated', testCase);
        
        console.log(`📊 Updated test case ${testCase.name} status to: ${status}`);
    }

    // Feedback Collection
    public async submitFeedback(feedback: Omit<TestingFeedback, 'timestamp'>): Promise<void> {
        const fullFeedback: TestingFeedback = {
            ...feedback,
            timestamp: new Date()
        };

        this.feedback.push(fullFeedback);
        await this.saveFeedback();
        
        // Update test case status based on feedback
        if (fullFeedback.deploymentReadiness >= 4) {
            await this.updateTestCaseStatus(fullFeedback.testCaseId, 'passed');
        } else if (fullFeedback.deploymentReadiness <= 2) {
            await this.updateTestCaseStatus(fullFeedback.testCaseId, 'needs-fixes');
        } else {
            await this.updateTestCaseStatus(fullFeedback.testCaseId, 'testing');
        }

        // Learn from feedback
        await this.extractLearningPatterns(fullFeedback);
        
        this.emit('feedbackSubmitted', fullFeedback);
        console.log(`📝 Feedback submitted for test case: ${fullFeedback.testCaseId}`);
    }

    // Learning and Pattern Recognition
    private async extractLearningPatterns(feedback: TestingFeedback): Promise<void> {
        const testCase = this.testCases.get(feedback.testCaseId);
        if (!testCase) return;

        // Extract patterns from manual steps
        for (const step of feedback.manualStepsRequired) {
            const patternId = `manual-${step.category}-${testCase.workflowType}`;
            await this.updateLearningPattern(patternId, {
                workflowType: testCase.workflowType,
                pattern: `Manual ${step.category} configuration required: ${step.step}`,
                impact: step.difficulty === 'hard' ? 'high' : step.difficulty === 'medium' ? 'medium' : 'low',
                automatable: step.canBeAutomated,
                solution: step.automationIdeas
            });
        }

        // Extract patterns from issues
        for (const issue of feedback.issues) {
            const patternId = `issue-${issue.type}-${testCase.workflowType}`;
            await this.updateLearningPattern(patternId, {
                workflowType: testCase.workflowType,
                pattern: `${issue.type} issue: ${issue.description}`,
                impact: issue.severity === 'critical' ? 'high' : issue.severity === 'high' ? 'high' : 'medium',
                automatable: !!issue.fixSuggestion,
                solution: issue.fixSuggestion
            });
        }
    }

    private async updateLearningPattern(
        patternId: string, 
        patternData: Omit<LearningPattern, 'id' | 'frequency' | 'examples'>
    ): Promise<void> {
        let pattern = this.learningPatterns.get(patternId);
        
        if (pattern) {
            pattern.frequency++;
            pattern.examples.push(`Test case: ${patternData.workflowType} - ${new Date().toISOString()}`);
            if (patternData.solution && !pattern.solution) {
                pattern.solution = patternData.solution;
            }
        } else {
            pattern = {
                id: patternId,
                ...patternData,
                frequency: 1,
                examples: [`Test case: ${patternData.workflowType} - ${new Date().toISOString()}`]
            };
        }

        this.learningPatterns.set(patternId, pattern);
        await this.saveLearningPatterns();
        
        console.log(`🧠 Updated learning pattern: ${pattern.pattern} (frequency: ${pattern.frequency})`);
    }

    // Workflow Enhancement Suggestions
    public async generateWorkflowEnhancements(workflowType: string): Promise<string[]> {
        const relevantPatterns = Array.from(this.learningPatterns.values())
            .filter(pattern => pattern.workflowType === workflowType)
            .sort((a, b) => b.frequency - a.frequency);

        const enhancements: string[] = [];

        for (const pattern of relevantPatterns) {
            if (pattern.automatable && pattern.solution) {
                enhancements.push(`Auto-fix: ${pattern.solution} (addresses: ${pattern.pattern})`);
            } else if (pattern.frequency >= 3 && pattern.impact === 'high') {
                enhancements.push(`High-priority improvement needed: ${pattern.pattern}`);
            }
        }

        return enhancements;
    }

    // Testing Protocol Generation
    public generateTestingProtocol(workflowType: string): string {
        const patterns = Array.from(this.learningPatterns.values())
            .filter(pattern => pattern.workflowType === workflowType);

        let protocol = `# Testing Protocol for ${workflowType} Workflows\n\n`;
        
        protocol += `## Pre-Testing Checklist\n`;
        protocol += `- [ ] Workflow JSON is valid\n`;
        protocol += `- [ ] All required nodes are available in n8n\n`;
        protocol += `- [ ] Test environment is prepared\n\n`;

        protocol += `## Known Manual Steps (based on ${patterns.length} previous tests)\n`;
        patterns
            .filter(p => p.pattern.includes('Manual'))
            .forEach(pattern => {
                protocol += `- [ ] ${pattern.pattern} (frequency: ${pattern.frequency})\n`;
                if (pattern.solution) {
                    protocol += `  - Solution: ${pattern.solution}\n`;
                }
            });

        protocol += `\n## Common Issues to Watch For\n`;
        patterns
            .filter(p => p.pattern.includes('issue'))
            .forEach(pattern => {
                protocol += `- ⚠️ ${pattern.pattern} (frequency: ${pattern.frequency})\n`;
                if (pattern.solution) {
                    protocol += `  - Fix: ${pattern.solution}\n`;
                }
            });

        protocol += `\n## Testing Steps\n`;
        protocol += `1. Import workflow into n8n\n`;
        protocol += `2. Configure credentials and connections\n`;
        protocol += `3. Test individual nodes\n`;
        protocol += `4. Execute full workflow\n`;
        protocol += `5. Validate output\n`;
        protocol += `6. Document any issues or manual steps\n`;
        protocol += `7. Submit feedback using the testing framework\n`;

        return protocol;
    }

    // Reporting and Analytics
    public generateTestingReport(): any {
        const totalTests = this.testCases.size;
        const passedTests = Array.from(this.testCases.values()).filter(tc => tc.status === 'passed').length;
        const failedTests = Array.from(this.testCases.values()).filter(tc => tc.status === 'failed').length;
        const needsFixesTests = Array.from(this.testCases.values()).filter(tc => tc.status === 'needs-fixes').length;

        const avgDeploymentReadiness = this.feedback.length > 0 
            ? this.feedback.reduce((sum, f) => sum + f.deploymentReadiness, 0) / this.feedback.length 
            : 0;

        const topIssues = Array.from(this.learningPatterns.values())
            .filter(p => p.pattern.includes('issue'))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);

        const topManualSteps = Array.from(this.learningPatterns.values())
            .filter(p => p.pattern.includes('Manual'))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5);

        return {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                needsFixesTests,
                successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
                avgDeploymentReadiness
            },
            topIssues: topIssues.map(issue => ({
                pattern: issue.pattern,
                frequency: issue.frequency,
                impact: issue.impact,
                solution: issue.solution
            })),
            topManualSteps: topManualSteps.map(step => ({
                pattern: step.pattern,
                frequency: step.frequency,
                automatable: step.automatable,
                solution: step.solution
            })),
            learningPatterns: this.learningPatterns.size,
            totalFeedback: this.feedback.length
        };
    }

    // Data Persistence
    private async saveTestCases(): Promise<void> {
        const data = Array.from(this.testCases.values());
        await fs.writeFile(
            path.join(this.testResultsPath, 'test-cases.json'),
            JSON.stringify(data, null, 2)
        );
    }

    private async loadTestCases(): Promise<void> {
        try {
            const data = await fs.readFile(path.join(this.testResultsPath, 'test-cases.json'), 'utf-8');
            const testCases: WorkflowTestCase[] = JSON.parse(data);
            testCases.forEach(tc => this.testCases.set(tc.id, tc));
        } catch (error) {
            // File doesn't exist yet, that's okay
        }
    }

    private async saveFeedback(): Promise<void> {
        await fs.writeFile(
            path.join(this.testResultsPath, 'feedback.json'),
            JSON.stringify(this.feedback, null, 2)
        );
    }

    private async loadFeedback(): Promise<void> {
        try {
            const data = await fs.readFile(path.join(this.testResultsPath, 'feedback.json'), 'utf-8');
            this.feedback = JSON.parse(data);
        } catch (error) {
            // File doesn't exist yet, that's okay
        }
    }

    private async saveLearningPatterns(): Promise<void> {
        const data = Array.from(this.learningPatterns.values());
        await fs.writeFile(
            path.join(this.learningPatternsPath, 'patterns.json'),
            JSON.stringify(data, null, 2)
        );
    }

    private async loadLearningPatterns(): Promise<void> {
        try {
            const data = await fs.readFile(path.join(this.learningPatternsPath, 'patterns.json'), 'utf-8');
            const patterns: LearningPattern[] = JSON.parse(data);
            patterns.forEach(p => this.learningPatterns.set(p.id, p));
        } catch (error) {
            // File doesn't exist yet, that's okay
        }
    }

    // Public getters for external access
    public getTestCases(): WorkflowTestCase[] {
        return Array.from(this.testCases.values());
    }

    public getFeedback(): TestingFeedback[] {
        return this.feedback;
    }

    public getLearningPatterns(): LearningPattern[] {
        return Array.from(this.learningPatterns.values());
    }

    public getTestCase(id: string): WorkflowTestCase | undefined {
        return this.testCases.get(id);
    }
} 