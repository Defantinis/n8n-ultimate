/**
 * Community Node Registry System
 * Discovers, catalogs, and manages community-developed n8n nodes from npm packages
 */
import { EventEmitter } from 'events';
export interface CommunityNodePackage {
    name: string;
    version: string;
    description?: string;
    author?: string | {
        name: string;
        email?: string;
    };
    keywords: string[];
    homepage?: string;
    repository?: string | {
        type: string;
        url: string;
    };
    license?: string;
    main?: string;
    n8n?: {
        nodes?: string[];
        credentials?: string[];
    };
    dependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    publishedAt: Date;
    lastUpdated: Date;
    downloadCount?: number;
    popularity?: number;
}
export interface CommunityNodeDefinition {
    name: string;
    displayName: string;
    description: string;
    version: string;
    packageName: string;
    category: string;
    icon?: string;
    inputs: NodeInputDefinition[];
    outputs: NodeOutputDefinition[];
    properties: NodePropertyDefinition[];
    credentials?: string[];
    webhooks?: boolean;
    polling?: boolean;
    trigger?: boolean;
    subtitle?: string;
    group?: string[];
    codex?: {
        categories: string[];
        subcategories: Record<string, string[]>;
        resources: {
            primaryDocumentation: string[];
            credentialDocumentation: string[];
        };
    };
}
export interface NodeInputDefinition {
    displayName: string;
    name: string;
    type: string;
    required?: boolean;
    default?: any;
}
export interface NodeOutputDefinition {
    displayName: string;
    name: string;
    type: string;
}
export interface NodePropertyDefinition {
    displayName: string;
    name: string;
    type: string;
    required?: boolean;
    default?: any;
    options?: Array<{
        name: string;
        value: any;
    }>;
    description?: string;
    placeholder?: string;
    typeOptions?: Record<string, any>;
}
export interface RegistrySearchOptions {
    query?: string;
    category?: string;
    author?: string;
    minDownloads?: number;
    maxAge?: number;
    sortBy?: 'popularity' | 'downloads' | 'updated' | 'name';
    limit?: number;
    offset?: number;
}
export interface RegistryStats {
    totalPackages: number;
    totalNodes: number;
    categories: Record<string, number>;
    lastUpdated: Date;
    popularPackages: CommunityNodePackage[];
    recentlyUpdated: CommunityNodePackage[];
}
export declare class CommunityNodeRegistry extends EventEmitter {
    private packages;
    private nodes;
    private registryPath;
    private cacheTimeout;
    private lastUpdate;
    private isUpdating;
    constructor(registryPath?: string);
    /**
     * Initialize the registry by loading cached data
     */
    initialize(): Promise<void>;
    /**
     * Discover community nodes from npm registry
     */
    discoverNodes(forceRefresh?: boolean): Promise<void>;
    /**
     * Search npm registry for packages matching query
     */
    private searchNpmRegistry;
    /**
     * Process a batch of packages to extract node definitions
     */
    private processBatch;
    /**
     * Extract node definitions from a package
     */
    private extractNodeDefinitions;
    /**
     * Search for community nodes
     */
    searchNodes(options?: RegistrySearchOptions): Promise<CommunityNodeDefinition[]>;
    /**
     * Get package information
     */
    getPackage(packageName: string): CommunityNodePackage | undefined;
    /**
     * Get node definition
     */
    getNode(nodeKey: string): CommunityNodeDefinition | undefined;
    /**
     * Get registry statistics
     */
    getStats(): RegistryStats;
    /**
     * Load registry data from cache
     */
    private loadFromCache;
    /**
     * Save registry data to cache
     */
    private saveToCache;
    /**
     * Utility method to add delay
     */
    private delay;
    /**
     * Clear all registry data
     */
    clear(): Promise<void>;
    /**
     * Get all available categories
     */
    getCategories(): string[];
    /**
     * Validate package compatibility with current n8n version
     */
    validatePackageCompatibility(packageName: string, n8nVersion?: string): Promise<{
        compatible: boolean;
        issues: string[];
        warnings: string[];
    }>;
    /**
     * Simple version compatibility check
     */
    private isVersionCompatible;
}
export declare const communityNodeRegistry: CommunityNodeRegistry;
//# sourceMappingURL=community-node-registry.d.ts.map