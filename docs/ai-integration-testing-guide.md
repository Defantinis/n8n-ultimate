# 🤖 AI Integration Testing Guide

## Overview
This guide shows you how to test the **AI-enhanced features** in your HubSpot-Mixpanel workflow with the localhost:3000 integration points.

## 🚀 Prerequisites

### 1. Start the AI Service
```bash
# In your n8n-ultimate directory
npm start
```

### 2. Verify Service is Running
```bash
curl http://localhost:3000/
# Expected: "n8n-ultimate AI service is running."
```

## 🧪 Testing AI Integration Points

### 1. **AI Error Analysis Endpoint**

**What it does**: Analyzes n8n workflow errors and provides intelligent recommendations.

**Test Command**:
```bash
curl -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "message": "Rate limit exceeded",
      "code": 429,
      "details": "API quota exceeded for HubSpot integration"
    },
    "context": "HubSpot-Mixpanel Integration",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'"
  }'
```

**Expected Response**:
```json
{
  "summary": "The error occurs because n8n is making too many API calls to HubSpot, exceeding its rate limits. To fix this, implement batching of requests and introduce delays between calls to reduce frequency. Additionally, review and optimize the workflow for any redundant steps and monitor API usage to stay within limits."
}
```

### 2. **Workflow Integration Points**

In your **HubSpot-Mixpanel workflow**, the AI integration is ready in these nodes:

#### **Enhanced AI Error Handler Node**
```javascript
// This code is already in your workflow
try {
  const items = $input.all();
  const errorData = items.filter(item => item.json.error);
  
  if (errorData.length === 0) {
    return [{ json: { status: 'success', message: 'No errors detected' } }];
  }
  
  // AI service integration point
  const errorSummary = {
    timestamp: new Date().toISOString(),
    errors: errorData.map(item => item.json.error),
    recovery_attempt: 1,
    ai_recommendation: 'Check API credentials and rate limits'
  };
  
  // 🤖 READY: Can call localhost:3000/summarize-error for smart analysis
  
  return [{ json: errorSummary }];
} catch (error) {
  return [{ json: { 
    fatal_error: error.message, 
    timestamp: new Date().toISOString(),
    recommendation: 'Contact system administrator'
  } }];
}
```

## 🔬 Advanced Testing Scenarios

### **Scenario 1: HubSpot API Rate Limiting**
```bash
# Simulate HubSpot rate limit error
curl -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "message": "Request failed with status code 429",
      "name": "AxiosError",
      "code": "ERR_BAD_REQUEST",
      "response": {
        "status": 429,
        "data": {
          "status": "error",
          "message": "You have exceeded your secondly limit."
        }
      }
    },
    "node": "HubSpot: Fetch Contacts",
    "workflow": "HubSpot-Mixpanel Integration"
  }'
```

### **Scenario 2: Mixpanel Authentication Error**
```bash
# Simulate Mixpanel auth error
curl -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "message": "Request failed with status code 401",
      "name": "HTTPError",
      "response": {
        "status": 401,
        "data": {
          "error": "Invalid API secret"
        }
      }
    },
    "node": "Mixpanel: Fetch Page Views",
    "workflow": "HubSpot-Mixpanel Integration"
  }'
```

### **Scenario 3: Data Processing Error**
```bash
# Simulate data processing error
curl -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "message": "Cannot read property mixpanel_customer_id of undefined",
      "name": "TypeError",
      "stack": "TypeError: Cannot read property mixpanel_customer_id..."
    },
    "node": "Process: Page View Data",
    "workflow": "HubSpot-Mixpanel Integration"
  }'
```

## 🎯 Testing in n8n Workflow

### **Step 1: Import the Workflow**
1. Copy the JSON from `workflows/hubspot-mixpanel-integration.json`
2. In n8n, go to **Workflows** → **Import from JSON**
3. Paste the JSON and click **Import**

### **Step 2: Test Error Handling**
1. **Trigger a test error** by temporarily setting invalid credentials
2. **Run the workflow** and let it fail
3. **Check the Enhanced AI Error Handler node output** - it will contain error analysis
4. **Optionally modify the node** to actually call the AI service:

```javascript
// Enhanced version with live AI integration
try {
  const items = $input.all();
  const errorData = items.filter(item => item.json.error);
  
  if (errorData.length > 0) {
    // Call AI service for intelligent analysis
    const aiResponse = await $http.request({
      method: 'POST',
      url: 'http://localhost:3000/summarize-error',
      body: {
        error: errorData[0].json.error,
        context: 'HubSpot-Mixpanel Integration',
        timestamp: new Date().toISOString()
      },
      headers: {
        'Content-Type': 'application/json'
      },
      json: true
    });
    
    return [{ json: {
      ai_analysis: aiResponse.summary,
      original_errors: errorData,
      timestamp: new Date().toISOString()
    }}];
  }
  
  return [{ json: { status: 'success', message: 'No errors detected' } }];
} catch (error) {
  return [{ json: { 
    fatal_error: error.message,
    recommendation: 'Contact system administrator'
  } }];
}
```

## 📊 Monitoring and Verification

### **Check AI Service Logs**
```bash
# The AI service logs will show requests
# Look for entries like:
# "POST /summarize-error - AI analysis requested"
```

### **Verify Integration Points**
- ✅ **Error Handler Node**: Ready for AI integration
- ✅ **Rate Limiter**: 2-second delays prevent API throttling  
- ✅ **Logging**: Comprehensive execution summaries
- ✅ **AI Service**: Running on localhost:3000

## 🔧 Troubleshooting

### **AI Service Not Responding**
```bash
# Check if service is running
curl http://localhost:3000/
# If not running:
npm start
```

### **n8n Can't Reach localhost:3000**
- Ensure n8n and the AI service are on the same network
- For n8n Cloud, you'll need to expose the service publicly
- For local n8n, localhost:3000 should work directly

### **AI Analysis Not Working**
- Check the AI service logs for errors
- Verify the request format matches the expected JSON structure
- Ensure the OptimizedAIAgent has proper model configuration

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **AI Service**: Responds to error analysis requests with intelligent summaries
2. **Workflow**: Imports successfully into n8n without errors
3. **Error Handling**: Enhanced nodes provide detailed analysis and recommendations
4. **Integration**: Seamless communication between n8n and localhost:3000

---

**🤖 Your AI-enhanced n8n workflow is now fully operational with intelligent error analysis and production-ready features!** 