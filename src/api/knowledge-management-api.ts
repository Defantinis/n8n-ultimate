/**
 * Knowledge Management API for n8n Workflow Automation Project
 */

import { Router, Request, Response } from 'express';
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

export class KnowledgeManagementAPI {
  private router: Router;
  private knowledgeStorage: KnowledgeStorageManager;

  constructor(knowledgeStorage: KnowledgeStorageManager) {
    this.knowledgeStorage = knowledgeStorage;
    this.router = Router();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/health', this.healthCheck.bind(this));
    this.router.get('/knowledge', this.getKnowledge.bind(this));
    this.router.post('/knowledge', this.createKnowledge.bind(this));
    this.router.post('/knowledge/search', this.searchKnowledge.bind(this));
  }

  private async healthCheck(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: { status: 'healthy', version: '1.0.0' },
      metadata: { timestamp: new Date().toISOString(), version: '1.0.0' }
    });
  }

  private async getKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.knowledgeStorage.read({});
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'ERROR', message: error.message } });
    }
  }

  private async createKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const entry = await this.knowledgeStorage.create(req.body);
      res.status(201).json({ success: true, data: entry });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'ERROR', message: error.message } });
    }
  }

  private async searchKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.body;
      const result = await this.knowledgeStorage.search(query, {});
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'ERROR', message: error.message } });
    }
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default KnowledgeManagementAPI;
