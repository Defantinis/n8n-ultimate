/**
 * Community Node Registry System
 * Discovers, catalogs, and manages community-developed n8n nodes from npm packages
 */
import { EventEmitter } from 'events';
import * as fs from 'fs/promises';
import * as path from 'path';
export class CommunityNodeRegistry extends EventEmitter {
    packages = new Map();
    nodes = new Map();
    registryPath;
    cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours
    lastUpdate = null;
    isUpdating = false;
    constructor(registryPath = './community-registry.json') {
        super();
        this.registryPath = registryPath;
    }
    /**
     * Initialize the registry by loading cached data
     */
    async initialize() {
        try {
            await this.loadFromCache();
            this.emit('initialized', { packages: this.packages.size, nodes: this.nodes.size });
        }
        catch (error) {
            console.warn('Failed to load registry cache:', error);
            this.emit('initialized', { packages: 0, nodes: 0 });
        }
    }
    /**
     * Discover community nodes from npm registry
     */
    async discoverNodes(forceRefresh = false) {
        if (this.isUpdating) {
            throw new Error('Registry update already in progress');
        }
        if (!forceRefresh && this.lastUpdate &&
            Date.now() - this.lastUpdate.getTime() < this.cacheTimeout) {
            return;
        }
        this.isUpdating = true;
        this.emit('discoveryStarted');
        try {
            // Search for n8n community nodes using npm search patterns
            const searchQueries = [
                'n8n-nodes-',
                'n8n-community-',
                '@n8n/community-',
                'keywords:n8n-community-node'
            ];
            const discoveredPackages = new Set();
            for (const query of searchQueries) {
                const packages = await this.searchNpmRegistry(query);
                packages.forEach(pkg => discoveredPackages.add(pkg.name));
                // Process packages in batches to avoid overwhelming the npm API
                await this.processBatch(packages);
                // Add delay between searches to respect rate limits
                await this.delay(1000);
            }
            this.lastUpdate = new Date();
            await this.saveToCache();
            this.emit('discoveryCompleted', {
                packagesFound: discoveredPackages.size,
                totalPackages: this.packages.size,
                totalNodes: this.nodes.size
            });
        }
        catch (error) {
            this.emit('discoveryError', error);
            throw error;
        }
        finally {
            this.isUpdating = false;
        }
    }
    /**
     * Search npm registry for packages matching query
     */
    async searchNpmRegistry(query) {
        // Simulate npm search API call
        // In real implementation, this would use npm search API or registry API
        const mockPackages = [
            {
                name: 'n8n-nodes-airtable-advanced',
                version: '1.2.3',
                description: 'Advanced Airtable integration for n8n',
                author: 'community-dev',
                keywords: ['n8n', 'airtable', 'database', 'community'],
                homepage: 'https://github.com/community/n8n-nodes-airtable-advanced',
                repository: 'https://github.com/community/n8n-nodes-airtable-advanced',
                license: 'MIT',
                n8n: {
                    nodes: ['dist/nodes/Airtable/AirtableAdvanced.node.js'],
                    credentials: ['dist/credentials/AirtableAdvancedApi.credentials.js']
                },
                publishedAt: new Date('2024-01-15'),
                lastUpdated: new Date('2024-06-01'),
                downloadCount: 15420,
                popularity: 0.85
            },
            {
                name: 'n8n-nodes-shopify-plus',
                version: '2.1.0',
                description: 'Enhanced Shopify integration with advanced features',
                author: { name: 'ShopifyDev', email: 'dev@shopify.com' },
                keywords: ['n8n', 'shopify', 'ecommerce', 'community'],
                homepage: 'https://github.com/shopify/n8n-nodes-shopify-plus',
                repository: { type: 'git', url: 'https://github.com/shopify/n8n-nodes-shopify-plus' },
                license: 'Apache-2.0',
                n8n: {
                    nodes: [
                        'dist/nodes/Shopify/ShopifyPlus.node.js',
                        'dist/nodes/Shopify/ShopifyWebhook.node.js'
                    ],
                    credentials: ['dist/credentials/ShopifyPlusApi.credentials.js']
                },
                publishedAt: new Date('2024-02-10'),
                lastUpdated: new Date('2024-06-15'),
                downloadCount: 28750,
                popularity: 0.92
            }
        ];
        // Filter packages based on query
        return mockPackages.filter(pkg => pkg.name.includes(query.replace('keywords:', '')) ||
            pkg.keywords.some(keyword => keyword.includes(query.replace('keywords:', ''))));
    }
    /**
     * Process a batch of packages to extract node definitions
     */
    async processBatch(packages) {
        for (const pkg of packages) {
            try {
                // Store package information
                this.packages.set(pkg.name, pkg);
                // Extract node definitions from package
                const nodeDefinitions = await this.extractNodeDefinitions(pkg);
                // Store node definitions
                for (const nodeDef of nodeDefinitions) {
                    this.nodes.set(`${pkg.name}:${nodeDef.name}`, nodeDef);
                }
                this.emit('packageProcessed', {
                    packageName: pkg.name,
                    nodesFound: nodeDefinitions.length
                });
            }
            catch (error) {
                this.emit('packageError', { packageName: pkg.name, error });
                console.warn(`Failed to process package ${pkg.name}:`, error);
            }
        }
    }
    /**
     * Extract node definitions from a package
     */
    async extractNodeDefinitions(pkg) {
        const definitions = [];
        if (!pkg.n8n?.nodes) {
            return definitions;
        }
        // Mock node definition extraction
        // In real implementation, this would download and parse the package
        const mockDefinitions = [
            {
                name: 'AirtableAdvanced',
                displayName: 'Airtable Advanced',
                description: 'Advanced operations for Airtable with batch processing',
                version: pkg.version,
                packageName: pkg.name,
                category: 'Database',
                icon: 'airtable.svg',
                inputs: [
                    { displayName: 'Main', name: 'main', type: 'main', required: true }
                ],
                outputs: [
                    { displayName: 'Main', name: 'main', type: 'main' }
                ],
                properties: [
                    {
                        displayName: 'Resource',
                        name: 'resource',
                        type: 'options',
                        required: true,
                        options: [
                            { name: 'Record', value: 'record' },
                            { name: 'Table', value: 'table' },
                            { name: 'Base', value: 'base' }
                        ]
                    },
                    {
                        displayName: 'Operation',
                        name: 'operation',
                        type: 'options',
                        required: true,
                        options: [
                            { name: 'Create', value: 'create' },
                            { name: 'Read', value: 'read' },
                            { name: 'Update', value: 'update' },
                            { name: 'Delete', value: 'delete' },
                            { name: 'Batch Create', value: 'batchCreate' },
                            { name: 'Batch Update', value: 'batchUpdate' }
                        ]
                    }
                ],
                credentials: ['airtableAdvancedApi'],
                webhooks: false,
                polling: true,
                trigger: false,
                subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
                group: ['transform'],
                codex: {
                    categories: ['Database', 'Productivity'],
                    subcategories: {
                        Database: ['NoSQL', 'Cloud Database'],
                        Productivity: ['Data Management', 'Automation']
                    },
                    resources: {
                        primaryDocumentation: [
                            'https://docs.airtable.com/api',
                            'https://airtable.com/developers/web/guides'
                        ],
                        credentialDocumentation: [
                            'https://airtable.com/developers/web/guides/personal-access-tokens'
                        ]
                    }
                }
            }
        ];
        return mockDefinitions.filter(def => def.packageName === pkg.name);
    }
    /**
     * Search for community nodes
     */
    async searchNodes(options = {}) {
        let results = Array.from(this.nodes.values());
        // Apply filters
        if (options.query) {
            const query = options.query.toLowerCase();
            results = results.filter(node => node.name.toLowerCase().includes(query) ||
                node.displayName.toLowerCase().includes(query) ||
                node.description.toLowerCase().includes(query));
        }
        if (options.category) {
            results = results.filter(node => node.category.toLowerCase() === options.category.toLowerCase());
        }
        if (options.author) {
            results = results.filter(node => {
                const pkg = this.packages.get(node.packageName);
                if (!pkg)
                    return false;
                const author = typeof pkg.author === 'string' ? pkg.author : pkg.author?.name;
                return author?.toLowerCase().includes(options.author.toLowerCase());
            });
        }
        // Apply sorting
        if (options.sortBy) {
            results.sort((a, b) => {
                const pkgA = this.packages.get(a.packageName);
                const pkgB = this.packages.get(b.packageName);
                switch (options.sortBy) {
                    case 'popularity':
                        return (pkgB?.popularity || 0) - (pkgA?.popularity || 0);
                    case 'downloads':
                        return (pkgB?.downloadCount || 0) - (pkgA?.downloadCount || 0);
                    case 'updated':
                        return (pkgB?.lastUpdated.getTime() || 0) - (pkgA?.lastUpdated.getTime() || 0);
                    case 'name':
                        return a.displayName.localeCompare(b.displayName);
                    default:
                        return 0;
                }
            });
        }
        // Apply pagination
        const offset = options.offset || 0;
        const limit = options.limit || results.length;
        return results.slice(offset, offset + limit);
    }
    /**
     * Get package information
     */
    getPackage(packageName) {
        return this.packages.get(packageName);
    }
    /**
     * Get node definition
     */
    getNode(nodeKey) {
        return this.nodes.get(nodeKey);
    }
    /**
     * Get registry statistics
     */
    getStats() {
        const categories = {};
        for (const node of Array.from(this.nodes.values())) {
            categories[node.category] = (categories[node.category] || 0) + 1;
        }
        const packageArray = Array.from(this.packages.values());
        const popularPackages = packageArray
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 10);
        const recentlyUpdated = packageArray
            .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
            .slice(0, 10);
        return {
            totalPackages: this.packages.size,
            totalNodes: this.nodes.size,
            categories,
            lastUpdated: this.lastUpdate || new Date(),
            popularPackages,
            recentlyUpdated
        };
    }
    /**
     * Load registry data from cache
     */
    async loadFromCache() {
        try {
            const data = await fs.readFile(this.registryPath, 'utf-8');
            const cache = JSON.parse(data);
            // Restore packages
            this.packages.clear();
            for (const [key, pkg] of cache.packages) {
                this.packages.set(key, {
                    ...pkg,
                    publishedAt: new Date(pkg.publishedAt),
                    lastUpdated: new Date(pkg.lastUpdated)
                });
            }
            // Restore nodes
            this.nodes.clear();
            for (const [key, node] of cache.nodes) {
                this.nodes.set(key, node);
            }
            this.lastUpdate = cache.lastUpdate ? new Date(cache.lastUpdate) : null;
        }
        catch (error) {
            // Cache file doesn't exist or is corrupted, start fresh
            this.packages.clear();
            this.nodes.clear();
            this.lastUpdate = null;
        }
    }
    /**
     * Save registry data to cache
     */
    async saveToCache() {
        const cache = {
            packages: Array.from(this.packages.entries()),
            nodes: Array.from(this.nodes.entries()),
            lastUpdate: this.lastUpdate?.toISOString()
        };
        const dir = path.dirname(this.registryPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(this.registryPath, JSON.stringify(cache, null, 2));
    }
    /**
     * Utility method to add delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Clear all registry data
     */
    async clear() {
        this.packages.clear();
        this.nodes.clear();
        this.lastUpdate = null;
        try {
            await fs.unlink(this.registryPath);
        }
        catch (error) {
            // File doesn't exist, ignore
        }
        this.emit('cleared');
    }
    /**
     * Get all available categories
     */
    getCategories() {
        const categories = new Set();
        for (const node of Array.from(this.nodes.values())) {
            categories.add(node.category);
        }
        return Array.from(categories).sort();
    }
    /**
     * Validate package compatibility with current n8n version
     */
    async validatePackageCompatibility(packageName, n8nVersion = '1.0.0') {
        const pkg = this.packages.get(packageName);
        if (!pkg) {
            return {
                compatible: false,
                issues: ['Package not found in registry'],
                warnings: []
            };
        }
        const issues = [];
        const warnings = [];
        // Check peer dependencies
        if (pkg.peerDependencies?.n8n) {
            const requiredVersion = pkg.peerDependencies.n8n;
            // Simple version check (in real implementation, use semver)
            if (!this.isVersionCompatible(n8nVersion, requiredVersion)) {
                issues.push(`Requires n8n version ${requiredVersion}, current: ${n8nVersion}`);
            }
        }
        // Check for deprecated features
        if (pkg.lastUpdated < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)) {
            warnings.push('Package has not been updated in over a year');
        }
        return {
            compatible: issues.length === 0,
            issues,
            warnings
        };
    }
    /**
     * Simple version compatibility check
     */
    isVersionCompatible(current, required) {
        // Simplified version check - in real implementation, use semver library
        const currentParts = current.split('.').map(Number);
        const requiredParts = required.replace(/[^\d.]/g, '').split('.').map(Number);
        for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
            const curr = currentParts[i] || 0;
            const req = requiredParts[i] || 0;
            if (curr > req)
                return true;
            if (curr < req)
                return false;
        }
        return true;
    }
}
// Export singleton instance
export const communityNodeRegistry = new CommunityNodeRegistry();
//# sourceMappingURL=community-node-registry.js.map