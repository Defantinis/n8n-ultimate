export interface INodeExecutionData {
    json: Record<string, any>;
    binary?: Record<string, any>;
    pairedItem?: any;
}
export interface INode {
    id: string;
    name: string;
    type: string;
    position: [number, number];
    parameters?: Record<string, any>;
    credentials?: Record<string, any>;
    webhookId?: string;
    continueOnFail?: boolean;
    notes?: string;
}
export interface IConnection {
    node: string;
    type: string;
    index: number;
}
export interface IWorkflowDb {
    id?: string;
    name: string;
    nodes: Record<string, INode>;
    connections: Record<string, Record<string, IConnection[][]>>;
    active?: boolean;
    settings?: Record<string, any>;
    staticData?: Record<string, any>;
    meta?: {
        description?: string;
        [key: string]: any;
    };
}
export interface TestingConfig {
    enableMockData: boolean;
    validateConnections: boolean;
    checkNodeCompatibility: boolean;
    performanceThresholds: {
        maxExecutionTime: number;
        maxMemoryUsage: number;
    };
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    testEnvironment: 'development' | 'staging' | 'production';
}
export interface WorkflowTestCase {
    id: string;
    name: string;
    description: string;
    workflow: IWorkflowDb;
    inputs: Record<string, any>;
    expectedOutputs: Record<string, any>;
    assertions: TestAssertion[];
    tags: string[];
    timeout: number;
}
export interface TestAssertion {
    type: 'equals' | 'contains' | 'exists' | 'type' | 'range' | 'custom';
    path: string;
    expected: any;
    message?: string;
    customValidator?: (actual: any, expected: any) => boolean;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    score: number;
    recommendations: string[];
}
export interface ValidationError {
    code: string;
    message: string;
    nodeId?: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    suggestion?: string;
}
export interface ValidationWarning {
    code: string;
    message: string;
    nodeId?: string;
    suggestion?: string;
}
export interface TestResult {
    id: string;
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    errors: string[];
    warnings: string[];
    assertions: AssertionResult[];
    performance: PerformanceMetrics;
}
export interface AssertionResult {
    type: string;
    path: string;
    status: 'passed' | 'failed';
    expected: any;
    actual: any;
    message?: string;
}
export interface PerformanceMetrics {
    executionTime: number;
    memoryUsage: number;
    nodeExecutionTimes: Record<string, number>;
    dataTransferSizes: Record<string, number>;
}
export declare class MockDataGenerator {
    static generateNodeData(nodeType: string, count?: number): INodeExecutionData[];
    static generateWorkflowTestData(workflow: IWorkflowDb): Record<string, INodeExecutionData[]>;
}
export declare class WorkflowValidator {
    private config;
    constructor(config: TestingConfig);
    validateWorkflow(workflow: IWorkflowDb): Promise<ValidationResult>;
    private validateBasicStructure;
    private validateNodes;
    private validateConnections;
    private validatePerformance;
    private validateSecurity;
    private calculateQualityScore;
    private hasErrorHandling;
}
export declare class WorkflowTestRunner {
    private config;
    private validator;
    constructor(config: TestingConfig);
    runTestSuite(testCases: WorkflowTestCase[]): Promise<TestResult[]>;
    runTestCase(testCase: WorkflowTestCase): Promise<TestResult>;
    private runAssertion;
    private getValueByPath;
}
export declare class TestSuiteGenerator {
    static generateBasicTestSuite(workflow: IWorkflowDb): WorkflowTestCase[];
    static generatePerformanceTestSuite(workflow: IWorkflowDb): WorkflowTestCase[];
    static generateSecurityTestSuite(workflow: IWorkflowDb): WorkflowTestCase[];
}
export declare const DEFAULT_TESTING_CONFIG: TestingConfig;
export declare class TestingManager {
    private config;
    private validator;
    private testRunner;
    constructor(config?: TestingConfig);
    validateWorkflow(workflow: IWorkflowDb): Promise<ValidationResult>;
    runTestSuite(testCases: WorkflowTestCase[]): Promise<TestResult[]>;
    generateTestSuite(workflow: IWorkflowDb, includePerformance?: boolean, includeSecurity?: boolean): WorkflowTestCase[];
    runFullValidation(workflow: IWorkflowDb, includePerformance?: boolean, includeSecurity?: boolean): Promise<{
        validation: ValidationResult;
        testResults: TestResult[];
    }>;
}
//# sourceMappingURL=testing-patterns.d.ts.map