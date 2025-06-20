/**
 * n8n Workflow Parsing Tools
 * Main entry point for all parsing and analysis functionality
 */

// Core parser
export { WorkflowParser } from './parsers/workflow-parser.js';

// Validators
export { WorkflowValidator } from './validators/workflow-validator.js';

// Utilities
export { 
  NodeAnalyzer,
  type NodeAnalysis,
  type NodeCategory,
  type NodeRelationship,
  type NodeRelationshipAnalysis,
  type BottleneckAnalysis
} from './utils/node-analyzer.js';

// Generation tools
export { WorkflowGenerator } from './generators/workflow-generator.js';
export { NodeFactory } from './generators/node-factory.js';
export { ConnectionBuilder } from './generators/connection-builder.js';
export { PositionCalculator } from './utils/position-calculator.js';
export { AIAgent } from './ai-agents/ai-agent.js';
export { SkeletonAnalyzer } from './skeleton-analyzer.js';

// Type definitions
export {
  type N8nWorkflow,
  type N8nNode,
  type N8nConnections,
  type N8nSettings,
  type N8nMeta,
  type HttpRequestParameters,
  type CodeParameters,
  type HtmlExtractParameters,
  type WriteBinaryFileParameters,
  type NodeType,
  type ConnectionType,
  type N8nExecutionData,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ParsedWorkflow
} from './types/n8n-workflow.js';

// Import for convenience functions
import { WorkflowParser } from './parsers/workflow-parser.js';

// Convenience function for quick parsing
export async function parseWorkflow(filePath: string) {
  const parser = new WorkflowParser();
  return await parser.parseFromFile(filePath);
}

// Convenience function for parsing from JSON string
export async function parseWorkflowFromJSON(jsonString: string) {
  const parser = new WorkflowParser();
  return await parser.parseFromString(jsonString);
} 