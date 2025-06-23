import * as fs from 'fs/promises';
import * as path from 'path';
const USER_TEMPLATES_DIR = path.join(process.cwd(), 'src', 'templates', 'user');
export class TemplateService {
    constructor() {
        this.ensureTemplatesDirExists();
    }
    async ensureTemplatesDirExists() {
        try {
            await fs.mkdir(USER_TEMPLATES_DIR, { recursive: true });
        }
        catch (error) {
            console.error('Failed to create user templates directory:', error);
            throw error;
        }
    }
    getTemplatePath(templateName, version) {
        return path.join(USER_TEMPLATES_DIR, `${templateName}-v${version}.json`);
    }
    async saveTemplate(templateName, workflow, description) {
        const latestVersion = await this.getLatestVersion(templateName);
        const newVersion = latestVersion + 1;
        const newTemplate = {
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
    async getTemplate(templateName, version) {
        const v = version ?? await this.getLatestVersion(templateName);
        if (v === 0)
            return null;
        const filePath = this.getTemplatePath(templateName, v);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            // If file not found for specific version, it's not an error, just means it doesn't exist
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }
    async listTemplates() {
        const files = await fs.readdir(USER_TEMPLATES_DIR);
        const templates = new Map();
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
    async getLatestVersion(templateName) {
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
//# sourceMappingURL=template-service.js.map