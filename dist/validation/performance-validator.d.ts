/**
 * Performance Validator
 * Validates workflow performance including processing times, resource usage, and optimization
 */
import { N8nWorkflow, ValidationResult } from '../types/n8n-workflow.js';
import { ConnectionValidator } from './connection-validator.js';
/**
 * Performance metrics for individual nodes
 */
export interface NodePerformanceMetrics {
    nodeId: string;
    nodeType: string;
    estimatedExecutionTime: number;
    estimatedMemoryUsage: number;
    estimatedCpuUsage: number;
    complexity: number;
    resourceIntensity: 'low' | 'medium' | 'high' | 'critical';
    bottleneckRisk: number;
    optimizationPotential: number;
    warnings: string[];
    recommendations: string[];
}
/**
 * Performance metrics for entire workflow
 */
export interface WorkflowPerformanceMetrics {
    totalEstimatedExecutionTime: number;
    totalEstimatedMemoryUsage: number;
    averageCpuUsage: number;
    maxConcurrentNodes: number;
    parallelExecutionPotential: number;
    resourceEfficiency: number;
    scalabilityScore: number;
    bottlenecks: string[];
    criticalPath: string[];
    optimizationOpportunities: string[];
}
/**
 * Performance thresholds for validation
 */
export interface PerformanceThresholds {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    maxCpuUsage: number;
    maxNodeComplexity: number;
    minResourceEfficiency: number;
    minScalabilityScore: number;
    warningThresholds: {
        executionTime: number;
        memoryUsage: number;
        cpuUsage: number;
    };
}
/**
 * Performance validation report
 */
export interface PerformanceValidationReport {
    summary: {
        overallScore: number;
        performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
        passesThresholds: boolean;
        criticalIssues: number;
        warnings: number;
        optimizationOpportunities: number;
    };
    workflowMetrics: WorkflowPerformanceMetrics;
    nodeMetrics: NodePerformanceMetrics[];
    validationResults: ValidationResult[];
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    benchmarkComparison?: {
        percentile: number;
        category: 'simple' | 'moderate' | 'complex' | 'enterprise';
        similarWorkflows: number;
    };
}
/**
 * Performance Validator Class
 */
export declare class PerformanceValidator {
    private connectionValidator;
    private thresholds;
    constructor(connectionValidator?: ConnectionValidator, customThresholds?: Partial<PerformanceThresholds>);
    /**
     * Validate workflow performance
     */
    validateWorkflowPerformance(workflow: N8nWorkflow): ValidationResult;
    /**
     * Generate comprehensive performance report
     */
    generatePerformanceReport(workflow: N8nWorkflow): PerformanceValidationReport;
    /**
     * Validate individual node performance
     */
    private validateNodePerformance;
    /**
     * Validate resource usage patterns
     */
    private validateResourceUsage;
    /**
     * Validate scalability characteristics
     */
    private validateScalability;
    /**
     * Analyze individual node performance
     */
    private analyzeNodePerformance;
    /**
     * Analyze workflow-level performance
     */
    private analyzeWorkflowPerformance;
    /**
     * Helper methods for performance calculations
     */
    private getDefaultNodePerformance;
    private estimateDataVolumeMultiplier;
    private calculateNodeComplexity;
    private categorizeResourceIntensity;
    private calculateBottleneckRisk;
    private calculateOptimizationPotential;
    private generateNodeWarnings;
    private calculateCriticalPath;
    private calculateTotalExecutionTime;
    private calculateMaxConcurrentNodes;
    private calculateNodeDepth;
    private calculateParallelExecutionPotential;
    private calculateResourceEfficiency;
    private calculateScalabilityScore;
    private identifyBottlenecks;
    private identifyOptimizationOpportunities;
    private calculateOverallScore;
    private getPerformanceGrade;
    private checkThresholds;
    private countOptimizationOpportunities;
    private generateRecommendations;
    /**
     * Update performance thresholds
     */
    updateThresholds(newThresholds: Partial<PerformanceThresholds>): void;
    /**
     * Get current performance thresholds
     */
    getThresholds(): PerformanceThresholds;
}
//# sourceMappingURL=performance-validator.d.ts.map