/**
 * n8n AI/LangChain Integration Patterns
 *
 * This module implements AI and LangChain integration patterns for n8n workflows,
 * providing comprehensive AI capabilities including OpenAI, LangChain, Vector Stores,
 * and AI Agents integration patterns.
 */
import { ConsoleLogger } from './integration-patterns.js';
/**
 * Default AI integration configuration
 */
export const defaultAIIntegrationConfig = {
    n8nBaseUrl: 'http://localhost:5678',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableCaching: true,
    enableMetrics: true,
    logLevel: 'info',
    openaiModel: 'gpt-4',
    openaiTemperature: 0.7,
    openaiMaxTokens: 2048,
    anthropicModel: 'claude-3-sonnet-20240229',
    vectorStoreType: 'chroma',
    aiTimeout: 60000, // 60 seconds for AI operations
    aiRetryAttempts: 2,
    enableAIMetrics: true,
    enableAILogging: true,
    ollamaBaseUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2'
};
/**
 * AI Node Templates
 * Pre-built node templates for common AI operations
 */
export class AINodeTemplatesClass {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger || new ConsoleLogger(config.logLevel);
    }
    /**
     * Create OpenAI Chat node
     */
    createOpenAIChatNode(position = [0, 0]) {
        return {
            id: `openai-${Date.now()}`,
            name: 'OpenAI Chat Model',
            type: 'n8n-nodes-base.openAi',
            typeVersion: 1,
            position,
            parameters: {
                resource: 'chat',
                operation: 'message',
                model: {
                    __rl: true,
                    mode: 'list',
                    value: this.config.openaiModel || 'gpt-4'
                },
                options: {
                    temperature: this.config.openaiTemperature || 0.7,
                    maxTokens: this.config.openaiMaxTokens || 2048,
                    presencePenalty: 0,
                    frequencyPenalty: 0,
                    topP: 1
                }
            },
            credentials: {
                openAiApi: {
                    id: 'openai-credentials',
                    name: 'OpenAI API'
                }
            }
        };
    }
    /**
     * Create LangChain node
     */
    createLangChainNode(position = [0, 0]) {
        return {
            id: `langchain-${Date.now()}`,
            name: 'LangChain',
            type: 'n8n-nodes-langchain.langChain',
            typeVersion: 1,
            position,
            parameters: {
                operation: 'conversationalRetrievalQAChain',
                model: {
                    __rl: true,
                    mode: 'list',
                    value: 'chatOpenAI'
                },
                options: {
                    enableCallbacks: this.config.langchainCallbacks || true,
                    verbose: this.config.enableAILogging || false
                }
            }
        };
    }
    /**
     * Create Vector Store node
     */
    createVectorStoreNode(position = [0, 0]) {
        const storeType = this.config.vectorStoreType || 'chroma';
        return {
            id: `vectorstore-${Date.now()}`,
            name: `Vector Store (${storeType})`,
            type: `n8n-nodes-langchain.vectorStore${storeType.charAt(0).toUpperCase() + storeType.slice(1)}`,
            typeVersion: 1,
            position,
            parameters: {
                operation: 'search',
                options: {
                    ...this.config.vectorStoreConfig,
                    topK: 5,
                    threshold: 0.7
                }
            }
        };
    }
    /**
     * Create AI Agent node
     */
    createAIAgentNode(position = [0, 0]) {
        return {
            id: `aiagent-${Date.now()}`,
            name: 'AI Agent',
            type: 'n8n-nodes-langchain.agent',
            typeVersion: 1,
            position,
            parameters: {
                agentType: 'conversationalRetrievalQAChain',
                model: {
                    __rl: true,
                    mode: 'list',
                    value: 'chatOpenAI'
                },
                memory: {
                    type: 'bufferMemory',
                    options: {
                        maxTokenLimit: 2000,
                        returnMessages: true
                    }
                },
                tools: []
            }
        };
    }
    /**
     * Create Ollama node for local AI
     */
    createOllamaNode(position = [0, 0]) {
        return {
            id: `ollama-${Date.now()}`,
            name: 'Ollama Local AI',
            type: 'n8n-nodes-base.httpRequest',
            typeVersion: 4.1,
            position,
            parameters: {
                method: 'POST',
                url: `${this.config.ollamaBaseUrl}/api/generate`,
                sendHeaders: true,
                headerParameters: {
                    parameters: [
                        {
                            name: 'Content-Type',
                            value: 'application/json'
                        }
                    ]
                },
                sendBody: true,
                bodyParameters: {
                    parameters: [
                        {
                            name: 'model',
                            value: this.config.ollamaModel || 'llama3.2'
                        },
                        {
                            name: 'prompt',
                            value: '={{ $json.prompt }}'
                        },
                        {
                            name: 'stream',
                            value: false
                        }
                    ]
                },
                options: {
                    timeout: this.config.aiTimeout || 60000,
                    retry: {
                        enabled: true,
                        maxAttempts: this.config.aiRetryAttempts || 2
                    }
                }
            }
        };
    }
}
/**
 * AI Workflow Patterns
 * Pre-built workflow patterns for common AI use cases
 */
export class AIWorkflowPatternsClass {
    nodeTemplates;
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger || new ConsoleLogger(config.logLevel);
        this.nodeTemplates = new AINodeTemplatesClass(config, this.logger);
    }
    /**
     * Create RAG (Retrieval-Augmented Generation) workflow
     */
    createRAGWorkflow(name = 'RAG Workflow') {
        const nodes = [];
        // Start trigger
        nodes.push({
            id: 'start',
            name: 'When clicking "Test workflow"',
            type: 'n8n-nodes-base.manualTrigger',
            typeVersion: 1,
            position: [240, 300],
            parameters: {}
        });
        // Vector Store Search
        const vectorStoreNode = this.nodeTemplates.createVectorStoreNode([460, 300]);
        nodes.push(vectorStoreNode);
        // AI Chat with Context
        const aiChatNode = this.nodeTemplates.createOpenAIChatNode([680, 300]);
        aiChatNode.parameters = {
            ...aiChatNode.parameters,
            text: '={{ "Context: " + $json.documents + "\n\nQuestion: " + $json.query + "\n\nAnswer based on the context:" }}'
        };
        nodes.push(aiChatNode);
        return {
            id: `rag-workflow-${Date.now()}`,
            name,
            nodes,
            connections: {
                'Start': {
                    main: [{ node: vectorStoreNode.id, type: 'main', index: 0 }]
                },
                [vectorStoreNode.name]: {
                    main: [{ node: aiChatNode.id, type: 'main', index: 0 }]
                }
            },
            active: false,
            settings: {
                executionOrder: 'v1'
            },
            meta: {
                instanceId: `rag-${Date.now()}`
            }
        };
    }
    /**
     * Create Conversational Agent workflow
     */
    createConversationalAgentWorkflow(name = 'Conversational Agent') {
        const nodes = [];
        // Webhook trigger for continuous conversation
        nodes.push({
            id: 'webhook',
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            typeVersion: 1,
            position: [240, 300],
            webhookId: `agent-webhook-${Date.now()}`,
            parameters: {}
        });
        // AI Agent
        const agentNode = this.nodeTemplates.createAIAgentNode([460, 300]);
        nodes.push(agentNode);
        // Response formatter
        nodes.push({
            id: 'response',
            name: 'Format Response',
            type: 'n8n-nodes-base.set',
            typeVersion: 3.2,
            position: [680, 300],
            parameters: {
                assignments: {
                    assignments: [
                        {
                            id: Date.now().toString(),
                            name: 'response',
                            value: '={{ $json.output }}',
                            type: 'string'
                        },
                        {
                            id: (Date.now() + 1).toString(),
                            name: 'timestamp',
                            value: '={{ new Date().toISOString() }}',
                            type: 'string'
                        }
                    ]
                },
                options: {}
            }
        });
        return {
            id: `agent-workflow-${Date.now()}`,
            name,
            nodes,
            connections: {
                'Start': {
                    main: [{ node: agentNode.id, type: 'main', index: 0 }]
                },
                [agentNode.name]: {}
            },
            active: true,
            settings: {
                executionOrder: 'v1'
            },
            meta: {
                instanceId: `agent-${Date.now()}`
            }
        };
    }
}
/**
 * AI Performance Monitor
 * Tracks AI-specific metrics and performance
 */
export class AIPerformanceMonitorClass {
    metrics = new Map();
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger || new ConsoleLogger(config.logLevel);
    }
    /**
     * Track AI operation metrics
     */
    trackAIOperation(provider, model, tokens, cost, latency, success) {
        const key = `${provider}:${model}`;
        const current = this.metrics.get(key) || {
            calls: 0,
            totalTokens: 0,
            totalCost: 0,
            averageLatency: 0,
            errors: 0,
            tokensPerCall: 0,
            errorRate: 0,
            costPerCall: 0
        };
        current.calls++;
        current.totalTokens += tokens;
        current.totalCost += cost;
        current.averageLatency = (current.averageLatency * (current.calls - 1) + latency) / current.calls;
        if (!success) {
            current.errors++;
        }
        // Update derived metrics
        current.tokensPerCall = current.calls > 0 ? current.totalTokens / current.calls : 0;
        current.errorRate = current.calls > 0 ? current.errors / current.calls : 0;
        current.costPerCall = current.calls > 0 ? current.totalCost / current.calls : 0;
        this.metrics.set(key, current);
        if (this.config.enableAILogging) {
            this.logger.info(`AI Operation: ${key}`, {
                tokens,
                cost,
                latency,
                success
            });
        }
    }
    /**
     * Get AI metrics for a specific provider/model
     */
    getAIMetrics(provider, model) {
        const key = `${provider}:${model}`;
        const metrics = this.metrics.get(key);
        if (!metrics) {
            return {
                calls: 0,
                totalTokens: 0,
                totalCost: 0,
                averageLatency: 0,
                errorRate: 0,
                tokensPerCall: 0,
                costPerCall: 0
            };
        }
        return {
            calls: metrics.calls,
            totalTokens: metrics.totalTokens,
            totalCost: metrics.totalCost,
            averageLatency: metrics.averageLatency,
            errorRate: metrics.errorRate,
            tokensPerCall: metrics.tokensPerCall,
            costPerCall: metrics.costPerCall
        };
    }
    /**
     * Get cost optimization recommendations
     */
    getCostOptimizationRecommendations() {
        const recommendations = [];
        for (const [key, metrics] of this.metrics.entries()) {
            const [provider, model] = key.split(':');
            // High token usage recommendation
            if (metrics.tokensPerCall > 1500) {
                recommendations.push({
                    recommendation: `Consider reducing prompt length or using a more efficient model for ${key}`,
                    potentialSavings: metrics.totalCost * 0.3,
                    priority: 'high'
                });
            }
            // High error rate recommendation
            if (metrics.errorRate > 0.1) {
                recommendations.push({
                    recommendation: `High error rate detected for ${key}. Review prompt engineering and retry logic`,
                    potentialSavings: metrics.totalCost * 0.2,
                    priority: 'high'
                });
            }
            // Cost optimization for expensive models
            if (model.includes('gpt-4') && metrics.calls > 100) {
                recommendations.push({
                    recommendation: `Consider using GPT-3.5-turbo for simpler tasks to reduce costs for ${key}`,
                    potentialSavings: metrics.totalCost * 0.5,
                    priority: 'medium'
                });
            }
        }
        return recommendations.sort((a, b) => b.potentialSavings - a.potentialSavings);
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics.clear();
        this.logger.info('AI metrics reset');
    }
}
/**
 * AI Integration Manager
 * Main orchestration class for AI integrations
 */
export class AIIntegrationManagerClass {
    config;
    nodeTemplates;
    workflowPatterns;
    performanceMonitor;
    logger;
    constructor(config = {}) {
        this.config = { ...defaultAIIntegrationConfig, ...config };
        this.logger = new ConsoleLogger(this.config.logLevel);
        this.nodeTemplates = new AINodeTemplatesClass(this.config, this.logger);
        this.workflowPatterns = new AIWorkflowPatternsClass(this.config, this.logger);
        this.performanceMonitor = new AIPerformanceMonitorClass(this.config, this.logger);
    }
    /**
     * Get AI node templates
     */
    getNodeTemplates() {
        return this.nodeTemplates;
    }
    /**
     * Get workflow patterns
     */
    getWorkflowPatterns() {
        return this.workflowPatterns;
    }
    /**
     * Get performance monitor
     */
    getPerformanceMonitor() {
        return this.performanceMonitor;
    }
    /**
     * Validate AI workflow configuration
     */
    async validateAIWorkflow(workflow) {
        const errors = [];
        const warnings = [];
        const recommendations = [];
        let aiCompatibilityScore = 100;
        // Check for AI nodes
        const aiNodes = workflow.nodes.filter(node => node.type.includes('openAi') ||
            node.type.includes('langchain') ||
            node.type.includes('vectorStore') ||
            node.name.toLowerCase().includes('ai') ||
            node.name.toLowerCase().includes('ollama'));
        if (aiNodes.length === 0) {
            warnings.push('No AI nodes detected in workflow');
            aiCompatibilityScore -= 20;
        }
        // Validate AI node configurations
        for (const node of aiNodes) {
            if (!node.credentials || Object.keys(node.credentials).length === 0) {
                errors.push(`AI node ${node.name} is missing credentials`);
                aiCompatibilityScore -= 15;
            }
            if (!node.parameters || Object.keys(node.parameters).length === 0) {
                warnings.push(`AI node ${node.name} has no parameters configured`);
                aiCompatibilityScore -= 10;
            }
            // Check for timeout configuration
            if (!node.parameters?.options?.timeout) {
                recommendations.push(`Consider adding timeout configuration to AI node ${node.name}`);
                aiCompatibilityScore -= 5;
            }
        }
        // Check for error handling patterns
        const errorHandlingNodes = workflow.nodes.filter(node => node.type.includes('if') ||
            node.type.includes('switch') ||
            node.type.includes('error'));
        if (aiNodes.length > 0 && errorHandlingNodes.length === 0) {
            recommendations.push('Consider adding error handling for AI operations');
            aiCompatibilityScore -= 10;
        }
        // Check for rate limiting considerations
        if (aiNodes.length > 3) {
            recommendations.push('Multiple AI nodes detected - consider implementing rate limiting');
            aiCompatibilityScore -= 5;
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            aiCompatibilityScore: Math.max(0, aiCompatibilityScore),
            recommendations
        };
    }
    /**
     * Create optimized AI workflow
     */
    async createOptimizedAIWorkflow(type, name, options = {}) {
        let workflow;
        switch (type) {
            case 'rag':
                workflow = this.workflowPatterns.createRAGWorkflow(name);
                break;
            case 'agent':
                workflow = this.workflowPatterns.createConversationalAgentWorkflow(name);
                break;
            default:
                throw new Error(`Unsupported workflow type: ${type}`);
        }
        // Add optimizations based on options
        if (options.includeErrorHandling) {
            workflow = this.addErrorHandlingToWorkflow(workflow);
        }
        if (options.includeMetrics) {
            workflow = this.addMetricsToWorkflow(workflow);
        }
        if (options.includeRateLimiting) {
            workflow = this.addRateLimitingToWorkflow(workflow);
        }
        return workflow;
    }
    /**
     * Add error handling to workflow
     */
    addErrorHandlingToWorkflow(workflow) {
        // Add error handling nodes - simplified implementation
        const errorHandlerNode = {
            id: `error-handler-${Date.now()}`,
            name: 'Error Handler',
            type: 'n8n-nodes-base.if',
            typeVersion: 2,
            position: [900, 400],
            parameters: {
                conditions: {
                    boolean: [],
                    dateTime: [],
                    number: [],
                    string: [
                        {
                            id: Date.now().toString(),
                            operation: 'contains',
                            value1: '={{ $json.error }}',
                            value2: 'error'
                        }
                    ]
                },
                combineOperation: 'any'
            }
        };
        workflow.nodes.push(errorHandlerNode);
        return workflow;
    }
    /**
     * Add metrics collection to workflow
     */
    addMetricsToWorkflow(workflow) {
        // Add metrics collection node - simplified implementation
        const metricsNode = {
            id: `metrics-${Date.now()}`,
            name: 'Collect Metrics',
            type: 'n8n-nodes-base.function',
            typeVersion: 1,
            position: [900, 300],
            parameters: {
                functionCode: `
          const startTime = items[0].json.startTime || Date.now();
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          return [{
            json: {
              ...items[0].json,
              metrics: {
                duration,
                timestamp: new Date().toISOString(),
                workflowId: '${workflow.id}'
              }
            }
          }];
        `
            }
        };
        workflow.nodes.push(metricsNode);
        return workflow;
    }
    /**
     * Add rate limiting to workflow
     */
    addRateLimitingToWorkflow(workflow) {
        // Add rate limiting node - simplified implementation
        const rateLimitNode = {
            id: `rate-limit-${Date.now()}`,
            name: 'Rate Limiter',
            type: 'n8n-nodes-base.wait',
            typeVersion: 1,
            position: [120, 300],
            parameters: {
                amount: 1,
                unit: 'seconds'
            }
        };
        workflow.nodes.unshift(rateLimitNode);
        return workflow;
    }
}
/**
 * Utility functions for AI integration
 */
export const AIUtils = {
    /**
     * Calculate estimated cost for AI operation
     */
    calculateEstimatedCost(provider, model, inputTokens, outputTokens) {
        const pricing = {
            'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
            'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
            'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
            'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 }
        };
        const modelPricing = pricing[model];
        if (!modelPricing) {
            return 0; // Unknown model
        }
        return (inputTokens / 1000) * modelPricing.input + (outputTokens / 1000) * modelPricing.output;
    },
    /**
     * Estimate tokens in text
     */
    estimateTokens(text) {
        // Rough estimation: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    },
    /**
     * Create quick RAG workflow
     */
    createQuickRAGWorkflow: (manager, name) => {
        return manager.createOptimizedAIWorkflow('rag', name, {
            includeErrorHandling: true,
            includeMetrics: true
        });
    },
    /**
     * Create quick agent workflow
     */
    createQuickAgentWorkflow: (manager, name) => {
        return manager.createOptimizedAIWorkflow('agent', name, {
            includeErrorHandling: true,
            includeMetrics: true,
            includeRateLimiting: true
        });
    }
};
//# sourceMappingURL=ai-integration-patterns.js.map