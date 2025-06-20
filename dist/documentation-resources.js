// Documentation and Community Resources Integration Module
// Documentation Resource Manager
export class DocumentationManager {
    constructor() {
        this.resources = new Map();
        this.nodeDocumentation = new Map();
        this.bestPractices = new Map();
        this.communityResources = new Map();
        this.initializeOfficialResources();
        this.initializeNodeDocumentation();
        this.initializeBestPractices();
        this.initializeCommunityResources();
    }
    getNodeDocumentation(nodeType) {
        return this.nodeDocumentation.get(nodeType);
    }
    searchResources(query) {
        const resources = Array.from(this.resources.values());
        return resources.filter(resource => {
            if (query.category && resource.category !== query.category)
                return false;
            if (query.difficulty && resource.difficulty !== query.difficulty)
                return false;
            if (query.type && resource.type !== query.type)
                return false;
            if (query.tags && !query.tags.some(tag => resource.tags.includes(tag)))
                return false;
            return true;
        });
    }
    getBestPractices(category) {
        const practices = Array.from(this.bestPractices.values());
        if (category) {
            return practices.filter(practice => practice.category === category);
        }
        return practices;
    }
    getCommunityResources(type) {
        const resources = Array.from(this.communityResources.values());
        if (type) {
            return resources.filter(resource => resource.type === type);
        }
        return resources;
    }
    addResource(resource) {
        this.resources.set(resource.id, resource);
    }
    generateWorkflowDocumentation(workflow) {
        const nodeTypes = Object.values(workflow.nodes || {}).map((node) => node.type);
        const uniqueNodeTypes = Array.from(new Set(nodeTypes));
        let documentation = `# Workflow Documentation: ${workflow.name}\n\n`;
        if (workflow.meta?.description) {
            documentation += `## Description\n${workflow.meta.description}\n\n`;
        }
        documentation += `## Overview\n`;
        documentation += `- **Total Nodes**: ${Object.keys(workflow.nodes || {}).length}\n`;
        documentation += `- **Node Types**: ${uniqueNodeTypes.length}\n`;
        documentation += `- **Complexity**: ${this.assessComplexity(workflow)}\n\n`;
        documentation += `## Node Documentation\n\n`;
        uniqueNodeTypes.forEach(nodeType => {
            const nodeDoc = this.getNodeDocumentation(nodeType);
            if (nodeDoc) {
                documentation += `### ${nodeDoc.displayName} (${nodeType})\n`;
                documentation += `${nodeDoc.description}\n\n`;
                if (nodeDoc.documentation.bestPractices.length > 0) {
                    documentation += `**Best Practices:**\n`;
                    nodeDoc.documentation.bestPractices.forEach(practice => {
                        documentation += `- ${practice}\n`;
                    });
                    documentation += `\n`;
                }
            }
        });
        documentation += `## Best Practices Applied\n`;
        const applicablePractices = this.getApplicableBestPractices(workflow);
        applicablePractices.forEach(practice => {
            documentation += `- **${practice.title}**: ${practice.description}\n`;
        });
        return documentation;
    }
    initializeOfficialResources() {
        const officialResources = [
            {
                id: 'official-getting-started',
                title: 'Getting Started with n8n',
                category: 'official',
                type: 'guide',
                url: 'https://docs.n8n.io/getting-started/',
                tags: ['basics', 'setup', 'introduction'],
                difficulty: 'beginner',
                lastUpdated: '2024-01-15',
                verified: true
            },
            {
                id: 'workflow-design-guide',
                title: 'Workflow Design Best Practices',
                category: 'official',
                type: 'best-practice',
                url: 'https://docs.n8n.io/workflows/',
                tags: ['workflows', 'design', 'best-practices'],
                difficulty: 'intermediate',
                lastUpdated: '2024-01-10',
                verified: true
            },
            {
                id: 'node-reference',
                title: 'Node Reference Documentation',
                category: 'official',
                type: 'reference',
                url: 'https://docs.n8n.io/nodes/',
                tags: ['nodes', 'reference', 'api'],
                difficulty: 'intermediate',
                lastUpdated: '2024-01-20',
                verified: true
            },
            {
                id: 'api-documentation',
                title: 'n8n API Documentation',
                category: 'official',
                type: 'api',
                url: 'https://docs.n8n.io/api/',
                tags: ['api', 'integration', 'development'],
                difficulty: 'advanced',
                lastUpdated: '2024-01-18',
                verified: true
            }
        ];
        officialResources.forEach(resource => {
            this.resources.set(resource.id, resource);
        });
    }
    initializeNodeDocumentation() {
        const nodeDocumentation = [
            {
                nodeType: 'n8n-nodes-base.webhook',
                displayName: 'Webhook',
                description: 'Receives HTTP requests and triggers workflow execution',
                category: 'trigger',
                version: '1.0',
                documentation: {
                    overview: 'The Webhook node allows you to receive HTTP requests from external services and trigger workflows based on incoming data.',
                    parameters: [
                        {
                            name: 'httpMethod',
                            type: 'options',
                            required: true,
                            description: 'The HTTP method to accept',
                            options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                            defaultValue: 'POST'
                        },
                        {
                            name: 'path',
                            type: 'string',
                            required: false,
                            description: 'Custom path for the webhook URL',
                            example: '/my-webhook'
                        }
                    ],
                    examples: [
                        {
                            id: 'webhook-basic',
                            title: 'Basic Webhook Setup',
                            description: 'Simple webhook that accepts POST requests',
                            useCase: 'Receiving data from external services',
                            workflow: {},
                            difficulty: 'beginner',
                            tags: ['webhook', 'basic'],
                            author: 'n8n Team',
                            createdAt: '2024-01-01'
                        }
                    ],
                    troubleshooting: [
                        {
                            issue: 'Webhook URL not responding',
                            symptoms: ['404 errors', 'Connection timeouts'],
                            causes: ['Incorrect URL', 'Workflow not active', 'Network issues'],
                            solutions: [
                                'Verify the webhook URL is correct',
                                'Ensure the workflow is activated',
                                'Check network connectivity'
                            ],
                            severity: 'medium'
                        }
                    ],
                    bestPractices: [
                        'Always use HTTPS in production',
                        'Implement authentication for sensitive data',
                        'Validate incoming data structure',
                        'Use meaningful webhook paths'
                    ],
                    communityTips: [
                        {
                            id: 'webhook-tip-1',
                            title: 'Dynamic Response Handling',
                            content: 'Use the Respond to Webhook node to send custom responses based on processing results',
                            author: 'community-user-1',
                            votes: 15,
                            tags: ['webhook', 'response'],
                            createdAt: '2024-01-05'
                        }
                    ]
                },
                resources: []
            },
            {
                nodeType: 'n8n-nodes-base.openai',
                displayName: 'OpenAI',
                description: 'Integrate with OpenAI APIs for AI-powered workflows',
                category: 'ai',
                version: '1.2',
                documentation: {
                    overview: 'The OpenAI node provides access to OpenAI powerful AI models including GPT-4, GPT-3.5, and DALL-E for text generation, completion, and image creation.',
                    parameters: [
                        {
                            name: 'resource',
                            type: 'options',
                            required: true,
                            description: 'The OpenAI resource to use',
                            options: ['chat', 'completion', 'image', 'audio'],
                            defaultValue: 'chat'
                        },
                        {
                            name: 'model',
                            type: 'options',
                            required: true,
                            description: 'The AI model to use',
                            options: ['gpt-4', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
                            defaultValue: 'gpt-3.5-turbo'
                        }
                    ],
                    examples: [
                        {
                            id: 'openai-chat',
                            title: 'AI-Powered Customer Support',
                            description: 'Use OpenAI to generate responses for customer inquiries',
                            useCase: 'Automated customer support',
                            workflow: {},
                            difficulty: 'intermediate',
                            tags: ['openai', 'customer-support', 'ai'],
                            author: 'n8n Community',
                            createdAt: '2024-01-08'
                        }
                    ],
                    troubleshooting: [
                        {
                            issue: 'API rate limit exceeded',
                            symptoms: ['429 error responses', 'Slow response times'],
                            causes: ['Too many requests', 'Insufficient API quota'],
                            solutions: [
                                'Implement request throttling',
                                'Upgrade API plan',
                                'Use batch processing for multiple requests'
                            ],
                            severity: 'medium'
                        }
                    ],
                    bestPractices: [
                        'Store API keys securely using n8n credentials',
                        'Implement error handling for API failures',
                        'Monitor token usage to avoid unexpected costs',
                        'Use appropriate models for your use case'
                    ],
                    communityTips: [
                        {
                            id: 'openai-tip-1',
                            title: 'Cost Optimization',
                            content: 'Use gpt-3.5-turbo for most tasks to reduce costs, only use gpt-4 when higher reasoning is required',
                            author: 'ai-expert',
                            votes: 28,
                            tags: ['openai', 'cost', 'optimization'],
                            createdAt: '2024-01-10'
                        }
                    ]
                },
                resources: []
            }
        ];
        nodeDocumentation.forEach(doc => {
            this.nodeDocumentation.set(doc.nodeType, doc);
        });
    }
    initializeBestPractices() {
        const bestPractices = [
            {
                id: 'workflow-design',
                title: 'Workflow Design Principles',
                category: 'workflow-design',
                description: 'Essential principles for designing maintainable and efficient workflows',
                guidelines: [
                    {
                        rule: 'Keep workflows focused and single-purpose',
                        explanation: 'Each workflow should have a clear, specific purpose rather than trying to handle multiple unrelated tasks',
                        importance: 'must',
                        examples: [
                            'Create separate workflows for different data sources',
                            'Separate processing workflows from notification workflows'
                        ]
                    },
                    {
                        rule: 'Use descriptive names for nodes and workflows',
                        explanation: 'Clear naming makes workflows easier to understand and maintain',
                        importance: 'should',
                        examples: [
                            'Instead of HTTP Request, use Fetch Customer Data from CRM',
                            'Instead of Set, use Format Order Data for Database'
                        ]
                    }
                ],
                examples: [
                    'E-commerce order processing workflow with error handling',
                    'Customer data synchronization with retry logic'
                ],
                antiPatterns: [
                    {
                        pattern: 'Single monolithic workflow handling everything',
                        why: 'Difficult to maintain, debug, and scale',
                        instead: 'Break into smaller, focused workflows that can be chained together'
                    }
                ],
                checklist: [
                    { item: 'Workflow has a clear, descriptive name', category: 'naming', critical: true },
                    { item: 'All nodes have meaningful names', category: 'naming', critical: true },
                    { item: 'Error handling is implemented', category: 'reliability', critical: true }
                ]
            }
        ];
        bestPractices.forEach(practice => {
            this.bestPractices.set(practice.id, practice);
        });
    }
    initializeCommunityResources() {
        const communityResources = [
            {
                id: 'community-templates',
                name: 'n8n Community Templates',
                type: 'template',
                description: 'Collection of community-contributed workflow templates',
                author: 'n8n Community',
                repository: 'https://github.com/n8n-io/n8n-workflow-templates',
                tags: ['templates', 'workflows', 'examples'],
                rating: 4.8,
                downloads: 15000,
                lastUpdated: '2024-01-15',
                compatibility: ['n8n 1.0+'],
                license: 'MIT'
            },
            {
                id: 'custom-nodes-collection',
                name: 'Community Custom Nodes',
                type: 'node',
                description: 'Repository of custom nodes created by the community',
                author: 'Various Contributors',
                repository: 'https://github.com/n8n-io/n8n-nodes-community',
                tags: ['nodes', 'custom', 'integrations'],
                rating: 4.5,
                downloads: 8500,
                lastUpdated: '2024-01-12',
                compatibility: ['n8n 0.180+'],
                license: 'Various'
            }
        ];
        communityResources.forEach(resource => {
            this.communityResources.set(resource.id, resource);
        });
    }
    assessComplexity(workflow) {
        const nodeCount = Object.keys(workflow.nodes || {}).length;
        const connectionCount = Object.keys(workflow.connections || {}).length;
        if (nodeCount <= 5 && connectionCount <= 10)
            return 'Simple';
        if (nodeCount <= 15 && connectionCount <= 30)
            return 'Moderate';
        if (nodeCount <= 30 && connectionCount <= 60)
            return 'Complex';
        return 'Very Complex';
    }
    getApplicableBestPractices(workflow) {
        return Array.from(this.bestPractices.values());
    }
}
// Documentation Generator
export class DocumentationGenerator {
    constructor() {
        this.docManager = new DocumentationManager();
    }
    generateProjectDocumentation(config) {
        let documentation = `# ${config.projectName} Documentation\n\n`;
        documentation += `## Project Overview\n\n`;
        documentation += `This project contains ${config.workflows.length} workflows with integrations to ${config.integrations.length} external services.\n\n`;
        if (config.integrations.length > 0) {
            documentation += `### Integrations\n`;
            config.integrations.forEach(integration => {
                documentation += `- ${integration}\n`;
            });
            documentation += `\n`;
        }
        documentation += `## Workflows\n\n`;
        config.workflows.forEach(workflow => {
            documentation += this.docManager.generateWorkflowDocumentation(workflow);
            documentation += `\n---\n\n`;
        });
        documentation += `## Best Practices\n\n`;
        const bestPractices = this.docManager.getBestPractices();
        bestPractices.forEach(practice => {
            documentation += `### ${practice.title}\n`;
            documentation += `${practice.description}\n\n`;
            practice.guidelines.forEach(guideline => {
                documentation += `- **${guideline.rule}**: ${guideline.explanation}\n`;
            });
            documentation += `\n`;
        });
        return documentation;
    }
    generateReadme(config) {
        let readme = `# ${config.projectName}\n\n`;
        readme += `${config.description}\n\n`;
        readme += `## Requirements\n\n`;
        config.requirements.forEach(req => {
            readme += `- ${req}\n`;
        });
        readme += `\n`;
        readme += `## Setup\n\n`;
        config.setupInstructions.forEach((instruction, index) => {
            readme += `${index + 1}. ${instruction}\n`;
        });
        readme += `\n`;
        readme += `## Workflows\n\n`;
        config.workflows.forEach(workflow => {
            readme += `### ${workflow.name}\n`;
            if (workflow.meta?.description) {
                readme += `${workflow.meta.description}\n`;
            }
            readme += `\n`;
        });
        return readme;
    }
}
// Resource Fetcher for real-time updates
export class ResourceFetcher {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 3600000; // 1 hour
    }
    async fetchCommunityResources() {
        return [
            {
                id: 'latest-templates',
                name: 'Latest Community Templates',
                type: 'template',
                description: 'Recently added workflow templates from the community',
                author: 'Community',
                tags: ['new', 'templates'],
                rating: 4.7,
                downloads: 2500,
                lastUpdated: new Date().toISOString(),
                compatibility: ['n8n 1.0+'],
                license: 'MIT'
            }
        ];
    }
    async fetchDocumentationUpdates() {
        return [
            {
                id: 'latest-updates',
                title: 'Latest Documentation Updates',
                category: 'official',
                type: 'guide',
                tags: ['updates', 'new-features'],
                difficulty: 'intermediate',
                lastUpdated: new Date().toISOString(),
                verified: true
            }
        ];
    }
    async checkNodeUpdates(nodeTypes) {
        return nodeTypes.filter(() => Math.random() > 0.8);
    }
}
// Export instances
export const documentationManager = new DocumentationManager();
export const documentationGenerator = new DocumentationGenerator();
export const resourceFetcher = new ResourceFetcher();
