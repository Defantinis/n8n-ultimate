import { N8nWorkflow } from '../types/n8n-workflow';
import * as fs from 'fs/promises';
import * as path from 'path';

const USER_TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates', 'user');

export interface WorkflowTemplate extends N8nWorkflow {
  templateName: string;
  templateDescription?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export class TemplateService {
  constructor() {
    this.ensureTemplatesDirExists();
  }

  private async ensureTemplatesDirExists(): Promise<void> {
    try {
      await fs.mkdir(USER_TEMPLATES_DIR, { recursive: true });
    } catch (error) {
      console.error('Failed to create user templates directory:', error);
      throw error;
    }
  }

  private getTemplatePath(templateName: string, version: number): string {
    return path.join(USER_TEMPLATES_DIR, `${templateName}-v${version}.json`);
  }

  public async saveTemplate(templateName: string, workflow: N8nWorkflow, description?: string): Promise<WorkflowTemplate> {
    const latestVersion = await this.getLatestVersion(templateName);
    const newVersion = latestVersion + 1;

    const newTemplate: WorkflowTemplate = {
      ...workflow,
      templateName,
      templateDescription: description,
      version: newVersion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const filePath = this.getTemplatePath(templateName, newVersion);
    await fs.writeFile(filePath, JSON.stringify(newTemplate, null, 2));

    return newTemplate;
  }

  public async getTemplate(templateName: string, version?: number): Promise<WorkflowTemplate | null> {
    const v = version ?? await this.getLatestVersion(templateName);
    if (v === 0) return null;

    const filePath = this.getTemplatePath(templateName, v);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as WorkflowTemplate;
    } catch (error) {
      // If file not found for specific version, it's not an error, just means it doesn't exist
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  public async listTemplates(): Promise<Array<{ name: string; latestVersion: number; description?: string }>> {
    const files = await fs.readdir(USER_TEMPLATES_DIR);
    const templates = new Map<string, { latestVersion: number; description?: string }>();

    for (const file of files) {
      const match = file.match(/^(.*)-v(\d+)\.json$/);
      if (match) {
        const name = match[1];
        const version = parseInt(match[2], 10);
        
        const current = templates.get(name) || { latestVersion: 0 };
        if (version > current.latestVersion) {
          templates.set(name, { latestVersion: version });
        }
      }
    }
    
    // To get description, we need to read the latest version of each file
    const result = [];
    for (const [name, data] of templates.entries()) {
        const template = await this.getTemplate(name, data.latestVersion);
        result.push({
            name,
            latestVersion: data.latestVersion,
            description: template?.templateDescription,
        });
    }

    return result;
  }

  public async getLatestVersion(templateName: string): Promise<number> {
    const files = await fs.readdir(USER_TEMPLATES_DIR);
    let latestVersion = 0;
    for (const file of files) {
      const match = file.match(new RegExp(`^${templateName}-v(\\d+)\\.json$`));
      if (match) {
        const version = parseInt(match[1], 10);
        if (version > latestVersion) {
          latestVersion = version;
        }
      }
    }
    return latestVersion;
  }
} 