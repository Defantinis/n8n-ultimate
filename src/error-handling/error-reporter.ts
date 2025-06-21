/**
 * User-Friendly Error Reporting and Suggestions System
 * Provides clear, actionable error messages and recovery suggestions
 */

import { EventEmitter } from 'events';
import { ErrorClassifier, ErrorSeverity, ErrorCategory, ErrorType, RecoveryStrategy } from './error-classifier';
import type { ClassifiedError, ErrorContext } from './error-classifier';

/**
 * Error report format options
 */
export enum ReportFormat {
  CONSOLE = 'console',
  JSON = 'json',
  HTML = 'html',
  MARKDOWN = 'markdown',
  PLAIN_TEXT = 'plain_text'
}

/**
 * Error report detail levels
 */
export enum DetailLevel {
  MINIMAL = 'minimal',      // Just the error message and one suggestion
  STANDARD = 'standard',    // Error message, category, and suggestions
  DETAILED = 'detailed',    // Full error details with context
  TECHNICAL = 'technical'   // All technical information for developers
}

/**
 * Suggestion types for different audiences
 */
export enum SuggestionType {
  USER_ACTION = 'user_action',           // Actions user can take
  SYSTEM_CHECK = 'system_check',         // System-level checks
  CONFIGURATION = 'configuration',       // Configuration changes
  TROUBLESHOOTING = 'troubleshooting',   // Troubleshooting steps
  CONTACT_SUPPORT = 'contact_support',   // When to contact support
  WORKAROUND = 'workaround'             // Alternative approaches
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
export class ErrorReporter extends EventEmitter {
  private classifier: ErrorClassifier;
  private config: ReporterConfig;
  private templates: Map<string, ErrorTemplate> = new Map();
  private reportHistory: Map<string, ErrorReport> = new Map();
  private maxHistorySize: number = 5000;

  constructor(classifier: ErrorClassifier, config: Partial<ReporterConfig> = {}) {
    super();
    this.classifier = classifier;
    this.config = {
      defaultFormat: ReportFormat.CONSOLE,
      defaultDetailLevel: DetailLevel.STANDARD,
      includeStackTrace: false,
      includeSuggestions: true,
      maxSuggestions: 5,
      enableAnalytics: true,
      ...config
    };

    this.initializeDefaultTemplates();
    this.setupEventListeners();
  }

  /**
   * Generate user-friendly error report
   */
  public generateReport(
    error: Error, 
    context: ErrorContext,
    options: {
      format?: ReportFormat;
      detailLevel?: DetailLevel;
      includeContext?: boolean;
      customSuggestions?: ErrorSuggestion[];
    } = {}
  ): ErrorReport {
    // Classify the error first
    const classifiedError = this.classifier.classifyError(error, context);
    
    // Generate report
    const report = this.createErrorReport(classifiedError, options);
    
    // Store in history
    this.addToHistory(report);
    
    // Emit events
    this.emit('reportGenerated', report);
    this.emit(`report:${classifiedError.severity}`, report);
    
    return report;
  }

  /**
   * Format error report for display
   */
  public formatReport(report: ErrorReport, format: ReportFormat = this.config.defaultFormat): string {
    switch (format) {
      case ReportFormat.CONSOLE:
        return this.formatConsoleReport(report);
      case ReportFormat.JSON:
        return this.formatJsonReport(report);
      case ReportFormat.HTML:
        return this.formatHtmlReport(report);
      case ReportFormat.MARKDOWN:
        return this.formatMarkdownReport(report);
      case ReportFormat.PLAIN_TEXT:
        return this.formatPlainTextReport(report);
      default:
        return this.formatConsoleReport(report);
    }
  }

  /**
   * Get suggestions for specific error type
   */
  public getSuggestions(
    errorType: ErrorType,
    context: ErrorContext,
    maxSuggestions: number = this.config.maxSuggestions
  ): ErrorSuggestion[] {
    const suggestions = this.generateSuggestions(errorType, context);
    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, maxSuggestions);
  }

  /**
   * Add custom error template
   */
  public addTemplate(template: ErrorTemplate): void {
    this.templates.set(template.id, template);
    this.emit('templateAdded', template);
  }

  /**
   * Get error report by ID
   */
  public getReport(reportId: string): ErrorReport | undefined {
    return this.reportHistory.get(reportId);
  }

  /**
   * Get reports by criteria
   */
  public getReports(criteria: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    timeRange?: { start: Date; end: Date };
    resolved?: boolean;
    limit?: number;
  }): ErrorReport[] {
    let reports = Array.from(this.reportHistory.values());

    if (criteria.severity) {
      reports = reports.filter(r => r.summary.severity === criteria.severity);
    }

    if (criteria.category) {
      reports = reports.filter(r => r.summary.category === criteria.category);
    }

    if (criteria.timeRange) {
      reports = reports.filter(r => 
        r.timestamp >= criteria.timeRange!.start && 
        r.timestamp <= criteria.timeRange!.end
      );
    }

    if (criteria.resolved !== undefined) {
      reports = reports.filter(r => 
        criteria.resolved ? r.metadata.resolution?.status === 'resolved' : 
        r.metadata.resolution?.status !== 'resolved'
      );
    }

    // Sort by timestamp (newest first)
    reports.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (criteria.limit) {
      reports = reports.slice(0, criteria.limit);
    }

    return reports;
  }

  /**
   * Mark error as resolved
   */
  public markResolved(reportId: string, resolvedBy: string, resolution: string): boolean {
    const report = this.reportHistory.get(reportId);
    if (report) {
      report.metadata.resolution = {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy,
        resolution
      };
      this.emit('reportResolved', report);
      return true;
    }
    return false;
  }

  /**
   * Create error report from classified error
   */
  private createErrorReport(
    classifiedError: ClassifiedError,
    options: {
      format?: ReportFormat;
      detailLevel?: DetailLevel;
      includeContext?: boolean;
      customSuggestions?: ErrorSuggestion[];
    }
  ): ErrorReport {
    const reportId = this.generateReportId();
    const template = this.findTemplate(classifiedError.type);
    
    const report: ErrorReport = {
      id: reportId,
      timestamp: new Date(),
      summary: {
        title: this.generateTitle(classifiedError, template),
        description: this.generateDescription(classifiedError, template),
        severity: classifiedError.severity,
        category: classifiedError.category,
        impact: this.generateImpactDescription(classifiedError),
        canRecover: classifiedError.recoveryStrategy !== RecoveryStrategy.NO_RECOVERY
      },
      userMessage: {
        primary: classifiedError.userFriendlyMessage,
        secondary: this.generateSecondaryMessage(classifiedError),
        technical: options.detailLevel === DetailLevel.TECHNICAL ? classifiedError.technicalMessage : undefined
      },
      suggestions: options.customSuggestions || this.generateSuggestions(classifiedError.type, classifiedError.context),
      context: {
        operation: classifiedError.context.operationId || 'unknown',
        component: this.getComponentFromCategory(classifiedError.category),
        userInfo: {
          userId: classifiedError.context.userId,
          sessionId: classifiedError.context.sessionId,
          workflowId: classifiedError.context.workflowId
        },
        systemInfo: classifiedError.context.systemInfo ? {
          platform: classifiedError.context.systemInfo.platform,
          version: classifiedError.context.systemInfo.nodeVersion,
          environment: process.env.NODE_ENV || 'development'
        } : undefined
      },
      recovery: {
        strategy: classifiedError.recoveryStrategy,
        isRetryable: classifiedError.isRetryable,
        maxRetries: classifiedError.maxRetries,
        currentRetry: classifiedError.retryCount,
        nextRetryIn: classifiedError.isRetryable ? this.calculateRetryDelay(classifiedError.retryCount) : undefined
      },
      support: {
        errorCode: `${classifiedError.category.toUpperCase()}_${classifiedError.type.toUpperCase()}`,
        correlationId: classifiedError.id,
        supportUrl: this.config.supportUrl,
        documentationUrl: this.generateDocumentationUrl(classifiedError.type)
      },
      metadata: {
        tags: classifiedError.tags,
        relatedErrors: classifiedError.relatedErrors,
        resolution: {
          status: 'pending'
        }
      }
    };

    return report;
  }

  /**
   * Generate suggestions based on error type and context
   */
  private generateSuggestions(errorType: ErrorType, context: ErrorContext): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];

    // Get suggestions based on error type
    switch (errorType) {
      case ErrorType.INVALID_WORKFLOW_STRUCTURE:
        suggestions.push(
          {
            id: 'check-workflow-schema',
            type: SuggestionType.USER_ACTION,
            title: 'Verify Workflow Structure',
            description: 'Check your workflow against the n8n schema requirements',
            steps: [
              'Open your workflow in the n8n editor',
              'Verify all nodes have proper connections',
              'Check that required fields are filled',
              'Ensure node types are compatible'
            ],
            priority: 100,
            estimatedTime: '5-10 minutes',
            difficulty: 'easy',
            requiresRestart: false,
            requiresSupport: false,
            relatedLinks: [
              {
                title: 'n8n Workflow Documentation',
                url: 'https://docs.n8n.io/workflows/',
                type: 'documentation'
              }
            ]
          },
          {
            id: 'validate-nodes',
            type: SuggestionType.TROUBLESHOOTING,
            title: 'Validate Individual Nodes',
            description: 'Check each node configuration for errors',
            steps: [
              'Select each node in your workflow',
              'Review node parameters and settings',
              'Test node connections individually',
              'Fix any validation errors shown'
            ],
            priority: 90,
            estimatedTime: '10-15 minutes',
            difficulty: 'medium',
            requiresRestart: false,
            requiresSupport: false
          }
        );
        break;

      case ErrorType.NODE_NOT_FOUND:
        suggestions.push(
          {
            id: 'check-node-name',
            type: SuggestionType.USER_ACTION,
            title: 'Verify Node Name',
            description: 'Double-check the spelling and availability of the community node',
            steps: [
              'Verify the exact node package name',
              'Check if the node exists in npm registry',
              'Ensure you have the correct version specified',
              'Try searching for alternative node names'
            ],
            priority: 100,
            estimatedTime: '2-5 minutes',
            difficulty: 'easy',
            requiresRestart: false,
            requiresSupport: false
          },
          {
            id: 'use-alternative-node',
            type: SuggestionType.WORKAROUND,
            title: 'Use Alternative Node',
            description: 'Find a similar community node or use built-in n8n nodes',
            steps: [
              'Search for similar community nodes',
              'Check if built-in n8n nodes can accomplish the task',
              'Consider using HTTP Request node for API calls',
              'Look for official n8n integrations'
            ],
            priority: 80,
            estimatedTime: '10-20 minutes',
            difficulty: 'medium',
            requiresRestart: false,
            requiresSupport: false
          }
        );
        break;

      case ErrorType.AI_TIMEOUT_ERROR:
        suggestions.push(
          {
            id: 'retry-request',
            type: SuggestionType.USER_ACTION,
            title: 'Retry the Request',
            description: 'AI services may be temporarily busy. Try again in a moment.',
            steps: [
              'Wait 30-60 seconds before retrying',
              'Check your internet connection',
              'Verify AI service status if available',
              'Try again with a simpler request if possible'
            ],
            priority: 100,
            estimatedTime: '1-2 minutes',
            difficulty: 'easy',
            requiresRestart: false,
            requiresSupport: false
          },
          {
            id: 'check-ai-config',
            type: SuggestionType.CONFIGURATION,
            title: 'Check AI Configuration',
            description: 'Verify your AI service settings and API keys',
            steps: [
              'Check if your API key is valid and not expired',
              'Verify the AI service endpoint is correct',
              'Ensure you have sufficient API credits/quota',
              'Check timeout settings in configuration'
            ],
            priority: 90,
            estimatedTime: '5-10 minutes',
            difficulty: 'medium',
            requiresRestart: false,
            requiresSupport: false
          }
        );
        break;

      case ErrorType.CONNECTION_ERROR:
        suggestions.push(
          {
            id: 'check-internet',
            type: SuggestionType.SYSTEM_CHECK,
            title: 'Check Internet Connection',
            description: 'Verify your network connectivity',
            steps: [
              'Test your internet connection in a browser',
              'Try accessing other websites or services',
              'Check if you\'re behind a firewall or proxy',
              'Restart your network connection if needed'
            ],
            priority: 100,
            estimatedTime: '2-5 minutes',
            difficulty: 'easy',
            requiresRestart: false,
            requiresSupport: false
          },
          {
            id: 'check-service-status',
            type: SuggestionType.TROUBLESHOOTING,
            title: 'Check Service Status',
            description: 'Verify if the target service is available',
            steps: [
              'Check the service status page if available',
              'Try accessing the service directly in a browser',
              'Look for service announcements or outages',
              'Contact the service provider if issues persist'
            ],
            priority: 80,
            estimatedTime: '5-10 minutes',
            difficulty: 'easy',
            requiresRestart: false,
            requiresSupport: false
          }
        );
        break;

      default:
        suggestions.push({
          id: 'general-troubleshooting',
          type: SuggestionType.TROUBLESHOOTING,
          title: 'General Troubleshooting',
          description: 'Basic steps to resolve common issues',
          steps: [
            'Try refreshing the page or restarting the operation',
            'Check system logs for more detailed error information',
            'Verify your configuration settings',
            'Contact support if the issue persists'
          ],
          priority: 50,
          estimatedTime: '10-15 minutes',
          difficulty: 'medium',
          requiresRestart: false,
          requiresSupport: true
        });
    }

    // Add context-specific suggestions
    if (context.workflowId) {
      suggestions.push({
        id: 'check-workflow-logs',
        type: SuggestionType.TROUBLESHOOTING,
        title: 'Check Workflow Logs',
        description: 'Review logs for this specific workflow',
        steps: [
          'Open the workflow execution history',
          'Look for error messages in the logs',
          'Check individual node execution results',
          'Review data flow between nodes'
        ],
        priority: 70,
        estimatedTime: '5-10 minutes',
        difficulty: 'medium',
        requiresRestart: false,
        requiresSupport: false
      });
    }

    return suggestions.slice(0, this.config.maxSuggestions);
  }

  /**
   * Format console report
   */
  private formatConsoleReport(report: ErrorReport): string {
    const severityIcon = this.getSeverityIcon(report.summary.severity);
    const lines = [
      `${severityIcon} ${report.summary.title}`,
      '',
      `📝 ${report.userMessage.primary}`,
      ''
    ];

    if (report.userMessage.secondary) {
      lines.push(`ℹ️  ${report.userMessage.secondary}`, '');
    }

    if (report.suggestions.length > 0) {
      lines.push('💡 Suggestions:');
      report.suggestions.forEach((suggestion, index) => {
        lines.push(`   ${index + 1}. ${suggestion.title}`);
        lines.push(`      ${suggestion.description}`);
        if (suggestion.estimatedTime) {
          lines.push(`      ⏱️  Estimated time: ${suggestion.estimatedTime}`);
        }
        lines.push('');
      });
    }

    if (report.support.errorCode) {
      lines.push(`🔍 Error Code: ${report.support.errorCode}`);
      lines.push(`🆔 Correlation ID: ${report.support.correlationId}`);
    }

    return lines.join('\n');
  }

  /**
   * Format JSON report
   */
  private formatJsonReport(report: ErrorReport): string {
    return JSON.stringify(report, null, 2);
  }

  /**
   * Format HTML report
   */
  private formatHtmlReport(report: ErrorReport): string {
    const severityClass = `severity-${report.summary.severity}`;
    
    let html = `
<div class="error-report ${severityClass}">
  <header class="error-header">
    <h2>${this.escapeHtml(report.summary.title)}</h2>
    <span class="severity-badge">${report.summary.severity.toUpperCase()}</span>
  </header>
  
  <div class="error-message">
    <p class="primary-message">${this.escapeHtml(report.userMessage.primary)}</p>
    ${report.userMessage.secondary ? `<p class="secondary-message">${this.escapeHtml(report.userMessage.secondary)}</p>` : ''}
  </div>`;

    if (report.suggestions.length > 0) {
      html += `
  <div class="suggestions">
    <h3>Suggested Solutions</h3>
    <ol>`;
      
      report.suggestions.forEach(suggestion => {
        html += `
      <li class="suggestion">
        <h4>${this.escapeHtml(suggestion.title)}</h4>
        <p>${this.escapeHtml(suggestion.description)}</p>
        <div class="suggestion-meta">
          <span class="time">⏱️ ${suggestion.estimatedTime}</span>
          <span class="difficulty">📊 ${suggestion.difficulty}</span>
        </div>
      </li>`;
      });
      
      html += `
    </ol>
  </div>`;
    }

    html += `
  <div class="error-meta">
    <p><strong>Error Code:</strong> ${report.support.errorCode}</p>
    <p><strong>Correlation ID:</strong> ${report.support.correlationId}</p>
    <p><strong>Timestamp:</strong> ${report.timestamp.toISOString()}</p>
  </div>
</div>`;

    return html;
  }

  /**
   * Format Markdown report
   */
  private formatMarkdownReport(report: ErrorReport): string {
    const severityEmoji = this.getSeverityIcon(report.summary.severity);
    
    let markdown = `# ${severityEmoji} ${report.summary.title}\n\n`;
    markdown += `**Severity:** ${report.summary.severity.toUpperCase()}\n`;
    markdown += `**Category:** ${report.summary.category}\n\n`;
    
    markdown += `## Error Message\n\n`;
    markdown += `${report.userMessage.primary}\n\n`;
    
    if (report.userMessage.secondary) {
      markdown += `${report.userMessage.secondary}\n\n`;
    }

    if (report.suggestions.length > 0) {
      markdown += `## Suggested Solutions\n\n`;
      report.suggestions.forEach((suggestion, index) => {
        markdown += `### ${index + 1}. ${suggestion.title}\n\n`;
        markdown += `${suggestion.description}\n\n`;
        markdown += `- **Estimated Time:** ${suggestion.estimatedTime}\n`;
        markdown += `- **Difficulty:** ${suggestion.difficulty}\n\n`;
        
        if (suggestion.steps.length > 0) {
          markdown += `**Steps:**\n`;
          suggestion.steps.forEach(step => {
            markdown += `1. ${step}\n`;
          });
          markdown += '\n';
        }
      });
    }

    markdown += `## Technical Details\n\n`;
    markdown += `- **Error Code:** \`${report.support.errorCode}\`\n`;
    markdown += `- **Correlation ID:** \`${report.support.correlationId}\`\n`;
    markdown += `- **Timestamp:** ${report.timestamp.toISOString()}\n`;

    return markdown;
  }

  /**
   * Format plain text report
   */
  private formatPlainTextReport(report: ErrorReport): string {
    let text = `${report.summary.title}\n`;
    text += '='.repeat(report.summary.title.length) + '\n\n';
    
    text += `Severity: ${report.summary.severity.toUpperCase()}\n`;
    text += `Category: ${report.summary.category}\n\n`;
    
    text += `Error Message:\n${report.userMessage.primary}\n\n`;
    
    if (report.userMessage.secondary) {
      text += `Additional Info:\n${report.userMessage.secondary}\n\n`;
    }

    if (report.suggestions.length > 0) {
      text += 'Suggested Solutions:\n';
      report.suggestions.forEach((suggestion, index) => {
        text += `${index + 1}. ${suggestion.title}\n`;
        text += `   ${suggestion.description}\n`;
        text += `   Estimated time: ${suggestion.estimatedTime}\n\n`;
      });
    }

    text += `Error Code: ${report.support.errorCode}\n`;
    text += `Correlation ID: ${report.support.correlationId}\n`;
    text += `Timestamp: ${report.timestamp.toISOString()}\n`;

    return text;
  }

  /**
   * Initialize default error templates
   */
  private initializeDefaultTemplates(): void {
    const defaultTemplates: ErrorTemplate[] = [
      {
        id: 'workflow-error-template',
        name: 'Workflow Error Template',
        description: 'Template for workflow-related errors',
        errorTypes: [ErrorType.INVALID_WORKFLOW_STRUCTURE, ErrorType.NODE_CONNECTION_ERROR, ErrorType.DATA_FLOW_ERROR],
        titleTemplate: 'Workflow {{operation}} Failed',
        descriptionTemplate: 'An error occurred while {{operation}} your n8n workflow',
        userMessageTemplate: 'There was a problem with your workflow. {{details}}',
        suggestionTemplates: [
          {
            type: SuggestionType.USER_ACTION,
            titleTemplate: 'Check Workflow Configuration',
            descriptionTemplate: 'Verify your workflow settings and node connections',
            stepsTemplate: ['Review workflow structure', 'Check node parameters', 'Validate connections'],
            priority: 100
          }
        ],
        variables: ['operation', 'details']
      }
    ];

    defaultTemplates.forEach(template => this.addTemplate(template));
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.classifier.on('errorClassified', (classifiedError: ClassifiedError) => {
      // Auto-generate report for critical errors
      if (classifiedError.severity === ErrorSeverity.CRITICAL) {
        const report = this.createErrorReport(classifiedError, { detailLevel: DetailLevel.DETAILED });
        this.emit('criticalErrorReport', report);
      }
    });
  }

  /**
   * Helper methods
   */
  private generateReportId(): string {
    return `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTitle(classifiedError: ClassifiedError, template?: ErrorTemplate): string {
    if (template) {
      return template.titleTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return classifiedError.context[key] || classifiedError.message || match;
      });
    }
    
    const categoryName = classifiedError.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${categoryName} Error`;
  }

  private generateDescription(classifiedError: ClassifiedError, template?: ErrorTemplate): string {
    if (template) {
      return template.descriptionTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return classifiedError.context[key] || classifiedError.message || match;
      });
    }
    
    return `An error occurred in the ${classifiedError.category} component`;
  }

  private generateSecondaryMessage(classifiedError: ClassifiedError): string {
    const messages = {
      [ErrorSeverity.CRITICAL]: 'This is a critical error that requires immediate attention.',
      [ErrorSeverity.HIGH]: 'This error is preventing normal operation.',
      [ErrorSeverity.MEDIUM]: 'This error may affect some functionality.',
      [ErrorSeverity.LOW]: 'This is a minor issue that can be safely ignored.',
      [ErrorSeverity.INFO]: 'This is an informational message.'
    };
    
    return messages[classifiedError.severity];
  }

  private generateImpactDescription(classifiedError: ClassifiedError): string {
    const impacts = {
      [ErrorCategory.WORKFLOW_GENERATION]: 'Workflow generation may be unavailable',
      [ErrorCategory.WORKFLOW_VALIDATION]: 'Workflow validation may fail',
      [ErrorCategory.COMMUNITY_NODE]: 'Community node features may be limited',
      [ErrorCategory.AI_AGENT]: 'AI-powered features may be unavailable',
      [ErrorCategory.NETWORK]: 'Network-dependent features may not work',
      [ErrorCategory.SYSTEM]: 'System functionality may be affected',
      [ErrorCategory.AUTHENTICATION]: 'Authentication may fail',
      [ErrorCategory.CONFIGURATION]: 'System configuration may be invalid',
      [ErrorCategory.PERFORMANCE]: 'System performance may be degraded',
      [ErrorCategory.KNOWLEDGE_MANAGEMENT]: 'Knowledge management features may be limited'
    };
    
    return impacts[classifiedError.category] || 'System functionality may be affected';
  }

  private getComponentFromCategory(category: ErrorCategory): string {
    const components = {
      [ErrorCategory.WORKFLOW_GENERATION]: 'Workflow Generator',
      [ErrorCategory.WORKFLOW_VALIDATION]: 'Workflow Validator',
      [ErrorCategory.COMMUNITY_NODE]: 'Community Node Manager',
      [ErrorCategory.AI_AGENT]: 'AI Agent',
      [ErrorCategory.NETWORK]: 'Network Layer',
      [ErrorCategory.SYSTEM]: 'Core System',
      [ErrorCategory.AUTHENTICATION]: 'Authentication Service',
      [ErrorCategory.CONFIGURATION]: 'Configuration Manager',
      [ErrorCategory.PERFORMANCE]: 'Performance Monitor',
      [ErrorCategory.KNOWLEDGE_MANAGEMENT]: 'Knowledge Manager'
    };
    
    return components[category] || 'Unknown Component';
  }

  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: 2^retryCount seconds
    return Math.min(Math.pow(2, retryCount) * 1000, 30000); // Max 30 seconds
  }

  private generateDocumentationUrl(errorType: ErrorType): string {
    if (!this.config.documentationBaseUrl) return '';
    
    const urlMap = {
      [ErrorType.INVALID_WORKFLOW_STRUCTURE]: '/troubleshooting/workflow-structure',
      [ErrorType.NODE_NOT_FOUND]: '/troubleshooting/community-nodes',
      [ErrorType.AI_TIMEOUT_ERROR]: '/troubleshooting/ai-services',
      [ErrorType.CONNECTION_ERROR]: '/troubleshooting/network-issues'
    };
    
    const path = urlMap[errorType] || '/troubleshooting/general';
    return `${this.config.documentationBaseUrl}${path}`;
  }

  private findTemplate(errorType: ErrorType): ErrorTemplate | undefined {
    const templates = Array.from(this.templates.values());
    for (const template of templates) {
      if (template.errorTypes.includes(errorType)) {
        return template;
      }
    }
    return undefined;
  }

  private getSeverityIcon(severity: ErrorSeverity): string {
    const icons = {
      [ErrorSeverity.CRITICAL]: '🚨',
      [ErrorSeverity.HIGH]: '⚠️',
      [ErrorSeverity.MEDIUM]: '⚡',
      [ErrorSeverity.LOW]: 'ℹ️',
      [ErrorSeverity.INFO]: '💡'
    };
    return icons[severity];
  }

  private escapeHtml(text: string): string {
    const div = { innerHTML: text } as any;
    return div.textContent || div.innerText || '';
  }

  private addToHistory(report: ErrorReport): void {
    this.reportHistory.set(report.id, report);
    
    // Maintain history size limit
    if (this.reportHistory.size > this.maxHistorySize) {
      const oldestKey = this.reportHistory.keys().next().value;
      this.reportHistory.delete(oldestKey);
    }
  }
}

export default ErrorReporter;
