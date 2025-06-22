/**
 * n8n Workflow Parsing Tools
 * Main entry point for all parsing and analysis functionality
 */
// Core parser
export { WorkflowParser } from './parsers/workflow-parser.js';
// Generation tools
export { AIAgent } from './ai-agents/ai-agent.js';
// Import for convenience functions
import { WorkflowParser } from './parsers/workflow-parser.js';
// Convenience function for quick parsing
export async function parseWorkflow(filePath) {
    const parser = new WorkflowParser();
    return await parser.parseFromFile(filePath);
}
// Convenience function for parsing from JSON string
export async function parseWorkflowFromJSON(jsonString) {
    const parser = new WorkflowParser();
    return await parser.parseFromString(jsonString);
}
//# sourceMappingURL=index.js.map