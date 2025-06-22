/**
 * Troubleshooting Guide for n8n Ultimate
 * Solutions for common issues and error scenarios
 */
/**
 * Common troubleshooting scenarios
 */
export const TROUBLESHOOTING_GUIDE = [
    {
        id: 'workflow-generation-fails',
        problem: 'AI Workflow Generation Fails',
        symptoms: [
            'Error message when trying to generate workflow',
            'AI returns empty or incomplete workflow',
            'Generation takes too long and times out'
        ],
        causes: [
            'Vague or unclear description provided',
            'AI model not responding or overloaded',
            'Network connectivity issues',
            'Invalid API credentials for AI service'
        ],
        solutions: [
            'Be more specific in your workflow description - include exact app names and actions',
            'Try breaking complex workflows into simpler parts',
            'Check your internet connection and try again',
            'Verify AI model configuration in Control Panel',
            'Try using a different AI model if available',
            'Contact support if the issue persists'
        ],
        prevention: [
            'Use clear, specific language when describing workflows',
            'Test AI connectivity before starting complex projects',
            'Keep descriptions focused on one main process'
        ],
        difficulty: 'easy',
        category: 'AI Generation'
    },
    {
        id: 'credential-authentication-errors',
        problem: 'API Credential Authentication Fails',
        symptoms: [
            '401 or 403 errors when testing nodes',
            'OAuth connection fails or times out',
            'Credentials appear connected but workflows fail'
        ],
        causes: [
            'Expired or revoked API tokens',
            'Incorrect permission scopes',
            'Service account has insufficient permissions',
            'OAuth redirect URL misconfiguration'
        ],
        solutions: [
            'Reconnect the credential by clicking "Connect Account" again',
            'Check that your account has necessary permissions for the actions',
            'Verify the service is not experiencing outages',
            'Try creating a new credential connection',
            'For OAuth: clear browser cache and cookies for the service',
            'Contact the service provider if permissions appear correct'
        ],
        prevention: [
            'Use dedicated service accounts for automation',
            'Regularly review and rotate API credentials',
            'Document required permissions for each integration',
            'Test credentials after any account changes'
        ],
        difficulty: 'medium',
        category: 'Authentication'
    },
    {
        id: 'workflow-execution-errors',
        problem: 'Workflow Execution Fails During Runtime',
        symptoms: [
            'Workflow starts but stops at specific node',
            'Data is not passed between nodes correctly',
            'Random execution failures'
        ],
        causes: [
            'Invalid data format or structure',
            'Rate limiting by external services',
            'Network timeouts or connectivity issues',
            'Memory or resource constraints'
        ],
        solutions: [
            'Check the execution log for specific error messages',
            'Validate data format using the workflow debugger',
            'Add error handling nodes to catch and manage failures',
            'Implement retry logic for network-related failures',
            'Use data transformation nodes to format data correctly',
            'Monitor resource usage in System Monitor'
        ],
        prevention: [
            'Always test workflows with real data before activation',
            'Implement proper error handling for all external API calls',
            'Use data validation nodes to check input formats',
            'Set appropriate timeouts and retry policies'
        ],
        difficulty: 'medium',
        category: 'Execution'
    },
    {
        id: 'performance-issues',
        problem: 'Slow Workflow Performance',
        symptoms: [
            'Workflows take much longer than expected',
            'System becomes unresponsive during execution',
            'High CPU or memory usage'
        ],
        causes: [
            'Large data sets being processed',
            'Inefficient workflow design',
            'Too many concurrent executions',
            'Resource constraints on the system'
        ],
        solutions: [
            'Optimize workflow by reducing unnecessary data processing',
            'Use batch processing for large datasets',
            'Implement pagination for API calls',
            'Reduce concurrent execution limits',
            'Add caching for frequently accessed data',
            'Consider upgrading system resources'
        ],
        prevention: [
            'Design workflows with performance in mind',
            'Test with realistic data volumes',
            'Monitor resource usage regularly',
            'Use efficient data transformation techniques'
        ],
        difficulty: 'hard',
        category: 'Performance'
    },
    {
        id: 'template-import-issues',
        problem: 'Template Import or Customization Problems',
        symptoms: [
            'Template fails to import correctly',
            'Nodes are missing or misconfigured after import',
            'Customizations break the workflow'
        ],
        causes: [
            'Template compatibility issues',
            'Missing required node types',
            'Version conflicts between template and system',
            'Invalid customization changes'
        ],
        solutions: [
            'Check template compatibility with your n8n version',
            'Verify all required apps and integrations are available',
            'Import template to a new workflow first',
            'Make customizations one step at a time',
            'Test after each significant change',
            'Revert to original template if issues persist'
        ],
        prevention: [
            'Always backup workflows before major customizations',
            'Test templates in development environment first',
            'Keep notes of customization changes',
            'Update templates regularly to latest versions'
        ],
        difficulty: 'easy',
        category: 'Templates'
    },
    {
        id: 'dashboard-not-loading',
        problem: 'Dashboard Not Loading or Responding',
        symptoms: [
            'Blank or partially loaded dashboard',
            'Navigation not working',
            'JavaScript errors in browser console'
        ],
        causes: [
            'Browser compatibility issues',
            'Cached data corruption',
            'Network connectivity problems',
            'Server-side configuration issues'
        ],
        solutions: [
            'Try refreshing the page (Ctrl+F5 or Cmd+Shift+R)',
            'Clear browser cache and cookies',
            'Try a different browser or incognito mode',
            'Check browser console for specific error messages',
            'Disable browser extensions temporarily',
            'Contact support if issue persists across browsers'
        ],
        prevention: [
            'Use supported browsers (Chrome, Firefox, Safari, Edge)',
            'Keep browsers updated to latest versions',
            'Avoid excessive browser extensions',
            'Regular cache clearing'
        ],
        difficulty: 'easy',
        category: 'Dashboard'
    }
];
/**
 * Quick fix suggestions based on error patterns
 */
export const QUICK_FIXES = {
    'timeout': [
        'Increase timeout settings in node configuration',
        'Check network connectivity',
        'Verify service availability'
    ],
    'unauthorized': [
        'Reconnect API credentials',
        'Check account permissions',
        'Verify service access'
    ],
    'rate_limit': [
        'Add delays between requests',
        'Implement retry logic',
        'Check API usage limits'
    ],
    'invalid_data': [
        'Validate input data format',
        'Add data transformation nodes',
        'Check data mapping configuration'
    ]
};
/**
 * Troubleshooting utility class
 */
export class TroubleshootingHelper {
    /**
     * Search troubleshooting guide by keyword
     */
    static searchTroubleshooting(query) {
        const lowerQuery = query.toLowerCase();
        return TROUBLESHOOTING_GUIDE.filter(item => item.problem.toLowerCase().includes(lowerQuery) ||
            item.symptoms.some(symptom => symptom.toLowerCase().includes(lowerQuery)) ||
            item.category.toLowerCase().includes(lowerQuery));
    }
    /**
     * Get troubleshooting items by category
     */
    static getByCategory(category) {
        return TROUBLESHOOTING_GUIDE.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    /**
     * Get troubleshooting items by difficulty
     */
    static getByDifficulty(difficulty) {
        return TROUBLESHOOTING_GUIDE.filter(item => item.difficulty === difficulty);
    }
    /**
     * Get quick fix suggestions for error type
     */
    static getQuickFixes(errorType) {
        const normalizedError = errorType.toLowerCase().replace(/[^a-z]/g, '_');
        for (const [pattern, fixes] of Object.entries(QUICK_FIXES)) {
            if (normalizedError.includes(pattern)) {
                return fixes;
            }
        }
        return [
            'Check the execution log for specific error details',
            'Verify all credentials and connections',
            'Test individual nodes to isolate the issue',
            'Contact support if problem persists'
        ];
    }
    /**
     * Generate diagnostic report for troubleshooting
     */
    static generateDiagnosticReport(workflowId) {
        return {
            timestamp: new Date().toISOString(),
            workflowId: workflowId || 'N/A',
            browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
            timestamp_check: 'System operational',
            common_issues: TROUBLESHOOTING_GUIDE.filter(item => item.difficulty === 'easy'),
            suggested_actions: [
                'Check system status in monitor dashboard',
                'Verify API credentials are valid',
                'Review recent workflow changes',
                'Test with simple workflow first'
            ]
        };
    }
}
export default TroubleshootingHelper;
//# sourceMappingURL=troubleshooting.js.map