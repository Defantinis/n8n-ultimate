/**
 * Dynamic Node Definition Parser
 * Dynamically loads and analyzes community node definitions with comprehensive parsing capabilities
 */
import { EventEmitter } from 'events';
export class DynamicNodeParser extends EventEmitter {
    parserVersion = '1.0.0';
    supportedNodeVersions = ['1.0.0', '1.1.0', '1.2.0', '2.0.0'];
    parsingCache = new Map();
    cacheTimeout = 60 * 60 * 1000; // 1 hour
    constructor() {
        super();
    }
    /**
     * Parse a community node definition into a standardized format
     */
    async parseNodeDefinition(nodeDefinition, packageInfo, options = {}) {
        const startTime = Date.now();
        const cacheKey = `${packageInfo.name}:${nodeDefinition.name}:${nodeDefinition.version}`;
        try {
            // Check cache first
            if (this.parsingCache.has(cacheKey)) {
                const cached = this.parsingCache.get(cacheKey);
                return {
                    success: true,
                    node: cached,
                    errors: [],
                    warnings: [],
                    metadata: {
                        parseTime: Date.now() - startTime,
                        nodeVersion: nodeDefinition.version,
                        parserVersion: this.parserVersion,
                        featuresDetected: this.detectFeatures(cached),
                        compatibilityLevel: 'full',
                        recommendedUpdates: []
                    }
                };
            }
            this.emit('parsingStarted', { nodeKey: cacheKey });
            // Parse the node definition
            const parsedNode = await this.performParsing(nodeDefinition, packageInfo, options);
            // Cache the result
            this.parsingCache.set(cacheKey, parsedNode);
            // Set cache expiration
            setTimeout(() => {
                this.parsingCache.delete(cacheKey);
            }, this.cacheTimeout);
            const metadata = {
                parseTime: Date.now() - startTime,
                nodeVersion: nodeDefinition.version,
                parserVersion: this.parserVersion,
                featuresDetected: this.detectFeatures(parsedNode),
                compatibilityLevel: this.assessCompatibility(parsedNode),
                recommendedUpdates: this.generateRecommendations(parsedNode)
            };
            this.emit('parsingCompleted', { nodeKey: cacheKey, metadata });
            return {
                success: true,
                node: parsedNode,
                errors: [],
                warnings: [],
                metadata
            };
        }
        catch (error) {
            this.emit('parsingError', { nodeKey: cacheKey, error });
            return {
                success: false,
                errors: [error.message],
                warnings: [],
                metadata: {
                    parseTime: Date.now() - startTime,
                    nodeVersion: nodeDefinition.version,
                    parserVersion: this.parserVersion,
                    featuresDetected: [],
                    compatibilityLevel: 'limited',
                    recommendedUpdates: []
                }
            };
        }
    }
    /**
     * Perform the actual parsing of node definition
     */
    async performParsing(nodeDefinition, packageInfo, options) {
        // Parse properties with enhanced type information
        const parsedProperties = this.parseProperties(nodeDefinition.properties || []);
        // Generate input/output schemas
        const inputSchema = this.generateInputSchema(parsedProperties);
        const outputSchema = this.generateOutputSchema(nodeDefinition);
        // Generate connection rules
        const connectionRules = options.generateConnectionRules !== false
            ? this.generateConnectionRules(nodeDefinition)
            : [];
        // Generate validation rules
        const validationRules = options.generateValidationRules !== false
            ? this.generateValidationRules(parsedProperties)
            : [];
        // Parse execution context
        const executionContext = options.parseExecutionContext !== false
            ? this.parseExecutionContext(nodeDefinition, packageInfo)
            : this.getDefaultExecutionContext();
        // Parse resource and operation definitions
        const resourceDefinitions = this.parseResourceDefinitions(parsedProperties);
        const operationDefinitions = this.parseOperationDefinitions(parsedProperties);
        // Parse credential requirements
        const credentialRequirements = options.includeCredentials !== false
            ? this.parseCredentialRequirements(nodeDefinition)
            : [];
        // Parse webhook configuration
        const webhookConfiguration = options.includeWebhooks !== false && nodeDefinition.webhooks
            ? this.parseWebhookConfiguration(nodeDefinition)
            : undefined;
        // Parse polling configuration
        const pollingConfiguration = options.includePolling !== false && nodeDefinition.polling
            ? this.parsePollingConfiguration(nodeDefinition)
            : undefined;
        // Parse trigger configuration
        const triggerConfiguration = options.includeTriggers !== false && nodeDefinition.trigger
            ? this.parseTriggerConfiguration(nodeDefinition)
            : undefined;
        return {
            ...nodeDefinition,
            parsedProperties,
            inputSchema,
            outputSchema,
            connectionRules,
            validationRules,
            executionContext,
            resourceDefinitions,
            operationDefinitions,
            credentialRequirements,
            webhookConfiguration,
            pollingConfiguration,
            triggerConfiguration
        };
    }
    /**
     * Parse node properties with enhanced type information
     */
    parseProperties(properties) {
        return properties.map(prop => {
            const parsedProp = {
                displayName: prop.displayName || prop.name,
                name: prop.name,
                type: this.normalizePropertyType(prop.type),
                required: prop.required || false,
                default: prop.default,
                options: prop.options || [],
                description: prop.description,
                placeholder: prop.placeholder,
                typeOptions: prop.typeOptions || {},
                displayOptions: prop.displayOptions,
                extractOnFail: prop.extractOnFail,
                routing: prop.routing,
                loadOptions: prop.loadOptions
            };
            // Enhanced type-specific parsing
            if (parsedProp.type === 'options' || parsedProp.type === 'multiOptions') {
                parsedProp.options = this.parsePropertyOptions(prop.options || []);
            }
            if (parsedProp.type === 'collection' || parsedProp.type === 'fixedCollection') {
                parsedProp.typeOptions = {
                    ...parsedProp.typeOptions,
                    multipleValues: prop.typeOptions?.multipleValues || false,
                    multipleValueButtonText: prop.typeOptions?.multipleValueButtonText
                };
            }
            return parsedProp;
        });
    }
    /**
     * Normalize property types to standard format
     */
    normalizePropertyType(type) {
        const typeMap = {
            'string': 'string',
            'number': 'number',
            'boolean': 'boolean',
            'options': 'options',
            'multiOptions': 'multiOptions',
            'collection': 'collection',
            'fixedCollection': 'fixedCollection',
            'json': 'json',
            'dateTime': 'dateTime',
            'color': 'color',
            'hidden': 'hidden',
            'notice': 'notice',
            'resourceLocator': 'resourceLocator',
            'credentialsSelect': 'credentialsSelect',
            'loadOptions': 'loadOptions',
            'resourceMapper': 'resourceMapper'
        };
        return typeMap[type] || 'string';
    }
    /**
     * Parse property options with enhanced information
     */
    parsePropertyOptions(options) {
        return options.map(option => ({
            name: option.name,
            value: option.value,
            description: option.description,
            action: option.action,
            routing: option.routing
        }));
    }
    /**
     * Generate input schema from parsed properties
     */
    generateInputSchema(properties) {
        const schemaProperties = {};
        const required = [];
        for (const prop of properties) {
            if (prop.type !== 'hidden' && prop.type !== 'notice') {
                schemaProperties[prop.name] = this.propertyToSchema(prop);
                if (prop.required) {
                    required.push(prop.name);
                }
            }
        }
        return {
            type: 'object',
            properties: schemaProperties,
            required: required.length > 0 ? required : undefined,
            additionalProperties: false
        };
    }
    /**
     * Convert parsed property to schema property
     */
    propertyToSchema(prop) {
        const schemaProperty = {
            type: 'string',
            description: prop.description
        };
        switch (prop.type) {
            case 'string':
                schemaProperty.type = 'string';
                break;
            case 'number':
                schemaProperty.type = 'number';
                break;
            case 'boolean':
                schemaProperty.type = 'boolean';
                break;
            case 'options':
                schemaProperty.type = 'string';
                if (prop.options && prop.options.length > 0) {
                    schemaProperty.enum = prop.options.map(opt => opt.value);
                }
                break;
            case 'multiOptions':
                schemaProperty.type = 'array';
                schemaProperty.items = {
                    type: 'string'
                };
                if (prop.options && prop.options.length > 0) {
                    schemaProperty.items.enum = prop.options.map(opt => opt.value);
                }
                break;
            case 'json':
                schemaProperty.type = 'object';
                schemaProperty.additionalProperties = true;
                break;
            case 'dateTime':
                schemaProperty.type = 'string';
                schemaProperty.format = 'date-time';
                break;
            default:
                schemaProperty.type = 'string';
        }
        return schemaProperty;
    }
    /**
     * Generate output schema based on node definition
     */
    generateOutputSchema(nodeDefinition) {
        // Basic output schema - in real implementation, this would be more sophisticated
        return {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    json: {
                        type: 'object',
                        additionalProperties: true,
                        description: 'The JSON data returned by the node'
                    },
                    binary: {
                        type: 'object',
                        additionalProperties: true,
                        description: 'Binary data returned by the node'
                    }
                },
                additionalProperties: false
            }
        };
    }
    /**
     * Generate connection rules from node definition
     */
    generateConnectionRules(nodeDefinition) {
        const rules = [];
        // Input connections
        for (const input of nodeDefinition.inputs) {
            rules.push({
                type: 'input',
                name: input.name,
                displayName: input.displayName,
                required: input.required || false,
                maxConnections: 1,
                dataTypes: [input.type],
                description: `Input connection for ${input.displayName}`
            });
        }
        // Output connections
        for (const output of nodeDefinition.outputs) {
            rules.push({
                type: 'output',
                name: output.name,
                displayName: output.displayName,
                required: false,
                dataTypes: [output.type],
                description: `Output connection for ${output.displayName}`
            });
        }
        return rules;
    }
    /**
     * Generate validation rules from parsed properties
     */
    generateValidationRules(properties) {
        const rules = [];
        for (const prop of properties) {
            // Required field validation
            if (prop.required) {
                rules.push({
                    type: 'required',
                    property: prop.name,
                    message: `${prop.displayName} is required`
                });
            }
            // Type-specific validations
            if (prop.type === 'number' && prop.typeOptions) {
                if (prop.typeOptions.minValue !== undefined) {
                    rules.push({
                        type: 'range',
                        property: prop.name,
                        message: `${prop.displayName} must be at least ${prop.typeOptions.minValue}`,
                        condition: { min: prop.typeOptions.minValue }
                    });
                }
                if (prop.typeOptions.maxValue !== undefined) {
                    rules.push({
                        type: 'range',
                        property: prop.name,
                        message: `${prop.displayName} must be at most ${prop.typeOptions.maxValue}`,
                        condition: { max: prop.typeOptions.maxValue }
                    });
                }
            }
            // Format validations
            if (prop.type === 'string' && prop.typeOptions?.password) {
                rules.push({
                    type: 'format',
                    property: prop.name,
                    message: `${prop.displayName} must be a secure password`
                });
            }
        }
        return rules;
    }
    /**
     * Parse execution context from node and package information
     */
    parseExecutionContext(nodeDefinition, packageInfo) {
        return {
            supportsStreaming: this.detectStreamingSupport(nodeDefinition),
            supportsBatching: this.detectBatchingSupport(nodeDefinition),
            maxBatchSize: this.calculateMaxBatchSize(nodeDefinition),
            timeout: this.calculateTimeout(nodeDefinition),
            retryPolicy: this.generateRetryPolicy(nodeDefinition),
            rateLimiting: this.generateRateLimiting(nodeDefinition),
            memoryUsage: this.generateMemoryConfig(nodeDefinition)
        };
    }
    /**
     * Get default execution context
     */
    getDefaultExecutionContext() {
        return {
            supportsStreaming: false,
            supportsBatching: false,
            timeout: 30000, // 30 seconds
            retryPolicy: {
                maxAttempts: 3,
                backoffStrategy: 'exponential',
                baseDelay: 1000,
                maxDelay: 10000,
                retryConditions: ['NETWORK_ERROR', 'TIMEOUT', 'RATE_LIMIT']
            },
            rateLimiting: {
                requestsPerSecond: 10,
                burstAllowed: 5
            },
            memoryUsage: {
                maxMemoryMB: 256,
                streamingThresholdMB: 50
            }
        };
    }
    /**
     * Parse resource definitions from properties
     */
    parseResourceDefinitions(properties) {
        const resourceProp = properties.find(p => p.name === 'resource');
        if (!resourceProp || !resourceProp.options) {
            return [];
        }
        return resourceProp.options.map(option => ({
            name: option.value,
            displayName: option.name,
            description: option.description || `Operations for ${option.name}`,
            operations: this.extractOperationsForResource(properties, option.value),
            properties: this.extractPropertiesForResource(properties, option.value)
        }));
    }
    /**
     * Parse operation definitions from properties
     */
    parseOperationDefinitions(properties) {
        const operationProp = properties.find(p => p.name === 'operation');
        if (!operationProp || !operationProp.options) {
            return [];
        }
        return operationProp.options.map(option => ({
            name: option.value,
            displayName: option.name,
            description: option.description || `${option.name} operation`,
            routing: this.extractRoutingForOperation(option),
            requestDefaults: this.extractRequestDefaults(option),
            outputParsing: this.extractOutputParsing(option)
        }));
    }
    /**
     * Parse credential requirements
     */
    parseCredentialRequirements(nodeDefinition) {
        if (!nodeDefinition.credentials) {
            return [];
        }
        return nodeDefinition.credentials.map(credName => ({
            name: credName,
            displayName: this.formatCredentialName(credName),
            type: this.inferCredentialType(credName),
            required: true,
            properties: this.generateCredentialProperties(credName)
        }));
    }
    /**
     * Parse webhook configuration
     */
    parseWebhookConfiguration(nodeDefinition) {
        return {
            path: `/${nodeDefinition.name.toLowerCase()}`,
            httpMethod: ['GET', 'POST'],
            responseMode: 'onReceived',
            responseData: 'firstEntryJson'
        };
    }
    /**
     * Parse polling configuration
     */
    parsePollingConfiguration(nodeDefinition) {
        return {
            interval: 60000, // 1 minute default
            pollResponse: {
                mode: 'getAllItemsOnce'
            }
        };
    }
    /**
     * Parse trigger configuration
     */
    parseTriggerConfiguration(nodeDefinition) {
        return {
            activationMode: 'init',
            pollResponse: {
                mode: 'define'
            }
        };
    }
    // Helper methods for feature detection and analysis
    detectFeatures(node) {
        const features = [];
        if (node.webhookConfiguration)
            features.push('webhooks');
        if (node.pollingConfiguration)
            features.push('polling');
        if (node.triggerConfiguration)
            features.push('triggers');
        if (node.credentialRequirements.length > 0)
            features.push('authentication');
        if (node.executionContext.supportsBatching)
            features.push('batching');
        if (node.executionContext.supportsStreaming)
            features.push('streaming');
        if (node.resourceDefinitions.length > 0)
            features.push('resources');
        if (node.operationDefinitions.length > 0)
            features.push('operations');
        return features;
    }
    assessCompatibility(node) {
        const features = this.detectFeatures(node);
        if (features.length >= 5)
            return 'full';
        if (features.length >= 2)
            return 'partial';
        return 'limited';
    }
    generateRecommendations(node) {
        const recommendations = [];
        if (!node.webhookConfiguration && node.category === 'Trigger') {
            recommendations.push('Consider adding webhook support for real-time triggers');
        }
        if (!node.executionContext.retryPolicy) {
            recommendations.push('Add retry policy for better error handling');
        }
        if (node.credentialRequirements.length === 0 && node.category !== 'Core') {
            recommendations.push('Consider adding authentication support');
        }
        return recommendations;
    }
    // Additional helper methods (simplified implementations)
    detectStreamingSupport(nodeDefinition) {
        return nodeDefinition.properties?.some(p => p.name?.includes('stream')) || false;
    }
    detectBatchingSupport(nodeDefinition) {
        return nodeDefinition.properties?.some(p => p.name?.includes('batch')) || false;
    }
    calculateMaxBatchSize(nodeDefinition) {
        return 100; // Default batch size
    }
    calculateTimeout(nodeDefinition) {
        return 30000; // 30 seconds default
    }
    generateRetryPolicy(nodeDefinition) {
        return {
            maxAttempts: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
            retryConditions: ['NETWORK_ERROR', 'TIMEOUT']
        };
    }
    generateRateLimiting(nodeDefinition) {
        return {
            requestsPerSecond: 10,
            burstAllowed: 5
        };
    }
    generateMemoryConfig(nodeDefinition) {
        return {
            maxMemoryMB: 256,
            streamingThresholdMB: 50
        };
    }
    extractOperationsForResource(properties, resource) {
        const operationProp = properties.find(p => p.name === 'operation');
        return operationProp?.options?.map(opt => opt.value) || [];
    }
    extractPropertiesForResource(properties, resource) {
        return properties
            .filter(p => p.displayOptions?.show?.resource?.includes(resource))
            .map(p => p.name);
    }
    extractRoutingForOperation(option) {
        if (option.routing && option.routing.request) {
            return option.routing;
        }
        return {
            request: {
                method: 'GET',
                url: '/api/endpoint'
            }
        };
    }
    extractRequestDefaults(option) {
        return {
            headers: { 'Accept': 'application/json' }
        };
    }
    extractOutputParsing(option) {
        return {
            responseFormat: 'json'
        };
    }
    formatCredentialName(credName) {
        return credName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    inferCredentialType(credName) {
        if (credName.toLowerCase().includes('api'))
            return 'api';
        if (credName.toLowerCase().includes('oauth'))
            return 'oauth2';
        return 'generic';
    }
    generateCredentialProperties(credName) {
        const baseProperties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                required: true,
                secret: true
            }
        ];
        if (credName.toLowerCase().includes('oauth')) {
            baseProperties.push({
                displayName: 'Client ID',
                name: 'clientId',
                type: 'string',
                required: true,
                secret: false
            }, {
                displayName: 'Client Secret',
                name: 'clientSecret',
                type: 'string',
                required: true,
                secret: true
            });
        }
        return baseProperties;
    }
    /**
     * Clear parsing cache
     */
    clearCache() {
        this.parsingCache.clear();
        this.emit('cacheCleared');
    }
    /**
     * Get cache statistics
     */
    getCacheStats() {
        return {
            size: this.parsingCache.size,
            keys: Array.from(this.parsingCache.keys())
        };
    }
}
// Export singleton instance
export const dynamicNodeParser = new DynamicNodeParser();
//# sourceMappingURL=dynamic-node-parser.js.map