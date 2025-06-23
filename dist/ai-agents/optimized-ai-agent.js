import { AIAgent } from './ai-agent.js';
import { StreamingOllamaClient } from './streaming-ollama-client.js';
import { EventEmitter } from 'events';
import { feedbackBus } from '../dashboard/interactions/feedback-bus.js';
/**
 * Optimized AI Agent with streaming, batching, and concurrent processing capabilities
 */
export class OptimizedAIAgent extends EventEmitter {
    baseAgent;
    streamingClient;
    config;
    promptTemplates = new Map();
    metrics = {
        totalRequests: 0,
        streamingRequests: 0,
        batchedRequests: 0,
        concurrentRequests: 0,
        avgResponseTime: 0,
        cacheHitRate: 0,
        promptOptimizations: 0,
        errorRate: 0
    };
    constructor(config) {
        super();
        this.config = {
            ollamaBaseUrl: 'http://localhost:11434',
            modelName: 'deepseek-r1:14b',
            enableCaching: true,
            enableStreaming: true,
            enableBatching: true,
            maxConcurrentRequests: 3,
            promptOptimization: true,
            enableMetrics: true,
            ...config
        };
        // Initialize base agent for fallback
        this.baseAgent = new AIAgent(this.config.ollamaBaseUrl, this.config.modelName, this.config.enableCaching);
        // Initialize streaming client
        const streamingConfig = {
            baseUrl: this.config.ollamaBaseUrl,
            model: this.config.modelName,
            maxConnections: this.config.maxConcurrentRequests * 2,
            enableBatching: this.config.enableBatching,
            ...this.config.streamingConfig
        };
        this.streamingClient = new StreamingOllamaClient(streamingConfig);
        this.initializePromptTemplates();
        this.setupEventHandlers();
        this.setupFeedbackListener();
    }
    /**
     * Orchestrates the full workflow generation process from a simple description.
     */
    async generateWorkflow(description) {
        console.log(`Generating workflow for: "${description}"`);
        const requirements = {
            description,
            type: 'custom', // Default type, can be refined by analysis
        };
        try {
            const analysis = await this.baseAgent.analyzeRequirements(requirements);
            const plan = await this.baseAgent.planWorkflow(analysis);
            console.log('Workflow plan generated successfully.');
            // In a real implementation, you'd generate and validate the final JSON here.
            return plan;
        }
        catch (error) {
            console.error('Error during workflow generation pipeline:', error);
            this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalRequests;
            return null;
        }
    }
    /**
     * Analyze requirements with streaming response
     */
    async analyzeRequirementsStreaming(requirements) {
        const requestId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const prompt = this.getOptimizedPrompt('analysis', { requirements });
        const request = {
            id: requestId,
            prompt,
            options: {
                temperature: 0.3,
                top_p: 0.9,
                num_predict: 2000
            }
        };
        this.metrics.totalRequests++;
        this.metrics.streamingRequests++;
        try {
            const generator = await this.streamingClient.streamRequest(request);
            return this.processAnalysisStream(generator, requirements);
        }
        catch (error) {
            this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalRequests;
            // Fallback to base agent
            const result = await this.baseAgent.analyzeRequirements(requirements);
            return this.createSingleYieldGenerator(result);
        }
    }
    /**
     * Plan workflow with streaming response
     */
    async planWorkflowStreaming(analysis) {
        const requestId = `planning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const prompt = this.getOptimizedPrompt('planning', { analysis });
        const request = {
            id: requestId,
            prompt,
            options: {
                temperature: 0.3,
                top_p: 0.9,
                num_predict: 3000
            }
        };
        this.metrics.totalRequests++;
        this.metrics.streamingRequests++;
        try {
            const generator = await this.streamingClient.streamRequest(request);
            return this.processPlanningStream(generator, analysis);
        }
        catch (error) {
            this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalRequests;
            // Fallback to base agent
            const result = await this.baseAgent.planWorkflow(analysis);
            return this.createSingleYieldGenerator(result);
        }
    }
    /**
     * Process multiple analysis requests concurrently
     */
    async analyzeConcurrent(requests) {
        const results = new Map();
        this.metrics.concurrentRequests += requests.length;
        const streamingRequests = requests.map(req => ({
            id: req.id,
            prompt: this.getOptimizedPrompt('analysis', { requirements: req.requirements }),
            priority: req.priority || 1,
            options: {
                temperature: 0.3,
                top_p: 0.9,
                num_predict: 2000
            }
        }));
        try {
            const responses = await this.streamingClient.executeConcurrent(streamingRequests, this.config.maxConcurrentRequests);
            for (const [id, response] of responses) {
                const originalRequest = requests.find(r => r.id === id);
                if (originalRequest) {
                    try {
                        const analysis = this.parseAnalysisResponse(response, originalRequest.requirements);
                        results.set(id, analysis);
                    }
                    catch (error) {
                        // Fallback to base agent for this specific request
                        const fallbackAnalysis = await this.baseAgent.analyzeRequirements(originalRequest.requirements);
                        results.set(id, fallbackAnalysis);
                    }
                }
            }
        }
        catch (error) {
            this.emit('concurrentError', { error, requests });
            throw error;
        }
        return results;
    }
    /**
     * Process multiple planning requests concurrently
     */
    async planConcurrent(requests) {
        const results = new Map();
        this.metrics.concurrentRequests += requests.length;
        const streamingRequests = requests.map(req => ({
            id: req.id,
            prompt: this.getOptimizedPrompt('planning', { analysis: req.analysis }),
            priority: req.priority || 1,
            options: {
                temperature: 0.3,
                top_p: 0.9,
                num_predict: 3000
            }
        }));
        try {
            const responses = await this.streamingClient.executeConcurrent(streamingRequests, this.config.maxConcurrentRequests);
            for (const [id, response] of responses) {
                const originalRequest = requests.find(r => r.id === id);
                if (originalRequest) {
                    try {
                        const plan = this.parsePlanningResponse(response, originalRequest.analysis);
                        results.set(id, plan);
                    }
                    catch (error) {
                        // Fallback to base agent for this specific request
                        const fallbackPlan = await this.baseAgent.planWorkflow(originalRequest.analysis);
                        results.set(id, fallbackPlan);
                    }
                }
            }
        }
        catch (error) {
            this.emit('concurrentError', { error, requests });
            throw error;
        }
        return results;
    }
    /**
     * Batch multiple requests for efficient processing
     */
    async batchRequests(requests) {
        const results = new Map();
        this.metrics.batchedRequests += requests.length;
        const streamingRequests = requests.map(req => {
            let prompt;
            if (req.type === 'analysis') {
                prompt = this.getOptimizedPrompt('analysis', { requirements: req.data });
            }
            else {
                prompt = this.getOptimizedPrompt('planning', { analysis: req.data });
            }
            return {
                id: req.id,
                prompt,
                options: {
                    temperature: 0.3,
                    top_p: 0.9,
                    num_predict: req.type === 'analysis' ? 2000 : 3000
                }
            };
        });
        try {
            for (const request of streamingRequests) {
                const responsePromise = await this.streamingClient.batchRequest(request);
                const response = await responsePromise;
                const originalRequest = requests.find(r => r.id === request.id);
                if (originalRequest) {
                    if (originalRequest.type === 'analysis') {
                        const analysis = this.parseAnalysisResponse(response, originalRequest.data);
                        results.set(request.id, analysis);
                    }
                    else {
                        const plan = this.parsePlanningResponse(response, originalRequest.data);
                        results.set(request.id, plan);
                    }
                }
            }
        }
        catch (error) {
            this.emit('batchError', { error, requests });
            throw error;
        }
        return results;
    }
    /**
     * Get comprehensive performance metrics
     */
    getOptimizedMetrics() {
        const streamingMetrics = this.streamingClient.getMetrics();
        const baseAgentStats = this.baseAgent.getCacheStats();
        return {
            ...this.metrics,
            streamingClient: streamingMetrics,
            baseAgent: baseAgentStats
        };
    }
    /**
     * Preload optimized prompts for better performance
     */
    async preloadOptimizedPrompts() {
        const commonPrompts = [
            {
                template: 'analysis',
                variables: {
                    requirements: {
                        description: 'Create a simple HTTP API workflow',
                        type: 'api',
                        inputs: [],
                        outputs: [],
                        steps: []
                    }
                }
            },
            {
                template: 'planning',
                variables: {
                    analysis: {
                        workflowType: 'linear',
                        estimatedComplexity: 5,
                        keyComponents: ['HTTP Request', 'Data Processing'],
                        suggestedNodeTypes: ['n8n-nodes-base.httpRequest', 'n8n-nodes-base.set'],
                        dataFlow: 'Linear data flow',
                        potentialChallenges: [],
                        recommendations: []
                    }
                }
            }
        ];
        // Preload prompts into streaming client cache
        await this.baseAgent.preloadCommonPrompts();
        this.emit('promptsPreloaded', { count: commonPrompts.length });
    }
    /**
     * Shutdown and cleanup resources
     */
    async shutdown() {
        await this.streamingClient.shutdown();
        this.baseAgent.clearCache();
        this.emit('shutdown');
    }
    /**
     * Initialize optimized prompt templates
     */
    initializePromptTemplates() {
        this.promptTemplates.set('analysis', `You are an expert n8n workflow designer. Analyze the following requirements and provide a structured analysis.

Requirements:
- Description: {{description}}
- Type: {{type}}
- Inputs: {{inputs}}
- Outputs: {{outputs}}
- Steps: {{steps}}
- Constraints: {{constraints}}

Respond with a JSON object containing:
{
  "workflowType": "linear|parallel|conditional|complex",
  "estimatedComplexity": 1-10,
  "keyComponents": ["component1", "component2"],
  "suggestedNodeTypes": ["node-type-1", "node-type-2"],
  "dataFlow": "description of data flow",
  "potentialChallenges": ["challenge1", "challenge2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Focus on practical n8n implementation.`);
        this.promptTemplates.set('planning', `Based on the analysis, create a detailed workflow plan for n8n.

Analysis:
- Workflow Type: {{workflowType}}
- Complexity: {{estimatedComplexity}}/10
- Key Components: {{keyComponents}}
- Suggested Node Types: {{suggestedNodeTypes}}
- Data Flow: {{dataFlow}}

Available n8n node types:
- Triggers: n8n-nodes-base.start, n8n-nodes-base.webhook, n8n-nodes-base.cron
- HTTP: n8n-nodes-base.httpRequest
- Logic: n8n-nodes-base.code, n8n-nodes-base.function, n8n-nodes-base.if
- Data: n8n-nodes-base.set, n8n-nodes-base.itemLists, n8n-nodes-base.merge
- Files: n8n-nodes-base.readBinaryFile, n8n-nodes-base.writeBinaryFile
- Utilities: n8n-nodes-base.wait, n8n-nodes-base.htmlExtract

Create a JSON response with:
{
  "nodes": [
    {
      "id": "unique-id",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "parameters": {},
      "description": "what this node does"
    }
  ],
  "flow": [
    {
      "from": "node-id-1",
      "to": "node-id-2",
      "type": "main|success|error",
      "condition": "optional condition"
    }
  ],
  "estimatedComplexity": 1-10,
  "rationale": "explanation of design decisions"
}

Keep the workflow practical and implementable.`);
    }
    /**
     * Get optimized prompt with variable substitution
     */
    getOptimizedPrompt(template, variables) {
        const baseTemplate = this.promptTemplates.get(template);
        if (!baseTemplate) {
            throw new Error(`Template '${template}' not found`);
        }
        if (this.config.promptOptimization) {
            this.metrics.promptOptimizations++;
            return this.streamingClient.getOptimizedPrompt(baseTemplate, this.flattenVariables(variables));
        }
        return baseTemplate;
    }
    /**
     * Flatten nested variables for template substitution
     */
    flattenVariables(variables, prefix = '') {
        const flattened = {};
        for (const [key, value] of Object.entries(variables)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, this.flattenVariables(value, newKey));
            }
            else if (Array.isArray(value)) {
                flattened[newKey] = value.join(', ');
            }
            else {
                flattened[newKey] = String(value || '');
            }
        }
        return flattened;
    }
    /**
     * Process streaming analysis response
     */
    async *processAnalysisStream(generator, requirements) {
        let accumulatedResponse = '';
        let partialAnalysis = {};
        try {
            for await (const chunk of generator) {
                accumulatedResponse += chunk.content;
                // Try to parse partial JSON as we receive it
                try {
                    const jsonMatch = accumulatedResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        partialAnalysis = {
                            workflowType: parsed.workflowType,
                            estimatedComplexity: parsed.estimatedComplexity,
                            keyComponents: parsed.keyComponents,
                            suggestedNodeTypes: parsed.suggestedNodeTypes,
                            dataFlow: parsed.dataFlow,
                            potentialChallenges: parsed.potentialChallenges,
                            recommendations: parsed.recommendations
                        };
                        yield partialAnalysis;
                    }
                }
                catch {
                    // Continue accumulating if JSON is incomplete
                }
                if (chunk.done) {
                    break;
                }
            }
            // Return final parsed analysis
            return this.parseAnalysisResponse(accumulatedResponse, requirements);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Process streaming planning response
     */
    async *processPlanningStream(generator, analysis) {
        let accumulatedResponse = '';
        let partialPlan = {};
        try {
            for await (const chunk of generator) {
                accumulatedResponse += chunk.content;
                // Try to parse partial JSON as we receive it
                try {
                    const jsonMatch = accumulatedResponse.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        partialPlan = {
                            nodes: parsed.nodes,
                            flow: parsed.flow,
                            estimatedComplexity: parsed.estimatedComplexity,
                            rationale: parsed.rationale
                        };
                        yield partialPlan;
                    }
                }
                catch {
                    // Continue accumulating if JSON is incomplete
                }
                if (chunk.done) {
                    break;
                }
            }
            // Return final parsed plan
            return this.parsePlanningResponse(accumulatedResponse, analysis);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Create a single-yield generator for fallback scenarios
     */
    async *createSingleYieldGenerator(result) {
        yield result;
        return result;
    }
    /**
     * Parse analysis response (reuse base agent logic)
     */
    parseAnalysisResponse(response, requirements) {
        // Use base agent's parsing logic
        return this.baseAgent.parseAnalysisResponse(response, requirements);
    }
    /**
     * Parse planning response (reuse base agent logic)
     */
    parsePlanningResponse(response, analysis) {
        // Use base agent's parsing logic
        return this.baseAgent.parsePlanningResponse(response, analysis);
    }
    /**
     * Setup event handlers for monitoring
     */
    setupEventHandlers() {
        if (this.config.enableMetrics) {
            this.streamingClient.on('shutdown', () => {
                this.emit('streamingClientShutdown');
            });
        }
    }
    setupFeedbackListener() {
        feedbackBus.subscribe('userIntent', (intent) => {
            console.log('AI Agent received user intent:', intent);
            if (intent.type === 'GENERATE_WORKFLOW_FROM_GUIDE' || intent.type === 'QUICK_ACTION') {
                this.generateWorkflow(intent.payload.description || 'user-initiated action');
            }
        });
    }
}
//# sourceMappingURL=optimized-ai-agent.js.map