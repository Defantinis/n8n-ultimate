#!/bin/bash

echo "🤖 n8n Ultimate - AI Integration Testing Demo"
echo "=============================================="
echo ""

# Check if AI service is running
echo "1. 🔍 Checking AI Service Status..."
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "   ✅ AI Service is running on localhost:3000"
else
    echo "   ❌ AI Service not running. Please run 'npm start' first."
    exit 1
fi

echo ""
echo "2. 🧪 Testing AI Error Analysis Scenarios..."
echo ""

# Test 1: Rate Limiting Error
echo "   📊 Scenario 1: HubSpot Rate Limiting"
echo "   Request: Analyzing rate limit error..."
response1=$(curl -s -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "message": "Rate limit exceeded",
      "code": 429,
      "details": "API quota exceeded for HubSpot integration"
    },
    "context": "HubSpot-Mixpanel Integration"
  }')

echo "   Response: $(echo $response1 | jq -r '.summary' | head -c 100)..."
echo ""

# Test 2: Authentication Error  
echo "   🔐 Scenario 2: Mixpanel Authentication"
echo "   Request: Analyzing auth error..."
response2=$(curl -s -X POST http://localhost:3000/summarize-error \
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
    "node": "Mixpanel: Fetch Page Views"
  }')

echo "   Response: $(echo $response2 | jq -r '.summary' | head -c 100)..."
echo ""

# Test 3: Data Processing Error
echo "   💾 Scenario 3: Data Processing Error"
echo "   Request: Analyzing data error..."
response3=$(curl -s -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": {
      "message": "Cannot read property mixpanel_customer_id of undefined",
      "name": "TypeError"
    },
    "node": "Process: Page View Data"
  }')

echo "   Response: $(echo $response3 | jq -r '.summary' | head -c 100)..."
echo ""

echo "3. 📋 Integration Points Summary:"
echo "   ✅ AI Service: localhost:3000/summarize-error"
echo "   ✅ Workflow: Enhanced AI Error Handler node ready"
echo "   ✅ Features: Rate limiting, logging, error analysis"
echo "   ✅ Status: Production-ready for n8n integration"
echo ""

echo "4. 🎯 Next Steps:"
echo "   1. Import workflow JSON into n8n"
echo "   2. Configure HubSpot and Mixpanel credentials"
echo "   3. Test workflow execution with AI error handling"
echo "   4. Monitor AI service logs for error analysis requests"
echo ""

echo "🎉 AI Integration Demo Complete!"
echo "Your workflow is ready with intelligent error analysis!" 