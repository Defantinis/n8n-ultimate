---
description: Systematic methodology for debugging n8n workflows, established patterns, and real-world solutions
globs: **/*.json, workflows/**/*
alwaysApply: true
---

# n8n Workflow Debugging Methodology

This rule establishes the systematic 5-phase debugging approach for n8n workflows, based on real-world patterns and solutions documented in [N8N_WORKFLOW_DEBUGGING.md](mdc:docs/N8N_WORKFLOW_DEBUGGING.md).

## **Core Debugging Philosophy**

- **Field Name Consistency**: The #1 cause of n8n workflow failures
- **Progressive Testing**: Individual nodes → connections → end-to-end
- **Error Pattern Recognition**: HTTP 500 errors have predictable root causes
- **Graceful Degradation**: Always include comprehensive error handling

## **5-Phase Debugging Methodology**

### **Phase 1: IDENTIFY**
- **HTTP 500 Errors**: Check trigger configuration, field mappings, HTTP parameters
- **Node Failures**: Verify node-specific requirements (credentials, parameters, data types)
- **Data Flow Issues**: Trace data transformation between connected nodes
- **Field Consistency**: Look for mismatched field names across the workflow

### **Phase 2: ISOLATE**
```javascript
// ✅ DO: Test individual components
// Test schedule trigger independently
// Verify HTTP requests with hardcoded values
// Check data transformations with sample data

// ❌ DON'T: Test entire workflow at once
// Skip individual node validation
// Assume data flow without verification
```

### **Phase 3: FIX**
**Critical Fix Patterns:**
- **Schedule Triggers**: Always include complete cron configuration
- **HTTP Requests**: Specify method, headers, and parameter structure
- **Field References**: Use consistent naming (customer_id vs mixpanel_customer_id)
- **Data Transformations**: Handle undefined/null values gracefully

### **Phase 4: VERIFY**
- **Individual Node Testing**: Each node executes successfully in isolation
- **Connection Testing**: Data flows correctly between connected nodes
- **End-to-End Testing**: Complete workflow executes without errors
- **Error Scenarios**: Graceful handling of edge cases and failures

### **Phase 5: DOCUMENT**
- **Update Task Master**: Log findings using `update_subtask` with timestamps
- **Pattern Documentation**: Record successful patterns for future reference
- **Error Solutions**: Document specific fixes for common error patterns

## **Field Name Consistency Patterns**

### **✅ DO: Consistent Field Naming**
```json
{
  "customer_id": "12345",           // Use throughout workflow
  "mixpanel_customer_id": "12345",  // Explicit mapping when needed
  "contact_id": "67890"             // Clear, consistent naming
}
```

### **❌ DON'T: Inconsistent Field References**
```json
{
  "customerId": "12345",      // CamelCase
  "customer_id": "12345",     // Snake_case  
  "CustomerID": "12345"       // PascalCase
}
```

## **HTTP Node Configuration Patterns**

### **✅ DO: Complete HTTP Configuration**
```json
{
  "method": "GET",
  "url": "https://api.example.com/endpoint",
  "headers": {
    "Authorization": "Bearer {{$credentials.token}}",
    "Content-Type": "application/json"
  },
  "qs": {
    "param1": "{{$json.field1}}",
    "param2": "{{$json.field2}}"
  }
}
```

### **❌ DON'T: Incomplete HTTP Configuration**
```json
{
  "url": "https://api.example.com/endpoint"
  // Missing method, headers, parameters
}
```

## **Error Handling Patterns**

### **✅ DO: Comprehensive Error Handling**
```javascript
// In Function nodes
try {
  const result = items.map(item => {
    const data = item.json;
    
    // Validate required fields
    if (!data.customer_id) {
      return { 
        error: 'Missing customer_id',
        original_data: data 
      };
    }
    
    // Process data
    return { 
      processed: true,
      customer_id: data.customer_id,
      result: processData(data)
    };
  });
  
  return result;
} catch (error) {
  return [{ 
    error: error.message,
    timestamp: new Date().toISOString()
  }];
}
```

## **Real-World Integration Patterns**

Based on successful HubSpot → Mixpanel integration:

### **API Integration Checklist**
- [ ] **Credentials**: Service Account authentication configured
- [ ] **Rate Limiting**: Appropriate delays between API calls
- [ ] **Data Mapping**: Consistent field names across all nodes
- [ ] **Error Logging**: Structured error information for debugging
- [ ] **Fallback Handling**: Graceful degradation when APIs are unavailable

### **Schedule Trigger Configuration**
```json
{
  "rule": {
    "interval": [{
      "field": "cronExpression",
      "value": "0 */6 * * *"  // Every 6 hours
    }]
  },
  "triggerOn": "schedule"
}
```

## **Testing Strategy**

### **Progressive Testing Approach**
1. **Node-Level**: Test each node individually with sample data
2. **Connection-Level**: Verify data flow between connected nodes
3. **Workflow-Level**: Execute complete workflow end-to-end
4. **Edge-Case-Level**: Test error scenarios and edge cases

### **Common Testing Commands**
```bash
# Test workflow import
n8n execute --file workflow.json

# Validate workflow structure  
n8n validate --file workflow.json

# Debug specific execution
n8n execute --file workflow.json --verbose
```

## **Task Master Integration**

When debugging n8n workflows, use Task Master systematically:

```bash
# Log debugging progress
task-master update-subtask --id=<subtask-id> --prompt="
Phase 1 IDENTIFY: Found HTTP 500 error in HubSpot node
- Root cause: Missing customer_id field mapping
- Affected nodes: HubSpot Contact Fetch, Mixpanel Update
- Error pattern: Field name inconsistency
"

# Mark phases complete
task-master set-status --id=<subtask-id> --status=done
```

## **Documentation Requirements**

Every n8n workflow fix must include:
- **Problem Description**: Specific error messages and affected nodes
- **Root Cause Analysis**: Why the error occurred
- **Solution Implementation**: Exact changes made
- **Testing Results**: Verification that fix works
- **Prevention Strategy**: How to avoid similar issues

## **Quality Gates**

Before marking any n8n workflow task complete:
- [ ] All HTTP 500 errors resolved
- [ ] Field name consistency verified
- [ ] Error handling implemented
- [ ] End-to-end testing passed
- [ ] Documentation updated
- [ ] Task Master progress logged

## **References**

- [N8N_WORKFLOW_DEBUGGING.md](mdc:docs/N8N_WORKFLOW_DEBUGGING.md) - Complete debugging guide
- [AI_AGENT_COLLABORATION_GUIDE.md](mdc:docs/AI_AGENT_COLLABORATION_GUIDE.md) - Tool usage patterns
- [HubSpot-Mixpanel Integration](mdc:workflows/hubspot-mixpanel-integration.json) - Working example

---

*This systematic approach ensures consistent, high-quality n8n workflow development and maintenance.* 