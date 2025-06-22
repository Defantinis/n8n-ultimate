# 🔧 **n8n Workflow Debugging Guide**
## Comprehensive Troubleshooting for n8n Ultimate

---

## **🚨 CRITICAL ERROR PATTERNS**

### **HTTP 500 Internal Server Errors**

**Most Common Causes:**
1. **Empty Node Parameters** - Critical fields left undefined
2. **Field Name Mismatches** - Data flowing between incompatible field names
3. **Missing HTTP Configuration** - Incomplete request setup
4. **Authentication Issues** - Credential configuration problems
5. **Data Transformation Errors** - JavaScript code referencing wrong fields

---

## **🎯 SYSTEMATIC DEBUGGING APPROACH**

### **Phase 1: Error Identification**

#### **Console Log Analysis**
Look for these patterns in browser developer tools:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
/rest/dynamic-node-parameters/options:1
/rest/workflows/[id]/run?partialExecutionVersion=2:1
```

#### **Error Location Mapping**
- **Node Parameter Errors**: `/rest/dynamic-node-parameters/options`
- **Workflow Execution Errors**: `/rest/workflows/[id]/run`
- **Credential Errors**: Authentication-related 500s
- **Data Flow Errors**: Between connected nodes

### **Phase 2: Systematic Inspection**

#### **Node-by-Node Checklist**

**1. Trigger Nodes (Schedule, Webhook, etc.)**
```json
✅ Check: {
  "parameters": {
    "rule": {
      "interval": [{"field": "hours", "hoursInterval": 2}]
    }
  }
}

❌ Avoid: {
  "parameters": {}  // Empty parameters cause 500 errors
}
```

**2. HTTP Request Nodes**
```json
✅ Required Fields: {
  "requestMethod": "GET|POST|PUT|DELETE",
  "url": "https://api.example.com/endpoint",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpBasicAuth"
}

✅ Query Parameters: {
  "sendQuery": true,
  "queryParameters": {
    "parameters": [
      {"name": "param1", "value": "value1"}
    ]
  }
}

✅ Headers: {
  "options": {
    "headers": {
      "entries": [
        {"name": "Accept", "value": "application/json"}
      ]
    }
  }
}
```

**3. API Integration Nodes (HubSpot, etc.)**
```json
✅ Required Fields: {
  "authentication": "appToken",
  "resource": "contact",
  "operation": "getAll|update|create",
  "returnAll": false,
  "limit": 100
}

✅ Update Operations: {
  "operation": "update",
  "contactId": "={{ $json.hubspot_id }}",
  "updateFields": {
    "customProperties": {
      "property": [
        {"name": "field_name", "value": "{{ $json.value }}"}
      ]
    }
  }
}
```

**4. Filter/Condition Nodes**
```json
✅ Complete Conditions: {
  "conditions": {
    "string": [
      {
        "value1": "={{ $json.field_name }}",
        "operation": "isNotEmpty"
      }
    ],
    "number": [
      {
        "value1": "={{ $json.numeric_field }}",
        "operation": "notEqual",
        "value2": 0  // Always include value2 for comparisons
      }
    ]
  }
}
```

**5. Code/Function Nodes**
```javascript
// ✅ Robust JavaScript patterns
const results = [];

for (const item of $input.all()) {
  try {
    // Always use consistent field names
    const processedItem = {
      id: item.json.id,
      // Reference correct field names from previous nodes
      customer_id: item.json.properties.mixpanel_customer_id,
      email: item.json.properties.email
    };
    
    // Validate required fields before processing
    if (processedItem.customer_id && processedItem.email) {
      results.push({ json: processedItem });
    }
  } catch (error) {
    console.error(`Processing error for item ${item.json.id}:`, error);
    // Continue processing other items
  }
}

console.log(`Processed ${results.length} valid items`);
return results;
```

---

## **🔍 FIELD NAME CONSISTENCY DEBUGGING**

### **Common Mismatch Patterns**

**Problem:** Data flows between nodes but field names don't match
```json
Node A outputs: {"properties": {"customer_id": "123"}}
Node B filters: {"value1": "={{ $json.properties.mixpanel_customer_id }}"}
```

**Solution:** Map field names systematically
1. **Document field mapping** between systems
2. **Use transform nodes** to standardize field names
3. **Test data flow** with small datasets first

### **Field Mapping Template**
```javascript
// Standardize field names across workflow
const standardizedData = {
  // Use consistent naming convention
  hubspot_id: item.json.id,
  customer_id: item.json.properties.mixpanel_customer_id, // Note the source field
  email: item.json.properties.email,
  name: `${item.json.properties.firstname || ''} ${item.json.properties.lastname || ''}`.trim()
};
```

---

## **🔐 CREDENTIAL CONFIGURATION**

### **HTTP Basic Auth Setup**
```json
{
  "name": "Service Account",
  "type": "httpBasicAuth",
  "data": {
    "user": "your_username_or_project_id",
    "password": "your_api_secret"
  }
}
```

### **API Token Setup**
```json
{
  "name": "HubSpot App Token", 
  "type": "hubspotAppToken",
  "data": {
    "appToken": "your_private_app_token"
  }
}
```

### **Credential Testing Pattern**
1. **Create simple test node** with minimal parameters
2. **Test authentication** before building complex workflows
3. **Use dedicated test endpoints** when available
4. **Monitor API rate limits** during testing

---

## **⚡ PERFORMANCE & RATE LIMITING**

### **Batch Processing Pattern**
```json
{
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 5,  // Adjust based on API rate limits
    "options": {}
  }
}
```

### **Rate Limiting Best Practices**
- **Start with small batches** (5-10 items)
- **Monitor API response times** and adjust accordingly
- **Add delays** between batches if needed
- **Implement retry logic** for failed requests

---

## **📊 ERROR HANDLING PATTERNS**

### **Comprehensive Error Logging**
```javascript
// Enhanced error handling with context
const errorInfo = {
  workflow_name: 'Integration Name',
  error_time: new Date().toISOString(),
  error_node: $node.name,
  error_message: $input.first()?.json?.error?.message || 'Unknown error',
  input_data: $input.first()?.json || {},
  execution_id: $execution.id,
  user_context: {
    total_items: $input.all().length,
    current_item: $input.first()?.json?.id
  }
};

console.error('🚨 Workflow Error:', JSON.stringify(errorInfo, null, 2));
return [{ json: errorInfo }];
```

### **Graceful Degradation**
```javascript
// Continue processing even when individual items fail
const successes = [];
const failures = [];

for (const item of $input.all()) {
  try {
    // Process item
    const result = processItem(item);
    successes.push(result);
  } catch (error) {
    failures.push({
      item: item.json.id,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

console.log(`✅ Processed: ${successes.length}, ❌ Failed: ${failures.length}`);
return successes.map(item => ({ json: item }));
```

---

## **🧪 TESTING STRATEGIES**

### **Progressive Testing Approach**

#### **Phase 1: Individual Node Testing**
- Test each node independently
- Use small, known datasets
- Verify output data structure
- Check field name consistency

#### **Phase 2: Connection Testing**
- Test node-to-node data flow
- Verify field mapping between nodes
- Check data transformation accuracy
- Validate filter logic

#### **Phase 3: End-to-End Testing**
- Run complete workflow with test data
- Monitor execution logs for errors
- Check final output accuracy
- Verify error handling behavior

### **Test Data Patterns**
```json
// Minimal test contact for HubSpot
{
  "id": "test123",
  "properties": {
    "email": "test@example.com",
    "firstname": "Test",
    "lastname": "User",
    "mixpanel_customer_id": "test_customer_123"
  }
}
```

---

## **📋 DEBUGGING CHECKLIST**

### **Pre-Deployment Checklist**
- [ ] All nodes have required parameters filled
- [ ] Field names are consistent across connected nodes
- [ ] HTTP requests include method, headers, and parameters
- [ ] Credentials are properly configured and tested
- [ ] Error handling is implemented in code nodes
- [ ] Batch sizes are appropriate for API rate limits
- [ ] Test data flows correctly through all nodes

### **Post-Error Checklist**
- [ ] Console logs reviewed for specific error patterns
- [ ] Each node parameters inspected individually
- [ ] Field name mapping verified between nodes
- [ ] Credentials re-tested with simple requests
- [ ] Data transformations validated with test data
- [ ] Error handling enhanced based on failure patterns

### **Documentation Checklist**
- [ ] Error cause identified and documented
- [ ] Fix applied and verified
- [ ] Test cases created for regression prevention
- [ ] Knowledge base updated with new patterns
- [ ] Team notified of resolution and learnings

---

## **🔄 COMMON FIX PATTERNS**

### **Schedule Trigger Fix**
```json
// Before (causes 500 error)
{"parameters": {}}

// After (works correctly)
{
  "parameters": {
    "rule": {
      "interval": [
        {"field": "hours", "hoursInterval": 2}
      ]
    }
  }
}
```

### **HTTP Request Fix**
```json
// Before (incomplete)
{
  "url": "https://api.example.com",
  "authentication": "genericCredentialType",
  "options": {}
}

// After (complete)
{
  "requestMethod": "GET",
  "url": "https://api.example.com/endpoint",
  "authentication": "genericCredentialType", 
  "genericAuthType": "httpBasicAuth",
  "sendQuery": true,
  "queryParameters": {
    "parameters": [
      {"name": "param", "value": "{{ $json.value }}"}
    ]
  },
  "options": {
    "headers": {
      "entries": [
        {"name": "Accept", "value": "application/json"}
      ]
    }
  }
}
```

### **Field Reference Fix**
```javascript
// Before (field mismatch)
const customer_id = item.json.properties.customer_id;

// After (correct field name)
const customer_id = item.json.properties.mixpanel_customer_id;
```

---

**💡 Remember: Most n8n 500 errors are configuration issues, not code bugs. Systematic parameter checking resolves 90% of workflow failures!** 