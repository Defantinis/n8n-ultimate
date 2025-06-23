import { N8nWorkflow } from '../types/n8n-workflow';
export interface WorkflowTemplate extends N8nWorkflow {
    templateName: string;
    templateDescription?: string;
    version: number;
    createdAt: string;
    updatedAt: string;
}
export declare class TemplateService {
    constructor();
    private ensureTemplatesDirExists;
    private getTemplatePath;
    saveTemplate(templateName: string, workflow: N8nWorkflow, description?: string): Promise<WorkflowTemplate>;
    getTemplate(templateName: string, version?: number): Promise<WorkflowTemplate | null>;
    listTemplates(): Promise<Array<{
        name: string;
        latestVersion: number;
        description?: string;
    }>>;
    getLatestVersion(templateName: string): Promise<number>;
}
//# sourceMappingURL=template-service.d.ts.map