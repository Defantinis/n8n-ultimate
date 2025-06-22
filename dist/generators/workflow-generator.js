import { randomUUID } from 'crypto';
import { WorkflowParser } from '../parsers/workflow-parser.js';
import { NodeFactory } from './node-factory.js';
import { ConnectionBuilder } from './connection-builder.js';
import { PositionCalculator } from '../utils/position-calculator.js';
import { AIAgent } from '../ai-agents/ai-agent.js';
import { memoryManager } from '../performance/memory-manager.js';
// WorkflowPlan and FlowConnection are now imported from types
/**
 * Main workflow generator that creates n8n workflows from user requirements
 */
export class WorkflowGenerator {
    constructor() {
        this.parser = new WorkflowParser();
        this.nodeFactory = new NodeFactory();
        this.connectionBuilder = new ConnectionBuilder();
        this.positionCalculator = new PositionCalculator();
        this.aiAgent = new AIAgent();
    }
    /**
     * Generate a complete n8n workflow from user requirements
     */
    async generateWorkflow(requirements) {
        const workflowId = randomUUID();
        try {
            // Create memory context for this workflow generation
            const memoryContext = memoryManager.createWorkflowContext(workflowId);
            // Step 1: Analyze requirements using AI
            const analysis = await this.aiAgent.analyzeRequirements(requirements);
            memoryManager.registerObject(workflowId, 'analysis', analysis);
            memoryManager.updateWorkflowContext(workflowId);
            // Step 2: Plan the workflow structure
            const plan = await this.aiAgent.planWorkflow(analysis);
            memoryManager.registerObject(workflowId, 'plan', plan);
            memoryManager.updateWorkflowContext(workflowId);
            // Step 3: Generate nodes based on the plan
            const nodes = await this.generateNodes(plan, workflowId);
            memoryManager.registerObject(workflowId, 'nodes', nodes);
            memoryManager.updateWorkflowContext(workflowId);
            // Step 4: Create connections between nodes
            const connections = this.connectionBuilder.buildConnections(nodes, plan.flow);
            memoryManager.registerObject(workflowId, 'connections', connections);
            memoryManager.updateWorkflowContext(workflowId);
            // Step 5: Calculate positions for visual layout
            const positionedNodes = this.positionCalculator.calculatePositions(nodes, connections);
            memoryManager.registerObject(workflowId, 'positionedNodes', positionedNodes);
            memoryManager.updateWorkflowContext(workflowId);
            // Step 6: Create the complete workflow
            const workflow = this.createWorkflow(requirements, positionedNodes, connections);
            memoryManager.registerObject(workflowId, 'workflow', workflow);
            memoryManager.updateWorkflowContext(workflowId);
            // Step 7: Validate the generated workflow
            const parsedWorkflow = await this.parser.parseWorkflow(workflow);
            memoryManager.registerObject(workflowId, 'parsedWorkflow', parsedWorkflow);
            memoryManager.updateWorkflowContext(workflowId);
            // Step 8: Optimize if needed
            const optimizedWorkflow = await this.optimizeWorkflow(parsedWorkflow, requirements);
            memoryManager.registerObject(workflowId, 'optimizedWorkflow', optimizedWorkflow);
            memoryManager.updateWorkflowContext(workflowId);
            const result = {
                workflow: optimizedWorkflow.workflow,
                metadata: optimizedWorkflow.metadata,
                validation: optimizedWorkflow.validation,
                generationDetails: {
                    requirements,
                    analysis,
                    plan,
                    nodeCount: nodes.length,
                    connectionCount: Object.keys(connections).length,
                    complexity: optimizedWorkflow.metadata.estimatedComplexity,
                    generatedAt: new Date().toISOString(),
                    memoryUsage: memoryContext.currentMemory.heapUsed - memoryContext.startMemory.heapUsed
                }
            };
            // Clean up memory context
            await memoryManager.cleanupWorkflowContext(workflowId);
            return result;
        }
        catch (error) {
            // Ensure cleanup on error
            await memoryManager.cleanupWorkflowContext(workflowId);
            throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate workflow nodes based on the AI plan
     */
    async generateNodes(plan, workflowId) {
        const nodes = [];
        // ENHANCED: Intelligent trigger selection and configuration
        const hasTrigger = plan.nodes.some(node => this.isTriggerNode(node.type));
        if (!hasTrigger) {
            const triggerNode = this.selectAndCreateTriggerNode(plan);
            nodes.push(triggerNode);
        }
        // Detect workflow type for context-aware parameter configuration
        const workflowContext = this.analyzeWorkflowContext(plan);
        for (const nodeSpec of plan.nodes) {
            const node = await this.nodeFactory.createNode(nodeSpec);
            // CRITICAL FIX: Ensure all node parameters have proper default values with workflow context
            node.parameters = this.ensureValidParameters(node.parameters, node.type);
            // Use memory pool for node objects if workflowId provided
            if (workflowId) {
                const pooledNode = memoryManager.getFromPool('nodes', workflowId);
                if (pooledNode) {
                    // Copy node properties to pooled object
                    Object.assign(pooledNode, node);
                    nodes.push(pooledNode);
                }
                else {
                    nodes.push(node);
                }
            }
            else {
                nodes.push(node);
            }
        }
        return nodes;
    }
    /**
     * Analyze workflow context to provide intelligent parameter defaults
     */
    analyzeWorkflowContext(plan) {
        const nodeTypes = plan.nodes.map(n => n.type);
        const descriptions = plan.nodes.map(n => n.description).join(' ').toLowerCase();
        return {
            type: this.detectWorkflowType(nodeTypes, descriptions),
            domain: this.detectWorkflowDomain(descriptions),
            complexity: plan.estimatedComplexity || 5,
            hasDataProcessing: nodeTypes.some(t => t.includes('code') || t.includes('set')),
            hasWebRequests: nodeTypes.some(t => t.includes('httpRequest')),
            hasFileOperations: nodeTypes.some(t => t.includes('file') || t.includes('csv')),
            hasNotifications: nodeTypes.some(t => t.includes('email') || t.includes('slack'))
        };
    }
    /**
     * Detect the primary workflow type
     */
    detectWorkflowType(nodeTypes, descriptions) {
        if (descriptions.includes('scrap') || descriptions.includes('extract') || nodeTypes.some(t => t.includes('html'))) {
            return 'scraper';
        }
        if (descriptions.includes('api') || descriptions.includes('endpoint') || nodeTypes.some(t => t.includes('webhook'))) {
            return 'api';
        }
        if (descriptions.includes('process') || descriptions.includes('transform') || nodeTypes.some(t => t.includes('code'))) {
            return 'data-processing';
        }
        if (descriptions.includes('email') || descriptions.includes('notify') || nodeTypes.some(t => t.includes('email'))) {
            return 'notification';
        }
        if (descriptions.includes('automat') || descriptions.includes('schedul')) {
            return 'automation';
        }
        return 'integration';
    }
    /**
     * Detect the workflow domain/industry
     */
    detectWorkflowDomain(descriptions) {
        if (descriptions.includes('e-commerce') || descriptions.includes('shop') || descriptions.includes('product'))
            return 'ecommerce';
        if (descriptions.includes('social') || descriptions.includes('twitter') || descriptions.includes('instagram'))
            return 'social-media';
        if (descriptions.includes('finance') || descriptions.includes('payment') || descriptions.includes('invoice'))
            return 'finance';
        if (descriptions.includes('crm') || descriptions.includes('customer') || descriptions.includes('lead'))
            return 'crm';
        if (descriptions.includes('marketing') || descriptions.includes('campaign') || descriptions.includes('analytics'))
            return 'marketing';
        return 'general';
    }
    /**
     * Ensure node parameters have valid structure and values to prevent JavaScript UI errors
     */
    ensureValidParameters(parameters, nodeType) {
        if (!parameters || typeof parameters !== 'object') {
            parameters = {};
        }
        // CRITICAL: Clean any [object Object] references and undefined values first
        parameters = this.cleanObjectReferences(parameters);
        // CRITICAL: Validate against n8n UI requirements to prevent React component crashes
        parameters = this.validateForN8nUI(parameters, nodeType);
        // ENHANCED: Apply intelligent defaults based on node type
        return this.applyIntelligentDefaults(parameters, nodeType);
    }
    /**
     * Validate parameters for n8n UI compatibility and prevent React component errors
     */
    validateForN8nUI(parameters, nodeType) {
        const cleanParams = {};
        // CRITICAL: Ensure all parameter values are React-component safe
        for (const [key, value] of Object.entries(parameters)) {
            if (value === undefined || value === null) {
                // Skip undefined/null values that break React components
                continue;
            }
            if (typeof value === 'string' && value.includes('[object Object]')) {
                // Skip malformed string values
                continue;
            }
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    // Validate arrays
                    cleanParams[key] = this.validateArrayForUI(value);
                }
                else {
                    // Recursively validate objects
                    cleanParams[key] = this.validateForN8nUI(value, nodeType);
                }
            }
            else {
                // Primitive values - ensure they're valid
                cleanParams[key] = this.validatePrimitiveForUI(value);
            }
        }
        // CRITICAL: Add required fields that n8n UI expects for specific node types
        return this.addRequiredUIFields(cleanParams, nodeType);
    }
    /**
     * Validate array values for UI compatibility
     */
    validateArrayForUI(arr) {
        return arr.filter(item => {
            if (item === undefined || item === null)
                return false;
            if (typeof item === 'string' && item.includes('[object Object]'))
                return false;
            return true;
        }).map(item => {
            if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                return this.validateForN8nUI(item, '');
            }
            return this.validatePrimitiveForUI(item);
        });
    }
    /**
     * Validate primitive values for UI compatibility
     */
    validatePrimitiveForUI(value) {
        // Handle different primitive types
        switch (typeof value) {
            case 'string':
                // Ensure strings don't contain object references
                if (value.includes('[object Object]'))
                    return '';
                return value;
            case 'number':
                // Ensure valid numbers
                if (isNaN(value) || !isFinite(value))
                    return 0;
                return value;
            case 'boolean':
                return Boolean(value);
            default:
                // For unknown types, convert to empty string
                return '';
        }
    }
    /**
     * Add required UI fields based on node type to prevent React component errors
     */
    addRequiredUIFields(parameters, nodeType) {
        switch (nodeType) {
            case 'n8n-nodes-base.httpRequest':
                return {
                    ...parameters,
                    // CRITICAL: These fields are required by n8n's HTTP Request UI component
                    url: parameters.url || 'https://example.com/api',
                    method: parameters.method || 'GET',
                    sendQuery: parameters.sendQuery || false,
                    queryParameters: parameters.queryParameters || { parameters: [] },
                    sendHeaders: parameters.sendHeaders || false,
                    headerParameters: parameters.headerParameters || { parameters: [] },
                    sendBody: parameters.sendBody || false,
                    contentType: parameters.contentType || 'json',
                    options: {
                        timeout: 10000,
                        retry: { limit: 3, delayBetweenRetries: 1000 },
                        redirect: { maxRedirects: 5 },
                        response: { response: 'autodetect' },
                        ...parameters.options
                    }
                };
            case 'n8n-nodes-base.if':
                return {
                    ...parameters,
                    // CRITICAL: IF nodes require proper condition structure
                    conditions: {
                        options: {
                            caseSensitive: true,
                            leftValue: '',
                            typeValidation: 'strict'
                        },
                        conditions: [
                            {
                                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
                                leftValue: '{{ $json.statusCode }}',
                                rightValue: 200,
                                operator: {
                                    type: 'number',
                                    operation: 'equals',
                                    singleValue: true
                                }
                            }
                        ],
                        combinator: 'and',
                        ...parameters.conditions
                    }
                };
            case 'n8n-nodes-base.htmlExtract':
                return {
                    ...parameters,
                    // CRITICAL: HTML Extract nodes need proper extraction rules
                    extractionValues: {
                        values: [
                            {
                                key: 'title',
                                cssSelector: 'title',
                                returnValue: 'text',
                                ...parameters.extractionValues?.values?.[0]
                            }
                        ],
                        ...parameters.extractionValues
                    },
                    options: {
                        trimValues: true,
                        skipEmptyValues: true,
                        ...parameters.options
                    }
                };
            case 'n8n-nodes-base.code':
                return {
                    ...parameters,
                    // CRITICAL: Code nodes need valid JavaScript
                    jsCode: parameters.jsCode || this.generateSafeJavaScript(),
                    mode: parameters.mode || 'runOnceForAllItems',
                    ...parameters
                };
            case 'n8n-nodes-base.set':
                return {
                    ...parameters,
                    // CRITICAL: Set nodes need proper value mapping
                    values: {
                        number: [],
                        string: [
                            {
                                name: 'timestamp',
                                value: '{{ new Date().toISOString() }}'
                            },
                            {
                                name: 'status',
                                value: 'processed'
                            }
                        ],
                        boolean: [],
                        array: [],
                        object: [],
                        ...parameters.values
                    },
                    options: {
                        dotNotation: true,
                        ...parameters.options
                    }
                };
            default:
                return parameters;
        }
    }
    /**
     * Generate safe JavaScript code for Code nodes that won't cause UI errors
     */
    generateSafeJavaScript() {
        return `// Auto-generated safe code
for (const item of $input.all()) {
  // Process each item safely
  try {
    const processedItem = {
      ...item.json,
      processed_at: new Date().toISOString(),
      processed: true
    };
    
    $input.item = { json: processedItem, pairedItem: item.pairedItem };
  } catch (error) {
    // Handle errors gracefully
    $input.item = { 
      json: { ...item.json, error: error.message, processed: false }, 
      pairedItem: item.pairedItem 
    };
  }
}

return $input.all();`;
    }
    /**
     * Clean [object Object] references and undefined values from parameters
     */
    cleanObjectReferences(params) {
        for (const key in params) {
            if (params[key] === '[object Object]' || params[key] === 'undefined') {
                delete params[key];
            }
            else if (typeof params[key] === 'object' && params[key] !== null) {
                this.cleanObjectReferences(params[key]);
            }
        }
    }
    /**
     * Apply intelligent defaults based on node type
     */
    applyIntelligentDefaults(parameters, nodeType) {
        let validParams = { ...parameters };
        switch (nodeType) {
            case 'n8n-nodes-base.httpRequest':
                // Intelligent HTTP Request auto-configuration
                if (!validParams.url) {
                    validParams.url = "https://example.com/api"; // Better default than just example.com
                }
                if (!validParams.httpMethod) {
                    validParams.httpMethod = "GET";
                }
                if (!validParams.options) {
                    validParams.options = {
                        timeout: 30000,
                        retry: {
                            enabled: true,
                            maxRetries: 3,
                            retryDelay: 1000
                        },
                        headers: {
                            "User-Agent": "Mozilla/5.0 (compatible; n8n-workflow/1.0)",
                            "Accept": "application/json, text/html, */*"
                        }
                    };
                }
                // Auto-configure for scraping if URL suggests it
                if (validParams.url && (validParams.url.includes('workflows') || validParams.url.includes('scrape'))) {
                    validParams.options.headers = {
                        ...validParams.options.headers,
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                    };
                }
                break;
            case 'n8n-nodes-base.html':
                // Smart HTML extraction defaults
                if (!validParams.operation) {
                    validParams.operation = "extractHtmlContent";
                }
                if (!validParams.extractionValues || !validParams.extractionValues.values) {
                    validParams.extractionValues = {
                        values: [
                            {
                                key: "title",
                                cssSelector: "h1, h2, .title, [class*='title']",
                                returnValue: "text"
                            },
                            {
                                key: "links",
                                cssSelector: "a[href]",
                                returnValue: "attribute",
                                attribute: "href"
                            },
                            {
                                key: "text",
                                cssSelector: "p, .content, [class*='content']",
                                returnValue: "text"
                            }
                        ]
                    };
                }
                if (!validParams.options) {
                    validParams.options = {
                        trimValues: true,
                        includeEmptyValues: false
                    };
                }
                break;
            case 'n8n-nodes-base.code':
                // Intelligent Code node defaults
                if (!validParams.jsCode || validParams.jsCode.trim() === '') {
                    validParams.jsCode = this.generateIntelligentCodeDefault(validParams);
                }
                if (!validParams.options) {
                    validParams.options = {
                        continueOnFail: false
                    };
                }
                break;
            case 'n8n-nodes-base.set':
                // Smart Set node configuration
                if (!validParams.options) {
                    validParams.options = {
                        keepOnlySet: false
                    };
                }
                if (!validParams.values) {
                    validParams.values = {
                        number: [
                            {
                                name: "processedAt",
                                value: "={{ new Date().toISOString() }}"
                            }
                        ],
                        string: [
                            {
                                name: "status",
                                value: "processed"
                            }
                        ]
                    };
                }
                break;
            case 'n8n-nodes-base.splitInBatches':
                // Optimal batch processing defaults
                if (!validParams.batchSize) {
                    validParams.batchSize = 5; // Good default for most APIs
                }
                if (!validParams.options) {
                    validParams.options = {
                        continueOnFail: true,
                        reset: false
                    };
                }
                break;
            case 'n8n-nodes-base.writeBinaryFile':
                // Smart file writing defaults
                if (!validParams.fileName) {
                    validParams.fileName = "output-{{ new Date().toISOString().split('T')[0] }}.json";
                }
                if (!validParams.options) {
                    validParams.options = {
                        encoding: "utf8",
                        append: false
                    };
                }
                break;
            case 'n8n-nodes-base.emailSend':
                // Email notification defaults
                if (!validParams.subject) {
                    validParams.subject = "🎉 Workflow Completed Successfully";
                }
                if (!validParams.message) {
                    validParams.message = "Your n8n workflow has completed successfully!\n\nTimestamp: {{ new Date().toISOString() }}\nItems processed: {{ $json.length || 1 }}";
                }
                if (!validParams.options) {
                    validParams.options = {
                        priority: "normal"
                    };
                }
                break;
            default:
                // Generic parameter validation for unknown node types
                if (Object.keys(validParams).length === 0) {
                    validParams.options = {
                        continueOnFail: false
                    };
                }
                break;
        }
        return validParams;
    }
    /**
     * Generate intelligent code defaults based on context
     */
    generateIntelligentCodeDefault(parameters) {
        // Detect if this might be data processing, filtering, or transformation
        const contextHints = JSON.stringify(parameters).toLowerCase();
        if (contextHints.includes('filter') || contextHints.includes('condition')) {
            return `// Filter and process data
const items = $input.all();
const filteredItems = items.filter(item => {
  // Add your filtering logic here
  return item.json.status === 'active';
});

return filteredItems;`;
        }
        if (contextHints.includes('transform') || contextHints.includes('map')) {
            return `// Transform data
const items = $input.all();
const transformedItems = items.map(item => ({
  ...item.json,
  processedAt: new Date().toISOString(),
  // Add your transformations here
}));

return transformedItems.map(item => ({ json: item }));`;
        }
        if (contextHints.includes('analyze') || contextHints.includes('stats')) {
            return `// Analyze and enhance data
const items = $input.all();
const stats = {
  total: items.length,
  processed: 0,
  errors: []
};

const processedItems = [];

for (const item of items) {
  try {
    // Add your analysis logic here
    const enhanced = {
      ...item.json,
      analyzedAt: new Date().toISOString()
    };
    
    processedItems.push({ json: enhanced });
    stats.processed++;
  } catch (error) {
    stats.errors.push({ error: error.message, data: item.json });
  }
}

// Add stats summary
processedItems.push({ json: { _stats: stats, _type: 'summary' } });

return processedItems;`;
        }
        // Default generic processing code
        return `// Process the input data
const items = $input.all();

// Your processing logic here
const processedItems = items.map(item => ({
  ...item.json,
  processedAt: new Date().toISOString()
}));

return processedItems.map(item => ({ json: item }));`;
    }
    /**
     * Check if a node type is a trigger node
     */
    isTriggerNode(nodeType) {
        const triggerTypes = [
            'n8n-nodes-base.manualTrigger',
            'n8n-nodes-base.webhook',
            'n8n-nodes-base.schedule',
            'n8n-nodes-base.httpRequestTrigger',
            'n8n-nodes-base.emailTrigger',
            'n8n-nodes-base.fileTrigger'
        ];
        return triggerTypes.includes(nodeType);
    }
    /**
     * Intelligently select and create the most appropriate trigger node
     */
    selectAndCreateTriggerNode(plan) {
        const triggerType = this.determineTriggerType(plan);
        switch (triggerType) {
            case 'webhook':
                return this.createWebhookTriggerNode();
            case 'schedule':
                return this.createScheduleTriggerNode(plan);
            case 'manual':
            default:
                return this.createManualTriggerNode();
        }
    }
    /**
     * Determine the most appropriate trigger type based on workflow characteristics
     */
    determineTriggerType(plan) {
        const nodeTypes = plan.nodes.map(n => n.type);
        const descriptions = plan.nodes.map(n => n.description).join(' ').toLowerCase();
        // Webhook triggers for API endpoints, integrations, and real-time processing
        if (descriptions.includes('api') ||
            descriptions.includes('endpoint') ||
            descriptions.includes('webhook') ||
            descriptions.includes('real-time') ||
            descriptions.includes('integration') ||
            nodeTypes.some(t => t.includes('api') || t.includes('webhook'))) {
            return 'webhook';
        }
        // Schedule triggers for automation, monitoring, and recurring tasks
        if (descriptions.includes('schedule') ||
            descriptions.includes('automat') ||
            descriptions.includes('daily') ||
            descriptions.includes('hourly') ||
            descriptions.includes('monitor') ||
            descriptions.includes('recurring') ||
            descriptions.includes('batch') ||
            descriptions.includes('sync')) {
            return 'schedule';
        }
        // Manual triggers for testing, scraping, and on-demand workflows
        return 'manual';
    }
    /**
     * Create a manual trigger node for testing workflows
     */
    createManualTriggerNode() {
        return {
            parameters: {
                options: {
                    manualTriggerMessage: "Click to start this workflow manually"
                }
            },
            type: 'n8n-nodes-base.manualTrigger',
            typeVersion: 1,
            position: [100, 200],
            id: 'manual-trigger',
            name: '▶️ Manual Trigger'
        };
    }
    /**
     * Create a webhook trigger node for API integrations
     */
    createWebhookTriggerNode() {
        return {
            parameters: {
                path: 'workflow-webhook',
                options: {
                    responseMode: 'responseNode',
                    responseData: 'firstEntryJson'
                },
                httpMethod: 'POST',
                authentication: 'none'
            },
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1.1,
            position: [100, 200],
            id: 'webhook-trigger',
            name: '🌐 Webhook Trigger'
        };
    }
    /**
     * Create a schedule trigger node for automated workflows
     */
    createScheduleTriggerNode(plan) {
        const scheduleInterval = this.determineScheduleInterval(plan);
        return {
            parameters: {
                rule: {
                    interval: scheduleInterval.interval
                },
                triggerTimes: {
                    item: scheduleInterval.triggerTimes
                }
            },
            type: 'n8n-nodes-base.schedule',
            typeVersion: 1.1,
            position: [100, 200],
            id: 'schedule-trigger',
            name: '⏰ Schedule Trigger'
        };
    }
    /**
     * Determine appropriate schedule interval based on workflow type
     */
    determineScheduleInterval(plan) {
        const descriptions = plan.nodes.map(n => n.description).join(' ').toLowerCase();
        // High-frequency monitoring (every 5 minutes)
        if (descriptions.includes('monitor') || descriptions.includes('alert') || descriptions.includes('health')) {
            return {
                interval: [{ field: 'minutes', secondsInterval: 5 }],
                triggerTimes: []
            };
        }
        // Hourly data processing
        if (descriptions.includes('hourly') || descriptions.includes('frequent')) {
            return {
                interval: [{ field: 'hours', hoursInterval: 1 }],
                triggerTimes: [{ hour: 0, minute: 0 }]
            };
        }
        // Daily batch processing (default - runs at 2 AM)
        return {
            interval: [{ field: 'days', daysInterval: 1 }],
            triggerTimes: [{ hour: 2, minute: 0 }]
        };
    }
    /**
     * Create the complete workflow structure
     */
    createWorkflow(requirements, nodes, connections) {
        return {
            name: requirements.name || 'Generated Workflow',
            nodes,
            connections,
            active: false,
            settings: {
                executionOrder: 'v1',
                saveManualExecutions: true,
                saveDataErrorExecution: 'all',
                saveDataSuccessExecution: 'all'
            },
            id: randomUUID(),
            meta: {
                templateCredsSetupCompleted: false
            },
            tags: requirements.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    /**
     * Optimize the generated workflow
     */
    async optimizeWorkflow(parsedWorkflow, requirements) {
        // Check if optimization is needed
        if (parsedWorkflow.metadata.estimatedComplexity <= 7 && parsedWorkflow.validation.isValid) {
            return parsedWorkflow;
        }
        // Apply optimizations based on validation results
        let optimizedWorkflow = parsedWorkflow.workflow;
        // Fix validation errors
        if (!parsedWorkflow.validation.isValid) {
            optimizedWorkflow = await this.fixValidationErrors(optimizedWorkflow, parsedWorkflow.validation.errors);
        }
        // Reduce complexity if too high
        if (parsedWorkflow.metadata.estimatedComplexity > 8) {
            optimizedWorkflow = await this.reduceComplexity(optimizedWorkflow, requirements);
        }
        // Re-parse the optimized workflow
        return await this.parser.parseWorkflow(optimizedWorkflow);
    }
    /**
     * Fix validation errors in the workflow
     */
    async fixValidationErrors(workflow, errors) {
        const fixedWorkflow = { ...workflow };
        for (const error of errors) {
            switch (error.type) {
                case 'node':
                    // Placeholder for fixing node errors
                    break;
                case 'connection':
                    // Placeholder for fixing connection errors
                    break;
                case 'structure':
                    // Placeholder for fixing structure errors
                    break;
            }
        }
        return fixedWorkflow;
    }
    /**
     * Reduce workflow complexity
     */
    async reduceComplexity(workflow, requirements) {
        // Identify complex nodes and suggest simplifications
        const complexNodes = workflow.nodes.filter(node => {
            // Simple complexity check - can be enhanced
            return Object.keys(node.parameters).length > 5 ||
                node.type.includes('code') ||
                node.type.includes('function');
        });
        // Use AI to suggest simplifications
        if (complexNodes.length > 0) {
            const simplificationSuggestions = await this.aiAgent.suggestSimplifications(workflow, complexNodes, requirements);
            return await this.applySimplifications(workflow, simplificationSuggestions);
        }
        return workflow;
    }
    /**
     * Apply simplification suggestions to the workflow
     */
    async applySimplifications(workflow, suggestions) {
        let simplifiedWorkflow = { ...workflow };
        for (const suggestion of suggestions) {
            switch (suggestion.type) {
                case 'split-node':
                    simplifiedWorkflow = await this.splitComplexNode(simplifiedWorkflow, suggestion);
                    break;
                case 'merge-nodes':
                    simplifiedWorkflow = await this.mergeSimpleNodes(simplifiedWorkflow, suggestion);
                    break;
                case 'simplify-parameters':
                    simplifiedWorkflow = await this.simplifyNodeParameters(simplifiedWorkflow, suggestion);
                    break;
            }
        }
        return simplifiedWorkflow;
    }
    /**
     * Generate workflow from a template
     */
    async generateFromTemplate(templateName, parameters) {
        const template = await this.loadTemplate(templateName);
        const populatedWorkflow = await this.populateTemplate(template, parameters);
        const parsedWorkflow = await this.parser.parseWorkflow(populatedWorkflow);
        return {
            workflow: parsedWorkflow.workflow,
            metadata: parsedWorkflow.metadata,
            validation: parsedWorkflow.validation,
            generationDetails: {
                requirements: { name: templateName, description: 'Generated from template', type: 'template' },
                analysis: { templateUsed: templateName },
                plan: { nodes: [], flow: [], estimatedComplexity: 0, rationale: 'Template-based generation' },
                nodeCount: parsedWorkflow.workflow.nodes.length,
                connectionCount: Object.keys(parsedWorkflow.workflow.connections).length,
                complexity: parsedWorkflow.metadata.estimatedComplexity,
                generatedAt: new Date().toISOString()
            }
        };
    }
    /**
     * Enhance an existing workflow with new requirements
     */
    async enhanceWorkflow(existingWorkflow, enhancements) {
        let workflow = { ...existingWorkflow };
        for (const enhancement of enhancements) {
            const targetNode = workflow.nodes.find(n => n.id === enhancement.parameters.targetNodeId);
            if (!targetNode && enhancement.type !== 'add-node') {
                console.warn(`Target node for enhancement not found: ${enhancement.parameters.targetNodeId}`);
                continue;
            }
            switch (enhancement.type) {
                case 'add-error-handling':
                    workflow = await this.addErrorHandling(workflow, targetNode);
                    break;
                // Other enhancement types can be added here
            }
        }
        // Recalculate positions for the entire workflow
        workflow.nodes = this.positionCalculator.calculatePositions(workflow.nodes, workflow.connections);
        const parsedWorkflow = await this.parser.parseWorkflow(workflow);
        return {
            workflow,
            metadata: parsedWorkflow.metadata,
            validation: parsedWorkflow.validation,
            generationDetails: {
                requirements: { description: 'Enhanced workflow', type: 'enhancement' },
                analysis: {},
                plan: { nodes: [], flow: [], estimatedComplexity: parsedWorkflow.metadata.estimatedComplexity, rationale: 'Applied enhancements' },
                nodeCount: workflow.nodes.length,
                connectionCount: Object.keys(workflow.connections).length,
                complexity: parsedWorkflow.metadata.estimatedComplexity,
                generatedAt: new Date().toISOString()
            }
        };
    }
    // Placeholder methods for error fixing and workflow modification
    // TODO: Implement when needed
    // private async fixConnectionError(workflow: N8nWorkflow, _error: any): Promise<N8nWorkflow> {
    //   return workflow;
    // }
    // private async fixStructureError(workflow: N8nWorkflow, _error: any): Promise<N8nWorkflow> {
    //   return workflow;
    // }
    async splitComplexNode(workflow, _suggestion) {
        // Implementation for splitting complex nodes
        return workflow;
    }
    async mergeSimpleNodes(workflow, _suggestion) {
        // Implementation for merging simple nodes
        return workflow;
    }
    async simplifyNodeParameters(workflow, _suggestion) {
        // Implementation for simplifying node parameters
        return workflow;
    }
    async loadTemplate(_templateName) {
        // Implementation for loading workflow templates
        throw new Error('Template loading not implemented yet');
    }
    async populateTemplate(template, _parameters) {
        // Placeholder for populating template with parameters
        return template;
    }
    // TODO: Implement enhancement methods when needed
    // private async addNodeToWorkflow(workflow: N8nWorkflow, enhancement: WorkflowEnhancement): Promise<N8nWorkflow> {
    //   const { targetNodeId, newNode } = enhancement.parameters;
    //   const node = await this.nodeFactory.createNode(newNode);
    //   const newNodes = [...workflow.nodes, node];
    //   return { ...workflow, nodes: newNodes };
    // }
    // private async modifyWorkflowNode(workflow: N8nWorkflow, _enhancement: WorkflowEnhancement): Promise<N8nWorkflow> {
    //   return workflow;
    // }
    // private async addConnectionToWorkflow(workflow: N8nWorkflow, _enhancement: WorkflowEnhancement): Promise<N8nWorkflow> {
    //   return workflow;
    // }
    async addErrorHandling(workflow, targetNode) {
        // 1. Create an 'IF' node for error checking
        const ifNode = await this.nodeFactory.createNode({
            id: `if-error-${targetNode.id}`,
            name: `Check ${targetNode.name} Success`,
            type: 'n8n-nodes-base.if',
            description: 'Checks if the previous node ran successfully.',
            parameters: {
                conditions: { conditions: [{ id: 'error-check', leftValue: '={{ $json.error }}', operator: { type: 'string', operation: 'isEmpty' } }] }
            }
        });
        // 2. Create an error notification node
        const errorNode = await this.nodeFactory.createNode({
            id: `error-node-${targetNode.id}`,
            name: `Error in ${targetNode.name}`,
            type: 'n8n-nodes-base.noOp',
            description: 'Stops workflow on error.',
            parameters: { message: `ERROR: ${targetNode.name} failed. Error: {{ $json.error }}` }
        });
        let newNodes = [...workflow.nodes, ifNode, errorNode];
        // 3. Reroute connections
        const { connections: reroutedConnections, originalSuccessorName } = this.connectionBuilder.rerouteThroughNode(workflow.connections, targetNode.name, ifNode.name);
        let newConnections = reroutedConnections;
        // 4. Connect IF node outputs
        if (originalSuccessorName) {
            newConnections = this.connectionBuilder.addConnectionByIds(newConnections, ifNode.name, originalSuccessorName, 'main', 0);
        }
        newConnections = this.connectionBuilder.addConnectionByIds(newConnections, ifNode.name, errorNode.name, 'main', 1);
        return { ...workflow, nodes: newNodes, connections: newConnections };
    }
    addNodeNotes(node) {
        // Add descriptive notes to nodes based on their type and purpose
        const nodeNotes = this.generateNodeNotes(node);
        if (nodeNotes) {
            node.notes = nodeNotes;
        }
    }
    generateNodeNotes(node) {
        const nodeType = node.type;
        const nodeName = node.name || 'Unnamed Node';
        // Generate contextual notes based on node type
        switch (nodeType) {
            case 'n8n-nodes-base.manualTrigger':
                return `🚀 Manual Trigger: Click this button to start the workflow execution manually. This is the entry point for the entire automation process.`;
            case 'n8n-nodes-base.httpRequest':
                const url = node.parameters?.url || 'target URL';
                return `🌐 HTTP Request: Fetches data from ${url}. Configured with proper headers, timeout settings, and error handling for reliable data retrieval.`;
            case 'n8n-nodes-base.html':
                return `🔍 HTML Parser: Extracts specific data from HTML content using CSS selectors. Configured to find titles, links, descriptions, and other structured data from web pages.`;
            case 'n8n-nodes-base.code':
                const codeType = this.detectCodePurpose(node.parameters?.jsCode || '');
                return `⚙️ JavaScript Code: ${codeType}. Processes data, validates results, and applies business logic transformations with comprehensive error handling.`;
            case 'n8n-nodes-base.if':
                return `✅ Conditional Logic: Evaluates data conditions to determine workflow path. Routes successful responses to data processing and errors to diagnostic handling.`;
            case 'n8n-nodes-base.set':
                return `📝 Data Setter: Configures data fields and adds metadata like timestamps, session IDs, and processing status for downstream nodes.`;
            case 'n8n-nodes-base.splitInBatches':
                const batchSize = node.parameters?.batchSize || 5;
                return `📦 Batch Processor: Splits large datasets into manageable chunks of ${batchSize} items for efficient processing and memory management.`;
            case 'n8n-nodes-base.writeBinaryFile':
                return `💾 File Writer: Saves processed data to files with automatic naming, proper encoding, and organized directory structure.`;
            case 'n8n-nodes-base.emailSend':
                return `📧 Email Sender: Sends notification emails with results, summaries, or error reports. Configured with proper formatting and attachments.`;
            default:
                return `🔧 ${nodeName}: Performs specialized processing as part of the automated workflow. Check parameters for specific configuration details.`;
        }
    }
    detectCodePurpose(jsCode) {
        if (jsCode.includes('console.log') && jsCode.includes('TEST')) {
            return 'Testing & Diagnostics - Provides detailed logging and validation for debugging workflow execution';
        }
        else if (jsCode.includes('validation') || jsCode.includes('validate')) {
            return 'Data Validation - Checks data quality, completeness, and format compliance';
        }
        else if (jsCode.includes('extract') || jsCode.includes('parse')) {
            return 'Data Extraction - Parses and structures raw data into usable formats';
        }
        else if (jsCode.includes('filter') || jsCode.includes('clean')) {
            return 'Data Processing - Filters, cleans, and transforms data for downstream use';
        }
        else if (jsCode.includes('learning') || jsCode.includes('insight')) {
            return 'Learning System - Collects patterns and insights for continuous workflow improvement';
        }
        else if (jsCode.includes('error') || jsCode.includes('diagnostic')) {
            return 'Error Handling - Provides comprehensive error analysis and recovery recommendations';
        }
        else {
            return 'Data Processing - Transforms and manipulates data according to workflow requirements';
        }
    }
}
