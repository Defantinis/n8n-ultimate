/**
 * Knowledge Management CLI Interface for n8n Workflow Automation Project
 */
import { KnowledgeStorageManager } from '../integration/knowledge-storage-system';
export declare class KnowledgeCLI {
    private program;
    private knowledgeStorage;
    private api;
    constructor(knowledgeStorage: KnowledgeStorageManager);
    private setupCommands;
    private listKnowledge;
    private searchKnowledge;
    private createKnowledge;
    private showAnalytics;
    run(args: string[]): void;
}
export default KnowledgeCLI;
//# sourceMappingURL=knowledge-cli.d.ts.map