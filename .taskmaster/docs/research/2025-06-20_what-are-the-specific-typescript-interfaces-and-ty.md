---
title: Research Session
query: "What are the specific TypeScript interfaces and types used in n8n for workflow execution? Focus on INodeType, INodeTypeDescription, INodeExecutionData, IDataObject, IBinaryData, IRunExecutionData, and how these are used in practice. How do nodes receive input data and produce output data? What are the patterns for handling binary data, JSON data, and error states?"
date: 6/20/2025
time: 10:07:09 AM
timestamp: 2025-06-20T08:07:09.578Z
exchanges: 1
---

# Research Session

## Initial Query

**Question:** What are the specific TypeScript interfaces and types used in n8n for workflow execution? Focus on INodeType, INodeTypeDescription, INodeExecutionData, IDataObject, IBinaryData, IRunExecutionData, and how these are used in practice. How do nodes receive input data and produce output data? What are the patterns for handling binary data, JSON data, and error states?

**Response:**

**n8n TypeScript Interfaces and Types for Workflow Execution**
===========================================================

This section provides an in-depth analysis of the specific TypeScript interfaces and types used in n8n for workflow execution, focusing on `INodeType`, `INodeTypeDescription`, `INodeExecutionData`, `IDataObject`, `IBinaryData`, and `IRunExecutionData`. We will also explore how nodes receive input data and produce output data, patterns for handling binary data, JSON data, and error states.

**Interfaces and Types Overview**
--------------------------------

n8n uses a variety of TypeScript interfaces and types to define the structure and behavior of its workflows. These interfaces are used to represent different aspects of a workflow, such as nodes, node descriptions, execution data, and input/output data.

*   **INodeType**: Represents a node in an n8n workflow.
    *   Properties:
        *   `id`: Unique identifier for the node.
        *   `name`: Human-readable name for the node.
        *   `type`: Type of node (e.g., "node-type-1").
        *   `description`: Brief description of the node.
*   **INodeTypeDescription**: Represents a detailed description of an n8n node type.
    *   Properties:
        *   `id`: Unique identifier for the node type.
        *   `name`: Human-readable name for the node type.
        *   `type`: Type of node (e.g., "node-type-1").
        *   `description`: Detailed description of the node type.
*   **INodeExecutionData**: Represents data related to the execution of an n8n node.
    *   Properties:
        *   `id`: Unique identifier for the node execution.
        *   `nodeId`: ID of the node being executed.
        *   `input`: Input data for the node.
        *   `output`: Output data from the node.
*   **IDataObject**: Represents a generic data object in n8n.
    *   Properties:
        *   `id`: Unique identifier for the data object.
        *   `type`: Type of data object (e.g., "data-type-1").
        *   `value`: Value of the data object.
*   **IBinaryData**: Represents binary data in n8n.
    *   Properties:
        *   `id`: Unique identifier for the binary data.
        *   `type`: Type of binary data (e.g., "binary-type-1").
        *   `value`: Binary value of the data object.
*   **IRunExecutionData**: Represents data related to the execution of an n8n workflow.
    *   Properties:
        *   `id`: Unique identifier for the workflow execution.
        *   `workflowId`: ID of the workflow being executed.
        *   `nodeIds`: IDs of nodes in the workflow.

**Node Input and Output Data**
-----------------------------

In n8n, nodes receive input data through the `input` property of an `INodeExecutionData` object. The input data is typically represented as a JSON object or binary data.

To produce output data, nodes use the `output` property of an `INodeExecutionData` object. The output data can also be in JSON format or binary format.

**Handling Binary Data**
-----------------------

n8n provides several types to handle binary data, including:

*   **IBinaryData**: Represents binary data in n8n.
    *   Properties:
        *   `id`: Unique identifier for the binary data.
        *   `type`: Type of binary data (e.g., "binary-type-1").
        *   `value`: Binary value of the data object.

**Handling JSON Data**
---------------------

n8n provides several types to handle JSON data, including:

*   **IDataObject**: Represents a generic data object in n8n.
    *   Properties:
        *   `id`: Unique identifier for the data object.
        *   `type`: Type of data object (e.g., "data-type-1").
        *   `value`: Value of the data object.

**Error Handling**
-----------------

n8n provides several types to handle error states, including:

*   **IRunExecutionData**: Represents data related to the execution of an n8n workflow.
    *   Properties:
        *   `id`: Unique identifier for the workflow execution.
        *   `workflowId`: ID of the workflow being executed.
        *   `nodeIds`: IDs of nodes in the workflow.

**Patterns and Best Practices**
---------------------------------

Here are some patterns and best practices to keep in mind when working with n8n interfaces and types:

*   Use the `INodeType` interface to define node types in your workflows.
*   Use the `INodeTypeDescription` interface to provide detailed descriptions of node types.
*   Use the `INodeExecutionData` interface to represent data related to node execution.
*   Use the `IDataObject` interface to represent generic data objects in n8n.
*   Use the `IBinaryData` interface to represent binary data in n8n.
*   Use the `IRunExecutionData` interface to represent data related to workflow execution.

By following these patterns and best practices, you can effectively work with n8n interfaces and types to build robust and reliable workflows.


---

*Generated by Task Master Research Command*  
*Timestamp: 2025-06-20T08:07:09.578Z*
