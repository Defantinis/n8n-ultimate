// Mock Data Generator
export class MockDataGenerator {
    static generateNodeData(nodeType, count = 1) {
        const mockData = [];
        for (let i = 0; i < count; i++) {
            switch (nodeType.toLowerCase()) {
                case 'webhook':
                    mockData.push({
                        json: {
                            body: { message: `Mock webhook data ${i + 1}`, timestamp: Date.now() },
                            headers: { 'content-type': 'application/json' },
                            query: {},
                            params: {}
                        }
                    });
                    break;
                case 'http':
                    mockData.push({
                        json: {
                            id: i + 1,
                            name: `Mock User ${i + 1}`,
                            email: `user${i + 1}@example.com`,
                            status: 'active'
                        }
                    });
                    break;
                case 'ai':
                case 'openai':
                case 'langchain':
                    mockData.push({
                        json: {
                            response: `AI generated response ${i + 1}`,
                            confidence: Math.random(),
                            tokens_used: Math.floor(Math.random() * 1000),
                            model: 'gpt-4'
                        }
                    });
                    break;
                default:
                    mockData.push({
                        json: {
                            id: i + 1,
                            data: `Mock data for ${nodeType} - ${i + 1}`,
                            timestamp: Date.now()
                        }
                    });
            }
        }
        return mockData;
    }
    static generateWorkflowTestData(workflow) {
        const testData = {};
        Object.values(workflow.nodes).forEach(node => {
            testData[node.name] = this.generateNodeData(node.type, 3);
        });
        return testData;
    }
}
// Workflow Validator
export class WorkflowValidator {
    config;
    constructor(config) {
        this.config = config;
    }
    async validateWorkflow(workflow) {
        const errors = [];
        const warnings = [];
        const recommendations = [];
        // Basic structure validation
        this.validateBasicStructure(workflow, errors);
        // Node validation
        this.validateNodes(workflow, errors, warnings);
        // Connection validation
        if (this.config.validateConnections) {
            this.validateConnections(workflow, errors, warnings);
        }
        // Performance and security checks
        this.validatePerformance(workflow, warnings, recommendations);
        this.validateSecurity(workflow, warnings, recommendations);
        const score = this.calculateQualityScore(workflow, errors, warnings);
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score,
            recommendations
        };
    }
    validateBasicStructure(workflow, errors) {
        if (!workflow.name || workflow.name.trim().length === 0) {
            errors.push({
                code: 'MISSING_NAME',
                message: 'Workflow must have a name',
                severity: 'high',
                suggestion: 'Add a descriptive name to your workflow'
            });
        }
        if (!workflow.nodes || Object.keys(workflow.nodes).length === 0) {
            errors.push({
                code: 'NO_NODES',
                message: 'Workflow must contain at least one node',
                severity: 'critical',
                suggestion: 'Add nodes to your workflow'
            });
        }
    }
    validateNodes(workflow, errors, warnings) {
        Object.values(workflow.nodes).forEach(node => {
            if (!node.type) {
                errors.push({
                    code: 'MISSING_NODE_TYPE',
                    message: `Node ${node.name} is missing type`,
                    nodeId: node.name,
                    severity: 'critical',
                    suggestion: 'Specify the node type'
                });
            }
            // AI nodes validation
            if (node.type.includes('ai') || node.type.includes('openai') || node.type.includes('langchain')) {
                if (!node.parameters?.credentials) {
                    warnings.push({
                        code: 'AI_NO_CREDENTIALS',
                        message: `AI node ${node.name} may need credentials configured`,
                        nodeId: node.name,
                        suggestion: 'Configure appropriate credentials for AI services'
                    });
                }
            }
            // Webhook validation
            if (node.type === 'n8n-nodes-base.webhook' && !node.webhookId) {
                warnings.push({
                    code: 'WEBHOOK_NO_ID',
                    message: `Webhook node ${node.name} should have a webhook ID for production`,
                    nodeId: node.name,
                    suggestion: 'Set a specific webhook ID for consistent URLs'
                });
            }
        });
    }
    validateConnections(workflow, errors, warnings) {
        if (!workflow.connections)
            return;
        const nodeNames = Object.keys(workflow.nodes);
        Object.entries(workflow.connections).forEach(([sourceNode, connections]) => {
            if (!nodeNames.includes(sourceNode)) {
                errors.push({
                    code: 'INVALID_SOURCE_NODE',
                    message: `Connection references non-existent source node: ${sourceNode}`,
                    severity: 'critical',
                    suggestion: 'Remove invalid connection or add missing node'
                });
            }
            Object.values(connections).forEach(outputConnections => {
                outputConnections.forEach(connection => {
                    connection.forEach(conn => {
                        if (!nodeNames.includes(conn.node)) {
                            errors.push({
                                code: 'INVALID_TARGET_NODE',
                                message: `Connection references non-existent target node: ${conn.node}`,
                                severity: 'critical',
                                suggestion: 'Remove invalid connection or add missing node'
                            });
                        }
                    });
                });
            });
        });
    }
    validatePerformance(workflow, warnings, recommendations) {
        const nodeCount = Object.keys(workflow.nodes).length;
        if (nodeCount > 50) {
            warnings.push({
                code: 'LARGE_WORKFLOW',
                message: 'Workflow has many nodes which may impact performance',
                suggestion: 'Consider breaking into smaller workflows'
            });
        }
        recommendations.push('Consider using webhook queues for high-volume workflows');
        recommendations.push('Implement error handling nodes for robust execution');
    }
    validateSecurity(workflow, warnings, recommendations) {
        Object.values(workflow.nodes).forEach(node => {
            if (node.parameters && JSON.stringify(node.parameters).includes('password')) {
                warnings.push({
                    code: 'HARDCODED_CREDENTIALS',
                    message: `Node ${node.name} may contain hardcoded credentials`,
                    nodeId: node.name,
                    suggestion: 'Use credential management system instead'
                });
            }
        });
        recommendations.push('Use environment variables for sensitive configuration');
        recommendations.push('Implement input validation for webhook endpoints');
    }
    calculateQualityScore(workflow, errors, warnings) {
        let score = 100;
        errors.forEach(error => {
            switch (error.severity) {
                case 'critical':
                    score -= 20;
                    break;
                case 'high':
                    score -= 10;
                    break;
                case 'medium':
                    score -= 5;
                    break;
                case 'low':
                    score -= 2;
                    break;
            }
        });
        warnings.forEach(() => score -= 1);
        // Bonus for good practices
        if (workflow.meta?.description)
            score += 5;
        if (this.hasErrorHandling(workflow))
            score += 10;
        return Math.max(0, Math.min(100, score));
    }
    hasErrorHandling(workflow) {
        return Object.values(workflow.nodes).some(node => node.type.includes('error') || node.continueOnFail === true);
    }
}
// Test Runner
export class WorkflowTestRunner {
    config;
    validator;
    constructor(config) {
        this.config = config;
        this.validator = new WorkflowValidator(config);
    }
    async runTestSuite(testCases) {
        const results = [];
        for (const testCase of testCases) {
            const result = await this.runTestCase(testCase);
            results.push(result);
        }
        return results;
    }
    async runTestCase(testCase) {
        const startTime = Date.now();
        const errors = [];
        const warnings = [];
        const assertions = [];
        try {
            // Validate workflow first
            const validationResult = await this.validator.validateWorkflow(testCase.workflow);
            if (!validationResult.isValid) {
                validationResult.errors.forEach(error => {
                    errors.push(`Validation Error: ${error.message}`);
                });
            }
            // Run assertions
            for (const assertion of testCase.assertions) {
                const assertionResult = await this.runAssertion(assertion, testCase.inputs, testCase.expectedOutputs);
                assertions.push(assertionResult);
            }
            const duration = Date.now() - startTime;
            const status = errors.length === 0 && assertions.every(a => a.status === 'passed') ? 'passed' : 'failed';
            return {
                id: testCase.id,
                name: testCase.name,
                status,
                duration,
                errors,
                warnings,
                assertions,
                performance: {
                    executionTime: duration,
                    memoryUsage: 0,
                    nodeExecutionTimes: {},
                    dataTransferSizes: {}
                }
            };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            errors.push(`Test execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                id: testCase.id,
                name: testCase.name,
                status: 'failed',
                duration,
                errors,
                warnings,
                assertions,
                performance: {
                    executionTime: duration,
                    memoryUsage: 0,
                    nodeExecutionTimes: {},
                    dataTransferSizes: {}
                }
            };
        }
    }
    async runAssertion(assertion, inputs, expectedOutputs) {
        try {
            const actualValue = this.getValueByPath(inputs, assertion.path);
            const expectedValue = assertion.expected;
            let passed = false;
            switch (assertion.type) {
                case 'equals':
                    passed = JSON.stringify(actualValue) === JSON.stringify(expectedValue);
                    break;
                case 'contains':
                    passed = actualValue && actualValue.toString().includes(expectedValue);
                    break;
                case 'exists':
                    passed = actualValue !== undefined && actualValue !== null;
                    break;
                case 'type':
                    passed = typeof actualValue === expectedValue;
                    break;
                case 'range':
                    passed = actualValue >= expectedValue.min && actualValue <= expectedValue.max;
                    break;
                case 'custom':
                    passed = assertion.customValidator ? assertion.customValidator(actualValue, expectedValue) : false;
                    break;
            }
            return {
                type: assertion.type,
                path: assertion.path,
                status: passed ? 'passed' : 'failed',
                expected: expectedValue,
                actual: actualValue,
                message: assertion.message || ''
            };
        }
        catch (error) {
            return {
                type: assertion.type,
                path: assertion.path,
                status: 'failed',
                expected: assertion.expected,
                actual: null,
                message: `Assertion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    getValueByPath(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
}
// Test Suite Generator
export class TestSuiteGenerator {
    static generateBasicTestSuite(workflow) {
        const testCases = [];
        const mockData = MockDataGenerator.generateWorkflowTestData(workflow);
        // Structure validation test
        testCases.push({
            id: `${workflow.name}-structure`,
            name: 'Workflow Structure Validation',
            description: 'Validates basic workflow structure and configuration',
            workflow,
            inputs: {},
            expectedOutputs: {},
            assertions: [
                {
                    type: 'exists',
                    path: 'name',
                    expected: true,
                    message: 'Workflow should have a name'
                }
            ],
            tags: ['structure', 'basic'],
            timeout: 5000
        });
        // Node-specific tests
        Object.values(workflow.nodes).forEach(node => {
            testCases.push({
                id: `${workflow.name}-node-${node.name}`,
                name: `Node ${node.name} Test`,
                description: `Tests the ${node.name} node configuration`,
                workflow,
                inputs: mockData[node.name] ? { [node.name]: mockData[node.name] } : {},
                expectedOutputs: {},
                assertions: [
                    {
                        type: 'exists',
                        path: `${node.name}.type`,
                        expected: true,
                        message: `Node ${node.name} should have a type`
                    }
                ],
                tags: ['node', node.type],
                timeout: 10000
            });
        });
        return testCases;
    }
    static generatePerformanceTestSuite(workflow) {
        return [{
                id: `${workflow.name}-performance`,
                name: 'Performance Test',
                description: 'Tests workflow performance with high data volume',
                workflow,
                inputs: { volume: 1000 },
                expectedOutputs: { success: true },
                assertions: [
                    {
                        type: 'range',
                        path: 'executionTime',
                        expected: { min: 0, max: 30000 },
                        message: 'Execution should complete within 30 seconds'
                    }
                ],
                tags: ['performance'],
                timeout: 60000
            }];
    }
    static generateSecurityTestSuite(workflow) {
        return [{
                id: `${workflow.name}-security`,
                name: 'Security Validation Test',
                description: 'Validates workflow security configuration',
                workflow,
                inputs: {},
                expectedOutputs: {},
                assertions: [
                    {
                        type: 'custom',
                        path: 'workflow',
                        expected: true,
                        message: 'Workflow should not contain hardcoded credentials',
                        customValidator: (workflow) => {
                            const workflowStr = JSON.stringify(workflow);
                            return !workflowStr.includes('password') && !workflowStr.includes('secret');
                        }
                    }
                ],
                tags: ['security'],
                timeout: 5000
            }];
    }
}
// Default Configuration
export const DEFAULT_TESTING_CONFIG = {
    enableMockData: true,
    validateConnections: true,
    checkNodeCompatibility: true,
    performanceThresholds: {
        maxExecutionTime: 30000,
        maxMemoryUsage: 512
    },
    logLevel: 'info',
    testEnvironment: 'development'
};
// Main Testing Manager
export class TestingManager {
    config;
    validator;
    testRunner;
    constructor(config = DEFAULT_TESTING_CONFIG) {
        this.config = config;
        this.validator = new WorkflowValidator(config);
        this.testRunner = new WorkflowTestRunner(config);
    }
    async validateWorkflow(workflow) {
        return this.validator.validateWorkflow(workflow);
    }
    async runTestSuite(testCases) {
        return this.testRunner.runTestSuite(testCases);
    }
    generateTestSuite(workflow, includePerformance = false, includeSecurity = false) {
        let testCases = TestSuiteGenerator.generateBasicTestSuite(workflow);
        if (includePerformance) {
            testCases = testCases.concat(TestSuiteGenerator.generatePerformanceTestSuite(workflow));
        }
        if (includeSecurity) {
            testCases = testCases.concat(TestSuiteGenerator.generateSecurityTestSuite(workflow));
        }
        return testCases;
    }
    async runFullValidation(workflow, includePerformance = false, includeSecurity = false) {
        const validation = await this.validateWorkflow(workflow);
        const testCases = this.generateTestSuite(workflow, includePerformance, includeSecurity);
        const testResults = await this.runTestSuite(testCases);
        return { validation, testResults };
    }
}
//# sourceMappingURL=testing-patterns.js.map