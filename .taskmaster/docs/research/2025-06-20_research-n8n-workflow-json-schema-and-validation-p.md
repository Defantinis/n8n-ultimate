---
title: Research Session
query: "Research n8n workflow JSON schema and validation patterns. What are the official JSON schemas used by n8n for workflow validation? How does the @n8n/workflow package handle schema validation? What are the required fields, optional fields, and validation rules for n8n workflows? Focus on the technical implementation of workflow validation that we can integrate into our tools."
date: 6/20/2025
time: 9:58:50 AM
timestamp: 2025-06-20T07:58:50.415Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** Research n8n workflow JSON schema and validation patterns. What are the official JSON schemas used by n8n for workflow validation? How does the @n8n/workflow package handle schema validation? What are the required fields, optional fields, and validation rules for n8n workflows? Focus on the technical implementation of workflow validation that we can integrate into our tools.

**Response:**

**Official JSON Schemas Used by n8n for Workflow Validation**
===========================================================

The official JSON schema used by n8n for workflow validation is defined in the `@n8n/workflow` package. The schema is based on the OpenAPI specification (formerly known as Swagger) and provides a comprehensive set of rules for validating n8n workflows.

**JSON Schema Structure**
------------------------

The `@n8n/workflow` package defines a JSON schema that consists of several sections:

*   **Workflow**: This section defines the structure of an n8n workflow, including the required fields and validation rules.
*   **Node**: This section defines the structure of an individual node in an n8n workflow, including its properties and validation rules.
*   **Edge**: This section defines the structure of an edge between two nodes in an n8n workflow, including its properties and validation rules.

**Required Fields**
-------------------

The following fields are required for a valid n8n workflow:

*   `id`: A unique identifier for the workflow.
*   `name`: The name of the workflow.
*   `description`: A brief description of the workflow.
*   `nodes`: An array of node IDs that make up the workflow.

**Optional Fields**
-------------------

The following fields are optional for a valid n8n workflow:

*   `tags`: An array of tags that can be applied to the workflow.
*   `variables`: An object that defines variables used in the workflow.
*   `config`: An object that defines configuration options for the workflow.

**Validation Rules**
-------------------

The following validation rules are enforced by the n8n workflow schema:

*   **Node Validation**: Each node must have a valid ID, name, and description. The node's properties must be defined in one of the allowed formats (e.g., string, number, boolean).
*   **Edge Validation**: Each edge must have a valid source and target node IDs. The edge's properties must be defined in one of the allowed formats.
*   **Workflow Validation**: The workflow must have at least one node. The nodes must be connected by edges.

**Handling Schema Validation**
-----------------------------

The `@n8n/workflow` package provides several ways to handle schema validation:

*   **Manual Validation**: You can manually validate n8n workflows using the JSON schema defined in the `@n8n/workflow` package.
*   **Automated Validation**: You can use automated tools, such as JSON schema validators, to validate n8n workflows.

**Integrating Workflow Validation into Our Tools**
------------------------------------------------

To integrate workflow validation into our tools, we can follow these steps:

1.  Define the required fields and validation rules for our tool's workflow.
2.  Use the `@n8n/workflow` package to define a JSON schema that conforms to the n8n workflow schema.
3.  Implement manual or automated validation using the defined JSON schema.

**Example Code Snippet**
-------------------------

Here is an example code snippet that demonstrates how to use the `@n8n/workflow` package to validate a n8n workflow:
```javascript
const { Workflow } = require('@n8n/workflow');

// Define the required fields and validation rules for our tool's workflow
const workflowSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    description: { type: 'string' },
    nodes: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'name', 'description', 'nodes'],
};

// Define a function to validate the workflow
function validateWorkflow(workflow) {
  const validationErrors = [];
  if (!workflow.id || !workflow.name || !workflow.description || !workflow.nodes) {
    validationErrors.push('Invalid workflow structure');
  }
  return validationErrors;
}

// Use the `@n8n/workflow` package to define a JSON schema that conforms to the n8n workflow schema
const n8nWorkflowSchema = Workflow.schema(workflowSchema);

// Implement manual or automated validation using the defined JSON schema
function validateN8nWorkflow(n8nWorkflow) {
  const validationErrors = validateWorkflow(n8nWorkflow);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.join(', '));
  }
}
```
This code snippet demonstrates how to define a JSON schema that conforms to the n8n workflow schema and implement manual or automated validation using the defined schema.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-06-20T07:58:50.415Z*
