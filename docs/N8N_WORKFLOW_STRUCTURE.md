# n8n Workflow JSON Structure Documentation

This document provides a comprehensive analysis of n8n workflow JSON structure based on analysis of the `n8nscraper.json` workflow and serves as a foundation for building AI-powered workflow generation tools.

## Overview

n8n workflows are represented as JSON objects containing nodes (processing units) and connections (data flow) that define automated processes. Each workflow follows a consistent structure that enables visual editing and programmatic execution.

## Top-Level Structure

```json
{
  "name": "Human-readable workflow title",
  "nodes": [...],           // Array of workflow nodes
  "connections": {...},     // Object defining node connections
  "active": false,          // Boolean: workflow enabled status
  "settings": {...},        // Workflow execution configuration
  "id": "unique_id",        // Unique workflow identifier
  "meta": {...}            // Metadata (template setup, etc.)
}
```

### Required Properties
- `name`: String - Human-readable workflow title
- `nodes`: Array - Collection of workflow processing nodes
- `connections`: Object - Defines data flow between nodes
- `active`: Boolean - Whether workflow is enabled for execution
- `settings`: Object - Workflow execution configuration
- `id`: String - Unique workflow identifier
- `meta`: Object - Additional metadata

## Node Structure

Every node in an n8n workflow follows this consistent structure:

```json
{
  "parameters": {...},           // Node-specific configuration
  "name": "Human Node Name",     // Display name in editor
  "type": "n8n-nodes-base.type", // Node type identifier
  "typeVersion": 1,              // Version of node type
  "position": [x, y],            // Visual editor coordinates
  "id": "uuid-string",           // Unique node identifier
  "notes": "Optional docs"       // Human-readable documentation
}
```

### Node Properties Explained

#### `parameters` (Object)
- **Purpose**: Contains all configuration specific to the node type
- **Variability**: Completely different structure for each node type
- **Examples**:
  - Code node: `{ "jsCode": "javascript code string" }`
  - HTTP node: `{ "url": "https://api.example.com" }`
  - HTML Extract: `{ "sourceData": "html", "extractionValues": [...] }`

#### `name` (String)
- **Purpose**: Human-readable identifier shown in visual editor
- **Requirements**: Must be unique within the workflow
- **Best Practice**: Descriptive names that explain the node's purpose

#### `type` (String)
- **Format**: `n8n-nodes-base.{nodeType}` or `n8n-nodes-{package}.{nodeType}`
- **Purpose**: Identifies which node implementation to use
- **Examples**: 
  - `n8n-nodes-base.start` - Workflow trigger
  - `n8n-nodes-base.code` - JavaScript execution
  - `n8n-nodes-base.httpRequest` - HTTP requests

#### `typeVersion` (Number)
- **Purpose**: Specifies which version of the node type to use
- **Importance**: Critical for compatibility - wrong version can break workflow
- **Evolution**: Node types evolve over time, version ensures consistent behavior

#### `position` (Array)
- **Format**: `[x, y]` coordinates as numbers
- **Purpose**: Visual positioning in the workflow editor
- **Units**: Pixels in the editor canvas
- **Layout**: Typically flows left-to-right with consistent spacing

#### `id` (String)
- **Format**: UUID (e.g., "23a85b96-73d8-444a-a9f9-3d0739f67a21")
- **Purpose**: Unique identifier for internal references
- **Requirements**: Must be globally unique within workflow
- **Generation**: Use UUID v4 for new nodes

#### `notes` (String, Optional)
- **Purpose**: Human-readable documentation for the node
- **Value**: Extremely helpful for understanding complex workflows
- **Best Practice**: Explain what the node does and why

## Node Types Analysis

Based on the n8nscraper.json workflow, here are the observed node types:

### 1. Start Node (`n8n-nodes-base.start`)
```json
{
  "parameters": {},
  "name": "Start",
  "type": "n8n-nodes-base.start",
  "typeVersion": 1,
  "position": [-20, 280],
  "id": "uuid-here"
}
```
- **Purpose**: Workflow trigger/entry point
- **Parameters**: Empty object (no configuration needed)
- **Usage**: Every workflow needs exactly one start node

### 2. Code Node (`n8n-nodes-base.code`)
```json
{
  "parameters": {
    "jsCode": "const items = [];\nfor (let i = 1; i <= 200; i++) {\n  items.push({ json: { page: i } });\n}\nreturn items;"
  },
  "name": "Generate Page Numbers",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [200, 280],
  "id": "uuid-here"
}
```
- **Purpose**: Execute custom JavaScript code
- **Key Parameter**: `jsCode` - JavaScript code string
- **Capabilities**: Data transformation, logic, API calls
- **Return**: Must return array of items or single item

### 3. HTTP Request Node (`n8n-nodes-base.httpRequest`)
```json
{
  "parameters": {
    "url": "https://n8n.io/workflows?page={{ $json.page }}"
  },
  "name": "Get Workflow List Page",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.1,
  "position": [440, 280],
  "id": "uuid-here"
}
```
- **Purpose**: Make HTTP requests to external APIs
- **Key Parameter**: `url` - Target URL (supports expressions)
- **Expression Support**: Can use `{{ $json.field }}` for dynamic URLs
- **Methods**: GET, POST, PUT, DELETE, etc.

### 4. HTML Extract Node (`n8n-nodes-base.htmlExtract`)
```json
{
  "parameters": {
    "sourceData": "html",
    "extractionValues": [
      {
        "key": "workflowUrl",
        "cssSelector": "a.workflow-card_link-block",
        "returnValue": "attribute",
        "attribute": "href"
      }
    ]
  },
  "name": "Extract URLs & Categories",
  "type": "n8n-nodes-base.htmlExtract",
  "typeVersion": 1,
  "position": [680, 280],
  "id": "uuid-here"
}
```
- **Purpose**: Parse HTML and extract specific data
- **Key Parameters**:
  - `sourceData`: "html" (data source type)
  - `extractionValues`: Array of extraction rules
- **Extraction Rules**: CSS selectors with return value specifications

### 5. Write Binary File Node (`n8n-nodes-base.writeBinaryFile`)
```json
{
  "parameters": {
    "fileSelector": "={{ $json.filePath }}",
    "dataPropertyName": "fileContent",
    "options": {
      "createDirectories": true
    }
  },
  "name": "Save Workflow JSON to File",
  "type": "n8n-nodes-base.writeBinaryFile",
  "typeVersion": 1.1,
  "position": [1640, 280],
  "id": "uuid-here"
}
```
- **Purpose**: Write data to files in the filesystem
- **Key Parameters**:
  - `fileSelector`: File path (supports expressions)
  - `dataPropertyName`: Which property contains the data
  - `options`: Additional file operations settings

## Connection Structure

Connections define the data flow between nodes, creating a directed graph:

```json
{
  "connections": {
    "Start": {
      "main": [
        [
          {
            "node": "Generate Page Numbers",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Page Numbers": {
      "main": [
        [
          {
            "node": "Get Workflow List Page",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Connection Properties
- **Key**: Source node name
- **Value**: Object with connection types
- **`main`**: Primary data flow (most common)
- **Target Object**:
  - `node`: Target node name (must match exactly)
  - `type`: Connection type ("main" for data flow)
  - `index`: Output index (usually 0)

### Connection Types
- **`main`**: Primary data flow between nodes
- **`error`**: Error handling connections (optional)
- **Multiple outputs**: Some nodes can have multiple output paths

## Expression Syntax

n8n supports dynamic expressions for accessing data:

### Basic Syntax
- `{{ $json.fieldName }}` - Access field from current item's JSON
- `={{ $json.fieldName }}` - Direct assignment expression
- `{{ $node["Node Name"].json.field }}` - Access data from specific node

### Common Patterns
```javascript
// URL with dynamic parameter
"url": "https://api.com/data?id={{ $json.id }}"

// Direct assignment
"fileSelector": "={{ $json.filePath }}"

// Complex expressions
"jsCode": "return [{ json: { computed: {{ $json.value }} * 2 } }];"
```

## Error Handling Patterns

Based on the analyzed workflow, common error handling patterns include:

### 1. Null Returns (Filtering)
```javascript
if (!json.workflowJsonString) {
  return null;  // Filters out invalid items
}
```

### 2. Try-Catch Blocks
```javascript
try {
  const pageData = JSON.parse(json.workflowJsonString);
  // Process data
} catch (error) {
  return null;  // Handle parsing errors
}
```

### 3. Optional Chaining
```javascript
const workflowJson = pageData?.props?.pageProps?.workflow;
if (!workflowJson) {
  return null;
}
```

### 4. Guard Clauses
```javascript
// Guard against missing data
if (!json.workflowJsonString) {
  return null;
}
```

## Implementation Requirements for AI Generation

### 1. UUID Generation
- **Requirement**: Every node needs a unique UUID
- **Format**: Standard UUID v4
- **Library**: Use crypto.randomUUID() or uuid package

### 2. Position Calculation
- **Algorithm**: Auto-layout nodes in logical flow
- **Spacing**: Consistent horizontal/vertical spacing
- **Direction**: Typically left-to-right flow
- **Coordinates**: Pixel-based positioning

### 3. Node Type Database
- **Need**: Comprehensive schema for each node type
- **Content**: Parameter definitions, validation rules, examples
- **Maintenance**: Keep updated with n8n releases

### 4. Connection Validation
- **Requirements**:
  - Source node exists
  - Target node exists
  - No circular dependencies
  - Valid connection types
  - Proper indexing

### 5. Expression Template System
- **Purpose**: Generate valid n8n expressions
- **Patterns**: Common expression templates
- **Validation**: Ensure expression syntax is correct

### 6. Version Compatibility
- **Challenge**: Node type versions must match target n8n
- **Solution**: Maintain version mapping database
- **Testing**: Validate against target n8n installation

## Workflow Validation Checklist

For AI-generated workflows, validate:

- [ ] **Structure**: All required top-level properties present
- [ ] **Nodes**: Each node has required properties
- [ ] **IDs**: All node IDs are unique UUIDs
- [ ] **Names**: All node names are unique
- [ ] **Types**: Node types exist and versions are compatible
- [ ] **Connections**: All connections reference existing nodes
- [ ] **Flow**: No circular dependencies
- [ ] **Expressions**: All expressions use valid syntax
- [ ] **Parameters**: Node parameters match type requirements

## Common Workflow Patterns

### Linear Processing
```
Start → Transform → API Call → Process → Save
```

### Branching Logic
```
Start → Decision Node → Branch A
                     → Branch B
```

### Error Handling
```
Main Flow → Success Path
         → Error Handler → Recovery/Logging
```

### Iteration
```
Start → Generate Items → Process Each → Collect Results
```

## Next Steps for Implementation

1. **Create Node Type Schemas**: Define parameter structures for each node type
2. **Build Position Algorithm**: Implement automatic node positioning
3. **Develop Expression Engine**: Template system for n8n expressions
4. **Implement Validation**: Comprehensive workflow validation
5. **Create Test Suite**: Validate against known good workflows
6. **Build Generation Templates**: Common workflow patterns as templates

---

*This documentation serves as the foundation for building AI agents that can parse, validate, and generate n8n workflows. It should be updated as new node types and patterns are discovered.* 