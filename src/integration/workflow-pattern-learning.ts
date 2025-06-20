/**
 * Workflow Pattern Learning System
 * 
 * Implements pattern recognition and learning capabilities for n8n workflows.
 * Automatically captures and learns from successful workflow patterns during 
 * generation and validation processes.
 */

import { N8nWorkflow, N8nNode, N8nConnections } from '../types/n8n-workflow';
import { KnowledgeStorageManager } from './knowledge-storage-system';
import { KnowledgeEntry } from './knowledge-management-system';

/**
 * Workflow Pattern Interfaces
 */
export interface WorkflowPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  nodeSequence: string[];
  connectionPatterns: ConnectionPattern[];
  performanceMetrics: PatternPerformanceMetrics;
  usage: PatternUsageStats;
  confidence: number;
  createdAt: Date;
  lastUsed: Date;
}

export interface ConnectionPattern {
  fromNodeType: string;
  toNodeType: string;
  frequency: number;
  successRate: number;
  avgExecutionTime: number;
}

export interface PatternPerformanceMetrics {
  successRate: number;
  avgExecutionTime: number;
  avgTokenUsage: number;
  avgCost: number;
  errorRate: number;
  reusabilityScore: number;
}

export interface PatternUsageStats {
  timesUsed: number;
  timesGenerated: number;
  timesModified: number;
  lastModified: Date;
  userRating: number;
}

export interface PatternAnalysisResult {
  detectedPatterns: WorkflowPattern[];
  noveltyScore: number;
  complexityScore: number;
  recommendations: string[];
  potentialImprovements: string[];
}

export interface PatternLearningConfig {
  minPatternFrequency: number;
  minSuccessRateThreshold: number;
  maxPatternsToStore: number;
  enableRealTimeLearning: boolean;
  patternCategories: string[];
  learningMode: 'passive' | 'active' | 'hybrid';
}

/**
 * Default Configuration
 */
export const DEFAULT_PATTERN_LEARNING_CONFIG: PatternLearningConfig = {
  minPatternFrequency: 3,
  minSuccessRateThreshold: 0.8,
  maxPatternsToStore: 1000,
  enableRealTimeLearning: true,
  patternCategories: [
    'data-processing',
    'api-integration',
    'ai-workflow',
    'automation',
    'monitoring',
    'notification',
    'error-handling',
    'transformation'
  ],
  learningMode: 'hybrid'
};

/**
 * Workflow Graph Analyzer
 * 
 * Analyzes workflow structure using graph theory principles
 */
export class WorkflowGraphAnalyzer {
  private adjacencyList: Map<string, string[]> = new Map();
  private nodeTypeFrequency: Map<string, number> = new Map();
  private connectionFrequency: Map<string, number> = new Map();

  constructor(private workflow: N8nWorkflow) {
    this.buildGraph();
  }

  private buildGraph(): void {
    // Build adjacency list representation
    for (const nodeId in this.workflow.connections) {
      const connections = this.workflow.connections[nodeId];
      const connectedNodes: string[] = [];
      
      for (const output in connections) {
        const outputConnections = connections[output];
        for (const connectionArray of outputConnections) {
          for (const connection of connectionArray) {
            connectedNodes.push(connection.node);
          }
        }
      }
      
      this.adjacencyList.set(nodeId, connectedNodes);
    }

    // Calculate node type frequencies
    for (const node of this.workflow.nodes) {
      const count = this.nodeTypeFrequency.get(node.type) || 0;
      this.nodeTypeFrequency.set(node.type, count + 1);
    }

    // Calculate connection pattern frequencies
    for (const [fromNodeId, toNodeIds] of this.adjacencyList) {
      const fromNode = this.workflow.nodes.find(n => n.id === fromNodeId);
      if (!fromNode) continue;

      for (const toNodeId of toNodeIds) {
        const toNode = this.workflow.nodes.find(n => n.id === toNodeId);
        if (!toNode) continue;

        const connectionKey = `${fromNode.type}->${toNode.type}`;
        const count = this.connectionFrequency.get(connectionKey) || 0;
        this.connectionFrequency.set(connectionKey, count + 1);
      }
    }
  }

  getNodeSequence(): string[] {
    // Perform topological sort to get execution order
    const visited = new Set<string>();
    const result: string[] = [];

    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const connections = this.adjacencyList.get(nodeId) || [];
      for (const connectedNodeId of connections) {
        dfs(connectedNodeId);
      }

      result.unshift(nodeId);
    };

    for (const nodeId of this.adjacencyList.keys()) {
      dfs(nodeId);
    }

    // Convert node IDs to node types
    return result.map(nodeId => {
      const node = this.workflow.nodes.find(n => n.id === nodeId);
      return node ? node.type : 'unknown';
    });
  }

  getConnectionPatterns(): ConnectionPattern[] {
    const patterns: ConnectionPattern[] = [];

    for (const [connectionKey, frequency] of this.connectionFrequency) {
      const [fromType, toType] = connectionKey.split('->');
      
      patterns.push({
        fromNodeType: fromType,
        toNodeType: toType,
        frequency,
        successRate: 1.0, // Will be updated with actual metrics
        avgExecutionTime: 0 // Will be updated with actual metrics
      });
    }

    return patterns;
  }

  calculateComplexity(): number {
    const nodeCount = this.workflow.nodes.length;
    const connectionCount = Object.keys(this.workflow.connections).length;
    const uniqueNodeTypes = this.nodeTypeFrequency.size;
    
    // Complexity formula considering multiple factors
    return Math.log2(nodeCount + 1) + 
           Math.log2(connectionCount + 1) + 
           Math.log2(uniqueNodeTypes + 1);
  }
}

/**
 * Pattern Recognition Engine
 * 
 * Identifies patterns in workflows using machine learning techniques
 */
export class PatternRecognitionEngine {
  private config: PatternLearningConfig;
  private knownPatterns: WorkflowPattern[] = [];

  constructor(config: Partial<PatternLearningConfig> = {}) {
    this.config = { ...DEFAULT_PATTERN_LEARNING_CONFIG, ...config };
  }

  async analyzeWorkflow(workflow: N8nWorkflow): Promise<PatternAnalysisResult> {
    const analyzer = new WorkflowGraphAnalyzer(workflow);
    const nodeSequence = analyzer.getNodeSequence();
    const connectionPatterns = analyzer.getConnectionPatterns();
    const complexity = analyzer.calculateComplexity();

    // Detect existing patterns
    const detectedPatterns = this.detectPatterns(nodeSequence, connectionPatterns);
    
    // Calculate novelty score
    const noveltyScore = this.calculateNoveltyScore(nodeSequence, connectionPatterns);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(workflow, detectedPatterns);
    
    // Identify potential improvements
    const potentialImprovements = this.identifyImprovements(workflow, detectedPatterns);

    return {
      detectedPatterns,
      noveltyScore,
      complexityScore: complexity,
      recommendations,
      potentialImprovements
    };
  }

  private detectPatterns(
    nodeSequence: string[], 
    connectionPatterns: ConnectionPattern[]
  ): WorkflowPattern[] {
    const detected: WorkflowPattern[] = [];

    for (const knownPattern of this.knownPatterns) {
      const similarity = this.calculatePatternSimilarity(
        knownPattern.nodeSequence, 
        nodeSequence,
        knownPattern.connectionPatterns,
        connectionPatterns
      );

      if (similarity > 0.7) { // 70% similarity threshold
        detected.push({
          ...knownPattern,
          confidence: similarity
        });
      }
    }

    return detected;
  }

  private calculatePatternSimilarity(
    knownSequence: string[],
    newSequence: string[],
    knownConnections: ConnectionPattern[],
    newConnections: ConnectionPattern[]
  ): number {
    // Calculate sequence similarity using Levenshtein distance
    const sequenceSimilarity = this.calculateSequenceSimilarity(knownSequence, newSequence);
    
    // Calculate connection pattern similarity
    const connectionSimilarity = this.calculateConnectionSimilarity(knownConnections, newConnections);
    
    // Weight both similarities
    return (sequenceSimilarity * 0.6) + (connectionSimilarity * 0.4);
  }

  private calculateSequenceSimilarity(seq1: string[], seq2: string[]): number {
    const maxLength = Math.max(seq1.length, seq2.length);
    if (maxLength === 0) return 1.0;

    const distance = this.levenshteinDistance(seq1, seq2);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(arr1: string[], arr2: string[]): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= arr2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= arr1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= arr2.length; i++) {
      for (let j = 1; j <= arr1.length; j++) {
        if (arr2[i - 1] === arr1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[arr2.length][arr1.length];
  }

  private calculateConnectionSimilarity(
    connections1: ConnectionPattern[], 
    connections2: ConnectionPattern[]
  ): number {
    if (connections1.length === 0 && connections2.length === 0) return 1.0;
    if (connections1.length === 0 || connections2.length === 0) return 0.0;

    let matchCount = 0;
    const totalConnections = Math.max(connections1.length, connections2.length);

    for (const conn1 of connections1) {
      const match = connections2.find(conn2 => 
        conn1.fromNodeType === conn2.fromNodeType && 
        conn1.toNodeType === conn2.toNodeType
      );
      if (match) matchCount++;
    }

    return matchCount / totalConnections;
  }

  private calculateNoveltyScore(
    nodeSequence: string[], 
    connectionPatterns: ConnectionPattern[]
  ): number {
    // Higher novelty if the pattern hasn't been seen before
    const hasSeenSequence = this.knownPatterns.some(pattern => 
      this.calculateSequenceSimilarity(pattern.nodeSequence, nodeSequence) > 0.8
    );

    const hasSeenConnections = this.knownPatterns.some(pattern =>
      this.calculateConnectionSimilarity(pattern.connectionPatterns, connectionPatterns) > 0.8
    );

    if (!hasSeenSequence && !hasSeenConnections) return 1.0;
    if (!hasSeenSequence || !hasSeenConnections) return 0.7;
    return 0.3;
  }

  private generateRecommendations(
    workflow: N8nWorkflow, 
    detectedPatterns: WorkflowPattern[]
  ): string[] {
    const recommendations: string[] = [];

    // Check for missing error handling
    const hasErrorHandling = workflow.nodes.some(node => 
      node.type.includes('error') || node.type.includes('catch')
    );
    if (!hasErrorHandling) {
      recommendations.push('Consider adding error handling nodes to improve workflow reliability');
    }

    // Check for monitoring/logging
    const hasMonitoring = workflow.nodes.some(node => 
      node.type.includes('webhook') || node.type.includes('log')
    );
    if (!hasMonitoring) {
      recommendations.push('Add monitoring or logging nodes to track workflow execution');
    }

    // Check for optimization opportunities
    if (detectedPatterns.length > 0) {
      const avgSuccessRate = detectedPatterns.reduce((sum, p) => sum + p.performanceMetrics.successRate, 0) / detectedPatterns.length;
      if (avgSuccessRate < 0.9) {
        recommendations.push('Consider optimizing workflow based on similar successful patterns');
      }
    }

    return recommendations;
  }

  private identifyImprovements(
    workflow: N8nWorkflow, 
    detectedPatterns: WorkflowPattern[]
  ): string[] {
    const improvements: string[] = [];

    // Suggest parallel execution opportunities
    const analyzer = new WorkflowGraphAnalyzer(workflow);
    const nodeSequence = analyzer.getNodeSequence();
    
    if (nodeSequence.length > 5) {
      improvements.push('Consider parallelizing independent workflow branches for better performance');
    }

    // Suggest pattern reuse
    if (detectedPatterns.length > 0) {
      improvements.push('Reuse proven patterns from your existing workflows for better reliability');
    }

    // Suggest caching opportunities
    const hasDataNodes = workflow.nodes.some(node => 
      node.type.includes('http') || node.type.includes('api')
    );
    if (hasDataNodes) {
      improvements.push('Consider adding caching mechanisms for frequently accessed data');
    }

    return improvements;
  }

  addKnownPattern(pattern: WorkflowPattern): void {
    this.knownPatterns.push(pattern);
    
    // Maintain maximum pattern limit
    if (this.knownPatterns.length > this.config.maxPatternsToStore) {
      // Remove oldest patterns with lowest confidence
      this.knownPatterns.sort((a, b) => b.confidence - a.confidence);
      this.knownPatterns = this.knownPatterns.slice(0, this.config.maxPatternsToStore);
    }
  }

  getKnownPatterns(): WorkflowPattern[] {
    return [...this.knownPatterns];
  }
}

/**
 * Pattern Learning Manager
 * 
 * Main orchestrator for workflow pattern learning system
 */
export class PatternLearningManager {
  private recognitionEngine: PatternRecognitionEngine;
  private storageManager: KnowledgeStorageManager;
  private config: PatternLearningConfig;

  constructor(
    config: Partial<PatternLearningConfig> = {},
    storageManager?: KnowledgeStorageManager
  ) {
    this.config = { ...DEFAULT_PATTERN_LEARNING_CONFIG, ...config };
    this.recognitionEngine = new PatternRecognitionEngine(config);
    this.storageManager = storageManager || new KnowledgeStorageManager({
      type: 'sqlite',
      filename: '.taskmaster/knowledge/patterns.db'
    });
  }

  async initialize(): Promise<void> {
    await this.storageManager.connect();
    await this.loadExistingPatterns();
  }

  async learnFromWorkflow(
    workflow: N8nWorkflow, 
    executionMetrics?: PatternPerformanceMetrics
  ): Promise<PatternAnalysisResult> {
    // Analyze the workflow
    const analysisResult = await this.recognitionEngine.analyzeWorkflow(workflow);
    
    // If this is a novel pattern, consider storing it
    if (analysisResult.noveltyScore > 0.7) {
      const newPattern = await this.createPatternFromWorkflow(workflow, executionMetrics);
      await this.storePattern(newPattern);
      this.recognitionEngine.addKnownPattern(newPattern);
    }

    // Update usage statistics for detected patterns
    for (const pattern of analysisResult.detectedPatterns) {
      await this.updatePatternUsage(pattern.id);
    }

    return analysisResult;
  }

  async createPatternFromWorkflow(
    workflow: N8nWorkflow, 
    metrics?: PatternPerformanceMetrics
  ): Promise<WorkflowPattern> {
    const analyzer = new WorkflowGraphAnalyzer(workflow);
    const nodeSequence = analyzer.getNodeSequence();
    const connectionPatterns = analyzer.getConnectionPatterns();
    
    const pattern: WorkflowPattern = {
      id: this.generatePatternId(workflow),
      name: workflow.name || 'Unnamed Workflow Pattern',
      description: `Pattern extracted from workflow: ${workflow.name}`,
      category: this.categorizeWorkflow(workflow),
      nodeSequence,
      connectionPatterns,
      performanceMetrics: metrics || {
        successRate: 1.0,
        avgExecutionTime: 0,
        avgTokenUsage: 0,
        avgCost: 0,
        errorRate: 0,
        reusabilityScore: 0.5
      },
      usage: {
        timesUsed: 1,
        timesGenerated: 1,
        timesModified: 0,
        lastModified: new Date(),
        userRating: 5
      },
      confidence: 0.8,
      createdAt: new Date(),
      lastUsed: new Date()
    };

    return pattern;
  }

  private generatePatternId(workflow: N8nWorkflow): string {
    const hash = this.simpleHash(JSON.stringify(workflow.nodes.map(n => n.type)));
    return `pattern_${Date.now()}_${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private categorizeWorkflow(workflow: N8nWorkflow): string {
    const nodeTypes = workflow.nodes.map(n => n.type);
    
    if (nodeTypes.some(type => type.includes('openAi') || type.includes('langchain'))) {
      return 'ai-workflow';
    }
    if (nodeTypes.some(type => type.includes('http') || type.includes('api'))) {
      return 'api-integration';
    }
    if (nodeTypes.some(type => type.includes('transform') || type.includes('set'))) {
      return 'data-processing';
    }
    if (nodeTypes.some(type => type.includes('webhook') || type.includes('trigger'))) {
      return 'automation';
    }
    
    return 'general';
  }

  private async loadExistingPatterns(): Promise<void> {
    try {
      const patterns = await this.storageManager.read<WorkflowPattern>({
        limit: this.config.maxPatternsToStore
      });
      
      for (const pattern of patterns.data) {
        this.recognitionEngine.addKnownPattern(pattern);
      }
    } catch (error) {
      console.warn('Could not load existing patterns:', error);
    }
  }

  private async storePattern(pattern: WorkflowPattern): Promise<void> {
    const knowledgeEntry: KnowledgeEntry = {
      id: pattern.id,
      type: 'workflow_pattern',
      title: pattern.name,
      content: JSON.stringify(pattern),
      tags: [pattern.category, 'pattern', 'workflow'],
      createdAt: pattern.createdAt,
      updatedAt: new Date(),
      metadata: {
        category: pattern.category,
        confidence: pattern.confidence,
        nodeCount: pattern.nodeSequence.length,
        connectionCount: pattern.connectionPatterns.length
      }
    };

    await this.storageManager.create(knowledgeEntry);
  }

  private async updatePatternUsage(patternId: string): Promise<void> {
    try {
      const result = await this.storageManager.read<WorkflowPattern>({
        textSearch: patternId,
        limit: 1
      });

      if (result.data.length > 0) {
        const pattern = JSON.parse(result.data[0].content) as WorkflowPattern;
        pattern.usage.timesUsed++;
        pattern.lastUsed = new Date();

        const updatedEntry: KnowledgeEntry = {
          ...result.data[0],
          content: JSON.stringify(pattern),
          updatedAt: new Date()
        };

        await this.storageManager.update(updatedEntry.id, updatedEntry);
      }
    } catch (error) {
      console.warn('Could not update pattern usage:', error);
    }
  }

  async getPatternRecommendations(workflow: N8nWorkflow): Promise<WorkflowPattern[]> {
    const analysisResult = await this.recognitionEngine.analyzeWorkflow(workflow);
    return analysisResult.detectedPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  async getPatternsByCategory(category: string): Promise<WorkflowPattern[]> {
    const result = await this.storageManager.read<WorkflowPattern>({
      tags: [category],
      limit: 50
    });

    return result.data.map(entry => JSON.parse(entry.content) as WorkflowPattern);
  }

  async getTopPatterns(limit: number = 10): Promise<WorkflowPattern[]> {
    const result = await this.storageManager.read<WorkflowPattern>({
      limit
    });

    const patterns = result.data.map(entry => JSON.parse(entry.content) as WorkflowPattern);
    return patterns.sort((a, b) => b.usage.timesUsed - a.usage.timesUsed);
  }

  async cleanup(): Promise<void> {
    await this.storageManager.disconnect();
  }
}

/**
 * Utility Functions
 */
export const PatternLearningUtils = {
  /**
   * Generate a workflow from a pattern
   */
  generateWorkflowFromPattern(pattern: WorkflowPattern, name: string): Partial<N8nWorkflow> {
    const nodes: N8nNode[] = [];
    const connections: { [key: string]: { [key: string]: any[] } } = {};

    // Generate nodes based on pattern sequence
    pattern.nodeSequence.forEach((nodeType, index) => {
      nodes.push({
        id: `node_${index}`,
        name: `${nodeType}_${index}`,
        type: nodeType,
        typeVersion: 1,
        position: [index * 200, 100],
        parameters: {}
      });
    });

    // Generate connections based on pattern
    pattern.connectionPatterns.forEach((conn, index) => {
      const fromNodeIndex = pattern.nodeSequence.findIndex(type => type === conn.fromNodeType);
      const toNodeIndex = pattern.nodeSequence.findIndex(type => type === conn.toNodeType);

      if (fromNodeIndex >= 0 && toNodeIndex >= 0) {
        const fromNodeId = `node_${fromNodeIndex}`;
        const toNodeId = `node_${toNodeIndex}`;

        if (!connections[fromNodeId]) {
          connections[fromNodeId] = {};
        }
        if (!connections[fromNodeId]['main']) {
          connections[fromNodeId]['main'] = [];
        }

        connections[fromNodeId]['main'].push({
          node: toNodeId,
          type: 'main',
          index: 0
        });
      }
    });

    return {
      name,
      nodes,
      connections,
      active: false,
      settings: { executionOrder: 'v1' }
    };
  },

  /**
   * Calculate pattern effectiveness score
   */
  calculateEffectivenessScore(pattern: WorkflowPattern): number {
    const metrics = pattern.performanceMetrics;
    const usage = pattern.usage;

    const performanceScore = (
      metrics.successRate * 0.3 +
      (1 - metrics.errorRate) * 0.2 +
      metrics.reusabilityScore * 0.2 +
      Math.min(usage.userRating / 5, 1) * 0.3
    );

    const usageScore = Math.min(usage.timesUsed / 10, 1) * 0.2;
    const confidenceScore = pattern.confidence * 0.3;

    return performanceScore * 0.5 + usageScore + confidenceScore;
  },

  /**
   * Export patterns to JSON
   */
  exportPatterns(patterns: WorkflowPattern[]): string {
    return JSON.stringify(patterns, null, 2);
  },

  /**
   * Import patterns from JSON
   */
  importPatterns(json: string): WorkflowPattern[] {
    try {
      return JSON.parse(json) as WorkflowPattern[];
    } catch (error) {
      throw new Error('Invalid pattern JSON format');
    }
  }
};

// Export default instance creator
export function createPatternLearningManager(
  config?: Partial<PatternLearningConfig>,
  storageManager?: KnowledgeStorageManager
): PatternLearningManager {
  return new PatternLearningManager(config, storageManager);
} 