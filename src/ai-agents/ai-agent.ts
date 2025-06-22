import { WorkflowRequirements, SimplificationSuggestion } from '../generators/workflow-generator.js';
import { WorkflowPlan, NodeSpecification, FlowConnection } from '../types/n8n-workflow.js';
import { N8nWorkflow, N8nNode } from '../types/n8n-workflow.js';
import { ollamaCacheManager } from '../performance/ollama-cache-manager.js';

/**
 * AI Agent that uses Ollama to analyze requirements and plan workflows
 */
export class AIAgent {
  private readonly ollamaBaseUrl: string;
  private readonly modelName: string;
  private readonly enableCaching: boolean;

  constructor(
    ollamaBaseUrl = 'http://localhost:11434', 
    modelName = 'deepseek-r1:14b',
    enableCaching = true
  ) {
    this.ollamaBaseUrl = ollamaBaseUrl;
    this.modelName = modelName;
    this.enableCaching = enableCaching;
  }

  /**
   * Analyze user requirements to understand what kind of workflow is needed
   */
  async analyzeRequirements(requirements: WorkflowRequirements): Promise<RequirementAnalysis> {
    const prompt = this.buildAnalysisPrompt(requirements);
    
    try {
      const response = await this.callOllama(prompt);
      return this.parseAnalysisResponse(response, requirements);
    } catch (error) {
      console.warn('AI analysis failed, using fallback analysis:', error);
      return this.createFallbackAnalysis(requirements);
    }
  }

  /**
   * Plan the workflow structure based on the analysis
   */
  async planWorkflow(analysis: RequirementAnalysis): Promise<WorkflowPlan> {
    const prompt = this.buildPlanningPrompt(analysis);
    
    try {
      const response = await this.callOllama(prompt);
      return this.parsePlanningResponse(response, analysis);
    } catch (error) {
      console.warn('AI planning failed, using fallback plan:', error);
      return this.createFallbackPlan(analysis);
    }
  }

  /**
   * Suggest simplifications for complex workflows
   */
  async suggestSimplifications(
    workflow: N8nWorkflow, 
    complexNodes: N8nNode[], 
    requirements: WorkflowRequirements
  ): Promise<SimplificationSuggestion[]> {
    const prompt = this.buildSimplificationPrompt(workflow, complexNodes, requirements);
    
    try {
      const response = await this.callOllama(prompt);
      return this.parseSimplificationResponse(response, complexNodes);
    } catch (error) {
      console.warn('AI simplification failed, using fallback suggestions:', error);
      return this.createFallbackSimplifications(complexNodes);
    }
  }

  /**
   * Get cache statistics for performance monitoring
   */
  getCacheStats() {
    if (!this.enableCaching) {
      return null;
    }
    return ollamaCacheManager.getCacheStats();
  }

  /**
   * Clear cache (useful for testing or manual cache management)
   */
  clearCache(): void {
    if (this.enableCaching) {
      ollamaCacheManager.clearCache();
    }
  }

  /**
   * Preload common workflow generation prompts into cache
   */
  async preloadCommonPrompts(): Promise<void> {
    if (!this.enableCaching) {
      return;
    }

    const commonPrompts = [
      {
        prompt: "You are an expert n8n workflow designer. Create a simple HTTP request workflow that fetches data from an API and processes it.",
        response: JSON.stringify({
          nodes: [
            { id: "start", name: "Start", type: "n8n-nodes-base.start" },
            { id: "http", name: "HTTP Request", type: "n8n-nodes-base.httpRequest" }
          ],
          flow: [{ from: "start", to: "http", type: "main" }]
        }),
        model: this.modelName
      },
      {
        prompt: "You are an expert n8n workflow designer. Create a data processing workflow that transforms JSON data.",
        response: JSON.stringify({
          nodes: [
            { id: "start", name: "Start", type: "n8n-nodes-base.start" },
            { id: "set", name: "Process Data", type: "n8n-nodes-base.set" }
          ],
          flow: [{ from: "start", to: "set", type: "main" }]
        }),
        model: this.modelName
      }
    ];

    await ollamaCacheManager.preloadCommonPrompts(commonPrompts);
  }

  /**
   * Build the analysis prompt for Ollama
   */
  private buildAnalysisPrompt(requirements: WorkflowRequirements): string {
    return `You are an expert n8n workflow designer. Analyze the following requirements and provide a structured analysis.

Requirements:
- Description: ${requirements.description}
- Type: ${requirements.type}
- Inputs: ${requirements.inputs?.map(i => `${i.name} (${i.type}): ${i.description}`).join(', ') || 'None specified'}
- Outputs: ${requirements.outputs?.map(o => `${o.name} (${o.type}): ${o.description}`).join(', ') || 'None specified'}
- Steps: ${requirements.steps?.join(', ') || 'None specified'}
- Constraints: ${JSON.stringify(requirements.constraints || {})}

Please analyze and respond with a JSON object containing:
{
  "workflowType": "linear|parallel|conditional|complex",
  "estimatedComplexity": 1-10,
  "keyComponents": ["component1", "component2", ...],
  "suggestedNodeTypes": ["node-type-1", "node-type-2", ...],
  "dataFlow": "description of how data flows through the workflow",
  "potentialChallenges": ["challenge1", "challenge2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}

Focus on practical n8n implementation and keep complexity reasonable.`;
  }

  /**
   * Build the planning prompt for Ollama
   */
  private buildPlanningPrompt(analysis: RequirementAnalysis): string {
    return `Based on the analysis, create a detailed workflow plan for n8n.

Analysis:
- Workflow Type: ${analysis.workflowType}
- Complexity: ${analysis.estimatedComplexity}/10
- Key Components: ${analysis.keyComponents.join(', ')}
- Suggested Node Types: ${analysis.suggestedNodeTypes.join(', ')}
- Data Flow: ${analysis.dataFlow}

Available n8n node types:
- Triggers: n8n-nodes-base.start, n8n-nodes-base.webhook, n8n-nodes-base.cron
- HTTP: n8n-nodes-base.httpRequest
- Logic: n8n-nodes-base.code, n8n-nodes-base.function, n8n-nodes-base.if
- Data: n8n-nodes-base.set, n8n-nodes-base.itemLists, n8n-nodes-base.merge
- Files: n8n-nodes-base.readBinaryFile, n8n-nodes-base.writeBinaryFile
- Utilities: n8n-nodes-base.wait, n8n-nodes-base.htmlExtract

Create a JSON response with:
{
  "nodes": [
    {
      "id": "unique-id",
      "name": "Node Name",
      "type": "n8n-nodes-base.nodeType",
      "parameters": { /* node-specific parameters */ },
      "description": "what this node does"
    }
  ],
  "flow": [
    {
      "from": "node-id-1",
      "to": "node-id-2",
      "type": "main|success|error",
      "condition": "optional condition for conditional flows"
    }
  ],
  "estimatedComplexity": 1-10,
  "rationale": "explanation of the design decisions"
}

Keep the workflow practical and implementable.`;
  }

  /**
   * Build the simplification prompt for Ollama
   */
  private buildSimplificationPrompt(
    workflow: N8nWorkflow, 
    complexNodes: N8nNode[], 
    requirements: WorkflowRequirements
  ): string {
    const nodeDescriptions = complexNodes.map(node => 
      `${node.name} (${node.type}): ${Object.keys(node.parameters).length} parameters`
    ).join('\n');

    return `Analyze this n8n workflow and suggest simplifications for complex nodes.

Workflow: ${workflow.name}
Total Nodes: ${workflow.nodes.length}
Complex Nodes:
${nodeDescriptions}

Original Requirements: ${requirements.description}

Please suggest simplifications as JSON:
{
  "suggestions": [
    {
      "type": "split-node|merge-nodes|simplify-parameters",
      "nodeId": "target-node-id",
      "description": "explanation of the simplification",
      "parameters": { /* any specific parameters for the simplification */ }
    }
  ]
}

Focus on maintaining functionality while reducing complexity.`;
  }

  /**
   * Call Ollama API with caching support
   */
  private async callOllama(prompt: string): Promise<string> {
    const temperature = 0.3;
    const topP = 0.9;
    const numPredict = 2000;

    // Check cache first if caching is enabled
    if (this.enableCaching) {
      const cachedResponse = await ollamaCacheManager.getCachedResponse(
        prompt,
        this.modelName,
        temperature,
        topP,
        numPredict
      );
      
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Make API call with performance tracking
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.modelName,
          prompt,
          stream: false,
          options: {
            temperature,
            top_p: topP,
            num_predict: numPredict
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as { response: string };
      const responseTime = Date.now() - startTime;

      // Record performance metrics
      if (this.enableCaching) {
        ollamaCacheManager.recordResponseTime(responseTime);
        
        // Cache the response
        await ollamaCacheManager.setCachedResponse(
          prompt,
          data.response,
          this.modelName,
          temperature,
          topP,
          numPredict
        );
      }

      return data.response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      // Still record response time for failed requests
      if (this.enableCaching) {
        ollamaCacheManager.recordResponseTime(responseTime);
      }
      
      throw error;
    }
  }

  /**
   * Parse the analysis response from Ollama
   */
  private parseAnalysisResponse(response: string, requirements: WorkflowRequirements): RequirementAnalysis {
    try {
      // Handle DeepSeek's thinking process by looking for JSON after </think>
      let cleanResponse = response;
      if (response.includes('</think>')) {
        cleanResponse = response.split('</think>')[1];
      }
      
      // Try to extract the last valid JSON object from the response
      const jsonMatches = cleanResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
      if (jsonMatches && jsonMatches.length > 0) {
        const lastJsonMatch = jsonMatches[jsonMatches.length - 1];
        const parsed = JSON.parse(lastJsonMatch);
        return {
          workflowType: parsed.workflowType || 'linear',
          estimatedComplexity: Math.min(10, Math.max(1, parsed.estimatedComplexity || 5)),
          keyComponents: Array.isArray(parsed.keyComponents) ? parsed.keyComponents : [],
          suggestedNodeTypes: Array.isArray(parsed.suggestedNodeTypes) ? parsed.suggestedNodeTypes : [],
          dataFlow: parsed.dataFlow || 'Linear data flow',
          potentialChallenges: Array.isArray(parsed.potentialChallenges) ? parsed.potentialChallenges : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
        };
      }
    } catch (error) {
      console.warn('Failed to parse AI analysis response:', error);
    }
    
    return this.createFallbackAnalysis(requirements);
  }

  /**
   * Parse the planning response from Ollama
   */
  private parsePlanningResponse(response: string, analysis: RequirementAnalysis): WorkflowPlan {
    try {
      // Handle DeepSeek's thinking process by looking for JSON after </think>
      let cleanResponse = response;
      if (response.includes('</think>')) {
        cleanResponse = response.split('</think>')[1];
      }
      
      // Try to extract the last valid JSON object from the response
      const jsonMatches = cleanResponse.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
      if (jsonMatches && jsonMatches.length > 0) {
        const lastJsonMatch = jsonMatches[jsonMatches.length - 1];
        const parsed = JSON.parse(lastJsonMatch);
        
        if (parsed.nodes && parsed.flow) {
          return {
            nodes: parsed.nodes.map((node: any) => ({
              id: node.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: node.name || 'Unnamed Node',
              type: node.type || 'n8n-nodes-base.start',
              parameters: node.parameters || {},
              description: node.description || ''
            })),
            flow: parsed.flow.map((connection: any) => ({
              from: connection.from,
              to: connection.to,
              type: connection.type || 'main',
              condition: connection.condition
            })),
            estimatedComplexity: Math.min(10, Math.max(1, parsed.estimatedComplexity || analysis.estimatedComplexity)),
            rationale: parsed.rationale || 'AI-generated workflow plan'
          };
        }
      }
    } catch (error) {
      console.warn('Failed to parse AI planning response:', error);
    }
    
    return this.createFallbackPlan(analysis);
  }

  /**
   * Parse the simplification response from Ollama
   */
  private parseSimplificationResponse(response: string, complexNodes: N8nNode[]): SimplificationSuggestion[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
          return parsed.suggestions.map((suggestion: any) => ({
            type: suggestion.type || 'simplify-parameters',
            nodeId: suggestion.nodeId || complexNodes[0]?.id || '',
            description: suggestion.description || 'Simplify node parameters',
            parameters: suggestion.parameters || {}
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to parse AI simplification response:', error);
    }
    
    return this.createFallbackSimplifications(complexNodes);
  }

  /**
   * Create fallback analysis when AI fails
   */
  private createFallbackAnalysis(requirements: WorkflowRequirements): RequirementAnalysis {
    const workflowType = this.determineWorkflowType(requirements);
    const estimatedComplexity = this.estimateComplexity(requirements);
    
    return {
      workflowType,
      estimatedComplexity,
      keyComponents: this.extractKeyComponents(requirements),
      suggestedNodeTypes: this.suggestNodeTypes(requirements),
      dataFlow: 'Sequential data processing flow',
      potentialChallenges: ['Configuration complexity', 'Error handling'],
      recommendations: ['Start simple', 'Add error handling', 'Test incrementally']
    };
  }

  /**
   * Create fallback plan when AI fails
   */
  private createFallbackPlan(analysis: RequirementAnalysis): WorkflowPlan {
    const nodes: NodeSpecification[] = [];
    const flow: FlowConnection[] = [];
    
    // Create a basic start node
    const startNodeId = `start-${Date.now()}`;
    nodes.push({
      id: startNodeId,
      name: 'Start',
      type: 'n8n-nodes-base.start',
      parameters: {},
      description: 'Workflow start trigger'
    });
    
    // Add basic processing based on workflow type
    let lastNodeId = startNodeId;
    
    if (analysis.keyComponents.includes('HTTP')) {
      const httpNodeId = `http-${Date.now()}`;
      nodes.push({
        id: httpNodeId,
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        parameters: {
          url: 'https://api.example.com',
          method: 'GET'
        },
        description: 'Make HTTP request'
      });
      
      flow.push({
        from: lastNodeId,
        to: httpNodeId,
        type: 'main'
      });
      
      lastNodeId = httpNodeId;
    }
    
    // Add data processing if needed
    if (analysis.keyComponents.includes('data-processing')) {
      const setNodeId = `set-${Date.now()}`;
      nodes.push({
        id: setNodeId,
        name: 'Process Data',
        type: 'n8n-nodes-base.set',
        parameters: {
          mode: 'manual',
          assignments: {
            assignments: []
          }
        },
        description: 'Process and transform data'
      });
      
      flow.push({
        from: lastNodeId,
        to: setNodeId,
        type: 'main'
      });
    }
    
    return {
      nodes,
      flow,
      estimatedComplexity: analysis.estimatedComplexity,
      rationale: 'Fallback plan with basic workflow structure'
    };
  }

  /**
   * Create fallback simplifications when AI fails
   */
  private createFallbackSimplifications(complexNodes: N8nNode[]): SimplificationSuggestion[] {
    return complexNodes.map(node => ({
      type: 'simplify-parameters' as const,
      nodeId: node.id,
      description: `Simplify parameters for ${node.name}`,
      parameters: {}
    }));
  }

  // Helper methods for fallback analysis
  private determineWorkflowType(requirements: WorkflowRequirements): 'linear' | 'parallel' | 'conditional' | 'complex' {
    if (requirements.type === 'api-integration') return 'linear';
    if (requirements.type === 'data-processing') return 'parallel';
    if (requirements.description.toLowerCase().includes('if') || 
        requirements.description.toLowerCase().includes('condition')) return 'conditional';
    return 'linear';
  }

  private estimateComplexity(requirements: WorkflowRequirements): number {
    let complexity = 3; // Base complexity
    
    if (requirements.inputs && requirements.inputs.length > 2) complexity += 1;
    if (requirements.outputs && requirements.outputs.length > 2) complexity += 1;
    if (requirements.steps && requirements.steps.length > 5) complexity += 2;
    if (requirements.constraints?.maxNodes && requirements.constraints.maxNodes > 10) complexity += 2;
    
    return Math.min(10, complexity);
  }

  private extractKeyComponents(requirements: WorkflowRequirements): string[] {
    const components: string[] = [];
    
    if (requirements.inputs?.some(i => i.type === 'webhook')) components.push('webhook');
    if (requirements.inputs?.some(i => i.type === 'api')) components.push('HTTP');
    if (requirements.outputs?.some(o => o.type === 'file')) components.push('file-processing');
    if (requirements.outputs?.some(o => o.type === 'email')) components.push('email');
    if (requirements.type === 'data-processing') components.push('data-processing');
    
    return components;
  }

  private suggestNodeTypes(requirements: WorkflowRequirements): string[] {
    const nodeTypes: string[] = ['n8n-nodes-base.start'];
    
    if (requirements.inputs?.some(i => i.type === 'webhook')) {
      nodeTypes.push('n8n-nodes-base.webhook');
    }
    if (requirements.type === 'api-integration') {
      nodeTypes.push('n8n-nodes-base.httpRequest');
    }
    if (requirements.type === 'data-processing') {
      nodeTypes.push('n8n-nodes-base.set', 'n8n-nodes-base.code');
    }
    if (requirements.outputs?.some(o => o.type === 'file')) {
      nodeTypes.push('n8n-nodes-base.writeBinaryFile');
    }
    
    return nodeTypes;
  }
}

/**
 * Requirement analysis result
 */
export interface RequirementAnalysis {
  workflowType: 'linear' | 'parallel' | 'conditional' | 'complex';
  estimatedComplexity: number;
  keyComponents: string[];
  suggestedNodeTypes: string[];
  dataFlow: string;
  potentialChallenges: string[];
  recommendations: string[];
} 