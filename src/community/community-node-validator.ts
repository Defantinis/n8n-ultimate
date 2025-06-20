/**
 * Community Node Validation Framework
 * Extends existing validation system to support community-developed n8n nodes
 */

import { EventEmitter } from 'events';
import { CommunityNodeDefinition, CommunityNodePackage } from './community-node-registry';
import { DynamicNodeParser, ParsedNodeDefinition, ParsingResult } from './dynamic-node-parser';

// Import existing validation systems
import { N8NWorkflowSchemaValidator } from '../validation/n8n-workflow-schema';
import { NodeCompatibilityValidator } from '../validation/node-compatibility-validator';
import { ConnectionValidator } from '../validation/connection-validator';
import { DataFlowValidator } from '../validation/data-flow-validator';
import { PerformanceValidator } from '../validation/performance-validator';
import { ErrorHandlingValidator } from '../validation/error-handling-validator';

// Core interfaces for community node validation
export interface CommunityValidationResult {
  isValid: boolean;
  score: number; // 0-100 validation score
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  errors: ValidationError[];
  warnings: ValidationWarning[];
  recommendations: ValidationRecommendation[];
  compatibility: CompatibilityReport;
  performance: PerformanceReport;
  security: SecurityReport;
  metadata: ValidationMetadata;
}

export interface ValidationError {
  type: ValidationErrorType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  location?: string;
  suggestion?: string;
  code: string;
}

export interface ValidationWarning {
  type: ValidationWarningType;
  message: string;
  location?: string;
  suggestion?: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ValidationRecommendation {
  type: RecommendationType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  benefits: string[];
}

export interface CompatibilityReport {
  n8nVersion: string;
  compatible: boolean;
  compatibilityLevel: 'full' | 'partial' | 'limited' | 'incompatible';
  missingFeatures: string[];
  deprecatedFeatures: string[];
  versionConflicts: VersionConflict[];
  migrationPath?: MigrationPath;
}

export interface PerformanceReport {
  estimatedExecutionTime: number;
  memoryUsage: number;
  resourceIntensity: 'low' | 'medium' | 'high';
  scalabilityScore: number;
  bottlenecks: PerformanceBottleneck[];
  optimizations: PerformanceOptimization[];
}

export interface SecurityReport {
  securityScore: number;
  vulnerabilities: SecurityVulnerability[];
  permissions: PermissionRequirement[];
  dataHandling: DataHandlingAnalysis;
  compliance: ComplianceCheck[];
}

export interface ValidationMetadata {
  validationTime: number;
  validatorVersion: string;
  nodeVersion: string;
  rulesApplied: string[];
  checksPerformed: number;
  timestamp: Date;
}

export type ValidationErrorType = 
  | 'SCHEMA_INVALID'
  | 'PROPERTY_MISSING'
  | 'TYPE_MISMATCH'
  | 'DEPENDENCY_MISSING'
  | 'VERSION_INCOMPATIBLE'
  | 'SECURITY_VIOLATION'
  | 'PERFORMANCE_ISSUE'
  | 'CONNECTION_INVALID'
  | 'CREDENTIAL_INVALID'
  | 'WEBHOOK_INVALID'
  | 'EXECUTION_ERROR';

export type ValidationWarningType =
  | 'DEPRECATED_FEATURE'
  | 'PERFORMANCE_CONCERN'
  | 'COMPATIBILITY_ISSUE'
  | 'SECURITY_CONCERN'
  | 'BEST_PRACTICE_VIOLATION'
  | 'DOCUMENTATION_MISSING'
  | 'TESTING_INSUFFICIENT'
  | 'MAINTENANCE_CONCERN';

export type RecommendationType =
  | 'SECURITY_IMPROVEMENT'
  | 'PERFORMANCE_OPTIMIZATION'
  | 'COMPATIBILITY_ENHANCEMENT'
  | 'CODE_QUALITY'
  | 'DOCUMENTATION'
  | 'TESTING'
  | 'MAINTENANCE'
  | 'USER_EXPERIENCE';

export interface VersionConflict {
  component: string;
  required: string;
  available: string;
  severity: 'critical' | 'major' | 'minor';
  resolution?: string;
}

export interface MigrationPath {
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  estimatedTime: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface MigrationStep {
  order: number;
  description: string;
  type: 'automatic' | 'manual' | 'assisted';
  code?: string;
  validation?: string;
}

export interface PerformanceBottleneck {
  location: string;
  type: 'cpu' | 'memory' | 'network' | 'io';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
}

export interface PerformanceOptimization {
  type: 'caching' | 'batching' | 'streaming' | 'async' | 'memory' | 'network';
  description: string;
  implementation: string;
  expectedImprovement: string;
  effort: 'low' | 'medium' | 'high';
}

export interface SecurityVulnerability {
  type: 'injection' | 'exposure' | 'authentication' | 'authorization' | 'validation' | 'encryption';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  mitigation: string;
  cve?: string;
}

export interface PermissionRequirement {
  type: 'file' | 'network' | 'system' | 'credential';
  level: 'read' | 'write' | 'execute' | 'admin';
  resource: string;
  justification: string;
  alternatives?: string[];
}

export interface DataHandlingAnalysis {
  dataTypes: string[];
  sensitiveData: boolean;
  encryption: boolean;
  storage: 'memory' | 'temporary' | 'persistent' | 'external';
  retention: string;
  compliance: string[];
}

export interface ComplianceCheck {
  standard: 'GDPR' | 'HIPAA' | 'SOC2' | 'ISO27001' | 'PCI-DSS';
  compliant: boolean;
  issues: string[];
  requirements: string[];
}

export interface ValidationOptions {
  includePerformanceValidation?: boolean;
  includeSecurityValidation?: boolean;
  includeCompatibilityValidation?: boolean;
  strictMode?: boolean;
  n8nVersion?: string;
  customRules?: CustomValidationRule[];
  skipWarnings?: boolean;
  maxValidationTime?: number;
}

export interface CustomValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning';
  validator: (node: ParsedNodeDefinition, packageInfo: CommunityNodePackage) => ValidationRuleResult;
}

export interface ValidationRuleResult {
  passed: boolean;
  message?: string;
  suggestion?: string;
  details?: any;
}

export class CommunityNodeValidator extends EventEmitter {
  private parser: DynamicNodeParser;
  private workflowValidator: N8NWorkflowSchemaValidator;
  private nodeCompatibilityValidator: NodeCompatibilityValidator;
  private connectionValidator: ConnectionValidator;
  private dataFlowValidator: DataFlowValidator;
  private performanceValidator: PerformanceValidator;
  private errorHandlingValidator: ErrorHandlingValidator;
  
  private validationCache: Map<string, CommunityValidationResult> = new Map();
  private cacheTimeout: number = 30 * 60 * 1000; // 30 minutes
  private validatorVersion: string = '1.0.0';

  constructor() {
    super();
    this.parser = new DynamicNodeParser();
    this.initializeValidators();
  }

  /**
   * Initialize all validation components
   */
  private initializeValidators(): void {
    this.workflowValidator = new N8NWorkflowSchemaValidator();
    this.nodeCompatibilityValidator = new NodeCompatibilityValidator();
    this.connectionValidator = new ConnectionValidator();
    this.dataFlowValidator = new DataFlowValidator();
    this.performanceValidator = new PerformanceValidator();
    this.errorHandlingValidator = new ErrorHandlingValidator();
  }

  /**
   * Validate a community node comprehensively
   */
  async validateCommunityNode(
    nodeDefinition: CommunityNodeDefinition,
    packageInfo: CommunityNodePackage,
    options: ValidationOptions = {}
  ): Promise<CommunityValidationResult> {
    const startTime = Date.now();
    const cacheKey = `${packageInfo.name}:${nodeDefinition.name}:${nodeDefinition.version}`;

    try {
      // Check cache first
      if (this.validationCache.has(cacheKey)) {
        const cached = this.validationCache.get(cacheKey)!;
        this.emit('validationCacheHit', { nodeKey: cacheKey });
        return cached;
      }

      this.emit('validationStarted', { nodeKey: cacheKey });

      // Parse the node first
      const parsingResult = await this.parser.parseNodeDefinition(nodeDefinition, packageInfo);
      
      if (!parsingResult.success || !parsingResult.node) {
        return this.createFailedValidationResult(
          parsingResult.errors,
          'Failed to parse node definition',
          startTime
        );
      }

      // Perform comprehensive validation
      const validationResult = await this.performComprehensiveValidation(
        parsingResult.node,
        packageInfo,
        options,
        startTime
      );

      // Cache the result
      this.validationCache.set(cacheKey, validationResult);
      setTimeout(() => {
        this.validationCache.delete(cacheKey);
      }, this.cacheTimeout);

      this.emit('validationCompleted', { 
        nodeKey: cacheKey, 
        score: validationResult.score,
        grade: validationResult.grade
      });

      return validationResult;

    } catch (error) {
      this.emit('validationError', { nodeKey: cacheKey, error });
      return this.createFailedValidationResult(
        [error.message],
        'Validation process failed',
        startTime
      );
    }
  }

  /**
   * Perform comprehensive validation of a parsed node
   */
  private async performComprehensiveValidation(
    parsedNode: ParsedNodeDefinition,
    packageInfo: CommunityNodePackage,
    options: ValidationOptions,
    startTime: number
  ): Promise<CommunityValidationResult> {
    
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const recommendations: ValidationRecommendation[] = [];

    // 1. Schema Validation
    const schemaValidation = await this.validateNodeSchema(parsedNode);
    errors.push(...schemaValidation.errors);
    warnings.push(...schemaValidation.warnings);

    // 2. Compatibility Validation
    const compatibilityReport = await this.validateCompatibility(
      parsedNode, 
      packageInfo, 
      options.n8nVersion || '1.0.0'
    );
    
    if (!compatibilityReport.compatible) {
      errors.push({
        type: 'VERSION_INCOMPATIBLE',
        severity: 'critical',
        message: `Node is incompatible with n8n version ${options.n8nVersion}`,
        code: 'COMPAT_001',
        suggestion: 'Update node to support current n8n version'
      });
    }

    // 3. Connection Validation
    const connectionValidation = await this.validateConnections(parsedNode);
    errors.push(...connectionValidation.errors);
    warnings.push(...connectionValidation.warnings);

    // 4. Performance Validation (if enabled)
    let performanceReport: PerformanceReport = this.getDefaultPerformanceReport();
    if (options.includePerformanceValidation !== false) {
      performanceReport = await this.validatePerformance(parsedNode);
      
      if (performanceReport.resourceIntensity === 'high') {
        warnings.push({
          type: 'PERFORMANCE_CONCERN',
          message: 'Node has high resource intensity',
          impact: 'medium',
          suggestion: 'Consider optimizing resource usage'
        });
      }
    }

    // 5. Security Validation (if enabled)
    let securityReport: SecurityReport = this.getDefaultSecurityReport();
    if (options.includeSecurityValidation !== false) {
      securityReport = await this.validateSecurity(parsedNode, packageInfo);
      
      for (const vulnerability of securityReport.vulnerabilities) {
        if (vulnerability.severity === 'critical' || vulnerability.severity === 'high') {
          errors.push({
            type: 'SECURITY_VIOLATION',
            severity: vulnerability.severity,
            message: vulnerability.description,
            location: vulnerability.location,
            suggestion: vulnerability.mitigation,
            code: 'SEC_001'
          });
        }
      }
    }

    // 6. Custom Rules Validation
    if (options.customRules) {
      const customValidation = await this.validateCustomRules(
        parsedNode, 
        packageInfo, 
        options.customRules
      );
      errors.push(...customValidation.errors);
      warnings.push(...customValidation.warnings);
    }

    // 7. Generate Recommendations
    recommendations.push(...this.generateRecommendations(
      parsedNode,
      compatibilityReport,
      performanceReport,
      securityReport
    ));

    // Calculate overall score and grade
    const score = this.calculateValidationScore(errors, warnings, performanceReport, securityReport);
    const grade = this.calculateGrade(score);

    const metadata: ValidationMetadata = {
      validationTime: Date.now() - startTime,
      validatorVersion: this.validatorVersion,
      nodeVersion: parsedNode.version,
      rulesApplied: this.getRulesApplied(options),
      checksPerformed: this.getChecksPerformed(options),
      timestamp: new Date()
    };

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      score,
      grade,
      errors,
      warnings: options.skipWarnings ? [] : warnings,
      recommendations,
      compatibility: compatibilityReport,
      performance: performanceReport,
      security: securityReport,
      metadata
    };
  }

  /**
   * Validate node schema and structure
   */
  private async validateNodeSchema(parsedNode: ParsedNodeDefinition): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check required properties
    if (!parsedNode.name) {
      errors.push({
        type: 'PROPERTY_MISSING',
        severity: 'critical',
        message: 'Node name is required',
        code: 'SCHEMA_001',
        suggestion: 'Add a valid node name'
      });
    }

    if (!parsedNode.displayName) {
      errors.push({
        type: 'PROPERTY_MISSING',
        severity: 'high',
        message: 'Node display name is required',
        code: 'SCHEMA_002',
        suggestion: 'Add a user-friendly display name'
      });
    }

    if (!parsedNode.description) {
      warnings.push({
        type: 'DOCUMENTATION_MISSING',
        message: 'Node description is missing',
        impact: 'medium',
        suggestion: 'Add a clear description of node functionality'
      });
    }

    // Validate input/output schemas
    if (!parsedNode.inputSchema || !parsedNode.outputSchema) {
      errors.push({
        type: 'SCHEMA_INVALID',
        severity: 'high',
        message: 'Input or output schema is missing',
        code: 'SCHEMA_003',
        suggestion: 'Ensure both input and output schemas are defined'
      });
    }

    // Validate properties
    for (const prop of parsedNode.parsedProperties) {
      if (!prop.name || !prop.displayName) {
        errors.push({
          type: 'PROPERTY_MISSING',
          severity: 'medium',
          message: `Property missing name or displayName: ${prop.name}`,
          code: 'SCHEMA_004',
          suggestion: 'Ensure all properties have name and displayName'
        });
      }

      if (prop.required && !prop.default && !prop.typeOptions) {
        warnings.push({
          type: 'BEST_PRACTICE_VIOLATION',
          message: `Required property '${prop.name}' has no default value`,
          impact: 'low',
          suggestion: 'Consider providing a default value for required properties'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate compatibility with n8n version
   */
  private async validateCompatibility(
    parsedNode: ParsedNodeDefinition,
    packageInfo: CommunityNodePackage,
    n8nVersion: string
  ): Promise<CompatibilityReport> {
    
    const missingFeatures: string[] = [];
    const deprecatedFeatures: string[] = [];
    const versionConflicts: VersionConflict[] = [];

    // Check for version-specific features
    if (parsedNode.webhookConfiguration && !this.isFeatureSupported('webhooks', n8nVersion)) {
      missingFeatures.push('webhooks');
    }

    if (parsedNode.pollingConfiguration && !this.isFeatureSupported('polling', n8nVersion)) {
      missingFeatures.push('polling');
    }

    if (parsedNode.triggerConfiguration && !this.isFeatureSupported('triggers', n8nVersion)) {
      missingFeatures.push('triggers');
    }

    // Check for deprecated features
    for (const prop of parsedNode.parsedProperties) {
      if (this.isFeatureDeprecated(prop.type, n8nVersion)) {
        deprecatedFeatures.push(`Property type: ${prop.type}`);
      }
    }

    // Check dependency versions
    if (packageInfo.dependencies) {
      for (const [dep, version] of Object.entries(packageInfo.dependencies)) {
        if (dep.startsWith('n8n') && !this.isVersionCompatible(version, n8nVersion)) {
          versionConflicts.push({
            component: dep,
            required: version,
            available: n8nVersion,
            severity: 'major',
            resolution: `Update ${dep} to version ${n8nVersion}`
          });
        }
      }
    }

    const compatibilityLevel = this.determineCompatibilityLevel(
      missingFeatures,
      deprecatedFeatures,
      versionConflicts
    );

    return {
      n8nVersion,
      compatible: versionConflicts.filter(c => c.severity === 'critical').length === 0,
      compatibilityLevel,
      missingFeatures,
      deprecatedFeatures,
      versionConflicts,
      migrationPath: versionConflicts.length > 0 ? this.generateMigrationPath(versionConflicts) : undefined
    };
  }

  /**
   * Validate node connections
   */
  private async validateConnections(parsedNode: ParsedNodeDefinition): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate connection rules
    for (const rule of parsedNode.connectionRules) {
      if (!rule.name || !rule.displayName) {
        errors.push({
          type: 'CONNECTION_INVALID',
          severity: 'medium',
          message: `Connection rule missing name or displayName`,
          code: 'CONN_001',
          suggestion: 'Ensure all connection rules have proper names'
        });
      }

      if (rule.type === 'input' && rule.required && rule.maxConnections !== 1) {
        warnings.push({
          type: 'BEST_PRACTICE_VIOLATION',
          message: `Required input '${rule.name}' allows multiple connections`,
          impact: 'low',
          suggestion: 'Consider limiting required inputs to single connections'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate node performance characteristics
   */
  private async validatePerformance(parsedNode: ParsedNodeDefinition): Promise<PerformanceReport> {
    const bottlenecks: PerformanceBottleneck[] = [];
    const optimizations: PerformanceOptimization[] = [];

    // Analyze execution context
    const execContext = parsedNode.executionContext;
    
    // Check for potential bottlenecks
    if (execContext.timeout && execContext.timeout > 60000) {
      bottlenecks.push({
        location: 'execution timeout',
        type: 'cpu',
        severity: 'medium',
        description: 'Long execution timeout may indicate performance issues',
        impact: 'Potential workflow delays'
      });
    }

    if (execContext.memoryUsage && execContext.memoryUsage.maxMemoryMB && execContext.memoryUsage.maxMemoryMB > 512) {
      bottlenecks.push({
        location: 'memory usage',
        type: 'memory',
        severity: 'high',
        description: 'High memory usage configuration',
        impact: 'May cause memory pressure on the system'
      });
    }

    // Suggest optimizations
    if (!execContext.supportsBatching) {
      optimizations.push({
        type: 'batching',
        description: 'Enable batch processing for better throughput',
        implementation: 'Implement batch processing in node execution logic',
        expectedImprovement: '30-50% throughput increase',
        effort: 'medium'
      });
    }

    if (!execContext.supportsStreaming) {
      optimizations.push({
        type: 'streaming',
        description: 'Enable streaming for large data processing',
        implementation: 'Implement streaming data processing',
        expectedImprovement: 'Reduced memory usage and better scalability',
        effort: 'high'
      });
    }

    const resourceIntensity = this.calculateResourceIntensity(execContext);
    const scalabilityScore = this.calculateScalabilityScore(execContext, bottlenecks);

    return {
      estimatedExecutionTime: execContext.timeout || 30000,
      memoryUsage: execContext.memoryUsage?.maxMemoryMB || 256,
      resourceIntensity,
      scalabilityScore,
      bottlenecks,
      optimizations
    };
  }

  /**
   * Validate security aspects of the node
   */
  private async validateSecurity(
    parsedNode: ParsedNodeDefinition,
    packageInfo: CommunityNodePackage
  ): Promise<SecurityReport> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const permissions: PermissionRequirement[] = [];
    const compliance: ComplianceCheck[] = [];

    // Check for potential security issues
    for (const prop of parsedNode.parsedProperties) {
      if (prop.typeOptions?.password && !prop.typeOptions.alwaysOpenEditWindow) {
        vulnerabilities.push({
          type: 'exposure',
          severity: 'medium',
          description: 'Password field may be visible in UI',
          location: `property: ${prop.name}`,
          mitigation: 'Set alwaysOpenEditWindow to true for password fields'
        });
      }

      if (prop.type === 'json' && !prop.description?.includes('sanitized')) {
        vulnerabilities.push({
          type: 'injection',
          severity: 'medium',
          description: 'JSON input may be vulnerable to injection attacks',
          location: `property: ${prop.name}`,
          mitigation: 'Implement proper input sanitization'
        });
      }
    }

    // Check credential requirements
    for (const cred of parsedNode.credentialRequirements) {
      permissions.push({
        type: 'credential',
        level: 'read',
        resource: cred.name,
        justification: `Required for ${cred.displayName} authentication`
      });

      if (cred.type === 'oauth2' && !cred.testedBy) {
        vulnerabilities.push({
          type: 'authentication',
          severity: 'low',
          description: 'OAuth2 credential not tested automatically',
          location: `credential: ${cred.name}`,
          mitigation: 'Implement credential testing'
        });
      }
    }

    // Analyze data handling
    const dataHandling: DataHandlingAnalysis = {
      dataTypes: parsedNode.parsedProperties.map(p => p.type),
      sensitiveData: parsedNode.credentialRequirements.length > 0,
      encryption: parsedNode.credentialRequirements.some(c => c.properties.some(p => p.secret)),
      storage: 'memory',
      retention: 'session',
      compliance: ['GDPR']
    };

    // Basic compliance checks
    compliance.push({
      standard: 'GDPR',
      compliant: dataHandling.encryption,
      issues: dataHandling.encryption ? [] : ['Sensitive data not encrypted'],
      requirements: ['Data encryption', 'Data minimization', 'User consent']
    });

    const securityScore = this.calculateSecurityScore(vulnerabilities, permissions, dataHandling);

    return {
      securityScore,
      vulnerabilities,
      permissions,
      dataHandling,
      compliance
    };
  }

  /**
   * Validate custom rules
   */
  private async validateCustomRules(
    parsedNode: ParsedNodeDefinition,
    packageInfo: CommunityNodePackage,
    customRules: CustomValidationRule[]
  ): Promise<{
    errors: ValidationError[];
    warnings: ValidationWarning[];
  }> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    for (const rule of customRules) {
      try {
        const result = rule.validator(parsedNode, packageInfo);
        
        if (!result.passed) {
          const validationIssue = {
            type: 'SCHEMA_INVALID' as ValidationErrorType,
            message: result.message || `Custom rule '${rule.name}' failed`,
            location: 'custom validation',
            suggestion: result.suggestion,
            code: 'CUSTOM_001'
          };

          if (rule.severity === 'error') {
            errors.push({
              ...validationIssue,
              severity: 'medium'
            });
          } else {
            warnings.push({
              type: 'BEST_PRACTICE_VIOLATION',
              message: validationIssue.message,
              impact: 'medium',
              suggestion: validationIssue.suggestion
            });
          }
        }
      } catch (error) {
        errors.push({
          type: 'EXECUTION_ERROR',
          severity: 'low',
          message: `Custom rule '${rule.name}' execution failed: ${error.message}`,
          code: 'CUSTOM_002',
          suggestion: 'Check custom rule implementation'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(
    parsedNode: ParsedNodeDefinition,
    compatibility: CompatibilityReport,
    performance: PerformanceReport,
    security: SecurityReport
  ): ValidationRecommendation[] {
    const recommendations: ValidationRecommendation[] = [];

    // Compatibility recommendations
    if (compatibility.compatibilityLevel === 'partial') {
      recommendations.push({
        type: 'COMPATIBILITY_ENHANCEMENT',
        priority: 'high',
        title: 'Improve n8n Compatibility',
        description: 'Node has partial compatibility with current n8n version',
        implementation: 'Update deprecated features and add missing feature support',
        estimatedEffort: 'medium',
        benefits: ['Better user experience', 'Future-proof implementation', 'Reduced maintenance']
      });
    }

    // Performance recommendations
    if (performance.resourceIntensity === 'high') {
      recommendations.push({
        type: 'PERFORMANCE_OPTIMIZATION',
        priority: 'medium',
        title: 'Optimize Resource Usage',
        description: 'Node has high resource intensity',
        implementation: 'Implement caching, batching, or streaming as suggested',
        estimatedEffort: 'medium',
        benefits: ['Better performance', 'Lower resource consumption', 'Improved scalability']
      });
    }

    // Security recommendations
    if (security.securityScore < 80) {
      recommendations.push({
        type: 'SECURITY_IMPROVEMENT',
        priority: 'high',
        title: 'Enhance Security',
        description: 'Node has security vulnerabilities that should be addressed',
        implementation: 'Address identified vulnerabilities and implement security best practices',
        estimatedEffort: 'medium',
        benefits: ['Better security posture', 'Compliance with standards', 'User trust']
      });
    }

    // Documentation recommendations
    if (!parsedNode.description || parsedNode.description.length < 50) {
      recommendations.push({
        type: 'DOCUMENTATION',
        priority: 'low',
        title: 'Improve Documentation',
        description: 'Node documentation is insufficient',
        implementation: 'Add comprehensive description and usage examples',
        estimatedEffort: 'low',
        benefits: ['Better user experience', 'Easier adoption', 'Reduced support requests']
      });
    }

    return recommendations;
  }

  // Helper methods for calculations and utilities
  private calculateValidationScore(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    performance: PerformanceReport,
    security: SecurityReport
  ): number {
    let score = 100;

    // Deduct points for errors
    for (const error of errors) {
      switch (error.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    }

    // Deduct points for warnings
    for (const warning of warnings) {
      switch (warning.impact) {
        case 'high': score -= 8; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    }

    // Factor in performance score
    score = (score * 0.7) + (performance.scalabilityScore * 0.15) + (security.securityScore * 0.15);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  private calculateResourceIntensity(execContext: any): 'low' | 'medium' | 'high' {
    const memoryMB = execContext.memoryUsage?.maxMemoryMB || 256;
    const timeout = execContext.timeout || 30000;

    if (memoryMB > 512 || timeout > 60000) return 'high';
    if (memoryMB > 256 || timeout > 30000) return 'medium';
    return 'low';
  }

  private calculateScalabilityScore(execContext: any, bottlenecks: PerformanceBottleneck[]): number {
    let score = 100;

    if (!execContext.supportsBatching) score -= 20;
    if (!execContext.supportsStreaming) score -= 15;
    
    for (const bottleneck of bottlenecks) {
      switch (bottleneck.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private calculateSecurityScore(
    vulnerabilities: SecurityVulnerability[],
    permissions: PermissionRequirement[],
    dataHandling: DataHandlingAnalysis
  ): number {
    let score = 100;

    // Deduct for vulnerabilities
    for (const vuln of vulnerabilities) {
      switch (vuln.severity) {
        case 'critical': score -= 40; break;
        case 'high': score -= 25; break;
        case 'medium': score -= 15; break;
        case 'low': score -= 5; break;
      }
    }

    // Bonus for encryption
    if (dataHandling.encryption) score += 10;

    // Deduct for excessive permissions
    if (permissions.length > 5) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  // Utility methods
  private isFeatureSupported(feature: string, version: string): boolean {
    // Simplified version checking - in real implementation, this would be more sophisticated
    const majorVersion = parseInt(version.split('.')[0]);
    
    switch (feature) {
      case 'webhooks': return majorVersion >= 1;
      case 'polling': return majorVersion >= 1;
      case 'triggers': return majorVersion >= 1;
      default: return true;
    }
  }

  private isFeatureDeprecated(feature: string, version: string): boolean {
    // Check for deprecated features based on version
    return false; // Simplified implementation
  }

  private isVersionCompatible(required: string, available: string): boolean {
    // Simplified version compatibility check
    return required <= available;
  }

  private determineCompatibilityLevel(
    missingFeatures: string[],
    deprecatedFeatures: string[],
    versionConflicts: VersionConflict[]
  ): 'full' | 'partial' | 'limited' | 'incompatible' {
    const criticalConflicts = versionConflicts.filter(c => c.severity === 'critical').length;
    
    if (criticalConflicts > 0) return 'incompatible';
    if (missingFeatures.length > 2 || deprecatedFeatures.length > 3) return 'limited';
    if (missingFeatures.length > 0 || deprecatedFeatures.length > 0) return 'partial';
    return 'full';
  }

  private generateMigrationPath(conflicts: VersionConflict[]): MigrationPath {
    const steps: MigrationStep[] = conflicts.map((conflict, index) => ({
      order: index + 1,
      description: `Update ${conflict.component} from ${conflict.required} to ${conflict.available}`,
      type: 'manual',
      validation: `Verify ${conflict.component} compatibility`
    }));

    return {
      fromVersion: conflicts[0]?.required || '0.0.0',
      toVersion: conflicts[0]?.available || '1.0.0',
      steps,
      estimatedTime: steps.length * 30, // 30 minutes per step
      complexity: conflicts.length > 3 ? 'high' : conflicts.length > 1 ? 'medium' : 'low'
    };
  }

  private getRulesApplied(options: ValidationOptions): string[] {
    const rules = ['schema', 'compatibility', 'connections'];
    
    if (options.includePerformanceValidation !== false) rules.push('performance');
    if (options.includeSecurityValidation !== false) rules.push('security');
    if (options.customRules) rules.push('custom');
    
    return rules;
  }

  private getChecksPerformed(options: ValidationOptions): number {
    let checks = 10; // Base checks
    
    if (options.includePerformanceValidation !== false) checks += 5;
    if (options.includeSecurityValidation !== false) checks += 8;
    if (options.customRules) checks += options.customRules.length;
    
    return checks;
  }

  private createFailedValidationResult(
    errors: string[],
    message: string,
    startTime: number
  ): CommunityValidationResult {
    return {
      isValid: false,
      score: 0,
      grade: 'F',
      errors: errors.map(error => ({
        type: 'EXECUTION_ERROR',
        severity: 'critical',
        message: error,
        code: 'VAL_FAIL'
      })),
      warnings: [],
      recommendations: [],
      compatibility: {
        n8nVersion: '1.0.0',
        compatible: false,
        compatibilityLevel: 'incompatible',
        missingFeatures: [],
        deprecatedFeatures: [],
        versionConflicts: []
      },
      performance: this.getDefaultPerformanceReport(),
      security: this.getDefaultSecurityReport(),
      metadata: {
        validationTime: Date.now() - startTime,
        validatorVersion: this.validatorVersion,
        nodeVersion: '0.0.0',
        rulesApplied: [],
        checksPerformed: 0,
        timestamp: new Date()
      }
    };
  }

  private getDefaultPerformanceReport(): PerformanceReport {
    return {
      estimatedExecutionTime: 30000,
      memoryUsage: 256,
      resourceIntensity: 'medium',
      scalabilityScore: 50,
      bottlenecks: [],
      optimizations: []
    };
  }

  private getDefaultSecurityReport(): SecurityReport {
    return {
      securityScore: 50,
      vulnerabilities: [],
      permissions: [],
      dataHandling: {
        dataTypes: [],
        sensitiveData: false,
        encryption: false,
        storage: 'memory',
        retention: 'session',
        compliance: []
      },
      compliance: []
    };
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
    this.emit('cacheCleared');
  }

  /**
   * Get validation cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.validationCache.size,
      keys: Array.from(this.validationCache.keys())
    };
  }
}

// Export singleton instance
export const communityNodeValidator = new CommunityNodeValidator(); 