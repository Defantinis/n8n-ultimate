/**
 * Test Suite for Knowledge Management API and CLI
 */
import { KnowledgeManagementAPI } from './knowledge-management-api';
import { KnowledgeCLI } from '../cli/knowledge-cli';
declare class MockKnowledgeStorageManager {
    private entries;
    create(entry: any): Promise<any>;
    read(query: any): Promise<{
        data: any[];
        total: number;
    }>;
    findById(id: string): Promise<any>;
    update(id: string, updates: any): Promise<any>;
    delete(id: string): Promise<boolean>;
    search(query: string, options: any): Promise<{
        data: any[];
        total: number;
    }>;
    getAnalytics(): Promise<any>;
    export(format: string): Promise<string>;
    import(data: string, format: string): Promise<{
        imported: number;
        errors: number;
    }>;
    private getCountByField;
}
export declare function runAPITests(): Promise<void>;
export declare function runCLITests(): Promise<void>;
export declare function runIntegrationTests(): Promise<void>;
export declare function runAllTests(): Promise<void>;
export { MockKnowledgeStorageManager, KnowledgeManagementAPI, KnowledgeCLI };
//# sourceMappingURL=test-knowledge-management-api.d.ts.map