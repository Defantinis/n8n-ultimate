/**
 * Performance Validator
 * Validates workflow performance including processing times, resource usage, and optimization
 */

import {
  N8nWorkflow,
  N8nNode,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../types/n8n-workflow.js';

import { ConnectionValidator } from './connection-validator.js';

/**
 * Performance metrics for individual nodes
 */
export interface NodePerformanceMetrics {
  nodeId: string;
  nodeType: string;
  estimatedExecutionTime: number; // milliseconds
  estimatedMemoryUsage: number; // MB
  estimatedCpuUsage: number; // percentage
  complexity: number; // 1-10 scale
  resourceIntensity: 'low' | 'medium' | 'high' | 'critical';
  bottleneckRisk: number; // 0-1 scale
  optimizationPotential: number; // 0-1 scale
  warnings: string[];
  recommendations: string[];
}

/**
 * Performance metrics for entire workflow
 */
export interface WorkflowPerformanceMetrics {
  totalEstimatedExecutionTime: number; // milliseconds
  totalEstimatedMemoryUsage: number; // MB
  averageCpuUsage: number; // percentage
  maxConcurrentNodes: number;
  parallelExecutionPotential: number; // 0-1 scale
  resourceEfficiency: number; // 0-1 scale
  scalabilityScore: number; // 0-1 scale
  bottlenecks: string[];
  criticalPath: string[];
  optimizationOpportunities: string[];
}

/**
 * Performance thresholds for validation
 */
export interface PerformanceThresholds {
  maxExecutionTime: number; // milliseconds
  maxMemoryUsage: number; // MB
  maxCpuUsage: number; // percentage
  maxNodeComplexity: number; // 1-10 scale
  minResourceEfficiency: number; // 0-1 scale
  minScalabilityScore: number; // 0-1 scale
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
    overallScore: number; // 0-100 scale
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
 * Node performance database with execution characteristics
 */
const NODE_PERFORMANCE_DB: Record<string, {
  baseExecutionTime: number; // milliseconds
  memoryUsage: number; // MB
  cpuIntensity: number; // 1-10 scale
  ioIntensity: number; // 1-10 scale
  networkIntensity: number; // 1-10 scale
  scalingFactor: number; // multiplier for data volume
  optimizationTips: string[];
}> = {
  'n8n-nodes-base.manualTrigger': {
    baseExecutionTime: 1,
    memoryUsage: 0.1,
    cpuIntensity: 1,
    ioIntensity: 1,
    networkIntensity: 1,
    scalingFactor: 1,
    optimizationTips: ['No optimization needed for trigger nodes']
  },
  'n8n-nodes-base.webhook': {
    baseExecutionTime: 5,
    memoryUsage: 0.5,
    cpuIntensity: 2,
    ioIntensity: 3,
    networkIntensity: 8,
    scalingFactor: 1.2,
    optimizationTips: ['Configure proper timeout values', 'Use webhook authentication']
  },
  'n8n-nodes-base.httpRequest': {
    baseExecutionTime: 100,
    memoryUsage: 1,
    cpuIntensity: 3,
    ioIntensity: 5,
    networkIntensity: 9,
    scalingFactor: 1.5,
    optimizationTips: [
      'Use connection pooling',
      'Implement retry logic with exponential backoff',
      'Cache responses when possible',
      'Optimize request payload size'
    ]
  },
  'n8n-nodes-base.set': {
    baseExecutionTime: 2,
    memoryUsage: 0.2,
    cpuIntensity: 2,
    ioIntensity: 1,
    networkIntensity: 1,
    scalingFactor: 1.1,
    optimizationTips: ['Use efficient data transformations', 'Avoid complex expressions']
  },
  'n8n-nodes-base.code': {
    baseExecutionTime: 10,
    memoryUsage: 2,
    cpuIntensity: 5,
    ioIntensity: 2,
    networkIntensity: 1,
    scalingFactor: 2,
    optimizationTips: [
      'Optimize JavaScript code for performance',
      'Avoid memory leaks in code',
      'Use efficient algorithms',
      'Minimize object creation'
    ]
  },
  'n8n-nodes-base.function': {
    baseExecutionTime: 15,
    memoryUsage: 3,
    cpuIntensity: 6,
    ioIntensity: 2,
    networkIntensity: 1,
    scalingFactor: 2.5,
    optimizationTips: [
      'Consider migrating to Code node',
      'Optimize function logic',
      'Use efficient data processing'
    ]
  },
  'n8n-nodes-base.if': {
    baseExecutionTime: 3,
    memoryUsage: 0.3,
    cpuIntensity: 2,
    ioIntensity: 1,
    networkIntensity: 1,
    scalingFactor: 1.1,
    optimizationTips: ['Use simple comparison logic', 'Avoid complex expressions']
  },
  'n8n-nodes-base.switch': {
    baseExecutionTime: 5,
    memoryUsage: 0.5,
    cpuIntensity: 3,
    ioIntensity: 1,
    networkIntensity: 1,
    scalingFactor: 1.2,
    optimizationTips: ['Optimize switch conditions', 'Use efficient routing logic']
  },
  'n8n-nodes-base.merge': {
    baseExecutionTime: 8,
    memoryUsage: 1.5,
    cpuIntensity: 4,
    ioIntensity: 2,
    networkIntensity: 1,
    scalingFactor: 1.8,
    optimizationTips: ['Consider data volume impact', 'Use appropriate merge strategy']
  },
  '@n8n/n8n-nodes-langchain.openAi': {
    baseExecutionTime: 2000,
    memoryUsage: 5,
    cpuIntensity: 3,
    ioIntensity: 5,
    networkIntensity: 10,
    scalingFactor: 3,
    optimizationTips: [
      'Optimize prompt length',
      'Use appropriate model for task',
      'Implement request batching',
      'Cache responses when possible',
      'Monitor token usage'
    ]
  },
  '@n8n/n8n-nodes-langchain.anthropic': {
    baseExecutionTime: 1800,
    memoryUsage: 4,
    cpuIntensity: 3,
    ioIntensity: 5,
    networkIntensity: 10,
    scalingFactor: 2.8,
    optimizationTips: [
      'Optimize message structure',
      'Use appropriate model size',
      'Implement response caching',
      'Monitor API rate limits'
    ]
  }
};

/**
 * Default performance thresholds
 */
const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  maxExecutionTime: 300000, // 5 minutes
  maxMemoryUsage: 512, // 512 MB
  maxCpuUsage: 80, // 80%
  maxNodeComplexity: 8,
  minResourceEfficiency: 0.6,
  minScalabilityScore: 0.5,
  warningThresholds: {
    executionTime: 60000, // 1 minute
    memoryUsage: 256, // 256 MB
    cpuUsage: 60 // 60%
  }
};

/**
 * Performance Validator Class
 */
export class PerformanceValidator {
  private connectionValidator: ConnectionValidator;
  private thresholds: PerformanceThresholds;

  constructor(
    connectionValidator?: ConnectionValidator,
    customThresholds?: Partial<PerformanceThresholds>
  ) {
    this.connectionValidator = connectionValidator || new ConnectionValidator();
    this.thresholds = { ...DEFAULT_PERFORMANCE_THRESHOLDS, ...customThresholds };
  }

  /**
   * Validate workflow performance
   */
  validateWorkflowPerformance(workflow: N8nWorkflow): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    const nodeResults = this.validateNodePerformance(workflow);
    allErrors.push(...nodeResults.errors);
    allWarnings.push(...nodeResults.warnings);
    
    const resourceResults = this.validateResourceUsage(workflow);
    allErrors.push(...resourceResults.errors);
    allWarnings.push(...resourceResults.warnings);

    const scalabilityResults = this.validateScalability(workflow);
    allErrors.push(...scalabilityResults.errors);
    allWarnings.push(...scalabilityResults.warnings);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generatePerformanceReport(workflow: N8nWorkflow): PerformanceValidationReport {
    const nodeMetrics = this.analyzeNodePerformance(workflow);
    const workflowMetrics = this.analyzeWorkflowPerformance(workflow, nodeMetrics);
    const validationResult = this.validateWorkflowPerformance(workflow);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(workflowMetrics, nodeMetrics);
    const performanceGrade = this.getPerformanceGrade(overallScore);
    const passesThresholds = this.checkThresholds(workflowMetrics);

    // Count issues
    const criticalIssues = validationResult.errors.length;
    const warnings = validationResult.warnings.length;
    const optimizationOpportunities = this.countOptimizationOpportunities(nodeMetrics);

    // Generate recommendations
    const recommendations = this.generateRecommendations(workflowMetrics, nodeMetrics, validationResult);

    return {
      summary: {
        overallScore,
        performanceGrade,
        passesThresholds,
        criticalIssues,
        warnings,
        optimizationOpportunities
      },
      workflowMetrics,
      nodeMetrics,
      validationResults: [validationResult],
      recommendations
    };
  }

  /**
   * Validate individual node performance
   */
  private validateNodePerformance(workflow: N8nWorkflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const nodeMetrics = this.analyzeNodePerformance(workflow);

    for (const metrics of nodeMetrics) {
      if (metrics.bottleneckRisk > 0.8) {
        errors.push({
          type: 'performance',
          message: `High bottleneck risk (${(metrics.bottleneckRisk * 100).toFixed(0)}%) for node ${metrics.nodeId}`,
          nodeId: metrics.nodeId,
          severity: 'error',
        });
      }

      if (metrics.complexity > this.thresholds.maxNodeComplexity) {
        warnings.push({
          type: 'performance',
          message: `High complexity (${metrics.complexity}) for node ${metrics.nodeId}`,
          nodeId: metrics.nodeId,
        });
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate resource usage patterns
   */
  private validateResourceUsage(workflow: N8nWorkflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const workflowMetrics = this.analyzeWorkflowPerformance(workflow, this.analyzeNodePerformance(workflow));

    if (workflowMetrics.totalEstimatedExecutionTime > this.thresholds.maxExecutionTime) {
      errors.push({
        type: 'performance',
        message: `Estimated execution time exceeds maximum of ${this.thresholds.maxExecutionTime}ms`,
        severity: 'error',
      });
    }

    if (workflowMetrics.totalEstimatedMemoryUsage > this.thresholds.maxMemoryUsage) {
      errors.push({
        type: 'performance',
        message: `Estimated memory usage exceeds maximum of ${this.thresholds.maxMemoryUsage}MB`,
        severity: 'error',
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate scalability characteristics
   */
  private validateScalability(workflow: N8nWorkflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const workflowMetrics = this.analyzeWorkflowPerformance(workflow, this.analyzeNodePerformance(workflow));

    if (workflowMetrics.scalabilityScore < this.thresholds.minScalabilityScore) {
      warnings.push({
        type: 'performance',
        message: `Low scalability score (${workflowMetrics.scalabilityScore.toFixed(2)}). Consider parallel processing or batching.`,
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Analyze individual node performance
   */
  private analyzeNodePerformance(workflow: N8nWorkflow): NodePerformanceMetrics[] {
    return workflow.nodes.map(node => {
      const perfData = NODE_PERFORMANCE_DB[node.type] || this.getDefaultNodePerformance();
      
      // Calculate estimated metrics based on node configuration
      const dataVolumeMultiplier = this.estimateDataVolumeMultiplier(node);
      const complexityMultiplier = this.calculateNodeComplexity(node);
      
      const estimatedExecutionTime = perfData.baseExecutionTime * dataVolumeMultiplier * complexityMultiplier;
      const estimatedMemoryUsage = perfData.memoryUsage * dataVolumeMultiplier;
      const estimatedCpuUsage = Math.min(perfData.cpuIntensity * complexityMultiplier * 10, 100);
      
      const complexity = Math.min(perfData.cpuIntensity + perfData.ioIntensity + perfData.networkIntensity, 10);
      const resourceIntensity = this.categorizeResourceIntensity(perfData);
      const bottleneckRisk = this.calculateBottleneckRisk(perfData, estimatedExecutionTime);
      const optimizationPotential = this.calculateOptimizationPotential(perfData, complexity);

      return {
        nodeId: node.id,
        nodeType: node.type,
        estimatedExecutionTime,
        estimatedMemoryUsage,
        estimatedCpuUsage,
        complexity,
        resourceIntensity,
        bottleneckRisk,
        optimizationPotential,
        warnings: this.generateNodeWarnings(node, perfData, estimatedExecutionTime, estimatedMemoryUsage),
        recommendations: perfData.optimizationTips
      };
    });
  }

  /**
   * Analyze workflow-level performance
   */
  private analyzeWorkflowPerformance(
    workflow: N8nWorkflow, 
    nodeMetrics: NodePerformanceMetrics[]
  ): WorkflowPerformanceMetrics {
    const dataFlowAnalysis = this.connectionValidator.analyzeDataFlow(workflow);
    
    // Calculate critical path and execution time
    const criticalPath = this.calculateCriticalPath(workflow, nodeMetrics);
    const totalEstimatedExecutionTime = this.calculateTotalExecutionTime(criticalPath, nodeMetrics);
    
    // Calculate resource usage
    const totalEstimatedMemoryUsage = nodeMetrics.reduce((sum, metric) => sum + metric.estimatedMemoryUsage, 0);
    const averageCpuUsage = nodeMetrics.reduce((sum, metric) => sum + metric.estimatedCpuUsage, 0) / nodeMetrics.length;
    
    // Calculate concurrency and efficiency
    const maxConcurrentNodes = this.calculateMaxConcurrentNodes(workflow);
    const parallelExecutionPotential = this.calculateParallelExecutionPotential(workflow);
    const resourceEfficiency = this.calculateResourceEfficiency(nodeMetrics, totalEstimatedExecutionTime);
    const scalabilityScore = this.calculateScalabilityScore(workflow, nodeMetrics);
    
    // Identify bottlenecks and optimization opportunities
    const bottlenecks = this.identifyBottlenecks(nodeMetrics);
    const optimizationOpportunities = this.identifyOptimizationOpportunities(workflow, nodeMetrics);

    return {
      totalEstimatedExecutionTime,
      totalEstimatedMemoryUsage,
      averageCpuUsage,
      maxConcurrentNodes,
      parallelExecutionPotential,
      resourceEfficiency,
      scalabilityScore,
      bottlenecks,
      criticalPath,
      optimizationOpportunities
    };
  }

  /**
   * Helper methods for performance calculations
   */
  private getDefaultNodePerformance() {
    return {
      baseExecutionTime: 10,
      memoryUsage: 1,
      cpuIntensity: 3,
      ioIntensity: 2,
      networkIntensity: 1,
      scalingFactor: 1.5,
      optimizationTips: ['Consider node-specific optimizations']
    };
  }

  private estimateDataVolumeMultiplier(node: N8nNode): number {
    // Estimate based on node parameters and type
    let multiplier = 1;

    // Check for batch processing parameters
    if (node.parameters?.batchSize) {
      multiplier *= Math.max(1, node.parameters.batchSize / 100);
    }

    // Check for data transformation complexity
    if (node.parameters?.values || node.parameters?.jsCode || node.parameters?.functionCode) {
      multiplier *= 1.5;
    }

    // Check for HTTP request parameters
    if (node.type === 'n8n-nodes-base.httpRequest' && node.parameters?.url) {
      multiplier *= 1.2; // Network requests have variable latency
    }

    return Math.max(1, multiplier);
  }

  private calculateNodeComplexity(node: N8nNode): number {
    let complexity = 1;

    // Base complexity by node type
    const perfData = NODE_PERFORMANCE_DB[node.type];
    if (perfData) {
      complexity = (perfData.cpuIntensity + perfData.ioIntensity) / 2;
    }

    // Additional complexity from parameters
    const paramCount = Object.keys(node.parameters || {}).length;
    complexity += paramCount * 0.1;

    // Code-based nodes have higher complexity
    if (node.parameters?.jsCode || node.parameters?.functionCode) {
      const codeLength = (node.parameters.jsCode || node.parameters.functionCode || '').length;
      complexity += Math.min(codeLength / 1000, 3);
    }

    return Math.max(1, Math.min(complexity, 10));
  }

  private categorizeResourceIntensity(perfData: any): 'low' | 'medium' | 'high' | 'critical' {
    const totalIntensity = perfData.cpuIntensity + perfData.ioIntensity + perfData.networkIntensity;
    
    if (totalIntensity <= 6) return 'low';
    if (totalIntensity <= 12) return 'medium';
    if (totalIntensity <= 18) return 'high';
    return 'critical';
  }

  private calculateBottleneckRisk(perfData: any, executionTime: number): number {
    const networkFactor = perfData.networkIntensity / 10;
    const timeFactor = Math.min(executionTime / 10000, 1); // Normalize to 10 seconds
    const scalingFactor = Math.min(perfData.scalingFactor / 3, 1);
    
    return Math.min((networkFactor + timeFactor + scalingFactor) / 3, 1);
  }

  private calculateOptimizationPotential(perfData: any, complexity: number): number {
    const complexityFactor = complexity / 10;
    const scalingFactor = Math.min(perfData.scalingFactor / 3, 1);
    const tipsFactor = perfData.optimizationTips.length / 5;
    
    return Math.min((complexityFactor + scalingFactor + tipsFactor) / 3, 1);
  }

  private generateNodeWarnings(node: N8nNode, perfData: any, executionTime: number, memoryUsage: number): string[] {
    const warnings: string[] = [];

    if (executionTime > 5000) {
      warnings.push(`High execution time expected (${executionTime}ms)`);
    }

    if (memoryUsage > 10) {
      warnings.push(`High memory usage expected (${memoryUsage}MB)`);
    }

    if (perfData.networkIntensity > 7) {
      warnings.push('Network-dependent node may be affected by connectivity issues');
    }

    if (perfData.scalingFactor > 2) {
      warnings.push('Performance may degrade significantly with larger data volumes');
    }

    return warnings;
  }

  private calculateCriticalPath(workflow: N8nWorkflow, nodeMetrics: NodePerformanceMetrics[]): string[] {
    // Simple critical path calculation - find longest execution path
    const dataFlowAnalysis = this.connectionValidator.analyzeDataFlow(workflow);
    const paths = dataFlowAnalysis.connectionPaths;
    
    let longestPath: string[] = [];
    let longestTime = 0;

    for (const path of paths) {
      const pathTime = path.path.reduce((total, nodeId) => {
        const metric = nodeMetrics.find(m => m.nodeId === nodeId);
        return total + (metric?.estimatedExecutionTime || 0);
      }, 0);

      if (pathTime > longestTime) {
        longestTime = pathTime;
        longestPath = path.path;
      }
    }

    return longestPath;
  }

  private calculateTotalExecutionTime(criticalPath: string[], nodeMetrics: NodePerformanceMetrics[]): number {
    return criticalPath.reduce((total, nodeId) => {
      const metric = nodeMetrics.find(m => m.nodeId === nodeId);
      return total + (metric?.estimatedExecutionTime || 0);
    }, 0);
  }

  private calculateMaxConcurrentNodes(workflow: N8nWorkflow): number {
    // Calculate maximum nodes that can execute concurrently
    const dataFlowAnalysis = this.connectionValidator.analyzeDataFlow(workflow);
    
    // Simple approximation: count nodes at each depth level
    const depthLevels: Record<number, string[]> = {};
    let maxDepth = 0;

    // Build depth levels (simplified)
    for (const node of workflow.nodes) {
      const depth = this.calculateNodeDepth(workflow, node.id);
      if (!depthLevels[depth]) {
        depthLevels[depth] = [];
      }
      depthLevels[depth].push(node.id);
      maxDepth = Math.max(maxDepth, depth);
    }

    // Return maximum nodes at any single depth level
    return Math.max(...Object.values(depthLevels).map(nodes => nodes.length));
  }

  private calculateNodeDepth(workflow: N8nWorkflow, nodeId: string): number {
    // Calculate depth from entry points (simplified BFS)
    const visited = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [];
    
    // Find entry points
    const dataFlowAnalysis = this.connectionValidator.analyzeDataFlow(workflow);
    for (const entryPoint of dataFlowAnalysis.entryPoints) {
      queue.push({ nodeId: entryPoint, depth: 0 });
    }

    while (queue.length > 0) {
      const { nodeId: currentId, depth } = queue.shift()!;
      
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      if (currentId === nodeId) {
        return depth;
      }

      // Add connected nodes
      const outputs = workflow.connections[currentId];
      if (outputs) {
        for (const outputType of Object.values(outputs)) {
          for (const connection of outputType) {
            if (!visited.has(connection.node)) {
              queue.push({ nodeId: connection.node, depth: depth + 1 });
            }
          }
        }
      }
    }

    return 0;
  }

  private calculateParallelExecutionPotential(workflow: N8nWorkflow): number {
    const totalNodes = workflow.nodes.length;
    const maxConcurrent = this.calculateMaxConcurrentNodes(workflow);
    
    return totalNodes > 0 ? maxConcurrent / totalNodes : 0;
  }

  private calculateResourceEfficiency(nodeMetrics: NodePerformanceMetrics[], totalExecutionTime: number): number {
    const totalComplexity = nodeMetrics.reduce((sum, metric) => sum + metric.complexity, 0);
    const avgComplexity = totalComplexity / nodeMetrics.length;
    
    // Normalize execution time (lower is better)
    const timeEfficiency = Math.max(0, 1 - (totalExecutionTime / 300000)); // 5 minutes baseline
    
    // Combine complexity and time efficiency
    return (avgComplexity / 10 + timeEfficiency) / 2;
  }

  private calculateScalabilityScore(workflow: N8nWorkflow, nodeMetrics: NodePerformanceMetrics[]): number {
    const parallelPotential = this.calculateParallelExecutionPotential(workflow);
    const avgScalingFactor = nodeMetrics.reduce((sum, metric) => {
      const perfData = NODE_PERFORMANCE_DB[metric.nodeType];
      return sum + (perfData?.scalingFactor || 1.5);
    }, 0) / nodeMetrics.length;
    
    // Lower scaling factor is better for scalability
    const scalingScore = Math.max(0, 1 - (avgScalingFactor - 1) / 2);
    
    return (parallelPotential + scalingScore) / 2;
  }

  private identifyBottlenecks(nodeMetrics: NodePerformanceMetrics[]): string[] {
    return nodeMetrics.filter(m => m.bottleneckRisk > 0.7).map(m => m.nodeId);
  }

  private identifyOptimizationOpportunities(workflow: N8nWorkflow, nodeMetrics: NodePerformanceMetrics[]): string[] {
    const opportunities: string[] = [];
    
    // High optimization potential nodes
    const optimizableNodes = nodeMetrics.filter(m => m.optimizationPotential > 0.6);
    if (optimizableNodes.length > 0) {
      opportunities.push(`${optimizableNodes.length} nodes have high optimization potential`);
    }

    // Parallel execution opportunities
    const parallelPotential = this.calculateParallelExecutionPotential(workflow);
    if (parallelPotential < 0.5 && workflow.nodes.length > 3) {
      opportunities.push('Consider restructuring for better parallel execution');
    }

    // Resource-intensive node optimization
    const resourceIntensiveNodes = nodeMetrics.filter(m => m.resourceIntensity === 'high' || m.resourceIntensity === 'critical');
    if (resourceIntensiveNodes.length > 0) {
      opportunities.push(`Optimize ${resourceIntensiveNodes.length} resource-intensive nodes`);
    }

    return opportunities;
  }

  private calculateOverallScore(workflowMetrics: WorkflowPerformanceMetrics, nodeMetrics: NodePerformanceMetrics[]): number {
    const efficiency = workflowMetrics.resourceEfficiency * 100;
    const scalability = workflowMetrics.scalabilityScore * 100;
    const avgOptimization = nodeMetrics.reduce((sum, m) => sum + m.optimizationPotential, 0) / nodeMetrics.length * 100;
    
    // Weight: 40% efficiency, 30% scalability, 30% optimization potential
    return Math.round((efficiency * 0.4 + scalability * 0.3 + (100 - avgOptimization) * 0.3));
  }

  private getPerformanceGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private checkThresholds(workflowMetrics: WorkflowPerformanceMetrics): boolean {
    return (
      workflowMetrics.totalEstimatedExecutionTime <= this.thresholds.maxExecutionTime &&
      workflowMetrics.totalEstimatedMemoryUsage <= this.thresholds.maxMemoryUsage
    );
  }

  private countOptimizationOpportunities(nodeMetrics: NodePerformanceMetrics[]): number {
    return nodeMetrics.reduce((acc, m) => acc + m.recommendations.length, 0);
  }

  private generateRecommendations(
    workflowMetrics: WorkflowPerformanceMetrics,
    nodeMetrics: NodePerformanceMetrics[],
    validationResult: ValidationResult
  ): { immediate: string[]; shortTerm: string[]; longTerm: string[] } {
    const recommendations = {
      immediate: [] as string[],
      shortTerm: [] as string[],
      longTerm: [] as string[]
    };

    // Based on validation errors
    for (const error of validationResult.errors) {
      if (error.nodeId) {
        recommendations.immediate.push(`Address performance error on node ${error.nodeId}: ${error.message}`);
      } else {
        recommendations.immediate.push(`Address workflow-level performance error: ${error.message}`);
      }
    }

    // Based on bottlenecks
    for (const bottleneck of workflowMetrics.bottlenecks) {
      recommendations.immediate.push(`Address bottleneck at node ${bottleneck}`);
    }

    // Based on optimization opportunities
    for (const opportunity of workflowMetrics.optimizationOpportunities) {
      recommendations.shortTerm.push(opportunity);
    }
    
    // General long-term recommendations
    if (workflowMetrics.scalabilityScore < 0.7) {
        recommendations.longTerm.push("Review overall workflow architecture for better scalability.");
    }

    return recommendations;
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * Get current performance thresholds
   */
  getThresholds(): PerformanceThresholds {
    return this.thresholds;
  }
} 