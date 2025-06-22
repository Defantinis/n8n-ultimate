/**
 * Test Suite for Node Performance Knowledge Base
 *
 * Comprehensive tests for the node performance monitoring, analysis,
 * and optimization recommendation system.
 */
import { NodePerformanceMetrics } from './node-performance-knowledge-base';
import { KnowledgeStorageManager } from './knowledge-storage-system';
import { INode } from '../types/n8n-node-interfaces';
/**
 * Mock knowledge storage for testing
 */
declare class MockKnowledgeStorageManager extends KnowledgeStorageManager {
    private mockData;
    private initializeCalled;
    initialize(): Promise<void>;
    create<T>(entry: any): Promise<T>;
    read<T>(query?: any): Promise<any>;
    getMockData(): any[];
    clearMockData(): void;
    isInitialized(): boolean;
}
/**
 * Sample n8n nodes for testing
 */
declare const mockNodes: INode[];
/**
 * Sample performance metrics for testing
 */
declare function createMockPerformanceMetrics(nodeId: string, nodeType: string, overrides?: Partial<NodePerformanceMetrics>): NodePerformanceMetrics;
interface TestResult {
    testName: string;
    passed: boolean;
    error?: string;
    duration: number;
    details?: any;
}
declare class NodePerformanceTestRunner {
    private results;
    runTest(testName: string, testFn: () => Promise<void>): Promise<void>;
    getResults(): TestResult[];
    getSummary(): {
        total: number;
        passed: number;
        failed: number;
        passRate: number;
    };
    printSummary(): void;
}
/**
 * Run all Node Performance Knowledge Base tests
 */
export declare function runNodePerformanceKnowledgeBaseTests(): Promise<TestResult[]>;
/**
 * Utility function to run a quick smoke test
 */
export declare function runNodePerformanceQuickTest(): Promise<boolean>;
export { NodePerformanceTestRunner, MockKnowledgeStorageManager, createMockPerformanceMetrics, mockNodes };
//# sourceMappingURL=test-node-performance-knowledge-base.d.ts.map