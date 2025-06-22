/**
 * Knowledge Management API for n8n Workflow Automation Project
 */
import { Router } from 'express';
import { KnowledgeStorageManager } from '../integration/knowledge-storage-system';
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
    metadata?: {
        timestamp: string;
        version: string;
    };
}
export declare class KnowledgeManagementAPI {
    private router;
    private knowledgeStorage;
    constructor(knowledgeStorage: KnowledgeStorageManager);
    private setupRoutes;
    private healthCheck;
    private getKnowledge;
    private createKnowledge;
    private searchKnowledge;
    getRouter(): Router;
}
export default KnowledgeManagementAPI;
//# sourceMappingURL=knowledge-management-api.d.ts.map