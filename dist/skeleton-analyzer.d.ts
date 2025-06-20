import { GeneratedWorkflow } from './generators/workflow-generator.js';
/**
 * Skeleton Workflow Analyzer and Enhancer
 * Provides tools for working with skeleton workflows
 */
export declare class SkeletonAnalyzer {
    private parser;
    private generator;
    constructor();
    /**
     * Analyze all skeleton workflows in a directory
     */
    analyzeSkeletonDirectory(skeletonDir: string): Promise<SkeletonAnalysis[]>;
    /**
     * Analyze a single skeleton workflow
     */
    analyzeSkeleton(filePath: string): Promise<SkeletonAnalysis>;
    /**
     * Analyze what capabilities a skeleton workflow provides
     */
    private analyzeCapabilities;
    /**
     * Identify common workflow patterns
     */
    private identifyPatterns;
    /**
     * Suggest enhancements for a skeleton workflow
     */
    private suggestEnhancements;
    /**
     * Calculate skeleton complexity (simplified)
     */
    private calculateSkeletonComplexity;
    /**
     * Identify the main purpose of the workflow
     */
    private identifyMainPurpose;
    /**
     * Create an enhanced version of a skeleton workflow
     */
    enhanceSkeleton(skeletonPath: string, enhancements: Enhancement[]): Promise<GeneratedWorkflow>;
    /**
     * Map our enhancement type to WorkflowEnhancement type
     */
    private mapEnhancementType;
    /**
     * Generate a report for skeleton workflows
     */
    generateSkeletonReport(analyses: SkeletonAnalysis[]): string;
    private calculateAverageComplexity;
    private getCommonPatterns;
}
export interface SkeletonAnalysis {
    filePath: string;
    fileName: string;
    parsed: any;
    capabilities: WorkflowCapabilities;
    patterns: WorkflowPattern[];
    enhancementSuggestions: Enhancement[];
}
export interface WorkflowCapabilities {
    canTrigger: boolean;
    canFetchData: boolean;
    canProcessData: boolean;
    canExtractData: boolean;
    canStoreData: boolean;
    canNotify: boolean;
    canHandleErrors: boolean;
    complexity: 'simple' | 'moderate' | 'complex';
    mainPurpose: string;
}
export interface WorkflowPattern {
    name: string;
    description: string;
    confidence: number;
}
export interface Enhancement {
    type: 'error-handling' | 'data-storage' | 'data-processing' | 'notification' | 'optimization';
    priority: 'low' | 'medium' | 'high';
    description: string;
    implementation: string;
    parameters?: Record<string, any>;
}
//# sourceMappingURL=skeleton-analyzer.d.ts.map