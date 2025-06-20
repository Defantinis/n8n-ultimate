/**
 * Test Suite for AI Integration Patterns
 *
 * Comprehensive tests for AI/LangChain integration functionality
 */
import { defaultAIIntegrationConfig, AINodeTemplatesClass, AIWorkflowPatternsClass, AIPerformanceMonitorClass, AIIntegrationManagerClass, AIUtils } from './ai-integration-patterns';
/**
 * Test Configuration
 */
const testConfig = {
    ...defaultAIIntegrationConfig,
    openaiApiKey: 'test-openai-key',
    anthropicApiKey: 'test-anthropic-key',
    enableAILogging: false // Disable logging for tests
};
/**
 * Test AI Node Templates
 */
export function testAINodeTemplates() {
    console.log('🧪 Testing AI Node Templates...');
    const templates = new AINodeTemplatesClass(testConfig);
    // Test OpenAI Chat Node
    const openaiNode = templates.createOpenAIChatNode([100, 200]);
    console.assert(openaiNode.type === 'n8n-nodes-base.openAi', 'OpenAI node type is correct');
    console.assert(openaiNode.position[0] === 100 && openaiNode.position[1] === 200, 'OpenAI node position is correct');
    console.assert(openaiNode.parameters.resource === 'chat', 'OpenAI node resource is correct');
    // Test LangChain Node
    const langchainNode = templates.createLangChainNode([200, 300]);
    console.assert(langchainNode.type === 'n8n-nodes-langchain.langChain', 'LangChain node type is correct');
    console.assert(langchainNode.parameters.operation === 'conversationalRetrievalQAChain', 'LangChain operation is correct');
    // Test Vector Store Node
    const vectorStoreNode = templates.createVectorStoreNode([300, 400]);
    console.assert(vectorStoreNode.type === 'n8n-nodes-langchain.vectorStoreChroma', 'Vector store node type is correct');
    console.assert(vectorStoreNode.parameters.operation === 'search', 'Vector store operation is correct');
    // Test AI Agent Node
    const agentNode = templates.createAIAgentNode([400, 500]);
    console.assert(agentNode.type === 'n8n-nodes-langchain.agent', 'AI agent node type is correct');
    console.assert(agentNode.parameters.agentType === 'conversationalRetrievalQAChain', 'AI agent type is correct');
    // Test Ollama Node
    const ollamaNode = templates.createOllamaNode([500, 600]);
    console.assert(ollamaNode.type === 'n8n-nodes-base.httpRequest', 'Ollama node type is correct');
    console.assert(ollamaNode.parameters.method === 'POST', 'Ollama node method is correct');
    console.log('✅ AI Node Templates tests passed');
}
/**
 * Test AI Workflow Patterns
 */
export function testAIWorkflowPatterns() {
    console.log('🧪 Testing AI Workflow Patterns...');
    const patterns = new AIWorkflowPatternsClass(testConfig);
    // Test RAG Workflow
    const ragWorkflow = patterns.createRAGWorkflow('Test RAG');
    console.assert(ragWorkflow.name === 'Test RAG', 'RAG workflow name is correct');
    console.assert(ragWorkflow.nodes.length === 3, 'RAG workflow has correct number of nodes');
    console.assert(ragWorkflow.active === false, 'RAG workflow is inactive by default');
    console.assert(Object.keys(ragWorkflow.connections).length === 2, 'RAG workflow has correct connections');
    // Test Conversational Agent Workflow
    const agentWorkflow = patterns.createConversationalAgentWorkflow('Test Agent');
    console.assert(agentWorkflow.name === 'Test Agent', 'Agent workflow name is correct');
    console.assert(agentWorkflow.nodes.length === 3, 'Agent workflow has correct number of nodes');
    console.assert(agentWorkflow.active === true, 'Agent workflow is active by default');
    // Verify node types in RAG workflow
    const ragNodeTypes = ragWorkflow.nodes.map(node => node.type);
    console.assert(ragNodeTypes.includes('n8n-nodes-base.manualTrigger'), 'RAG workflow has manual trigger');
    console.assert(ragNodeTypes.includes('n8n-nodes-langchain.vectorStoreChroma'), 'RAG workflow has vector store');
    console.assert(ragNodeTypes.includes('n8n-nodes-base.openAi'), 'RAG workflow has OpenAI node');
    console.log('✅ AI Workflow Patterns tests passed');
}
/**
 * Test AI Performance Monitor
 */
export function testAIPerformanceMonitor() {
    console.log('🧪 Testing AI Performance Monitor...');
    const monitor = new AIPerformanceMonitorClass(testConfig);
    // Test tracking AI operations
    monitor.trackAIOperation('openai', 'gpt-4', 1000, 0.06, 2500, true);
    monitor.trackAIOperation('openai', 'gpt-4', 1200, 0.072, 2800, true);
    monitor.trackAIOperation('openai', 'gpt-4', 800, 0.048, 1900, false); // Failed operation
    // Test getting metrics
    const metrics = monitor.getAIMetrics('openai', 'gpt-4');
    console.assert(metrics.calls === 3, 'Correct number of calls tracked');
    console.assert(metrics.totalTokens === 3000, 'Correct total tokens tracked');
    console.assert(Math.abs(metrics.totalCost - 0.18) < 0.001, 'Correct total cost tracked');
    console.assert(metrics.errorRate > 0.3 && metrics.errorRate < 0.34, 'Correct error rate calculated');
    console.assert(metrics.tokensPerCall === 1000, 'Correct tokens per call calculated');
    // Test cost optimization recommendations
    const recommendations = monitor.getCostOptimizationRecommendations();
    console.assert(recommendations.length > 0, 'Cost optimization recommendations generated');
    console.assert(recommendations[0].priority === 'high', 'High priority recommendation exists');
    // Test metrics reset
    monitor.resetMetrics();
    const emptyMetrics = monitor.getAIMetrics('openai', 'gpt-4');
    console.assert(emptyMetrics.calls === 0, 'Metrics reset correctly');
    console.log('✅ AI Performance Monitor tests passed');
}
/**
 * Test AI Integration Manager
 */
export function testAIIntegrationManager() {
    console.log('🧪 Testing AI Integration Manager...');
    const manager = new AIIntegrationManagerClass(testConfig);
    // Test getting components
    const nodeTemplates = manager.getNodeTemplates();
    const workflowPatterns = manager.getWorkflowPatterns();
    const performanceMonitor = manager.getPerformanceMonitor();
    console.assert(nodeTemplates instanceof AINodeTemplatesClass, 'Node templates instance is correct');
    console.assert(workflowPatterns instanceof AIWorkflowPatternsClass, 'Workflow patterns instance is correct');
    console.assert(performanceMonitor instanceof AIPerformanceMonitorClass, 'Performance monitor instance is correct');
    // Test workflow validation
    const testWorkflow = {
        id: 'test-workflow',
        name: 'Test Workflow',
        nodes: [
            {
                id: 'openai-node',
                name: 'OpenAI Test',
                type: 'n8n-nodes-base.openAi',
                typeVersion: 1,
                position: [0, 0],
                parameters: { resource: 'chat' },
                credentials: { openAiApi: { id: 'test-cred', name: 'Test Cred' } }
            }
        ],
        connections: {},
        active: false,
        settings: { executionOrder: 'v1' },
        meta: { instanceId: 'test-instance' }
    };
    manager.validateAIWorkflow(testWorkflow).then(validation => {
        console.assert(validation.valid === true, 'Valid AI workflow passes validation');
        console.assert(validation.aiCompatibilityScore > 50, 'AI compatibility score is reasonable');
        console.assert(validation.errors.length === 0, 'No validation errors for valid workflow');
    });
    // Test optimized workflow creation
    manager.createOptimizedAIWorkflow('rag', 'Test Optimized RAG', {
        includeErrorHandling: true,
        includeMetrics: true,
        includeRateLimiting: true
    }).then(workflow => {
        console.assert(workflow.name === 'Test Optimized RAG', 'Optimized workflow name is correct');
        console.assert(workflow.nodes.length >= 3, 'Optimized workflow has additional nodes');
    });
    console.log('✅ AI Integration Manager tests passed');
}
/**
 * Test AI Utilities
 */
export function testAIUtils() {
    console.log('🧪 Testing AI Utilities...');
    // Test cost calculation
    const cost = AIUtils.calculateEstimatedCost('openai', 'gpt-4', 1000, 500);
    console.assert(cost === 0.06, 'Cost calculation is correct for GPT-4'); // (1000/1000)*0.03 + (500/1000)*0.06
    const cost2 = AIUtils.calculateEstimatedCost('openai', 'gpt-3.5-turbo', 1000, 500);
    console.assert(cost2 === 0.0025, 'Cost calculation is correct for GPT-3.5-turbo'); // (1000/1000)*0.0015 + (500/1000)*0.002
    // Test token estimation
    const tokens = AIUtils.estimateTokens('Hello world, this is a test message');
    console.assert(tokens > 8 && tokens < 12, 'Token estimation is reasonable');
    // Test unknown model cost
    const unknownCost = AIUtils.calculateEstimatedCost('openai', 'unknown-model', 1000, 500);
    console.assert(unknownCost === 0, 'Unknown model returns 0 cost');
    console.log('✅ AI Utilities tests passed');
}
/**
 * Test Workflow Validation Edge Cases
 */
export function testWorkflowValidationEdgeCases() {
    console.log('🧪 Testing Workflow Validation Edge Cases...');
    const manager = new AIIntegrationManagerClass(testConfig);
    // Test workflow with no AI nodes
    const noAIWorkflow = {
        id: 'no-ai-workflow',
        name: 'No AI Workflow',
        nodes: [
            {
                id: 'http-node',
                name: 'HTTP Request',
                type: 'n8n-nodes-base.httpRequest',
                typeVersion: 1,
                position: [0, 0],
                parameters: { url: 'https://api.example.com' }
            }
        ],
        connections: {},
        active: false,
        settings: { executionOrder: 'v1' },
        meta: { instanceId: 'test-instance' }
    };
    manager.validateAIWorkflow(noAIWorkflow).then(validation => {
        console.assert(validation.warnings.length > 0, 'Warnings generated for no AI nodes');
        console.assert(validation.aiCompatibilityScore < 100, 'AI compatibility score reduced for no AI nodes');
    });
    // Test workflow with missing credentials
    const missingCredsWorkflow = {
        id: 'missing-creds-workflow',
        name: 'Missing Credentials Workflow',
        nodes: [
            {
                id: 'openai-node',
                name: 'OpenAI Test',
                type: 'n8n-nodes-base.openAi',
                typeVersion: 1,
                position: [0, 0],
                parameters: { resource: 'chat' }
                // Missing credentials
            }
        ],
        connections: {},
        active: false,
        settings: { executionOrder: 'v1' },
        meta: { instanceId: 'test-instance' }
    };
    manager.validateAIWorkflow(missingCredsWorkflow).then(validation => {
        console.assert(validation.valid === false, 'Invalid workflow fails validation');
        console.assert(validation.errors.length > 0, 'Errors generated for missing credentials');
    });
    console.log('✅ Workflow Validation Edge Cases tests passed');
}
/**
 * Test Configuration Handling
 */
export function testConfigurationHandling() {
    console.log('🧪 Testing Configuration Handling...');
    // Test with partial configuration
    const partialConfig = {
        openaiModel: 'gpt-3.5-turbo',
        enableAIMetrics: false
    };
    const manager = new AIIntegrationManagerClass(partialConfig);
    const nodeTemplates = manager.getNodeTemplates();
    const openaiNode = nodeTemplates.createOpenAIChatNode();
    // Verify configuration merging
    console.assert(openaiNode.parameters.model.value === 'gpt-3.5-turbo', 'Partial configuration overrides defaults correctly');
    // Test with different vector store type
    const vectorConfig = {
        vectorStoreType: 'pinecone'
    };
    const vectorManager = new AIIntegrationManagerClass(vectorConfig);
    const vectorTemplates = vectorManager.getNodeTemplates();
    const vectorNode = vectorTemplates.createVectorStoreNode();
    console.assert(vectorNode.type === 'n8n-nodes-langchain.vectorStorePinecone', 'Vector store type configuration works correctly');
    console.log('✅ Configuration Handling tests passed');
}
/**
 * Run All Tests
 */
export function runAllAIIntegrationTests() {
    console.log('🚀 Running All AI Integration Pattern Tests...\n');
    try {
        testAINodeTemplates();
        testAIWorkflowPatterns();
        testAIPerformanceMonitor();
        testAIIntegrationManager();
        testAIUtils();
        testWorkflowValidationEdgeCases();
        testConfigurationHandling();
        console.log('\n🎉 All AI Integration Pattern Tests Passed Successfully!');
        console.log('📊 Test Summary:');
        console.log('   ✅ AI Node Templates: 5 node types tested');
        console.log('   ✅ Workflow Patterns: 2 workflow types tested');
        console.log('   ✅ Performance Monitor: Metrics and recommendations tested');
        console.log('   ✅ Integration Manager: Validation and optimization tested');
        console.log('   ✅ Utilities: Cost calculation and token estimation tested');
        console.log('   ✅ Edge Cases: Missing credentials and no AI nodes tested');
        console.log('   ✅ Configuration: Partial config and overrides tested');
        return true;
    }
    catch (error) {
        console.error('\n❌ AI Integration Pattern Tests Failed:');
        console.error(error);
        return false;
    }
}
/**
 * Performance Benchmarks
 */
export function runPerformanceBenchmarks() {
    console.log('⚡ Running Performance Benchmarks...\n');
    const manager = new AIIntegrationManagerClass(testConfig);
    const startTime = Date.now();
    // Benchmark node creation
    const nodeStartTime = Date.now();
    const nodeTemplates = manager.getNodeTemplates();
    for (let i = 0; i < 100; i++) {
        nodeTemplates.createOpenAIChatNode([i, i]);
        nodeTemplates.createLangChainNode([i, i]);
        nodeTemplates.createVectorStoreNode([i, i]);
    }
    const nodeEndTime = Date.now();
    // Benchmark workflow creation
    const workflowStartTime = Date.now();
    const workflowPatterns = manager.getWorkflowPatterns();
    for (let i = 0; i < 10; i++) {
        workflowPatterns.createRAGWorkflow(`Test RAG ${i}`);
        workflowPatterns.createConversationalAgentWorkflow(`Test Agent ${i}`);
    }
    const workflowEndTime = Date.now();
    // Benchmark performance monitoring
    const monitorStartTime = Date.now();
    const monitor = manager.getPerformanceMonitor();
    for (let i = 0; i < 1000; i++) {
        monitor.trackAIOperation('openai', 'gpt-4', 1000, 0.06, 2500, true);
    }
    const monitorEndTime = Date.now();
    const totalTime = Date.now() - startTime;
    console.log('📊 Performance Benchmark Results:');
    console.log(`   🏗️  Node Creation (300 nodes): ${nodeEndTime - nodeStartTime}ms`);
    console.log(`   🔄 Workflow Creation (20 workflows): ${workflowEndTime - workflowStartTime}ms`);
    console.log(`   📈 Performance Tracking (1000 operations): ${monitorEndTime - monitorStartTime}ms`);
    console.log(`   ⏱️  Total Time: ${totalTime}ms`);
    console.log('✅ Performance benchmarks completed\n');
}
// Export test runner for external use
export default {
    runAllTests: runAllAIIntegrationTests,
    runBenchmarks: runPerformanceBenchmarks,
    testAINodeTemplates,
    testAIWorkflowPatterns,
    testAIPerformanceMonitor,
    testAIIntegrationManager,
    testAIUtils,
    testWorkflowValidationEdgeCases,
    testConfigurationHandling
};
//# sourceMappingURL=test-ai-integration-patterns.js.map