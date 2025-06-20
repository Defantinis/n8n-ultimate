import { WorkflowParser } from './parsers/workflow-parser.js';
import { WorkflowGenerator, GeneratedWorkflow } from './generators/workflow-generator.js';
import { N8nWorkflow } from './types/n8n-workflow.js';
import { readdirSync } from 'fs';
import { join, basename } from 'path';

/**
 * Skeleton Workflow Analyzer and Enhancer
 * Provides tools for working with skeleton workflows
 */
export class SkeletonAnalyzer {
  private parser: WorkflowParser;
  private generator: WorkflowGenerator;

  constructor() {
    this.parser = new WorkflowParser();
    this.generator = new WorkflowGenerator();
  }

  /**
   * Analyze all skeleton workflows in a directory
   */
  async analyzeSkeletonDirectory(skeletonDir: string): Promise<SkeletonAnalysis[]> {
    const files = readdirSync(skeletonDir).filter(f => f.endsWith('.json'));
    const analyses: SkeletonAnalysis[] = [];

    for (const file of files) {
      const filePath = join(skeletonDir, file);
      try {
        const analysis = await this.analyzeSkeleton(filePath);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze ${file}:`, error);
      }
    }

    return analyses;
  }

  /**
   * Analyze a single skeleton workflow
   */
  async analyzeSkeleton(filePath: string): Promise<SkeletonAnalysis> {
    const parsed = await this.parser.parseFromFile(filePath);
    const capabilities = this.analyzeCapabilities(parsed.workflow);
    const patterns = this.identifyPatterns(parsed.workflow);
    const enhancementSuggestions = this.suggestEnhancements(parsed.workflow);

    return {
      filePath,
      fileName: basename(filePath),
      parsed,
      capabilities,
      patterns,
      enhancementSuggestions
    };
  }

  /**
   * Analyze what capabilities a skeleton workflow provides
   */
  private analyzeCapabilities(workflow: N8nWorkflow): WorkflowCapabilities {
    const nodeTypes = workflow.nodes.map(node => node.type);
    
    return {
      canTrigger: nodeTypes.some(type => 
        type.includes('trigger') || type.includes('webhook') || type.includes('schedule')
      ),
      canFetchData: nodeTypes.some(type => 
        type.includes('httpRequest') || type.includes('api') || type.includes('database')
      ),
      canProcessData: nodeTypes.some(type => 
        type.includes('code') || type.includes('function') || type.includes('transform')
      ),
      canExtractData: nodeTypes.some(type => 
        type.includes('html') || type.includes('json') || type.includes('xml')
      ),
      canStoreData: nodeTypes.some(type => 
        type.includes('file') || type.includes('database') || type.includes('storage')
      ),
      canNotify: nodeTypes.some(type => 
        type.includes('email') || type.includes('slack') || type.includes('webhook')
      ),
      canHandleErrors: nodeTypes.some(type => 
        type.includes('if') || type.includes('switch') || type.includes('merge')
      ),
      complexity: this.calculateSkeletonComplexity(workflow),
      mainPurpose: this.identifyMainPurpose(workflow)
    };
  }

  /**
   * Identify common workflow patterns
   */
  private identifyPatterns(workflow: N8nWorkflow): WorkflowPattern[] {
    const patterns: WorkflowPattern[] = [];
    const nodeTypes = workflow.nodes.map(node => node.type);

    // Web scraping pattern
    if (nodeTypes.includes('n8n-nodes-base.httpRequest') && 
        nodeTypes.includes('n8n-nodes-base.html')) {
      patterns.push({
        name: 'Web Scraping',
        description: 'Fetches web pages and extracts data',
        confidence: 0.9
      });
    }

    // API integration pattern
    if (nodeTypes.includes('n8n-nodes-base.httpRequest') && 
        !nodeTypes.includes('n8n-nodes-base.html')) {
      patterns.push({
        name: 'API Integration',
        description: 'Makes HTTP requests to APIs',
        confidence: 0.8
      });
    }

    // Data processing pattern
    if (nodeTypes.includes('n8n-nodes-base.code') || 
        nodeTypes.includes('n8n-nodes-base.function')) {
      patterns.push({
        name: 'Data Processing',
        description: 'Processes and transforms data',
        confidence: 0.7
      });
    }

    // Notification pattern
    if (nodeTypes.some(type => 
        type.includes('email') || type.includes('slack') || type.includes('webhook'))) {
      patterns.push({
        name: 'Notification',
        description: 'Sends notifications or alerts',
        confidence: 0.8
      });
    }

    return patterns;
  }

  /**
   * Suggest enhancements for a skeleton workflow
   */
  private suggestEnhancements(workflow: N8nWorkflow): Enhancement[] {
    const suggestions: Enhancement[] = [];
    const nodeTypes = workflow.nodes.map(node => node.type);

    // Error handling suggestions for each HTTP request
    workflow.nodes.forEach(node => {
      if (node.type.includes('httpRequest')) {
        suggestions.push({
          type: 'error-handling',
          priority: 'high',
          description: `Add error handling for '${node.name}'`,
          implementation: `Add an IF node to check for errors after this HTTP request.`,
          parameters: { targetNodeId: node.id }
        });
      }
    });

    // Data storage suggestions
    if (nodeTypes.includes('n8n-nodes-base.httpRequest') && 
        !nodeTypes.some(type => type.includes('file') || type.includes('database'))) {
      suggestions.push({
        type: 'data-storage',
        priority: 'medium',
        description: 'Add data storage capability',
        implementation: 'Add Write Binary File or database nodes to persist results'
      });
    }

    // Data transformation suggestions
    if (nodeTypes.includes('n8n-nodes-base.html') && 
        !nodeTypes.includes('n8n-nodes-base.code')) {
      suggestions.push({
        type: 'data-processing',
        priority: 'medium',
        description: 'Add data transformation',
        implementation: 'Add Code or Function nodes to clean and structure extracted data'
      });
    }

    // Notification suggestions
    if (workflow.nodes.length > 2 && 
        !nodeTypes.some(type => type.includes('email') || type.includes('slack'))) {
      suggestions.push({
        type: 'notification',
        priority: 'low',
        description: 'Add completion notifications',
        implementation: 'Add Email or Slack nodes to notify when workflow completes'
      });
    }

    return suggestions;
  }

  /**
   * Calculate skeleton complexity (simplified)
   */
  private calculateSkeletonComplexity(workflow: N8nWorkflow): 'simple' | 'moderate' | 'complex' {
    const nodeCount = workflow.nodes.length;
    const uniqueTypes = new Set(workflow.nodes.map(n => n.type)).size;
    
    if (nodeCount <= 3 && uniqueTypes <= 2) return 'simple';
    if (nodeCount <= 6 && uniqueTypes <= 4) return 'moderate';
    return 'complex';
  }

  /**
   * Identify the main purpose of the workflow
   */
  private identifyMainPurpose(workflow: N8nWorkflow): string {
    const nodeTypes = workflow.nodes.map(node => node.type);
    
    if (nodeTypes.includes('n8n-nodes-base.html')) {
      return 'Web Data Extraction';
    } else if (nodeTypes.includes('n8n-nodes-base.httpRequest')) {
      return 'API Integration';
    } else if (nodeTypes.includes('n8n-nodes-base.code')) {
      return 'Data Processing';
    } else if (nodeTypes.some(type => type.includes('email') || type.includes('slack'))) {
      return 'Notification System';
    }
    
    return 'General Automation';
  }

  /**
   * Create an enhanced version of a skeleton workflow
   */
  async enhanceSkeleton(
    skeletonPath: string, 
    enhancements: Enhancement[]
  ): Promise<GeneratedWorkflow> {
    const parsed = await this.parser.parseFromFile(skeletonPath);
    
    // Convert our Enhancement objects to WorkflowEnhancement objects
    const workflowEnhancements = enhancements.map(e => ({
      type: this.mapEnhancementType(e.type),
      description: e.description,
      parameters: e.parameters || {}
    }));

    return await this.generator.enhanceWorkflow(parsed.workflow, workflowEnhancements);
  }

  /**
   * Map our enhancement type to WorkflowEnhancement type
   */
  private mapEnhancementType(type: Enhancement['type']): 'add-node' | 'modify-node' | 'add-connection' | 'add-error-handling' {
    switch (type) {
      case 'error-handling':
        return 'add-error-handling';
      case 'data-storage':
      case 'notification':
        return 'add-node';
      case 'data-processing':
      case 'optimization':
        return 'modify-node';
      default:
        return 'add-node';
    }
  }

  /**
   * Generate a report for skeleton workflows
   */
  generateSkeletonReport(analyses: SkeletonAnalysis[]): string {
    let report = '# Skeleton Workflow Analysis Report\n\n';
    
    report += `## Overview\n`;
    report += `- Total Skeletons: ${analyses.length}\n`;
    report += `- Average Complexity: ${this.calculateAverageComplexity(analyses)}\n`;
    report += `- Common Patterns: ${this.getCommonPatterns(analyses).join(', ')}\n\n`;

    for (const analysis of analyses) {
      report += `## ${analysis.fileName}\n`;
      report += `- **Purpose**: ${analysis.capabilities.mainPurpose}\n`;
      report += `- **Complexity**: ${analysis.capabilities.complexity}\n`;
      report += `- **Nodes**: ${analysis.parsed.metadata.nodeCount}\n`;
      report += `- **Validation**: ${analysis.parsed.validation.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
      
      if (analysis.patterns.length > 0) {
        report += `- **Patterns**: ${analysis.patterns.map(p => p.name).join(', ')}\n`;
      }
      
      if (analysis.enhancementSuggestions.length > 0) {
        report += `- **Enhancement Suggestions**:\n`;
        analysis.enhancementSuggestions.forEach(suggestion => {
          report += `  - ${suggestion.description} (${suggestion.priority} priority)\n`;
        });
      }
      
      report += '\n';
    }

    return report;
  }

  private calculateAverageComplexity(analyses: SkeletonAnalysis[]): string {
    const complexityMap = { simple: 1, moderate: 2, complex: 3 };
    const avg = analyses.reduce((sum, a) => sum + complexityMap[a.capabilities.complexity], 0) / analyses.length;
    
    if (avg < 1.5) return 'Simple';
    if (avg < 2.5) return 'Moderate';
    return 'Complex';
  }

  private getCommonPatterns(analyses: SkeletonAnalysis[]): string[] {
    const patternCounts = new Map<string, number>();
    
    analyses.forEach(analysis => {
      analysis.patterns.forEach(pattern => {
        patternCounts.set(pattern.name, (patternCounts.get(pattern.name) || 0) + 1);
      });
    });

    return Array.from(patternCounts.entries())
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([name, _]) => name);
  }
}

// Type definitions
export interface SkeletonAnalysis {
  filePath: string;
  fileName: string;
  parsed: any;
  capabilities: WorkflowCapabilities;
  patterns: WorkflowPattern[];
  enhancementSuggestions: Enhancement[];
}

export interface WorkflowCapabilities {
  canTrigger: boolean;
  canFetchData: boolean;
  canProcessData: boolean;
  canExtractData: boolean;
  canStoreData: boolean;
  canNotify: boolean;
  canHandleErrors: boolean;
  complexity: 'simple' | 'moderate' | 'complex';
  mainPurpose: string;
}

export interface WorkflowPattern {
  name: string;
  description: string;
  confidence: number;
}

export interface Enhancement {
  type: 'error-handling' | 'data-storage' | 'data-processing' | 'notification' | 'optimization';
  priority: 'low' | 'medium' | 'high';
  description: string;
  implementation: string;
  parameters?: Record<string, any>;
} 