/**
 * Validation Error Integrator
 * Main orchestrator that integrates advanced error handling with all validation systems
 */

import { EventEmitter } from 'events';
import { PerformanceAwareErrorHandler, PerformanceAwareConfig } from '../error-handling/performance-aware-error-handler';
import { ErrorClassifier, ErrorContext, ClassifiedError } from '../error-handling/error-classifier';
import { AdvancedErrorLogger } from '../error-handling/error-logger';
import { ErrorReporter } from '../error-handling/error-reporter';

// Validation system imports
import { N8NWorkflowSchemaValidator, N8NWorkflowSchema, ValidationResult } from './n8n-workflow-schema';
import { DataFlowValidator, DataFlowValidationReport } from './data-flow-validator';
import { ConnectionValidator } from './connection-validator';
import { NodeCompatibilityValidator } from './node-compatibility-validator';
import { PerformanceValidator } from './performance-validator';
import { ErrorHandlingValidator } from './error-handling-validator';

// Community node integration imports
import { CommunityNodeIntegrationManager } from '../community/community-node-integration-api';
import { CommunityNodeValidator } from '../community/community-node-validator';

// Knowledge management imports
import { KnowledgeManagementSystem } from '../integration/knowledge-management-system';
import { LearningIntegrationManager } from '../integration/learning-integration-system';

/**
 * Unified validation result format
 */
export interface UnifiedValidationResult {
  // Basic result info
  id: string;
  timestamp: Date;
  validationDuration: number;
  
  // Overall validation status
  overallValid: boolean;
  overallSeverity: 'info' | 'warning' | 'error' | 'critical';
  
  // System-specific results
  workflowValidation: {
    valid: boolean;
    results: ValidationResult[];
    duration: number;
    errorCount: number;
    warningCount: number;
  };
  
  dataFlowValidation: {
    valid: boolean;
    report: DataFlowValidationReport;
    duration: number;
    pathIssues: number;
    typeIssues: number;
  };
  
  connectionValidation: {
    valid: boolean;
    results: ValidationResult[];
    duration: number;
    connectionIssues: number;
  };
  
  nodeCompatibilityValidation: {
    valid: boolean;
    results: ValidationResult[];
    duration: number;
    compatibilityIssues: number;
  };
  
  performanceValidation: {
    valid: boolean;
    results: ValidationResult[];
    duration: number;
    performanceIssues: number;
  };
  
  errorHandlingValidation: {
    valid: boolean;
    results: ValidationResult[];
    duration: number;
    resilienceScore: number;
  };
  
  communityNodeValidation?: {
    valid: boolean;
    results: any[];
    duration: number;
    communityNodeIssues: number;
  };
  
  knowledgeValidation?: {
    valid: boolean;
    insights: string[];
    duration: number;
    learningOpportunities: number;
  };
  
  // Error handling integration
  errorHandling: {
    errorsEncountered: number;
    errorsResolved: number;
    performanceImpact: number;
    adaptiveModeUsed: boolean;
    fallbacksTriggered: number;
  };
  
  // Aggregated recommendations
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    performanceOptimizations: string[];
    errorHandlingImprovements: string[];
  };
  
  // Performance metrics
  performanceMetrics: {
    totalValidationTime: number;
    validationBreakdown: Record<string, number>;
    memoryUsage: number;
    errorHandlingOverhead: number;
    systemLoad: number;
  };
}

/**
 * Validation configuration
 */
export interface ValidationConfiguration {
  // Core validation settings
  enableWorkflowValidation: boolean;
  enableDataFlowValidation: boolean;
  enableConnectionValidation: boolean;
  enableNodeCompatibilityValidation: boolean;
  enablePerformanceValidation: boolean;
  enableErrorHandlingValidation: boolean;
  
  // Optional integrations
  enableCommunityNodeValidation: boolean;
  enableKnowledgeValidation: boolean;
  
  // Performance settings
  maxValidationTime: number;
  enableParallelValidation: boolean;
  validationPriority: 'speed' | 'thoroughness' | 'balanced';
  
  // Error handling integration
  errorHandlingConfig: Partial<PerformanceAwareConfig>;
  adaptiveValidation: boolean;
  fallbackOnErrors: boolean;
  
  // Reporting settings
  detailedReporting: boolean;
  includePerformanceMetrics: boolean;
  generateRecommendations: boolean;
}

/**
 * Validation context
 */
export interface ValidationContext {
  workflowId?: string;
  userId?: string;
  sessionId?: string;
  validationType: 'full' | 'incremental' | 'focused';
  targetSystems: string[];
  performanceConstraints?: {
    maxTime: number;
    maxMemory: number;
  };
  errorTolerance: 'strict' | 'tolerant' | 'adaptive';
}

/**
 * Main Validation Error Integrator Class
 */
export class ValidationErrorIntegrator extends EventEmitter {
  private errorHandler: PerformanceAwareErrorHandler;
  private config: ValidationConfiguration;
  
  // Core validators
  private workflowValidator: N8NWorkflowSchemaValidator;
  private dataFlowValidator: DataFlowValidator;
  private connectionValidator: ConnectionValidator;
  private nodeCompatibilityValidator: NodeCompatibilityValidator;
  private performanceValidator: PerformanceValidator;
  private errorHandlingValidator: ErrorHandlingValidator;
  
  // Optional integrations
  private communityNodeManager?: CommunityNodeIntegrationManager;
  private communityNodeValidator?: CommunityNodeValidator;
  private knowledgeManager?: KnowledgeManagementSystem;
  private learningManager?: LearningIntegrationManager;
  
  // Performance tracking
  private validationStats = {
    totalValidations: 0,
    successfulValidations: 0,
    failedValidations: 0,
    averageValidationTime: 0,
    errorHandlingInvocations: 0
  };
  
  constructor(config: Partial<ValidationConfiguration> = {}) {
    super();
    
    // Initialize configuration with defaults
    this.config = {
      enableWorkflowValidation: true,
      enableDataFlowValidation: true,
      enableConnectionValidation: true,
      enableNodeCompatibilityValidation: true,
      enablePerformanceValidation: true,
      enableErrorHandlingValidation: true,
      enableCommunityNodeValidation: false,
      enableKnowledgeValidation: false,
      maxValidationTime: 30000, // 30 seconds
      enableParallelValidation: true,
      validationPriority: 'balanced',
      errorHandlingConfig: {},
      adaptiveValidation: true,
      fallbackOnErrors: true,
      detailedReporting: true,
      includePerformanceMetrics: true,
      generateRecommendations: true,
      ...config
    };
    
    this.initializeComponents();
    this.setupEventHandlers();
  }
  
  /**
   * Main validation method
   */
  async validateWorkflow(
    workflow: N8NWorkflowSchema,
    context: ValidationContext = { validationType: 'full', targetSystems: ['all'], errorTolerance: 'adaptive' }
  ): Promise<UnifiedValidationResult> {
    const validationId = this.generateValidationId();
    const startTime = performance.now();
    
    this.emit('validation:started', { id: validationId, workflow: workflow.name, context });
    
    try {
      // Initialize result structure
      const result: UnifiedValidationResult = {
        id: validationId,
        timestamp: new Date(),
        validationDuration: 0,
        overallValid: true,
        overallSeverity: 'info',
        workflowValidation: { valid: true, results: [], duration: 0, errorCount: 0, warningCount: 0 },
        dataFlowValidation: { valid: true, report: {} as DataFlowValidationReport, duration: 0, pathIssues: 0, typeIssues: 0 },
        connectionValidation: { valid: true, results: [], duration: 0, connectionIssues: 0 },
        nodeCompatibilityValidation: { valid: true, results: [], duration: 0, compatibilityIssues: 0 },
        performanceValidation: { valid: true, results: [], duration: 0, performanceIssues: 0 },
        errorHandlingValidation: { valid: true, results: [], duration: 0, resilienceScore: 0 },
        errorHandling: { 
          errorsEncountered: 0, 
          errorsResolved: 0, 
          performanceImpact: 0, 
          adaptiveModeUsed: false, 
          fallbacksTriggered: 0 
        },
        recommendations: {
          immediate: [],
          shortTerm: [],
          longTerm: [],
          performanceOptimizations: [],
          errorHandlingImprovements: []
        },
        performanceMetrics: {
          totalValidationTime: 0,
          validationBreakdown: {},
          memoryUsage: 0,
          errorHandlingOverhead: 0,
          systemLoad: 0
        }
      };
      
      // Prepare validation tasks
      const validationTasks: Array<() => Promise<void>> = [];
      
      // Core validation tasks
      if (this.config.enableWorkflowValidation) {
        validationTasks.push(() => this.runWorkflowValidation(workflow, result, context));
      }
      
      if (this.config.enableDataFlowValidation) {
        validationTasks.push(() => this.runDataFlowValidation(workflow, result, context));
      }
      
      if (this.config.enableConnectionValidation) {
        validationTasks.push(() => this.runConnectionValidation(workflow, result, context));
      }
      
      if (this.config.enableNodeCompatibilityValidation) {
        validationTasks.push(() => this.runNodeCompatibilityValidation(workflow, result, context));
      }
      
      if (this.config.enablePerformanceValidation) {
        validationTasks.push(() => this.runPerformanceValidation(workflow, result, context));
      }
      
      if (this.config.enableErrorHandlingValidation) {
        validationTasks.push(() => this.runErrorHandlingValidation(workflow, result, context));
      }
      
      // Optional integration tasks
      if (this.config.enableCommunityNodeValidation && this.communityNodeManager) {
        validationTasks.push(() => this.runCommunityNodeValidation(workflow, result, context));
      }
      
      if (this.config.enableKnowledgeValidation && this.knowledgeManager) {
        validationTasks.push(() => this.runKnowledgeValidation(workflow, result, context));
      }
      
      // Execute validation tasks
      if (this.config.enableParallelValidation && validationTasks.length > 1) {
        await this.executeParallelValidation(validationTasks, context);
      } else {
        await this.executeSequentialValidation(validationTasks, context);
      }
      
      // Finalize result
      result.validationDuration = performance.now() - startTime;
      result.performanceMetrics.totalValidationTime = result.validationDuration;
      
      this.finalizeValidationResult(result);
      this.updateStats(result);
      
      this.emit('validation:completed', { id: validationId, result, duration: result.validationDuration });
      
      return result;
      
    } catch (error) {
      const errorContext: ErrorContext = {
        timestamp: new Date(),
        userId: context.userId,
        sessionId: context.sessionId,
        systemInfo: {
          component: 'ValidationErrorIntegrator',
          operation: 'validateWorkflow',
          workflowId: context.workflowId
        }
      };
      
      // Handle validation error through our error handling system
      const errorResult = await this.errorHandler.handleError(error as Error, errorContext);
      
      this.emit('validation:error', { id: validationId, error, errorResult });
      
      // Return a failed validation result
      const failedResult: UnifiedValidationResult = {
        id: validationId,
        timestamp: new Date(),
        validationDuration: performance.now() - startTime,
        overallValid: false,
        overallSeverity: 'critical',
        workflowValidation: { valid: false, results: [], duration: 0, errorCount: 1, warningCount: 0 },
        dataFlowValidation: { valid: false, report: {} as DataFlowValidationReport, duration: 0, pathIssues: 0, typeIssues: 0 },
        connectionValidation: { valid: false, results: [], duration: 0, connectionIssues: 0 },
        nodeCompatibilityValidation: { valid: false, results: [], duration: 0, compatibilityIssues: 0 },
        performanceValidation: { valid: false, results: [], duration: 0, performanceIssues: 0 },
        errorHandlingValidation: { valid: false, results: [], duration: 0, resilienceScore: 0 },
        errorHandling: { 
          errorsEncountered: 1, 
          errorsResolved: errorResult.success ? 1 : 0, 
          performanceImpact: errorResult.performanceMetrics.totalTime, 
          adaptiveModeUsed: true, 
          fallbacksTriggered: errorResult.success ? 0 : 1 
        },
        recommendations: {
          immediate: ['Fix validation system error before proceeding'],
          shortTerm: [],
          longTerm: [],
          performanceOptimizations: [],
          errorHandlingImprovements: []
        },
        performanceMetrics: {
          totalValidationTime: performance.now() - startTime,
          validationBreakdown: {},
          memoryUsage: 0,
          errorHandlingOverhead: errorResult.performanceMetrics.totalTime,
          systemLoad: 0
        }
      };
      
      this.updateStats(failedResult);
      return failedResult;
    }
  }
  
  /**
   * Execute parallel validation tasks
   */
  private async executeParallelValidation(
    tasks: Array<() => Promise<void>>,
    context: ValidationContext
  ): Promise<void> {
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Validation timeout')), this.config.maxValidationTime);
    });
    
    try {
      await Promise.race([
        Promise.all(tasks.map(task => this.executeWithErrorHandling(task, context))),
        timeoutPromise
      ]);
    } catch (error) {
      // Handle timeout or other errors
      const errorContext: ErrorContext = {
        timestamp: new Date(),
        userId: context.userId,
        sessionId: context.sessionId,
        systemInfo: {
          component: 'ValidationErrorIntegrator',
          operation: 'executeParallelValidation'
        }
      };
      
      await this.errorHandler.handleError(error as Error, errorContext);
      throw error;
    }
  }
  
  /**
   * Execute sequential validation tasks
   */
  private async executeSequentialValidation(
    tasks: Array<() => Promise<void>>,
    context: ValidationContext
  ): Promise<void> {
    for (const task of tasks) {
      await this.executeWithErrorHandling(task, context);
    }
  }
  
  /**
   * Execute a single validation task with error handling
   */
  private async executeWithErrorHandling(
    task: () => Promise<void>,
    context: ValidationContext
  ): Promise<void> {
    try {
      await task();
    } catch (error) {
      if (context.errorTolerance === 'strict') {
        throw error;
      }
      
      // Handle error through our system
      const errorContext: ErrorContext = {
        timestamp: new Date(),
        userId: context.userId,
        sessionId: context.sessionId,
        systemInfo: {
          component: 'ValidationErrorIntegrator',
          operation: 'executeValidationTask'
        }
      };
      
      const errorResult = await this.errorHandler.handleError(error as Error, errorContext);
      
      if (context.errorTolerance === 'tolerant' || errorResult.success) {
        // Continue with other validations
        return;
      }
      
      throw error;
    }
  }
  
  /**
   * Run workflow schema validation
   */
  private async runWorkflowValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const validationResults = this.workflowValidator.validate(workflow);
      
      result.workflowValidation = {
        valid: validationResults.every(r => r.valid),
        results: validationResults,
        duration: performance.now() - startTime,
        errorCount: validationResults.filter(r => !r.valid && r.severity === 'error').length,
        warningCount: validationResults.filter(r => !r.valid && r.severity === 'warning').length
      };
      
      result.performanceMetrics.validationBreakdown['workflow'] = result.workflowValidation.duration;
      
    } catch (error) {
      result.workflowValidation.valid = false;
      result.workflowValidation.duration = performance.now() - startTime;
      result.workflowValidation.errorCount = 1;
      throw error;
    }
  }
  
  /**
   * Run data flow validation
   */
  private async runDataFlowValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const report = this.dataFlowValidator.generateDataFlowReport(workflow);
      
      result.dataFlowValidation = {
        valid: report.summary.errors === 0,
        report,
        duration: performance.now() - startTime,
        pathIssues: report.summary.invalidPaths,
        typeIssues: report.summary.dataTypeIssues
      };
      
      result.performanceMetrics.validationBreakdown['dataFlow'] = result.dataFlowValidation.duration;
      
    } catch (error) {
      result.dataFlowValidation.valid = false;
      result.dataFlowValidation.duration = performance.now() - startTime;
      throw error;
    }
  }
  
  /**
   * Run connection validation
   */
  private async runConnectionValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const validationResults = this.connectionValidator.validateWorkflowConnections(workflow);
      
      result.connectionValidation = {
        valid: validationResults.every(r => r.valid),
        results: validationResults,
        duration: performance.now() - startTime,
        connectionIssues: validationResults.filter(r => !r.valid).length
      };
      
      result.performanceMetrics.validationBreakdown['connection'] = result.connectionValidation.duration;
      
    } catch (error) {
      result.connectionValidation.valid = false;
      result.connectionValidation.duration = performance.now() - startTime;
      result.connectionValidation.connectionIssues = 1;
      throw error;
    }
  }
  
  /**
   * Run node compatibility validation
   */
  private async runNodeCompatibilityValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const validationResults = this.nodeCompatibilityValidator.validateWorkflowNodeCompatibility(workflow);
      
      result.nodeCompatibilityValidation = {
        valid: validationResults.every(r => r.valid),
        results: validationResults,
        duration: performance.now() - startTime,
        compatibilityIssues: validationResults.filter(r => !r.valid).length
      };
      
      result.performanceMetrics.validationBreakdown['nodeCompatibility'] = result.nodeCompatibilityValidation.duration;
      
    } catch (error) {
      result.nodeCompatibilityValidation.valid = false;
      result.nodeCompatibilityValidation.duration = performance.now() - startTime;
      result.nodeCompatibilityValidation.compatibilityIssues = 1;
      throw error;
    }
  }
  
  /**
   * Run performance validation
   */
  private async runPerformanceValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const validationResults = this.performanceValidator.validatePerformance(workflow);
      
      result.performanceValidation = {
        valid: validationResults.every(r => r.valid),
        results: validationResults,
        duration: performance.now() - startTime,
        performanceIssues: validationResults.filter(r => !r.valid).length
      };
      
      result.performanceMetrics.validationBreakdown['performance'] = result.performanceValidation.duration;
      
    } catch (error) {
      result.performanceValidation.valid = false;
      result.performanceValidation.duration = performance.now() - startTime;
      result.performanceValidation.performanceIssues = 1;
      throw error;
    }
  }
  
  /**
   * Run error handling validation
   */
  private async runErrorHandlingValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      const validationResults = this.errorHandlingValidator.validateErrorHandling(workflow);
      const workflowAnalysis = this.errorHandlingValidator.analyzeWorkflowErrorHandling(workflow);
      
      result.errorHandlingValidation = {
        valid: validationResults.every(r => r.valid),
        results: validationResults,
        duration: performance.now() - startTime,
        resilienceScore: workflowAnalysis.resilience
      };
      
      result.performanceMetrics.validationBreakdown['errorHandling'] = result.errorHandlingValidation.duration;
      
    } catch (error) {
      result.errorHandlingValidation.valid = false;
      result.errorHandlingValidation.duration = performance.now() - startTime;
      result.errorHandlingValidation.resilienceScore = 0;
      throw error;
    }
  }
  
  /**
   * Run community node validation (optional)
   */
  private async runCommunityNodeValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    if (!this.communityNodeValidator) return;
    
    const startTime = performance.now();
    
    try {
      // Find community nodes in workflow
      const communityNodes = workflow.nodes.filter(node => 
        !node.type.startsWith('n8n-nodes-base.')
      );
      
      const validationResults = [];
      for (const node of communityNodes) {
        const nodeValidation = await this.communityNodeValidator.validateNode(node.type, {
          validateSchema: true,
          validateSecurity: true,
          validatePerformance: true
        });
        validationResults.push(nodeValidation);
      }
      
      result.communityNodeValidation = {
        valid: validationResults.every(r => r.isValid),
        results: validationResults,
        duration: performance.now() - startTime,
        communityNodeIssues: validationResults.filter(r => !r.isValid).length
      };
      
      result.performanceMetrics.validationBreakdown['communityNode'] = result.communityNodeValidation.duration;
      
    } catch (error) {
      result.communityNodeValidation = {
        valid: false,
        results: [],
        duration: performance.now() - startTime,
        communityNodeIssues: 1
      };
      throw error;
    }
  }
  
  /**
   * Run knowledge validation (optional)
   */
  private async runKnowledgeValidation(
    workflow: N8NWorkflowSchema,
    result: UnifiedValidationResult,
    context: ValidationContext
  ): Promise<void> {
    if (!this.knowledgeManager || !this.learningManager) return;
    
    const startTime = performance.now();
    
    try {
      // Use knowledge system to provide insights
      const insights: string[] = [];
      const learningOpportunities = 0;
      
      // This is a placeholder - actual implementation would query the knowledge system
      // for workflow patterns, best practices, and learning opportunities
      
      result.knowledgeValidation = {
        valid: true,
        insights,
        duration: performance.now() - startTime,
        learningOpportunities
      };
      
      result.performanceMetrics.validationBreakdown['knowledge'] = result.knowledgeValidation.duration;
      
    } catch (error) {
      result.knowledgeValidation = {
        valid: false,
        insights: [],
        duration: performance.now() - startTime,
        learningOpportunities: 0
      };
      throw error;
    }
  }
  
  /**
   * Finalize validation result
   */
  private finalizeValidationResult(result: UnifiedValidationResult): void {
    // Determine overall validity
    const validationResults = [
      result.workflowValidation.valid,
      result.dataFlowValidation.valid,
      result.connectionValidation.valid,
      result.nodeCompatibilityValidation.valid,
      result.performanceValidation.valid,
      result.errorHandlingValidation.valid
    ];
    
    if (result.communityNodeValidation) {
      validationResults.push(result.communityNodeValidation.valid);
    }
    
    if (result.knowledgeValidation) {
      validationResults.push(result.knowledgeValidation.valid);
    }
    
    result.overallValid = validationResults.every(v => v);
    
    // Determine overall severity
    const errorCounts = [
      result.workflowValidation.errorCount,
      result.dataFlowValidation.pathIssues + result.dataFlowValidation.typeIssues,
      result.connectionValidation.connectionIssues,
      result.nodeCompatibilityValidation.compatibilityIssues,
      result.performanceValidation.performanceIssues
    ];
    
    if (result.communityNodeValidation) {
      errorCounts.push(result.communityNodeValidation.communityNodeIssues);
    }
    
    const totalErrors = errorCounts.reduce((sum, count) => sum + count, 0);
    
    if (totalErrors === 0) {
      result.overallSeverity = 'info';
    } else if (totalErrors <= 2) {
      result.overallSeverity = 'warning';
    } else if (totalErrors <= 5) {
      result.overallSeverity = 'error';
    } else {
      result.overallSeverity = 'critical';
    }
    
    // Generate recommendations if enabled
    if (this.config.generateRecommendations) {
      this.generateRecommendations(result);
    }
    
    // Calculate memory usage and system load
    if (this.config.includePerformanceMetrics) {
      result.performanceMetrics.memoryUsage = this.getMemoryUsage();
      result.performanceMetrics.systemLoad = this.getSystemLoad();
      result.performanceMetrics.errorHandlingOverhead = result.errorHandling.performanceImpact;
    }
  }
  
  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(result: UnifiedValidationResult): void {
    // Immediate recommendations
    if (!result.workflowValidation.valid) {
      result.recommendations.immediate.push('Fix workflow schema errors before deployment');
    }
    
    if (!result.dataFlowValidation.valid) {
      result.recommendations.immediate.push('Resolve data flow issues to prevent runtime errors');
    }
    
    if (!result.connectionValidation.valid) {
      result.recommendations.immediate.push('Fix node connection problems');
    }
    
    // Short-term recommendations
    if (result.performanceValidation.performanceIssues > 0) {
      result.recommendations.shortTerm.push('Optimize workflow performance');
    }
    
    if (result.errorHandlingValidation.resilienceScore < 0.7) {
      result.recommendations.shortTerm.push('Improve error handling resilience');
    }
    
    // Long-term recommendations
    if (result.communityNodeValidation && result.communityNodeValidation.communityNodeIssues > 0) {
      result.recommendations.longTerm.push('Consider alternatives to problematic community nodes');
    }
    
    // Performance optimizations
    if (result.performanceMetrics.totalValidationTime > 10000) {
      result.recommendations.performanceOptimizations.push('Enable parallel validation for faster results');
    }
    
    // Error handling improvements
    if (result.errorHandling.errorsEncountered > 0) {
      result.recommendations.errorHandlingImprovements.push('Review error handling configuration');
    }
  }
  
  /**
   * Initialize all components
   */
  private initializeComponents(): void {
    // Initialize error handler
    this.errorHandler = new PerformanceAwareErrorHandler(this.config.errorHandlingConfig);
    
    // Initialize core validators
    this.workflowValidator = new N8NWorkflowSchemaValidator();
    this.connectionValidator = new ConnectionValidator();
    this.dataFlowValidator = new DataFlowValidator(this.connectionValidator);
    this.nodeCompatibilityValidator = new NodeCompatibilityValidator();
    this.performanceValidator = new PerformanceValidator();
    this.errorHandlingValidator = new ErrorHandlingValidator(this.connectionValidator);
    
    // Initialize optional components based on configuration
    if (this.config.enableCommunityNodeValidation) {
      this.communityNodeManager = new CommunityNodeIntegrationManager();
      this.communityNodeValidator = new CommunityNodeValidator();
    }
    
    if (this.config.enableKnowledgeValidation) {
      // Initialize knowledge components - placeholder for actual implementation
      // this.knowledgeManager = new KnowledgeManagementSystem();
      // this.learningManager = new LearningIntegrationManager();
    }
  }
  
  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.errorHandler.on('error:handled', (data) => {
      this.emit('error:handled', data);
    });
    
    this.errorHandler.on('performance:degraded', (data) => {
      this.emit('performance:degraded', data);
    });
    
    this.errorHandler.on('mode:changed', (data) => {
      this.emit('adaptive:mode:changed', data);
    });
  }
  
  /**
   * Utility methods
   */
  private generateValidationId(): string {
    return `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private getMemoryUsage(): number {
    const usage = process.memoryUsage();
    return usage.heapUsed / 1024 / 1024; // MB
  }
  
  private getSystemLoad(): number {
    // Simplified system load calculation
    const usage = process.cpuUsage();
    return (usage.user + usage.system) / 1000000; // Convert to seconds
  }
  
  private updateStats(result: UnifiedValidationResult): void {
    this.validationStats.totalValidations++;
    
    if (result.overallValid) {
      this.validationStats.successfulValidations++;
    } else {
      this.validationStats.failedValidations++;
    }
    
    // Update average validation time
    const currentAvg = this.validationStats.averageValidationTime;
    const newAvg = (currentAvg * (this.validationStats.totalValidations - 1) + result.validationDuration) / this.validationStats.totalValidations;
    this.validationStats.averageValidationTime = newAvg;
    
    this.validationStats.errorHandlingInvocations += result.errorHandling.errorsEncountered;
  }
  
  /**
   * Get validation statistics
   */
  getValidationStats(): typeof this.validationStats {
    return { ...this.validationStats };
  }
  
  /**
   * Get current configuration
   */
  getConfiguration(): ValidationConfiguration {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(newConfig: Partial<ValidationConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize components if necessary
    if (newConfig.errorHandlingConfig) {
      this.errorHandler = new PerformanceAwareErrorHandler(this.config.errorHandlingConfig);
      this.setupEventHandlers();
    }
  }
  
  /**
   * Shutdown the integrator
   */
  async shutdown(): Promise<void> {
    await this.errorHandler.shutdown();
    
    if (this.communityNodeManager) {
      // Shutdown community node manager if needed
    }
    
    this.emit('shutdown');
  }
}

export default ValidationErrorIntegrator; 