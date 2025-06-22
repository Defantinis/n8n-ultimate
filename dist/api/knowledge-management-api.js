/**
 * Knowledge Management API for n8n Workflow Automation Project
 */
import { Router } from 'express';
export class KnowledgeManagementAPI {
    router;
    knowledgeStorage;
    constructor(knowledgeStorage) {
        this.knowledgeStorage = knowledgeStorage;
        this.router = Router();
        this.setupRoutes();
    }
    setupRoutes() {
        this.router.get('/health', this.healthCheck.bind(this));
        this.router.get('/knowledge', this.getKnowledge.bind(this));
        this.router.post('/knowledge', this.createKnowledge.bind(this));
        this.router.post('/knowledge/search', this.searchKnowledge.bind(this));
    }
    async healthCheck(req, res) {
        res.json({
            success: true,
            data: { status: 'healthy', version: '1.0.0' },
            metadata: { timestamp: new Date().toISOString(), version: '1.0.0' }
        });
    }
    async getKnowledge(req, res) {
        try {
            const result = await this.knowledgeStorage.read({});
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'ERROR', message: error.message } });
        }
    }
    async createKnowledge(req, res) {
        try {
            const entry = await this.knowledgeStorage.create(req.body);
            res.status(201).json({ success: true, data: entry });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'ERROR', message: error.message } });
        }
    }
    async searchKnowledge(req, res) {
        try {
            const { query } = req.body;
            const result = await this.knowledgeStorage.search(query, {});
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: { code: 'ERROR', message: error.message } });
        }
    }
    getRouter() {
        return this.router;
    }
}
export default KnowledgeManagementAPI;
//# sourceMappingURL=knowledge-management-api.js.map