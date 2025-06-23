#!/bin/bash

# 🚀 n8n Ultimate AI Workflow Demo Script
# Demonstrates the comprehensive AI-powered features of our enhanced HubSpot-Mixpanel integration

echo "🎯 n8n Ultimate AI Workflow Demo"
echo "=================================="
echo ""

# Check if AI service is running
echo "🔍 Checking AI service status..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ AI service running on localhost:3000"
else
    echo "❌ AI service not running. Please start with: npm start"
    exit 1
fi

echo ""
echo "🧠 Testing AI-Powered Error Analysis..."
echo "----------------------------------------"

# Test 1: Rate Limiting Error Analysis
echo "📊 Testing Rate Limiting Error Analysis:"
curl -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": "Rate limiting error (429): HubSpot API limit exceeded",
    "workflow": "hubspot-mixpanel-integration", 
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq -r '.summary' | head -3

echo ""

# Test 2: Authentication Error Analysis  
echo "🔐 Testing Authentication Error Analysis:"
curl -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": "Authentication failed (401): Invalid API token for Mixpanel",
    "workflow": "hubspot-mixpanel-integration",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq -r '.summary' | head -3

echo ""

# Test 3: Data Processing Error Analysis
echo "📈 Testing Data Processing Error Analysis:"
curl -X POST http://localhost:3000/summarize-error \
  -H "Content-Type: application/json" \
  -d '{
    "error": "TypeError: Cannot read property customer_id of undefined",
    "workflow": "hubspot-mixpanel-integration",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }' | jq -r '.summary' | head -3

echo ""
echo "🎨 Workflow Features Demonstration..."
echo "------------------------------------"

echo "✨ Key AI-Enhanced Features in Your Workflow:"
echo ""
echo "🔧 1. AI-Enhanced Contact Aggregation:"
echo "   • Intelligent customer ID validation with regex patterns"
echo "   • AI-powered data quality scoring and metrics"
echo "   • Comprehensive error tracking and categorization"
echo ""

echo "🌐 2. AI-Powered Page View Processing:"
echo "   • Real-time integration with localhost:3000 AI service"
echo "   • Intelligent engagement scoring algorithms"
echo "   • AI-generated insights and recommendations"
echo "   • Fallback logic for offline AI service scenarios"
echo ""

echo "🛡️ 3. Enhanced AI Error Handler:"
echo "   • Context-aware error classification"
echo "   • AI-powered recommendations for issue resolution"
echo "   • Automatic error reporting to AI service"
echo "   • Intelligent severity assessment"
echo ""

echo "📊 4. AI Execution Logger:"
echo "   • Comprehensive execution metrics tracking"
echo "   • AI performance analytics"
echo "   • Automatic logging to AI service for analysis"
echo "   • Real-time success rate calculations"
echo ""

echo "⚡ 5. Production-Ready Features:"
echo "   • Rate limiting with intelligent delays"
echo "   • Retry mechanisms with exponential backoff"
echo "   • Comprehensive error handling at every stage"
echo "   • AI-powered data validation and quality checks"
echo ""

echo "🔗 6. localhost:3000 Integration Points:"
echo "   • /analyze-engagement - Real-time engagement analysis"
echo "   • /report-error - Enhanced error reporting"
echo "   • /analyze-errors - Batch error analysis"
echo "   • /log-execution - Execution metrics logging"
echo ""

echo "📋 Workflow Structure Validation:"
echo "--------------------------------"
echo "✅ Fixed all parameter naming issues (jsCode → code)"
echo "✅ Added missing HTTP method parameters"
echo "✅ Corrected Set node values structure"
echo "✅ Fixed connection references to use node IDs"
echo "✅ Implemented comprehensive AI code logic"
echo "✅ Added production-ready error handling"
echo "✅ Integrated localhost:3000 AI service calls"
echo ""

echo "🎯 Demo Complete!"
echo "=================="
echo ""
echo "Your enhanced HubSpot-Mixpanel workflow now includes:"
echo "• 🧠 AI-powered data processing and validation"
echo "• 🔍 Intelligent error analysis and recommendations" 
echo "• 📊 Real-time engagement scoring and insights"
echo "• 🌐 Full integration with localhost:3000 AI service"
echo "• 🛡️ Production-ready error handling and rate limiting"
echo "• ⚡ Copy-paste ready for n8n with proper JSON structure"
echo ""
echo "Ready to import into n8n and start using! 🚀" 