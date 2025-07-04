---
description: Master priority rule that defines immediate actions and core approach for AI agents on n8n Ultimate
globs: **/*
alwaysApply: true
---

# n8n Ultimate Project Priorities

**CRITICAL**: This rule defines the immediate actions every AI agent must take when starting work on this project.

## **Immediate Session Startup Actions**

### **1. Project Context Recognition**
```bash
# REQUIRED: Understand project immediately
Project: n8n Ultimate - AI-powered workflow generation system
Phase: Phase 2 - User-friendly production experience (25% complete)
AI Models: PHI4 (main), DeepSeek R1 (research), Claude Sonnet (fallback)
Operation: Zero-cost using local Ollama models
```

### **2. Task Master Integration (MANDATORY)**
```bash
# STEP 1: Get current project status
mcp_task-master-ai_get_tasks

# STEP 2: Identify what to work on next
mcp_task-master-ai_next_task

# STEP 3: Load specific task context
mcp_task-master-ai_get_task --id=<current-task-id>
```

### **3. Knowledge Base Access**
- **Read**: [Execution Log for AI helper.txt](mdc:Execution Log for AI helper.txt) - Project history
- **Reference**: [AI_AGENT_COLLABORATION_GUIDE.md](mdc:docs/AI_AGENT_COLLABORATION_GUIDE.md) - Tool patterns
- **Reference**: [N8N_WORKFLOW_DEBUGGING.md](mdc:docs/N8N_WORKFLOW_DEBUGGING.md) - Debugging methodology

## **Core Priorities Hierarchy**

### **Priority 1: For Future AI Agents**
- **✅ Systematic Approach**: Apply 5-phase methodology (IDENTIFY → ISOLATE → FIX → VERIFY → DOCUMENT)
- **✅ Tool Integration**: Proper Task Master usage with comprehensive logging
- **✅ Real Examples**: Reference actual fixes and established patterns
- **✅ Quality Standards**: Comprehensive testing and documentation requirements

### **Priority 2: For Project Continuity**
- **✅ Knowledge Base**: Comprehensive troubleshooting guide maintenance
- **✅ Best Practices**: Established patterns for workflow development
- **✅ Tool Usage**: Documented approach using our own systems
- **✅ Collaboration Framework**: Clear AI-human interaction patterns

## **Non-Negotiable Standards**

### **Every Implementation Must Include:**
- [ ] **Task Master Integration**: Progress logged with timestamps
- [ ] **5-Phase Methodology**: Systematic approach applied
- [ ] **Error Handling**: Comprehensive error management
- [ ] **Testing Strategy**: Unit, integration, and end-to-end testing
- [ ] **Documentation Updates**: Both inline and external documentation
- [ ] **Pattern Consistency**: Follows established project patterns

### **Quality Gates (Never Skip):**
- [ ] **Functionality Verified**: Feature works as specified
- [ ] **Error Scenarios Tested**: Edge cases and failure modes handled
- [ ] **Documentation Complete**: Clear, actionable instructions provided
- [ ] **Progress Logged**: Task Master updated with findings
- [ ] **Rules Updated**: New patterns captured for future agents

## **Systematic Methodology (Apply to Everything)**

### **Phase 1: IDENTIFY**
- Load task context using Task Master
- Analyze existing codebase patterns
- Verify prerequisite tasks completed
- Define clear implementation scope

### **Phase 2: ISOLATE**
- Identify specific files/components to modify
- Recognize existing similar implementations
- Assess potential breaking changes
- Plan comprehensive testing strategy

### **Phase 3: FIX/IMPLEMENT**
- Start with smallest working change
- Follow established project patterns
- Include comprehensive error handling
- Update documentation inline

### **Phase 4: VERIFY**
- Test individual components
- Verify component interactions
- Execute end-to-end functionality
- Test error scenarios and edge cases

### **Phase 5: DOCUMENT**
- Update Task Master with detailed findings
- Update rules with new patterns discovered
- Update execution log with session summary
- Ensure future agents can understand decisions

## **n8n Workflow Specific Priorities**

### **Critical Success Factors:**
- **Field Name Consistency**: #1 cause of workflow failures
- **Progressive Testing**: Individual nodes → connections → end-to-end
- **Complete HTTP Configuration**: Method, headers, parameters
- **Comprehensive Error Handling**: Graceful degradation patterns

### **Debugging Approach:**
```bash
# Use established 5-phase n8n debugging methodology
# Log all findings in Task Master with:
mcp_task-master-ai_update_subtask --id=<id> --prompt="[Phase] [Finding] [Solution] [Next Steps]"
```

## **AI Agent Collaboration Patterns**

### **Session Handoff Template:**
```
## Session Summary - [Date/Time]
**Tasks Completed:** [List with Task Master IDs]
**Current Status:** [Working on Task #X]
**Key Decisions:** [With reasoning]
**Patterns Established:** [New rules/approaches]
**For Next Agent:** [Specific focus area and context]
```

### **Tool Priority Order:**
1. **Task Master** (Primary) - Always use for task management
2. **Project Documentation** - Reference docs/ for context
3. **Execution Log** - Update for continuity
4. **Code Analysis** - Use codebase_search and file analysis
5. **AI Research** - Use for up-to-date information
6. **Testing Tools** - Integrate with existing framework

## **Emergency Procedures**

### **When Context is Lost:**
1. **Task Master**: `mcp_task-master-ai_get_tasks` to understand state
2. **Execution Log**: Read recent entries for context
3. **Documentation**: Review relevant docs/ files
4. **Code Analysis**: Examine recent changes
5. **Systematic Approach**: Apply 5-phase methodology

### **When Things Break:**
1. **Immediate**: Apply n8n debugging methodology
2. **Document**: Log in Task Master with full context
3. **Fix**: Use systematic 5-phase approach
4. **Verify**: Test thoroughly before marking complete
5. **Learn**: Update rules with discovered patterns

## **Success Metrics**

### **Every Session Must Achieve:**
- [ ] **Task Progress**: Measurable advancement on assigned tasks
- [ ] **Quality Standards**: All quality gates passed
- [ ] **Knowledge Preservation**: Patterns and decisions documented
- [ ] **Continuity**: Clear handoff for next agent/session
- [ ] **Learning**: Rules updated with new discoveries

## **References (Always Available)**

- [ai_collaboration_patterns.md](mdc:.roo/rules/ai_collaboration_patterns.md) - Complete collaboration guide
- [n8n_workflow_debugging.md](mdc:.roo/rules/n8n_workflow_debugging.md) - n8n debugging methodology
- [taskmaster.md](mdc:.roo/rules/taskmaster.md) - Complete Task Master reference
- [AI_AGENT_COLLABORATION_GUIDE.md](mdc:docs/AI_AGENT_COLLABORATION_GUIDE.md) - Detailed tool usage
- [N8N_WORKFLOW_DEBUGGING.md](mdc:docs/N8N_WORKFLOW_DEBUGGING.md) - Complete debugging guide
- [Execution Log for AI helper.txt](mdc:Execution Log for AI helper.txt) - Project evolution history

---

**REMEMBER**: Every action should advance the project toward Phase 2 completion while maintaining the systematic approach and quality standards that make this project a model for AI-human collaboration. 