export interface DocumentationResource {
    id: string;
    title: string;
    category: 'official' | 'community' | 'tutorial' | 'example' | 'api' | 'troubleshooting';
    type: 'guide' | 'reference' | 'workflow' | 'node' | 'integration' | 'best-practice' | 'api';
    url?: string;
    content?: string;
    tags: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    lastUpdated: string;
    author?: string;
    rating?: number;
    verified: boolean;
}
export interface NodeDocumentation {
    nodeType: string;
    displayName: string;
    description: string;
    category: string;
    version: string;
    documentation: {
        overview: string;
        parameters: NodeParameter[];
        examples: WorkflowExample[];
        troubleshooting: TroubleshootingEntry[];
        bestPractices: string[];
        communityTips: CommunityTip[];
    };
    resources: DocumentationResource[];
}
export interface NodeParameter {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'options' | 'collection' | 'json' | 'expression';
    required: boolean;
    description: string;
    defaultValue?: any;
    options?: string[];
    example?: string;
    validation?: string;
}
export interface WorkflowExample {
    id: string;
    title: string;
    description: string;
    useCase: string;
    workflow: any;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    author: string;
    createdAt: string;
    downloadCount?: number;
}
export interface TroubleshootingEntry {
    issue: string;
    symptoms: string[];
    causes: string[];
    solutions: string[];
    relatedNodes?: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
}
export interface CommunityTip {
    id: string;
    title: string;
    content: string;
    author: string;
    votes: number;
    tags: string[];
    createdAt: string;
}
export interface BestPracticeGuide {
    id: string;
    title: string;
    category: 'workflow-design' | 'performance' | 'security' | 'maintenance' | 'debugging';
    description: string;
    guidelines: Guideline[];
    examples: string[];
    antiPatterns: AntiPattern[];
    checklist: ChecklistItem[];
}
export interface Guideline {
    rule: string;
    explanation: string;
    importance: 'must' | 'should' | 'could';
    examples: string[];
}
export interface AntiPattern {
    pattern: string;
    why: string;
    instead: string;
    example?: string;
}
export interface ChecklistItem {
    item: string;
    category: string;
    critical: boolean;
}
export interface CommunityResource {
    id: string;
    name: string;
    type: 'template' | 'workflow' | 'node' | 'integration' | 'tool' | 'tutorial';
    description: string;
    author: string;
    repository?: string;
    downloadUrl?: string;
    documentation?: string;
    tags: string[];
    rating: number;
    downloads: number;
    lastUpdated: string;
    compatibility: string[];
    license: string;
}
export declare class DocumentationManager {
    private resources;
    private nodeDocumentation;
    private bestPractices;
    private communityResources;
    constructor();
    getNodeDocumentation(nodeType: string): NodeDocumentation | undefined;
    searchResources(query: {
        category?: string;
        tags?: string[];
        difficulty?: string;
        type?: string;
    }): DocumentationResource[];
    getBestPractices(category?: string): BestPracticeGuide[];
    getCommunityResources(type?: string): CommunityResource[];
    addResource(resource: DocumentationResource): void;
    generateWorkflowDocumentation(workflow: any): string;
    private initializeOfficialResources;
    private initializeNodeDocumentation;
    private initializeBestPractices;
    private initializeCommunityResources;
    private assessComplexity;
    private getApplicableBestPractices;
}
export declare class DocumentationGenerator {
    private docManager;
    constructor();
    generateProjectDocumentation(config: {
        projectName: string;
        workflows: any[];
        integrations: string[];
        customNodes?: string[];
    }): string;
    generateReadme(config: {
        projectName: string;
        description: string;
        workflows: any[];
        requirements: string[];
        setupInstructions: string[];
    }): string;
}
export declare class ResourceFetcher {
    private cache;
    private cacheTimeout;
    fetchCommunityResources(): Promise<CommunityResource[]>;
    fetchDocumentationUpdates(): Promise<DocumentationResource[]>;
    checkNodeUpdates(nodeTypes: string[]): Promise<string[]>;
}
export declare const documentationManager: DocumentationManager;
export declare const documentationGenerator: DocumentationGenerator;
export declare const resourceFetcher: ResourceFetcher;
//# sourceMappingURL=documentation-resources.d.ts.map