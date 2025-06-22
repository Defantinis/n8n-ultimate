/**
 * Knowledge Management Interface Integration
 *
 * This module brings together the Knowledge Management API, CLI, and storage
 * to provide a unified interface for the n8n Workflow Automation Project.
 */
import { Express } from 'express';
import { KnowledgeManagementAPI } from '../api/knowledge-management-api';
import { KnowledgeCLI } from '../cli/knowledge-cli';
import { KnowledgeStorageManager } from './knowledge-storage-system';
import { LearningIntegrationManager } from './learning-integration-system';
export interface KnowledgeInterfaceConfig {
    apiPort?: number;
    enableCLI?: boolean;
    enableAPI?: boolean;
    corsOrigins?: string[];
    rateLimitWindow?: number;
    rateLimitMax?: number;
}
export declare class KnowledgeInterfaceManager {
    private app;
    private api;
    private cli;
    private storageManager;
    private learningManager?;
    private config;
    constructor(storageManager: KnowledgeStorageManager, config?: KnowledgeInterfaceConfig, learningManager?: LearningIntegrationManager);
    private setupExpress;
    startAPI(): Promise<void>;
    getCLI(): KnowledgeCLI;
    getAPI(): KnowledgeManagementAPI;
    getApp(): Express;
    initializeWithLearning(): Promise<void>;
    shutdown(): Promise<void>;
}
export declare function createKnowledgeInterface(storageManager: KnowledgeStorageManager, config?: KnowledgeInterfaceConfig, learningManager?: LearningIntegrationManager): KnowledgeInterfaceManager;
export default KnowledgeInterfaceManager;
//# sourceMappingURL=knowledge-interface-integration.d.ts.map