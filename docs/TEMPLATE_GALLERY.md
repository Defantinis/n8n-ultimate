# Template Gallery & Documentation

Welcome to the **n8n Ultimate Template Gallery**! This comprehensive collection provides ready-to-use workflow templates for common automation scenarios, complete with setup instructions and customization guides.

## 📋 Table of Contents

1. [Quick Start Templates](#quick-start-templates)
2. [API Integration Templates](#api-integration-templates)
3. [Data Processing Templates](#data-processing-templates)
4. [Monitoring & Alerting Templates](#monitoring--alerting-templates)
5. [E-commerce Templates](#e-commerce-templates)
6. [Customer Support Templates](#customer-support-templates)
7. [Template Usage Guide](#template-usage-guide)
8. [Customization Guidelines](#customization-guidelines)

---

## 🚀 Quick Start Templates

### 1. Basic API Workflow
**File**: `src/templates/basic-api-workflow.json`  
**Complexity**: ⭐ Beginner  
**Use Case**: Simple API data fetching and processing

#### What it does:
- Fetches data from any REST API
- Processes the response data
- Outputs structured results

#### Configuration:
```json
{
  "API_URL": "https://api.example.com/data",
  "method": "GET"
}
```

#### Setup Instructions:
1. Import the template into n8n
2. Replace `{{API_URL}}` with your target API endpoint
3. Customize the data processing logic in the "Process Data" node
4. Test with the Execute Workflow button

#### Customization Options:
- **Authentication**: Add credentials for API access
- **Headers**: Include custom headers for API requests
- **Data Transformation**: Modify the Set node for specific data processing
- **Error Handling**: Add error handling nodes for robust operation

---

### 2. Ultra-Simple HTTP Test
**Complexity**: ⭐ Beginner  
**Use Case**: Basic HTTP connectivity testing

```json
{
  "name": "Ultra-Simple HTTP Test",
  "description": "Minimal workflow to test HTTP connectivity",
  "nodes": [
    {
      "id": "start",
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "position": [100, 200]
    },
    {
      "id": "http_test",
      "name": "HTTP Test",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://httpbin.org/get",
        "method": "GET"
      },
      "position": [300, 200]
    }
  ],
  "connections": {
    "Start": {
      "main": [
        [{ "node": "HTTP Test", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

#### Use Cases:
- Testing n8n HTTP functionality
- Validating external API connectivity
- Basic workflow debugging

---

## 🔗 API Integration Templates

### 3. REST API Data Pipeline
**Complexity**: ⭐⭐ Intermediate  
**Use Case**: Complete API integration with error handling

```json
{
  "name": "REST API Data Pipeline",
  "description": "Robust API integration with authentication and error handling",
  "nodes": [
    {
      "id": "webhook_trigger",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "api-pipeline",
        "httpMethod": "POST"
      }
    },
    {
      "id": "validate_input",
      "name": "Validate Input",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Input validation\\nconst requiredFields = ['endpoint', 'method'];\\nconst missingFields = requiredFields.filter(field => !items[0].json[field]);\\n\\nif (missingFields.length > 0) {\\n  throw new Error(`Missing required fields: ${missingFields.join(', ')}`);\\n}\\n\\nreturn items;"
      }
    },
    {
      "id": "api_call",
      "name": "API Call with Retry",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$json.endpoint}}",
        "method": "={{$json.method}}",
        "options": {
          "timeout": 10000,
          "retry": {
            "enabled": true,
            "maxRetries": 3
          }
        }
      }
    }
  ]
}
```

#### Features:
- ✅ Input validation
- ✅ Automatic retry logic
- ✅ Response transformation
- ✅ Error handling

---

## 📊 Data Processing Templates

### 4. CSV Data Processor
**Complexity**: ⭐⭐ Intermediate  
**Use Case**: Process and transform CSV data

```json
{
  "name": "CSV Data Processor",
  "description": "Read, validate, and transform CSV data",
  "nodes": [
    {
      "id": "file_trigger",
      "name": "File Trigger",
      "type": "n8n-nodes-base.localFileTrigger",
      "parameters": {
        "path": "/data/input/",
        "fileExtension": "csv"
      }
    },
    {
      "id": "read_csv",
      "name": "Read CSV",
      "type": "n8n-nodes-base.readBinaryFile"
    },
    {
      "id": "parse_csv",
      "name": "Parse CSV",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// CSV parsing with validation\\nconst csv = require('csv-parse/sync');\\nconst fileContent = items[0].binary.data.toString();\\n\\ntry {\\n  const records = csv.parse(fileContent, {\\n    columns: true,\\n    skip_empty_lines: true\\n  });\\n  return records.map(record => ({ json: record }));\\n} catch (error) {\\n  throw new Error(`CSV parsing failed: ${error.message}`);\\n}"
      }
    }
  ]
}
```

#### Features:
- ✅ Automatic file monitoring
- ✅ CSV parsing with error handling
- ✅ Data validation and cleaning

---

## 📈 Monitoring & Alerting Templates

### 5. Website Uptime Monitor
**Complexity**: ⭐⭐ Intermediate  
**Use Case**: Monitor website availability and performance

```json
{
  "name": "Website Uptime Monitor",
  "description": "Monitor website uptime with alerts",
  "nodes": [
    {
      "id": "schedule",
      "name": "Every 5 Minutes",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "*/5 * * * *"
            }
          ]
        }
      }
    },
    {
      "id": "health_check",
      "name": "Health Check",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Multi-endpoint health check\\nconst endpoints = ['https://example.com', 'https://api.example.com/health'];\\n\\nconst results = await Promise.allSettled(\\n  endpoints.map(async (url) => {\\n    const startTime = Date.now();\\n    try {\\n      const response = await $http.request({\\n        method: 'GET',\\n        url: url,\\n        timeout: 10000\\n      });\\n      return {\\n        url,\\n        status: 'up',\\n        responseTime: Date.now() - startTime\\n      };\\n    } catch (error) {\\n      return {\\n        url,\\n        status: 'down',\\n        error: error.message\\n      };\\n    }\\n  })\\n);\\n\\nreturn results.map(result => ({ json: result.value || result.reason }));"
      }
    }
  ]
}
```

#### Features:
- ✅ Multiple endpoint monitoring
- ✅ Response time tracking
- ✅ Automated alerting

---

## 🛒 E-commerce Templates

### 6. Order Processing Pipeline
**Complexity**: ⭐⭐⭐ Advanced  
**Use Case**: Complete e-commerce order processing

```json
{
  "name": "E-commerce Order Processing",
  "description": "Complete order processing with fraud detection",
  "nodes": [
    {
      "id": "order_webhook",
      "name": "New Order",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "new-order",
        "httpMethod": "POST"
      }
    },
    {
      "id": "fraud_check",
      "name": "Fraud Detection",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// AI-powered fraud detection\nconst order = items[0].json;\nlet riskScore = 0;\n\n// Risk factors\nif (order.amount > 1000) riskScore += 2;\nif (order.shipping.country !== order.billing.country) riskScore += 3;\nif (order.customer.orderCount === 0) riskScore += 2;\nif (order.payment.method === 'cryptocurrency') riskScore += 4;\n\n// Velocity checks\nconst recentOrders = await checkRecentOrders(order.customer.email, 24); // Last 24 hours\nif (recentOrders > 3) riskScore += 5;\n\nconst riskLevel = riskScore >= 7 ? 'high' : riskScore >= 4 ? 'medium' : 'low';\n\nreturn [{\n  json: {\n    ...order,\n    fraudCheck: {\n      riskScore,\n      riskLevel,\n      requiresReview: riskLevel === 'high',\n      factors: {\n        highValue: order.amount > 1000,\n        countryMismatch: order.shipping.country !== order.billing.country,\n        newCustomer: order.customer.orderCount === 0,\n        cryptoPayment: order.payment.method === 'cryptocurrency',\n        highVelocity: recentOrders > 3\n      }\n    }\n  }\n}];"
      }
    },
    {
      "id": "inventory_check",
      "name": "Inventory Validation",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Real-time inventory validation\nconst order = items[0].json;\nconst inventoryChecks = [];\n\nfor (const item of order.items) {\n  const inventory = await checkInventory(item.sku);\n  inventoryChecks.push({\n    sku: item.sku,\n    requested: item.quantity,\n    available: inventory.available,\n    reserved: inventory.reserved,\n    canFulfill: inventory.available >= item.quantity,\n    estimatedShipDate: inventory.available >= item.quantity ? \n      calculateShipDate(item.sku) : null\n  });\n}\n\nconst canFulfillOrder = inventoryChecks.every(check => check.canFulfill);\n\nreturn [{\n  json: {\n    ...order,\n    inventory: {\n      checks: inventoryChecks,\n      canFulfill: canFulfillOrder,\n      partialFulfillment: !canFulfillOrder && inventoryChecks.some(c => c.canFulfill)\n    }\n  }\n}];"
      }
    },
    {
      "id": "payment_processing",
      "name": "Process Payment",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Payment processing with multiple providers\nconst order = items[0].json;\n\ntry {\n  const paymentResult = await processPayment({\n    amount: order.total,\n    currency: order.currency,\n    paymentMethod: order.payment,\n    customer: order.customer,\n    orderId: order.id\n  });\n  \n  return [{\n    json: {\n      ...order,\n      payment: {\n        ...order.payment,\n        status: 'completed',\n        transactionId: paymentResult.transactionId,\n        processedAt: new Date().toISOString(),\n        provider: paymentResult.provider\n      }\n    }\n  }];\n} catch (error) {\n  return [{\n    json: {\n      ...order,\n      payment: {\n        ...order.payment,\n        status: 'failed',\n        error: error.message,\n        attemptedAt: new Date().toISOString()\n      }\n    }\n  }];\n}"
      }
    }
  ]
}
```

#### Features:
- ✅ Fraud detection algorithms
- ✅ Real-time inventory validation
- ✅ Payment processing
- ✅ Order fulfillment workflow

---

## 💬 Customer Support Templates

### 7. Support Ticket Automation
**Complexity**: ⭐⭐⭐ Advanced  
**Use Case**: Intelligent customer support automation

```json
{
  "name": "Intelligent Support Automation",
  "description": "AI-powered customer support with sentiment analysis",
  "nodes": [
    {
      "id": "email_trigger",
      "name": "Email Trigger",
      "type": "n8n-nodes-base.emailReadImap",
      "parameters": {
        "format": "simple",
        "options": {
          "allowUnauthorizedCerts": false
        }
      }
    },
    {
      "id": "sentiment_analysis",
      "name": "Analyze Sentiment",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// AI sentiment analysis\nconst message = items[0].json.text;\n\n// Simple sentiment analysis (replace with AI service)\nconst positiveWords = ['happy', 'pleased', 'satisfied', 'great', 'excellent'];\nconst negativeWords = ['angry', 'frustrated', 'disappointed', 'terrible', 'awful'];\nconst urgentWords = ['urgent', 'asap', 'immediately', 'critical', 'emergency'];\n\nconst words = message.toLowerCase().split(/\\s+/);\nconst positiveCount = words.filter(word => positiveWords.includes(word)).length;\nconst negativeCount = words.filter(word => negativeWords.includes(word)).length;\nconst urgentCount = words.filter(word => urgentWords.includes(word)).length;\n\nconst sentiment = negativeCount > positiveCount ? 'negative' : \n                 positiveCount > negativeCount ? 'positive' : 'neutral';\n\nconst priority = urgentCount > 0 ? 'high' : \n                negativeCount > 2 ? 'medium' : 'low';\n\nreturn [{\n  json: {\n    ...items[0].json,\n    analysis: {\n      sentiment,\n      priority,\n      urgency: urgentCount,\n      confidence: Math.abs(positiveCount - negativeCount) / words.length\n    }\n  }\n}];"
      }
    },
    {
      "id": "categorize_ticket",
      "name": "Categorize Ticket",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Intelligent ticket categorization\nconst message = items[0].json.text.toLowerCase();\nconst subject = items[0].json.subject.toLowerCase();\nconst fullText = `${subject} ${message}`;\n\nconst categories = {\n  billing: ['payment', 'invoice', 'charge', 'billing', 'refund', 'subscription'],\n  technical: ['error', 'bug', 'not working', 'broken', 'issue', 'problem'],\n  account: ['login', 'password', 'access', 'account', 'profile', 'settings'],\n  shipping: ['delivery', 'shipping', 'tracking', 'package', 'order'],\n  general: ['question', 'help', 'how to', 'information', 'support']\n};\n\nlet bestCategory = 'general';\nlet maxScore = 0;\n\nfor (const [category, keywords] of Object.entries(categories)) {\n  const score = keywords.reduce((acc, keyword) => {\n    return acc + (fullText.includes(keyword) ? 1 : 0);\n  }, 0);\n  \n  if (score > maxScore) {\n    maxScore = score;\n    bestCategory = category;\n  }\n}\n\nreturn [{\n  json: {\n    ...items[0].json,\n    category: {\n      primary: bestCategory,\n      confidence: maxScore / categories[bestCategory].length,\n      matchedKeywords: categories[bestCategory].filter(k => fullText.includes(k))\n    }\n  }\n}];"
      }
    },
    {
      "id": "assign_agent",
      "name": "Assign Agent",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Intelligent agent assignment\nconst ticket = items[0].json;\nconst category = ticket.category.primary;\nconst priority = ticket.analysis.priority;\nconst sentiment = ticket.analysis.sentiment;\n\n// Agent specializations\nconst agents = {\n  billing: ['alice@company.com', 'bob@company.com'],\n  technical: ['charlie@company.com', 'diana@company.com'],\n  account: ['eve@company.com', 'frank@company.com'],\n  shipping: ['grace@company.com', 'henry@company.com'],\n  general: ['iris@company.com', 'jack@company.com']\n};\n\n// Load balancing (simplified)\nconst availableAgents = agents[category] || agents.general;\nconst assignedAgent = availableAgents[Math.floor(Math.random() * availableAgents.length)];\n\n// Calculate SLA based on priority and sentiment\nconst slaHours = priority === 'high' ? 2 : \n                priority === 'medium' ? 8 : 24;\n\nconst escalationHours = sentiment === 'negative' ? slaHours / 2 : slaHours;\n\nreturn [{\n  json: {\n    ...ticket,\n    assignment: {\n      agent: assignedAgent,\n      assignedAt: new Date().toISOString(),\n      slaDeadline: new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString(),\n      escalationTime: new Date(Date.now() + escalationHours * 60 * 60 * 1000).toISOString()\n    }\n  }\n}];"
      }
    }
  ]
}
```

#### Features:
- ✅ Sentiment analysis
- ✅ Automatic categorization
- ✅ Intelligent agent assignment
- ✅ SLA management

---

## 📖 Template Usage Guide

### How to Use Templates

#### 1. Import Template
```bash
# Copy template file to your n8n instance
cp template.json /path/to/n8n/workflows/
```

#### 2. Configure Credentials
Most templates require credentials setup:
- API keys for external services
- Database connections
- Email/messaging service credentials

#### 3. Customize Parameters
Update template-specific parameters:
- API endpoints
- Processing rules
- Alert thresholds

#### 4. Test Workflow
Always test templates before production:
1. Use test data
2. Verify all connections
3. Check error handling

### Template Categories

| Category | Complexity | Use Cases |
|----------|------------|-----------|
| **Quick Start** | ⭐ | Basic API calls, simple data processing |
| **API Integration** | ⭐⭐ | REST APIs, authentication, data pipelines |
| **Data Processing** | ⭐⭐ | CSV processing, data transformation |
| **Monitoring** | ⭐⭐ | Uptime monitoring, performance tracking |

---

## 🛠️ Customization Guidelines

### Best Practices

#### 1. Environment Variables
Use environment variables for configuration:
```javascript
const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL || 'https://api.default.com';
```

#### 2. Error Handling
Always implement comprehensive error handling:
```javascript
try {
  const result = await apiCall();
  return [{ json: result }];
} catch (error) {
  throw new Error(`Operation failed: ${error.message}`);
}
```

#### 3. Data Validation
Validate inputs and outputs:
```javascript
if (!items[0].json.email || !items[0].json.email.includes('@')) {
  throw new Error('Valid email address required');
}
```

### Template Modification Guide

#### Adding New Nodes
1. Identify insertion point
2. Add node configuration
3. Update connections
4. Test thoroughly

#### Modifying Business Logic
1. Locate relevant Function nodes
2. Update JavaScript code
3. Maintain error handling
4. Update documentation

---

## 🔍 Template Search & Discovery

### Search by Use Case
- **Data Integration**: Templates 3, 4
- **Monitoring**: Template 5
- **API Testing**: Templates 1, 2

### Search by Complexity
- **Beginner** (⭐): Templates 1, 2
- **Intermediate** (⭐⭐): Templates 3, 4, 5

### Search by Technology
- **REST APIs**: Templates 1, 2, 3
- **File Processing**: Template 4
- **Scheduled Tasks**: Template 5

---

## 📚 Additional Resources

### Documentation Links
- [n8n Official Documentation](https://docs.n8n.io/)
- [Beginner Tutorial](./BEGINNER_TUTORIAL.md)
- [Advanced Examples](./ADVANCED_EXAMPLES.md)

### Community Resources
- [n8n Community Forum](https://community.n8n.io/)
- [Template Sharing Platform](https://n8n.io/workflows/)

---

*The n8n Ultimate Template Gallery provides production-ready workflow templates with comprehensive documentation, making it easy to implement complex automation scenarios quickly and reliably.* 