/**
 * Knowledge Management Interface Integration
 * 
 * This module brings together the Knowledge Management API, CLI, and storage
 * to provide a unified interface for the n8n Workflow Automation Project.
 */

import express, { Express, Request, Response } from 'express';
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

export class KnowledgeInterfaceManager {
  private app: Express;
  private api: KnowledgeManagementAPI;
  private cli: KnowledgeCLI;
  private storageManager: KnowledgeStorageManager;
  private learningManager?: LearningIntegrationManager;
  private config: KnowledgeInterfaceConfig;

  constructor(
    storageManager: KnowledgeStorageManager,
    config: KnowledgeInterfaceConfig = {},
    learningManager?: LearningIntegrationManager
  ) {
    this.storageManager = storageManager;
    this.learningManager = learningManager;
    this.config = {
      apiPort: 3000,
      enableCLI: true,
      enableAPI: true,
      corsOrigins: ['*'],
      rateLimitWindow: 15 * 60 * 1000, // 15 minutes
      rateLimitMax: 100, // limit each IP to 100 requests per windowMs
      ...config
    };

    this.app = express();
    this.api = new KnowledgeManagementAPI(storageManager);
    this.cli = new KnowledgeCLI(storageManager);

    this.setupExpress();
  }

  private setupExpress(): void {
    // Middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS
    this.app.use((req: Request, res: Response, next) => {
      const origin = req.headers.origin;
      if (this.config.corsOrigins?.includes('*') || 
          (origin && this.config.corsOrigins?.includes(origin))) {
        res.header('Access-Control-Allow-Origin', origin || '*');
      }
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });

    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          api: this.config.enableAPI,
          cli: this.config.enableCLI,
          storage: true,
          learning: !!this.learningManager
        }
      });
    });

    // API routes
    if (this.config.enableAPI) {
      this.app.use('/api/v1', this.api.getRouter());
    }

    // Documentation endpoint
    this.app.get('/docs', (req: Request, res: Response) => {
      res.json({
        title: 'Knowledge Management API Documentation',
        version: '1.0.0',
        endpoints: {
          health: 'GET /health',
          knowledge: {
            list: 'GET /api/v1/knowledge',
            create: 'POST /api/v1/knowledge',
            get: 'GET /api/v1/knowledge/:id',
            update: 'PUT /api/v1/knowledge/:id',
            delete: 'DELETE /api/v1/knowledge/:id',
            search: 'POST /api/v1/knowledge/search',
            recommendations: 'GET /api/v1/knowledge/recommendations',
            analytics: 'GET /api/v1/knowledge/analytics',
            export: 'POST /api/v1/knowledge/export',
            import: 'POST /api/v1/knowledge/import'
          }
        },
        cli: this.config.enableCLI ? {
          commands: ['list', 'search', 'create', 'analytics']
        } : 'disabled'
      });
    });

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Endpoint not found'
        }
      });
    });

    // Error handler
    this.app.use((error: any, req: Request, res: Response, next: any) => {
      console.error('API Error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred'
        }
      });
    });
  }

  public async startAPI(): Promise<void> {
    if (!this.config.enableAPI) {
      console.log('API is disabled in configuration');
      return;
    }

    return new Promise((resolve) => {
      this.app.listen(this.config.apiPort, () => {
        console.log(`Knowledge Management API running on port ${this.config.apiPort}`);
        console.log(`Documentation available at http://localhost:${this.config.apiPort}/docs`);
        resolve();
      });
    });
  }

  public getCLI(): KnowledgeCLI {
    if (!this.config.enableCLI) {
      throw new Error('CLI is disabled in configuration');
    }
    return this.cli;
  }

  public getAPI(): KnowledgeManagementAPI {
    if (!this.config.enableAPI) {
      throw new Error('API is disabled in configuration');
    }
    return this.api;
  }

  public getApp(): Express {
    return this.app;
  }

  public async initializeWithLearning(): Promise<void> {
    if (this.learningManager) {
      // Connect learning events to knowledge storage
      this.learningManager.on('insight', async (insight: any) => {
        try {
          const knowledge = {
            id: `insight-${insight.id}`,
            title: insight.title,
            description: insight.description,
            type: 'SYSTEM_INSIGHT' as any,
            category: 'PERFORMANCE' as any,
            timestamp: new Date(),
            metadata: { insight },
            tags: ['automated', 'insight', insight.type],
            source: 'LEARNING_SYSTEM' as any,
            confidence: insight.confidence,
            usageCount: 0,
            lastAccessed: new Date()
          };

          await this.storageManager.create(knowledge);
          console.log(`Learning insight stored as knowledge: ${knowledge.id}`);
        } catch (error) {
          console.error('Error storing learning insight:', error);
        }
      });

      console.log('Knowledge interface integrated with learning system');
    }
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down Knowledge Interface Manager...');
    // Add cleanup logic here if needed
  }
}

// Factory function for easy setup
export function createKnowledgeInterface(
  storageManager: KnowledgeStorageManager,
  config?: KnowledgeInterfaceConfig,
  learningManager?: LearningIntegrationManager
): KnowledgeInterfaceManager {
  return new KnowledgeInterfaceManager(storageManager, config, learningManager);
}

export default KnowledgeInterfaceManager;
