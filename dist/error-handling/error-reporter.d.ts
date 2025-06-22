/**
 * User-Friendly Error Reporting and Suggestions System
 * Provides clear, actionable error messages and recovery suggestions
 */
import { EventEmitter } from 'events';
import { ErrorClassifier, ErrorSeverity, ErrorCategory, ErrorType, RecoveryStrategy } from './error-classifier';
import type { ErrorContext } from './error-classifier';
/**
 * Error report format options
 */
export declare enum ReportFormat {
    CONSOLE = "console",
    JSON = "json",
    HTML = "html",
    MARKDOWN = "markdown",
    PLAIN_TEXT = "plain_text"
}
/**
 * Error report detail levels
 */
export declare enum DetailLevel {
    MINIMAL = "minimal",// Just the error message and one suggestion
    STANDARD = "standard",// Error message, category, and suggestions
    DETAILED = "detailed",// Full error details with context
    TECHNICAL = "technical"
}
/**
 * Suggestion types for different audiences
 */
export declare enum SuggestionType {
    USER_ACTION = "user_action",// Actions user can take
    SYSTEM_CHECK = "system_check",// System-level checks
    CONFIGURATION = "configuration",// Configuration changes
    TROUBLESHOOTING = "troubleshooting",// Troubleshooting steps
    CONTACT_SUPPORT = "contact_support",// When to contact support
    WORKAROUND = "workaround"
}
/**
 * Suggestion structure
 */
export interface ErrorSuggestion {
    id: string;
    type: SuggestionType;
    title: string;
    description: string;
    steps: string[];
    priority: number;
    estimatedTime: string;
    difficulty: 'easy' | 'medium' | 'hard';
    requiresRestart: boolean;
    requiresSupport: boolean;
    relatedLinks?: Array<{
        title: string;
        url: string;
        type: 'documentation' | 'tutorial' | 'support' | 'community';
    }>;
    prerequisites?: string[];
    warnings?: string[];
}
/**
 * Error report structure
 */
export interface ErrorReport {
    id: string;
    timestamp: Date;
    summary: {
        title: string;
        description: string;
        severity: ErrorSeverity;
        category: ErrorCategory;
        impact: string;
        canRecover: boolean;
    };
    userMessage: {
        primary: string;
        secondary?: string;
        technical?: string;
    };
    suggestions: ErrorSuggestion[];
    context: {
        operation: string;
        component: string;
        userInfo: {
            userId?: string;
            sessionId?: string;
            workflowId?: string;
        };
        systemInfo?: {
            platform: string;
            version: string;
            environment: string;
        };
    };
    recovery: {
        strategy: RecoveryStrategy;
        isRetryable: boolean;
        maxRetries: number;
        currentRetry: number;
        nextRetryIn?: number;
    };
    support: {
        errorCode: string;
        correlationId: string;
        supportUrl?: string;
        documentationUrl?: string;
    };
    metadata: {
        tags: string[];
        relatedErrors: string[];
        resolution?: {
            status: 'pending' | 'resolved' | 'escalated';
            resolvedAt?: Date;
            resolvedBy?: string;
            resolution?: string;
        };
    };
}
/**
 * Template for different error scenarios
 */
export interface ErrorTemplate {
    id: string;
    name: string;
    description: string;
    errorTypes: ErrorType[];
    titleTemplate: string;
    descriptionTemplate: string;
    userMessageTemplate: string;
    suggestionTemplates: Array<{
        type: SuggestionType;
        titleTemplate: string;
        descriptionTemplate: string;
        stepsTemplate: string[];
        priority: number;
    }>;
    variables: string[];
}
/**
 * Error reporting configuration
 */
export interface ReporterConfig {
    defaultFormat: ReportFormat;
    defaultDetailLevel: DetailLevel;
    includeStackTrace: boolean;
    includeSuggestions: boolean;
    maxSuggestions: number;
    supportEmail?: string;
    supportUrl?: string;
    documentationBaseUrl?: string;
    enableAnalytics: boolean;
    customTemplates?: ErrorTemplate[];
}
/**
 * Main error reporter class
 */
export declare class ErrorReporter extends EventEmitter {
    private classifier;
    private config;
    private templates;
    private reportHistory;
    private maxHistorySize;
    constructor(classifier: ErrorClassifier, config?: Partial<ReporterConfig>);
    /**
     * Generate user-friendly error report
     */
    generateReport(error: Error, context: ErrorContext, options?: {
        format?: ReportFormat;
        detailLevel?: DetailLevel;
        includeContext?: boolean;
        customSuggestions?: ErrorSuggestion[];
    }): ErrorReport;
    /**
     * Format error report for display
     */
    formatReport(report: ErrorReport, format?: ReportFormat): string;
    /**
     * Get suggestions for specific error type
     */
    getSuggestions(errorType: ErrorType, context: ErrorContext, maxSuggestions?: number): ErrorSuggestion[];
    /**
     * Add custom error template
     */
    addTemplate(template: ErrorTemplate): void;
    /**
     * Get error report by ID
     */
    getReport(reportId: string): ErrorReport | undefined;
    /**
     * Get reports by criteria
     */
    getReports(criteria: {
        severity?: ErrorSeverity;
        category?: ErrorCategory;
        timeRange?: {
            start: Date;
            end: Date;
        };
        resolved?: boolean;
        limit?: number;
    }): ErrorReport[];
    /**
     * Mark error as resolved
     */
    markResolved(reportId: string, resolvedBy: string, resolution: string): boolean;
    /**
     * Create error report from classified error
     */
    private createErrorReport;
    /**
     * Generate suggestions based on error type and context
     */
    private generateSuggestions;
    /**
     * Format console report
     */
    private formatConsoleReport;
    /**
     * Format JSON report
     */
    private formatJsonReport;
    /**
     * Format HTML report
     */
    private formatHtmlReport;
    /**
     * Format Markdown report
     */
    private formatMarkdownReport;
    /**
     * Format plain text report
     */
    private formatPlainTextReport;
    /**
     * Initialize default error templates
     */
    private initializeDefaultTemplates;
    /**
     * Setup event listeners
     */
    private setupEventListeners;
    /**
     * Helper methods
     */
    private generateReportId;
    private generateTitle;
    private generateDescription;
    private generateSecondaryMessage;
    private generateImpactDescription;
    private getComponentFromCategory;
    private calculateRetryDelay;
    private generateDocumentationUrl;
    private findTemplate;
    private getSeverityIcon;
    private escapeHtml;
    private addToHistory;
}
export default ErrorReporter;
//# sourceMappingURL=error-reporter.d.ts.map