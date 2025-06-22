/**
 * n8n Workflow Parsing Tools
 * Main entry point for all parsing and analysis functionality
 */

// Core parser
export { WorkflowParser } from './parsers/workflow-parser.js';

// Generation tools
export { AIAgent } from './ai-agents/ai-agent.js';

// Type definitions
export {
  type N8nWorkflow,
  type N8nNode,
  type N8nConnections,
  type WorkflowSettings,
  type WorkflowMetadata,
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