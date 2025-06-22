---
description: AI agent collaboration patterns, Task Master integration, and systematic project continuity approach
globs: **/*
alwaysApply: true
---

# AI Agent Collaboration Patterns

This rule establishes systematic patterns for AI agents working on this project, ensuring consistent tool usage, documentation standards, and collaboration frameworks based on patterns documented in [AI_AGENT_COLLABORATION_GUIDE.md](mdc:docs/AI_AGENT_COLLABORATION_GUIDE.md).

## **Project Context Priority**

**When starting any new session, immediately understand:**
- **Project Type**: n8n Ultimate - AI-powered workflow generation system
- **Current Phase**: Phase 2 - User-friendly production experience  
- **Core Technologies**: Node.js, TypeScript, n8n API, Task Master AI
- **Local AI Models**: PHI4 (main), DeepSeek R1 (research), Claude Sonnet (fallback)
- **Zero-Cost Operation**: Task management using local Ollama models

## **Task Master Integration Patterns**

### **✅ DO: Systematic Task Master Usage**

**Session Initialization:**
```bash
# 1. Check current tasks and status
mcp_task-master-ai_get_tasks

# 2. Identify next task to work on
mcp_task-master-ai_next_task

# 3. Get detailed task context
mcp_task-master-ai_get_task --id=<task-id>
```

**During Implementation:**
```bash
# Start working on a task
mcp_task-master-ai_set_task_status --id=<id> --status=in-progress

# Log detailed progress with timestamps
mcp_task-master-ai_update_subtask --id=<subtask-id> --prompt="
Implementation Progress Update:
- Explored codebase structure in src/dashboard/
- Identified files needing modification: dashboard/index.ts, user-guide/
- Planned approach: Progressive disclosure pattern
- Challenges discovered: Need to integrate with existing template system
"

# Mark completion with verification
mcp_task-master-ai_set_task_status --id=<id> --status=done
```

### **❌ DON'T: Task Master Anti-Patterns**
```bash
# Don't work without task context
# Don't skip progress logging
# Don't mark tasks done without verification
# Don't create tasks without proper description/dependencies
```

## **5-Phase Systematic Methodology**

Apply this to ALL development work:

### **Phase 1: IDENTIFY**
- **Task Context**: Use `get_task` to understand requirements fully
- **Codebase Analysis**: Examine existing patterns and architecture
- **Dependency Check**: Verify all prerequisite tasks are complete
- **Scope Definition**: Clear boundaries of what needs to be accomplished

### **Phase 2: ISOLATE**
- **Component Focus**: Identify specific files/functions to modify
- **Pattern Recognition**: Look for existing similar implementations
- **Risk Assessment**: Identify potential breaking changes
- **Test Strategy**: Plan verification approach

### **Phase 3: FIX/IMPLEMENT**
- **Progressive Implementation**: Start with smallest working change
- **Pattern Consistency**: Follow established project patterns
- **Error Handling**: Include comprehensive error handling
- **Documentation**: Update relevant documentation inline

### **Phase 4: VERIFY**
- **Unit Level**: Test individual functions/components
- **Integration Level**: Test interactions between components
- **System Level**: Test complete feature functionality
- **Edge Cases**: Test error scenarios and boundary conditions

### **Phase 5: DOCUMENT**
- **Task Master Updates**: Log all findings and decisions
- **Rule Updates**: Update rules based on new patterns
- **Execution Log**: Update project execution log
- **Knowledge Preservation**: Ensure future agents can understand decisions

## **Code Development Patterns**

### **✅ DO: Systematic Code Implementation**

**File Organization:**
```typescript
// Follow established project structure
src/
  dashboard/           // UI components with progressive disclosure
  ai-agents/          // AI integration patterns
  error-handling/     // Comprehensive error management
  performance/        // Optimization and caching
  testing/           // Real-world testing framework
```

**Error Handling Pattern:**
```typescript
// Always include comprehensive error handling
try {
  const result = await performOperation(data);
  
  // Log success patterns for learning
  logger.info('Operation successful', { 
    operation: 'workflow-generation',
    data: sanitizedData,
    result: result.id 
  });
  
  return result;
} catch (error) {
  // Log error patterns for debugging
  logger.error('Operation failed', {
    operation: 'workflow-generation',
    error: error.message,
    data: sanitizedData,
    timestamp: new Date().toISOString()
  });
  
  throw new WorkflowGenerationError(
    `Failed to generate workflow: ${error.message}`,
    { originalError: error, data }
  );
}
```

**Testing Integration:**
```typescript
// Always include test strategy
describe('Workflow Generator', () => {
  it('should generate valid n8n workflow', async () => {
    const generator = new WorkflowGenerator();
    const result = await generator.create(testInput);
    
    expect(result).toMatchWorkflowSchema();
    expect(result.nodes).toHaveMinimumLength(1);
    expect(result.connections).toBeValidConnections();
  });
});
```

## **Documentation Standards**

### **Required Documentation for Every Change**
1. **Task Master Updates**: Detailed progress logging
2. **Inline Comments**: Explain complex logic and decisions
3. **README Updates**: If new features or patterns introduced
4. **Rule Updates**: If new patterns established
5. **Execution Log**: Overall project progress tracking

### **Documentation Templates**

**Task Master Progress Update:**
```bash
mcp_task-master-ai_update_subtask --id=<id> --prompt="
Progress Update - [Feature Name]

COMPLETED:
- ✅ Analyzed existing dashboard structure
- ✅ Implemented progressive disclosure pattern
- ✅ Added keyboard shortcuts (Tab/Shift+Tab)
- ✅ Integrated with existing template system

DISCOVERIES:
- Dashboard uses modular component architecture
- Template system already supports categorization
- User guide integration requires additional API endpoints

NEXT STEPS:
- Need to implement API endpoints for user guide
- Should add comprehensive error handling
- Plan testing strategy for UI interactions

DECISIONS MADE:
- Using progressive disclosure for better UX
- Maintaining backward compatibility with existing templates
- Following established TypeScript patterns in src/dashboard/
"
```

## **Quality Standards**

### **Code Quality Gates**
Before marking any task complete:
- [ ] **Functionality**: Feature works as specified
- [ ] **Error Handling**: Comprehensive error management
- [ ] **Testing**: Unit and integration tests pass
- [ ] **Documentation**: Inline and external docs updated
- [ ] **Patterns**: Follows established project patterns
- [ ] **Performance**: No performance regressions
- [ ] **Task Master**: Progress fully logged

### **Documentation Quality Gates**
- [ ] **Clarity**: Clear, actionable instructions
- [ ] **Completeness**: All aspects covered
- [ ] **Examples**: Real code examples included
- [ ] **Context**: Links to related documentation
- [ ] **Maintenance**: Easy to update and extend

## **AI Agent Handoff Patterns**

### **Session Startup Checklist**
```bash
# 1. Load project context
mcp_task-master-ai_get_tasks --withSubtasks=true

# 2. Check execution log
# Read: Execution Log for AI helper.txt

# 3. Review recent progress
mcp_task-master-ai_get_task --id=<last-active-task>

# 4. Understand current phase
# Check: docs/PROJECT_OVERVIEW.md, docs/Roadmap.md
```

### **Session Handoff Template**
When ending a session, update execution log:
```
## Session Summary - [Date]

**Tasks Completed:**
- Task #X.Y: [Description] - Status: done
- Subtask findings logged in Task Master

**Current Status:**
- Working on Task #Z: [Description]
- Phase 2 progress: X% complete
- Next session should focus on: [Specific area]

**Key Decisions Made:**
- [Decision 1 with reasoning]
- [Decision 2 with reasoning]

**Patterns Established:**
- [New pattern identified]
- [Rule updates made]

**For Next AI Agent:**
- Priority: Continue Task #Z, focus on [specific aspect]
- Context: Review Task Master subtask details for full context
- Tools: Use established MCP tool patterns documented in rules
```

## **Tool Integration Priority Order**

1. **Task Master (Primary)**: Always use for task management and progress tracking
2. **Project Documentation**: Refer to docs/ for context and patterns
3. **Execution Log**: Update for project continuity
4. **Code Analysis**: Use codebase_search and file analysis tools
5. **AI Research**: Use research capabilities for up-to-date information
6. **Testing Tools**: Integrate with existing testing framework

## **Collaboration Framework**

### **AI-Human Interaction Patterns**
- **Progress Transparency**: Always show current task status and progress
- **Decision Documentation**: Log all significant decisions with reasoning
- **Context Preservation**: Ensure seamless handoff between sessions
- **Quality Focus**: Never compromise on testing or documentation
- **Learning Integration**: Capture patterns for future improvement

### **Project Continuity Strategy**
- **Knowledge Base**: Comprehensive documentation in docs/
- **Pattern Library**: Established approaches in rules/
- **Progress Tracking**: Detailed Task Master integration
- **Decision History**: Complete reasoning in execution log
- **Quality Standards**: Consistent requirements and gates

## **Emergency Patterns**

### **When Things Break**
1. **Immediate**: Use n8n debugging methodology from rules
2. **Document**: Log in Task Master with full context
3. **Fix**: Apply systematic 5-phase approach
4. **Verify**: Test thoroughly before marking complete
5. **Learn**: Update rules with new patterns discovered

### **When Context is Lost**
1. **Task Master**: `get_tasks` to understand current state
2. **Execution Log**: Read recent entries for context
3. **Documentation**: Review relevant docs/ files
4. **Code Analysis**: Examine recent changes and patterns
5. **Systematic Approach**: Apply 5-phase methodology

## **References**

- [AI_AGENT_COLLABORATION_GUIDE.md](mdc:docs/AI_AGENT_COLLABORATION_GUIDE.md) - Complete collaboration guide
- [N8N_WORKFLOW_DEBUGGING.md](mdc:docs/N8N_WORKFLOW_DEBUGGING.md) - Debugging methodology
- [dev_workflow.md](mdc:.roo/rules/dev_workflow.md) - Task Master workflow guide
- [taskmaster.md](mdc:.roo/rules/taskmaster.md) - Complete tool reference
- [Execution Log for AI helper.txt](mdc:Execution Log for AI helper.txt) - Project history

---

*This framework ensures every AI agent can immediately understand the project context, apply consistent methodologies, and maintain the high quality standards established for n8n Ultimate.* 