/**
 * Community Node Validation Framework
 * Extends existing validation system to support community-developed n8n nodes
 */
import { EventEmitter } from 'events';
import { CommunityNodeDefinition, CommunityNodePackage } from './community-node-registry';
import { ParsedNodeDefinition } from './dynamic-node-parser.js';
export interface CommunityValidationResult {
    isValid: boolean;
    score: number;
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
export type ValidationErrorType = 'SCHEMA_INVALID' | 'PROPERTY_MISSING' | 'TYPE_MISMATCH' | 'DEPENDENCY_MISSING' | 'VERSION_INCOMPATIBLE' | 'SECURITY_VIOLATION' | 'PERFORMANCE_ISSUE' | 'CONNECTION_INVALID' | 'CREDENTIAL_INVALID' | 'WEBHOOK_INVALID' | 'EXECUTION_ERROR';
export type ValidationWarningType = 'DEPRECATED_FEATURE' | 'PERFORMANCE_CONCERN' | 'COMPATIBILITY_ISSUE' | 'SECURITY_CONCERN' | 'BEST_PRACTICE_VIOLATION' | 'DOCUMENTATION_MISSING' | 'TESTING_INSUFFICIENT' | 'MAINTENANCE_CONCERN';
export type RecommendationType = 'SECURITY_IMPROVEMENT' | 'PERFORMANCE_OPTIMIZATION' | 'COMPATIBILITY_ENHANCEMENT' | 'CODE_QUALITY' | 'DOCUMENTATION' | 'TESTING' | 'MAINTENANCE' | 'USER_EXPERIENCE';
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
export declare class CommunityNodeValidator extends EventEmitter {
    private parser;
    private nodeCompatibilityValidator;
    private connectionValidator;
    private dataFlowValidator;
    private performanceValidator;
    private errorHandlingValidator;
    private validationCache;
    private cacheTimeout;
    private validatorVersion;
    constructor();
    /**
     * Initialize all validation components
     */
    private initializeValidators;
    /**
     * Validate a community node comprehensively
     */
    validateCommunityNode(nodeDefinition: CommunityNodeDefinition, packageInfo: CommunityNodePackage, options?: ValidationOptions): Promise<CommunityValidationResult>;
    /**
     * Perform comprehensive validation of a parsed node
     */
    private performComprehensiveValidation;
    /**
     * Validate node schema and structure
     */
    private validateNodeSchema;
    /**
     * Validate compatibility with n8n version
     */
    private validateCompatibility;
    /**
     * Validate node connections
     */
    private validateConnections;
    /**
     * Validate node performance characteristics
     */
    private validatePerformance;
    /**
     * Validate security aspects of the node
     */
    private validateSecurity;
    /**
     * Validate custom rules
     */
    private validateCustomRules;
    /**
     * Generate recommendations based on validation results
     */
    private generateRecommendations;
    private calculateValidationScore;
    private calculateGrade;
    private calculateResourceIntensity;
    private calculateScalabilityScore;
    private calculateSecurityScore;
    private isFeatureSupported;
    private isFeatureDeprecated;
    private isVersionCompatible;
    private determineCompatibilityLevel;
    private generateMigrationPath;
    private getRulesApplied;
    private getChecksPerformed;
    private createFailedValidationResult;
    private getDefaultPerformanceReport;
    private getDefaultSecurityReport;
    /**
     * Clear validation cache
     */
    clearCache(): void;
    /**
     * Get validation cache statistics
     */
    getCacheStats(): {
        size: number;
        keys: string[];
    };
}
export declare const communityNodeValidator: CommunityNodeValidator;
//# sourceMappingURL=community-node-validator.d.ts.map