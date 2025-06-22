/**
 * Community Node Integration API
 * Main interface for integrating community nodes into the workflow generation system
 * Provides installation management, version compatibility, and runtime integration
 */
import { EventEmitter } from 'events';
import { CommunityNodeRegistry } from './community-node-registry';
import { DynamicNodeParser } from './dynamic-node-parser';
import { CommunityNodeValidator } from './community-node-validator';
/**
 * Main implementation of the Community Node Integration API
 */
export class CommunityNodeIntegrationManager extends EventEmitter {
    registry;
    parser;
    validator;
    installedNodes = new Map();
    integrationCache = new Map();
    cacheTimeout = 60 * 60 * 1000; // 1 hour
    constructor() {
        super();
        this.registry = new CommunityNodeRegistry();
        this.parser = new DynamicNodeParser();
        this.validator = new CommunityNodeValidator();
        this.initializeEventHandlers();
    }
    /**
     * Initialize event handlers for component communication
     */
    initializeEventHandlers() {
        this.registry.on('discoveryCompleted', (data) => {
            this.emit('registryUpdated', data);
        });
        this.parser.on('parsingCompleted', (data) => {
            this.emit('nodeParsingCompleted', data);
        });
        this.validator.on('validationCompleted', (data) => {
            this.emit('nodeValidationCompleted', data);
        });
    }
    /**
     * Initialize the integration manager
     */
    async initialize() {
        try {
            await this.registry.initialize();
            await this.loadInstalledNodes();
            this.emit('initialized', {
                registryNodes: this.registry.getStats().totalNodes,
                installedNodes: this.installedNodes.size
            });
        }
        catch (error) {
            this.emit('initializationError', error);
            throw error;
        }
    }
    /**
     * Discover available community nodes
     */
    async discoverAvailableNodes(options = {}) {
        try {
            await this.registry.discoverNodes();
            const searchOptions = {
                sortBy: (options.sortBy === 'relevance' ? 'popularity' : options.sortBy) || 'popularity',
                limit: options.limit || 50
            };
            const nodes = await this.registry.searchNodes(searchOptions);
            const packages = nodes.map(node => this.registry.getPackage(node.packageName))
                .filter(pkg => pkg !== undefined);
            // Apply additional filtering
            let filteredPackages = packages;
            if (options.categories?.length) {
                filteredPackages = filteredPackages.filter(pkg => options.categories.some(cat => pkg.keywords.includes(cat)));
            }
            if (options.keywords?.length) {
                filteredPackages = filteredPackages.filter(pkg => options.keywords.some(keyword => pkg.keywords.some(pkgKeyword => pkgKeyword.toLowerCase().includes(keyword.toLowerCase()))));
            }
            if (options.minPopularity) {
                filteredPackages = filteredPackages.filter(pkg => (pkg.popularity || 0) >= options.minPopularity);
            }
            if (options.maxAge) {
                const maxDate = new Date();
                maxDate.setDate(maxDate.getDate() - options.maxAge);
                filteredPackages = filteredPackages.filter(pkg => pkg.lastUpdated >= maxDate);
            }
            this.emit('nodesDiscovered', {
                total: packages.length,
                filtered: filteredPackages.length,
                options
            });
            return filteredPackages.slice(0, options.limit || 50);
        }
        catch (error) {
            this.emit('discoveryError', error);
            throw error;
        }
    }
    /**
     * Search for specific nodes
     */
    async searchNodes(query, options = {}) {
        try {
            const searchOptions = {
                query: options.exactMatch ? `"${query}"` : query,
                sortBy: (options.sortBy === 'relevance' ? 'popularity' : options.sortBy) || 'popularity',
                limit: options.limit || 20
            };
            let results = await this.registry.searchNodes(searchOptions);
            // Apply additional filtering
            if (options.categories?.length) {
                results = results.filter(node => options.categories.includes(node.category));
            }
            if (!options.includeDescription) {
                // Search only in names and display names
                results = results.filter(node => node.name.toLowerCase().includes(query.toLowerCase()) ||
                    node.displayName.toLowerCase().includes(query.toLowerCase()));
            }
            this.emit('searchCompleted', {
                query,
                results: results.length,
                options
            });
            return results;
        }
        catch (error) {
            this.emit('searchError', { query, error });
            throw error;
        }
    }
    /**
     * Get detailed information about a specific node
     */
    async getNodeDetails(nodeId) {
        try {
            const node = this.registry.getNode(nodeId);
            if (!node) {
                return null;
            }
            const pkg = this.registry.getPackage(node.packageName);
            if (!pkg) {
                return null;
            }
            // Parse the node definition
            const parsingResult = await this.parser.parseNodeDefinition(node, pkg);
            if (!parsingResult.success || !parsingResult.node) {
                throw new Error(`Failed to parse node definition: ${parsingResult.errors.join(', ')}`);
            }
            // Validate the node
            const validationResult = await this.validator.validateCommunityNode(node, pkg);
            // Determine installation status
            const installedInfo = this.installedNodes.get(pkg.name);
            let installationStatus = 'not-installed';
            if (installedInfo) {
                if (installedInfo.version === pkg.version) {
                    installationStatus = 'installed';
                }
                else if (this.isVersionNewer(pkg.version, installedInfo.version)) {
                    installationStatus = 'outdated';
                }
                else {
                    installationStatus = 'incompatible';
                }
            }
            // Generate usage examples and documentation
            const usageExamples = this.generateUsageExamples(parsingResult.node);
            const documentation = this.generateDocumentation(pkg, node);
            const dependencies = this.analyzeDependencies(pkg);
            const details = {
                package: pkg,
                definition: node,
                parsedDefinition: parsingResult.node,
                validationResult,
                installationStatus,
                dependencies,
                usageExamples,
                documentation
            };
            this.emit('nodeDetailsRetrieved', { nodeId, status: installationStatus });
            return details;
        }
        catch (error) {
            this.emit('nodeDetailsError', { nodeId, error });
            throw error;
        }
    }
    /**
     * Install a community node
     */
    async installNode(packageName, options = {}) {
        const startTime = Date.now();
        try {
            this.emit('installationStarted', { packageName, options });
            // Get package information
            const pkg = this.registry.getPackage(packageName);
            if (!pkg) {
                throw new Error(`Package ${packageName} not found in registry`);
            }
            // Check if already installed
            const existing = this.installedNodes.get(packageName);
            if (existing && !options.force) {
                if (existing.version === (options.version || pkg.version)) {
                    return {
                        success: true,
                        packageName,
                        version: existing.version,
                        installPath: '',
                        dependencies: existing.dependencies,
                        warnings: ['Package already installed'],
                        errors: [],
                        installationTime: Date.now() - startTime
                    };
                }
            }
            // Validate node before installation
            let validationResult;
            if (!options.skipValidation) {
                const nodes = await this.registry.searchNodes({ query: packageName });
                const node = nodes.find(n => n.packageName === packageName);
                if (node) {
                    validationResult = await this.validator.validateCommunityNode(node, pkg, {
                        strictMode: true,
                        includeSecurityValidation: true
                    });
                    if (!validationResult.isValid && validationResult.errors.some(e => e.severity === 'critical')) {
                        throw new Error(`Node validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
                    }
                }
            }
            // Simulate installation process
            const installPath = `/usr/local/lib/node_modules/${packageName}`;
            const dependencies = Object.keys(pkg.dependencies || {});
            // Install dependencies if requested
            if (options.installDependencies && dependencies.length > 0) {
                // Simulate dependency installation
                await this.delay(2000);
            }
            // Simulate main installation
            await this.delay(3000);
            // Update installed nodes registry
            const installedInfo = {
                packageName,
                version: options.version || pkg.version,
                installDate: new Date(),
                usageCount: 0,
                status: 'active',
                size: 1024 * 1024, // 1MB default
                dependencies
            };
            this.installedNodes.set(packageName, installedInfo);
            await this.saveInstalledNodes();
            const result = {
                success: true,
                packageName,
                version: installedInfo.version,
                installPath,
                dependencies,
                validationResult,
                warnings: [],
                errors: [],
                installationTime: Date.now() - startTime
            };
            this.emit('installationCompleted', result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                packageName,
                version: options.version || 'unknown',
                installPath: '',
                dependencies: [],
                warnings: [],
                errors: [error.message],
                installationTime: Date.now() - startTime
            };
            this.emit('installationError', { packageName, error, result });
            return result;
        }
    }
    /**
     * Uninstall a community node
     */
    async uninstallNode(packageName) {
        try {
            this.emit('uninstallationStarted', { packageName });
            const installed = this.installedNodes.get(packageName);
            if (!installed) {
                return {
                    success: false,
                    packageName,
                    removedFiles: [],
                    errors: ['Package not installed']
                };
            }
            // Simulate uninstallation
            await this.delay(1000);
            // Remove from installed registry
            this.installedNodes.delete(packageName);
            await this.saveInstalledNodes();
            const result = {
                success: true,
                packageName,
                removedFiles: [`/usr/local/lib/node_modules/${packageName}`],
                errors: []
            };
            this.emit('uninstallationCompleted', result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                packageName,
                removedFiles: [],
                errors: [error.message]
            };
            this.emit('uninstallationError', { packageName, error });
            return result;
        }
    }
    /**
     * Update an installed node
     */
    async updateNode(packageName, targetVersion) {
        try {
            this.emit('updateStarted', { packageName, targetVersion });
            const installed = this.installedNodes.get(packageName);
            if (!installed) {
                throw new Error('Package not installed');
            }
            const pkg = this.registry.getPackage(packageName);
            if (!pkg) {
                throw new Error('Package not found in registry');
            }
            const newVersion = targetVersion || pkg.version;
            const fromVersion = installed.version;
            if (fromVersion === newVersion) {
                return {
                    success: true,
                    packageName,
                    fromVersion,
                    toVersion: newVersion,
                    changes: [],
                    migrationRequired: false,
                    warnings: ['Already at target version'],
                    errors: []
                };
            }
            // Simulate update process
            await this.delay(2000);
            // Generate version changes
            const changes = [
                {
                    type: 'modified',
                    component: 'core',
                    description: `Updated from ${fromVersion} to ${newVersion}`,
                    impact: 'feature',
                    migrationRequired: false
                }
            ];
            // Update installed info
            installed.version = newVersion;
            this.installedNodes.set(packageName, installed);
            await this.saveInstalledNodes();
            const result = {
                success: true,
                packageName,
                fromVersion,
                toVersion: newVersion,
                changes,
                migrationRequired: false,
                warnings: [],
                errors: []
            };
            this.emit('updateCompleted', result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                packageName,
                fromVersion: 'unknown',
                toVersion: targetVersion || 'unknown',
                changes: [],
                migrationRequired: false,
                warnings: [],
                errors: [error.message]
            };
            this.emit('updateError', { packageName, error });
            return result;
        }
    }
    /**
     * List all installed nodes
     */
    async listInstalledNodes() {
        return Array.from(this.installedNodes.values());
    }
    /**
     * Validate a specific node
     */
    async validateNode(nodeId, options = {}) {
        try {
            const node = this.registry.getNode(nodeId);
            if (!node) {
                throw new Error(`Node ${nodeId} not found`);
            }
            const pkg = this.registry.getPackage(node.packageName);
            if (!pkg) {
                throw new Error(`Package ${node.packageName} not found`);
            }
            const result = await this.validator.validateCommunityNode(node, pkg, options);
            this.emit('nodeValidated', { nodeId, score: result.score, grade: result.grade });
            return result;
        }
        catch (error) {
            this.emit('validationError', { nodeId, error });
            throw error;
        }
    }
    /**
     * Check compatibility of a node with specific n8n version
     */
    async checkCompatibility(nodeId, n8nVersion = '1.0.0') {
        try {
            const validationResult = await this.validateNode(nodeId, {
                n8nVersion,
                includeCompatibilityValidation: true
            });
            const result = {
                compatible: validationResult.compatibility.compatible,
                compatibilityLevel: validationResult.compatibility.compatibilityLevel,
                n8nVersion,
                nodeVersion: validationResult.metadata.nodeVersion,
                issues: validationResult.compatibility.versionConflicts.map(conflict => ({
                    type: 'version',
                    severity: conflict.severity,
                    description: `${conflict.component}: required ${conflict.required}, available ${conflict.available}`,
                    affectedFeatures: [conflict.component],
                    resolution: conflict.resolution
                })),
                recommendations: validationResult.recommendations.map(r => r.description),
                migrationRequired: !!validationResult.compatibility.migrationPath,
                estimatedMigrationEffort: validationResult.compatibility.migrationPath?.complexity || 'low'
            };
            this.emit('compatibilityChecked', { nodeId, result });
            return result;
        }
        catch (error) {
            this.emit('compatibilityError', { nodeId, error });
            throw error;
        }
    }
    /**
     * Integrate a node into a workflow context
     */
    async integrateNode(nodeId, workflowContext) {
        try {
            this.emit('integrationStarted', { nodeId, workflowContext });
            const cacheKey = `${nodeId}:${workflowContext.workflowId}`;
            const cached = this.integrationCache.get(cacheKey);
            if (cached) {
                this.emit('integrationCacheHit', { nodeId, workflowContext });
                return cached;
            }
            const nodeDetails = await this.getNodeDetails(nodeId);
            if (!nodeDetails) {
                throw new Error(`Node ${nodeId} not found`);
            }
            // Check if node is installed
            if (nodeDetails.installationStatus === 'not-installed') {
                throw new Error(`Node ${nodeId} is not installed`);
            }
            // Validate compatibility with workflow context
            const compatibilityResult = await this.checkCompatibility(nodeId, workflowContext.n8nVersion);
            if (!compatibilityResult.compatible) {
                throw new Error(`Node ${nodeId} is not compatible with n8n version ${workflowContext.n8nVersion}`);
            }
            // Generate node configuration
            const requirements = {
                functionality: workflowContext.requirements,
                inputTypes: workflowContext.dataTypes,
                outputTypes: workflowContext.dataTypes
            };
            const configuration = await this.generateNodeConfiguration(nodeId, requirements);
            // Generate connection mappings
            const connectionMappings = this.generateConnectionMappings(nodeDetails.parsedDefinition, workflowContext);
            const result = {
                success: true,
                nodeId,
                integrationPath: `/integrations/${nodeId}`,
                configuration,
                connectionMappings,
                validationResults: nodeDetails.validationResult,
                warnings: [],
                errors: []
            };
            // Cache the result
            this.integrationCache.set(cacheKey, result);
            setTimeout(() => {
                this.integrationCache.delete(cacheKey);
            }, this.cacheTimeout);
            this.emit('integrationCompleted', result);
            return result;
        }
        catch (error) {
            const result = {
                success: false,
                nodeId,
                integrationPath: '',
                configuration: {},
                connectionMappings: [],
                validationResults: {},
                warnings: [],
                errors: [error.message]
            };
            this.emit('integrationError', { nodeId, error, result });
            return result;
        }
    }
    /**
     * Generate node configuration based on requirements
     */
    async generateNodeConfiguration(nodeId, requirements) {
        try {
            const nodeDetails = await this.getNodeDetails(nodeId);
            if (!nodeDetails) {
                throw new Error(`Node ${nodeId} not found`);
            }
            const parsedNode = nodeDetails.parsedDefinition;
            // Generate property configurations
            const properties = {};
            for (const prop of parsedNode.properties || []) {
                if (prop.required) {
                    properties[prop.name] = prop.default || this.generateDefaultValue(prop.type);
                }
            }
            // Generate credential configurations
            const credentials = (parsedNode.credentialRequirements || []).map(cred => ({
                type: cred.type,
                name: cred.name,
                required: cred.required,
                configuration: {}
            }));
            // Generate connection configurations
            const connections = [];
            if (parsedNode.inputSchema && parsedNode.outputSchema) {
                connections.push({
                    input: 'main',
                    output: 'main',
                    type: 'main',
                    mapping: {
                        fields: [],
                        transformations: []
                    }
                });
            }
            // Generate settings based on requirements
            const settings = {
                retryOnFailure: true,
                maxRetries: 3,
                timeout: requirements.performanceRequirements?.maxExecutionTime || 30000,
                continueOnFail: false,
                alwaysOutputData: false
            };
            // Generate environment configuration
            const environment = {
                variables: {},
                secrets: credentials.map(c => c.name),
                networkAccess: {
                    allowedHosts: [],
                    blockedHosts: [],
                    allowInternet: true
                }
            };
            const configuration = {
                nodeId,
                properties,
                credentials,
                connections,
                settings,
                environment
            };
            this.emit('configurationGenerated', { nodeId, configuration });
            return configuration;
        }
        catch (error) {
            this.emit('configurationError', { nodeId, error });
            throw error;
        }
    }
    /**
     * Suggest nodes for a workflow based on description
     */
    async suggestNodesForWorkflow(workflowDescription) {
        try {
            this.emit('suggestionStarted', { workflowDescription });
            // Simple keyword-based matching (in real implementation, this would use AI/ML)
            const keywords = this.extractKeywords(workflowDescription);
            const suggestions = [];
            for (const keyword of keywords) {
                const nodes = await this.searchNodes(keyword, { limit: 5 });
                for (const node of nodes) {
                    const relevanceScore = this.calculateRelevanceScore(node, keywords);
                    if (relevanceScore > 0.3) { // Threshold for relevance
                        suggestions.push({
                            nodeId: node.name,
                            packageName: node.packageName,
                            relevanceScore,
                            matchedRequirements: [keyword],
                            benefits: [`Handles ${keyword} operations`],
                            limitations: [],
                            alternatives: [],
                            estimatedImplementationTime: 30 // minutes
                        });
                    }
                }
            }
            // Sort by relevance score and remove duplicates
            const uniqueSuggestions = suggestions
                .filter((suggestion, index, self) => index === self.findIndex(s => s.nodeId === suggestion.nodeId))
                .sort((a, b) => b.relevanceScore - a.relevanceScore)
                .slice(0, 10);
            this.emit('suggestionsGenerated', {
                workflowDescription,
                suggestions: uniqueSuggestions.length
            });
            return uniqueSuggestions;
        }
        catch (error) {
            this.emit('suggestionError', { workflowDescription, error });
            throw error;
        }
    }
    /**
     * Generate a complete workflow with community nodes
     */
    async generateWorkflowWithCommunityNodes(requirements) {
        try {
            this.emit('workflowGenerationStarted', { requirements });
            // Suggest nodes based on requirements
            const suggestions = await this.suggestNodesForWorkflow(requirements.description);
            // Select best nodes based on preferences
            const selectedNodes = this.selectOptimalNodes(suggestions, requirements.preferences);
            // Generate workflow structure
            const nodes = [];
            const connections = [];
            let nodeCounter = 0;
            // Add start node
            nodes.push({
                id: 'start',
                type: 'n8n-nodes-base.start',
                position: { x: 100, y: 200 },
                parameters: {},
                isCommunityNode: false
            });
            // Add community nodes
            for (let i = 0; i < selectedNodes.length; i++) {
                const suggestion = selectedNodes[i];
                nodeCounter++;
                const nodeId = `node_${nodeCounter}`;
                nodes.push({
                    id: nodeId,
                    type: suggestion.nodeId,
                    packageName: suggestion.packageName,
                    position: { x: 300 + (i * 200), y: 200 },
                    parameters: {},
                    isCommunityNode: true
                });
                // Connect to previous node
                const previousNodeId = i === 0 ? 'start' : `node_${nodeCounter - 1}`;
                connections.push({
                    source: previousNodeId,
                    sourceOutput: 'main',
                    target: nodeId,
                    targetInput: 'main',
                    type: 'main'
                });
            }
            // Validate the generated workflow
            const validation = await this.validateGeneratedWorkflow(nodes, connections);
            const workflow = {
                id: `workflow_${Date.now()}`,
                name: `Generated Workflow: ${requirements.description.substring(0, 50)}...`,
                description: requirements.description,
                nodes,
                connections,
                settings: {
                    timezone: 'UTC',
                    saveDataErrorExecution: 'all',
                    saveDataSuccessExecution: 'all',
                    saveManualExecutions: true,
                    callerPolicy: 'workflowsFromSameOwner'
                },
                metadata: {
                    createdAt: new Date(),
                    createdBy: 'community-integration-api',
                    version: '1.0.0',
                    tags: ['generated', 'community-nodes'],
                    communityNodesUsed: selectedNodes.map(s => s.packageName),
                    estimatedExecutionTime: selectedNodes.reduce((sum, s) => sum + s.estimatedImplementationTime, 0),
                    complexity: selectedNodes.length > 5 ? 'high' : selectedNodes.length > 2 ? 'medium' : 'low'
                },
                validation
            };
            this.emit('workflowGenerated', { workflow });
            return workflow;
        }
        catch (error) {
            this.emit('workflowGenerationError', { requirements, error });
            throw error;
        }
    }
    // Helper methods
    async loadInstalledNodes() {
        // Simulate loading from persistent storage
        // In real implementation, this would read from a database or file system
    }
    async saveInstalledNodes() {
        // Simulate saving to persistent storage
    }
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    isVersionNewer(newVersion, currentVersion) {
        // Simple version comparison (in real implementation, use semver)
        return newVersion > currentVersion;
    }
    generateUsageExamples(parsedNode) {
        // Generate basic usage examples based on node properties
        return [
            {
                title: 'Basic Usage',
                description: `Basic example of using ${parsedNode.displayName}`,
                configuration: {},
                inputData: { test: 'data' },
                expectedOutput: { result: 'processed' }
            }
        ];
    }
    generateDocumentation(pkg, node) {
        return {
            readme: pkg.description || 'No description available',
            changelog: 'No changelog available',
            apiReference: 'No API reference available',
            examples: [],
            troubleshooting: 'No troubleshooting guide available',
            links: pkg.homepage ? [
                {
                    title: 'Homepage',
                    url: pkg.homepage,
                    type: 'documentation'
                }
            ] : []
        };
    }
    analyzeDependencies(pkg) {
        const dependencies = [];
        if (pkg.dependencies) {
            for (const [name, version] of Object.entries(pkg.dependencies)) {
                dependencies.push({
                    name,
                    version,
                    type: 'runtime',
                    installed: true, // Simplified
                    compatible: true,
                    issues: []
                });
            }
        }
        return dependencies;
    }
    generateConnectionMappings(parsedNode, workflowContext) {
        // Generate basic connection mappings
        return [
            {
                sourceNode: 'previous',
                sourceOutput: 'main',
                targetNode: parsedNode.name,
                targetInput: 'main',
                dataType: 'json'
            }
        ];
    }
    generateDefaultValue(type) {
        switch (type) {
            case 'string': return '';
            case 'number': return 0;
            case 'boolean': return false;
            case 'options': return null;
            default: return null;
        }
    }
    extractKeywords(description) {
        // Simple keyword extraction (in real implementation, use NLP)
        const words = description.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['the', 'and', 'with', 'from', 'that', 'this'].includes(word));
        return Array.from(new Set(words)).slice(0, 10);
    }
    calculateRelevanceScore(node, keywords) {
        let score = 0;
        const nodeText = `${node.name} ${node.displayName} ${node.description}`.toLowerCase();
        for (const keyword of keywords) {
            if (nodeText.includes(keyword)) {
                score += 0.2;
            }
        }
        return Math.min(score, 1.0);
    }
    selectOptimalNodes(suggestions, preferences) {
        let selected = suggestions.slice(0, preferences.maxCommunityNodes || 5);
        if (preferences.performanceOverFeatures) {
            selected = selected.filter(s => s.estimatedImplementationTime <= 60);
        }
        if (!preferences.allowBetaNodes) {
            // Filter out beta nodes (simplified check)
            selected = selected.filter(s => !s.packageName.includes('beta'));
        }
        return selected;
    }
    async validateGeneratedWorkflow(nodes, connections) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        const communityNodeValidations = {};
        // Validate community nodes
        for (const node of nodes.filter(n => n.isCommunityNode)) {
            try {
                const validation = await this.validateNode(node.type);
                communityNodeValidations[node.id] = validation;
                if (!validation.isValid) {
                    errors.push(`Node ${node.id} validation failed`);
                }
            }
            catch (error) {
                errors.push(`Failed to validate node ${node.id}: ${error.message}`);
            }
        }
        // Basic workflow structure validation
        if (nodes.length === 0) {
            errors.push('Workflow must contain at least one node');
        }
        if (connections.length < nodes.length - 1) {
            warnings.push('Some nodes may not be connected');
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            communityNodeValidations
        };
    }
    /**
     * Clear all caches
     */
    clearCaches() {
        this.integrationCache.clear();
        this.validator.clearCache();
        this.emit('cachesCleared');
    }
    /**
     * Get integration statistics
     */
    getStats() {
        return {
            installedNodes: this.installedNodes.size,
            cachedIntegrations: this.integrationCache.size,
            registryNodes: this.registry.getStats().totalNodes
        };
    }
}
//# sourceMappingURL=community-node-integration-api.js.map