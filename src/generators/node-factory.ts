import { randomUUID } from 'crypto';
import { N8nNode } from '../types/n8n-workflow.js';
import { NodeSpecification } from '../types/n8n-workflow.js';

/**
 * Factory class for creating n8n nodes based on specifications
 */
export class NodeFactory {
  private nodeTemplates: Map<string, NodeTemplate>;

  constructor() {
    this.nodeTemplates = new Map();
    this.initializeNodeTemplates();
  }

  /**
   * Create a node based on the specification
   */
  async createNode(spec: NodeSpecification): Promise<N8nNode> {
    const template = this.nodeTemplates.get(spec.type);
    
    if (!template) {
      throw new Error(`Unknown node type: ${spec.type}`);
    }

    // Create base node structure
    const node: N8nNode = {
      id: spec.id || randomUUID(),
      name: spec.name,
      type: spec.type,
      typeVersion: template.defaultVersion,
      position: spec.position || [0, 0],
      parameters: this.mergeParameters(template.defaultParameters, spec.parameters)
    };

    // Add type-specific properties
    if (template.requiresCredentials) {
      node.credentials = template.defaultCredentials || {};
    }

    if (template.webhookId) {
      node.webhookId = randomUUID();
    }

    return node;
  }

  /**
   * Get available node types
   */
  getAvailableNodeTypes(): string[] {
    return Array.from(this.nodeTemplates.keys());
  }

  /**
   * Get node template information
   */
  getNodeTemplate(nodeType: string): NodeTemplate | undefined {
    return this.nodeTemplates.get(nodeType);
  }

  /**
   * Initialize default node templates
   */
  private initializeNodeTemplates(): void {
    // Trigger nodes
    this.nodeTemplates.set('n8n-nodes-base.start', {
      category: 'trigger',
      defaultVersion: 1,
      defaultParameters: {},
      description: 'Start node for manual execution'
    });

    this.nodeTemplates.set('n8n-nodes-base.webhook', {
      category: 'trigger',
      defaultVersion: 1,
      defaultParameters: {
        path: 'webhook',
        httpMethod: 'POST',
        responseMode: 'onReceived'
      },
      description: 'Webhook trigger node',
      webhookId: true
    });

    this.nodeTemplates.set('n8n-nodes-base.cron', {
      category: 'trigger',
      defaultVersion: 1,
      defaultParameters: {
        triggerTimes: {
          item: [
            {
              mode: 'everyMinute'
            }
          ]
        }
      },
      description: 'Schedule trigger node'
    });

    // HTTP nodes
    this.nodeTemplates.set('n8n-nodes-base.httpRequest', {
      category: 'communication',
      defaultVersion: 4.1,
      defaultParameters: {
        url: '',
        method: 'GET',
        sendHeaders: false,
        headerParameters: {
          parameters: []
        },
        sendQuery: false,
        queryParameters: {
          parameters: []
        },
        sendBody: false,
        bodyParameters: {
          parameters: []
        },
        options: {}
      },
      description: 'HTTP Request node for API calls'
    });

    // Code nodes
    this.nodeTemplates.set('n8n-nodes-base.code', {
      category: 'logic',
      defaultVersion: 2,
      defaultParameters: {
        mode: 'runOnceForAllItems',
        jsCode: '// Add your JavaScript code here\nreturn $input.all();'
      },
      description: 'Code node for custom JavaScript logic'
    });

    this.nodeTemplates.set('n8n-nodes-base.function', {
      category: 'logic',
      defaultVersion: 1,
      defaultParameters: {
        functionCode: '// Add your code here\nreturn items;'
      },
      description: 'Function node for custom logic'
    });

    // Data processing nodes
    this.nodeTemplates.set('n8n-nodes-base.set', {
      category: 'data-processing',
      defaultVersion: 3.3,
      defaultParameters: {
        mode: 'manual',
        duplicateItem: false,
        assignments: {
          assignments: []
        },
        options: {}
      },
      description: 'Set node for data manipulation'
    });

    this.nodeTemplates.set('n8n-nodes-base.itemLists', {
      category: 'data-processing',
      defaultVersion: 3,
      defaultParameters: {
        operation: 'splitOutItems',
        fieldToSplitOut: '',
        options: {}
      },
      description: 'Item Lists node for array operations'
    });

    // Utility nodes
    this.nodeTemplates.set('n8n-nodes-base.if', {
      category: 'control-flow',
      defaultVersion: 2,
      defaultParameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: '',
            typeValidation: 'strict'
          },
          conditions: [
            {
              id: randomUUID(),
              leftValue: '',
              rightValue: '',
              operator: {
                type: 'string',
                operation: 'equals'
              }
            }
          ],
          combinator: 'and'
        },
        options: {}
      },
      description: 'IF node for conditional logic'
    });

    this.nodeTemplates.set('n8n-nodes-base.merge', {
      category: 'utility',
      defaultVersion: 2.1,
      defaultParameters: {
        mode: 'append',
        options: {}
      },
      description: 'Merge node for combining data streams'
    });

    this.nodeTemplates.set('n8n-nodes-base.wait', {
      category: 'utility',
      defaultVersion: 1,
      defaultParameters: {
        unit: 'seconds',
        amount: 1
      },
      description: 'Wait node for delays'
    });

    // File operations
    this.nodeTemplates.set('n8n-nodes-base.readBinaryFile', {
      category: 'storage',
      defaultVersion: 1,
      defaultParameters: {
        filePath: ''
      },
      description: 'Read Binary File node'
    });

    this.nodeTemplates.set('n8n-nodes-base.writeBinaryFile', {
      category: 'storage',
      defaultVersion: 1,
      defaultParameters: {
        fileName: 'data.json',
        dataPropertyName: 'data'
      },
      description: 'Write Binary File node'
    });

    // HTML/Text processing
    this.nodeTemplates.set('n8n-nodes-base.htmlExtract', {
      category: 'data-processing',
      defaultVersion: 1,
      defaultParameters: {
        operation: 'extractHtmlContent',
        options: {}
      },
      description: 'HTML Extract node for web scraping'
    });

    // Email nodes
    this.nodeTemplates.set('n8n-nodes-base.emailSend', {
      category: 'notification',
      defaultVersion: 2,
      defaultParameters: {
        fromEmail: '',
        toEmail: '',
        subject: '',
        message: '',
        options: {}
      },
      requiresCredentials: true,
      defaultCredentials: {
        smtp: {
          id: '',
          name: 'SMTP account'
        }
      },
      description: 'Email Send node for notifications'
    });

    // Database nodes
    this.nodeTemplates.set('n8n-nodes-base.postgres', {
      category: 'storage',
      defaultVersion: 2.4,
      defaultParameters: {
        operation: 'executeQuery',
        query: '',
        options: {}
      },
      requiresCredentials: true,
      defaultCredentials: {
        postgres: {
          id: '',
          name: 'PostgreSQL account'
        }
      },
      description: 'PostgreSQL database node'
    });

    // Webhook response
    this.nodeTemplates.set('n8n-nodes-base.respondToWebhook', {
      category: 'communication',
      defaultVersion: 1,
      defaultParameters: {
        options: {}
      },
      description: 'Respond to Webhook node'
    });
  }

  /**
   * Merge template parameters with specification parameters
   */
  private mergeParameters(templateParams: Record<string, any>, specParams: Record<string, any>): Record<string, any> {
    const merged = { ...templateParams };
    
    // Deep merge parameters
    for (const [key, value] of Object.entries(specParams)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && 
          typeof merged[key] === 'object' && merged[key] !== null && !Array.isArray(merged[key])) {
        merged[key] = { ...merged[key], ...value };
      } else {
        merged[key] = value;
      }
    }

    return merged;
  }

  /**
   * Create a custom node template
   */
  addNodeTemplate(nodeType: string, template: NodeTemplate): void {
    this.nodeTemplates.set(nodeType, template);
  }

  /**
   * Get node categories
   */
  getNodeCategories(): string[] {
    const categories = new Set<string>();
    for (const template of this.nodeTemplates.values()) {
      categories.add(template.category);
    }
    return Array.from(categories);
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category: string): string[] {
    const nodes: string[] = [];
    for (const [nodeType, template] of this.nodeTemplates.entries()) {
      if (template.category === category) {
        nodes.push(nodeType);
      }
    }
    return nodes;
  }
}

/**
 * Node template interface
 */
export interface NodeTemplate {
  category: 'trigger' | 'communication' | 'logic' | 'data-processing' | 'storage' | 'notification' | 'control-flow' | 'utility';
  defaultVersion: number;
  defaultParameters: Record<string, any>;
  description: string;
  requiresCredentials?: boolean;
  defaultCredentials?: Record<string, any>;
  webhookId?: boolean;
} 