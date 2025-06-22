# User Flow Maps

This document contains Mermaid diagrams illustrating the primary user flows for our key personas.

---

## 1. Brenda (Business Automator): Guided Generation Flow

This flow maps Brenda's journey from an idea to a running workflow using the guided, wizard-like interface.

```mermaid
graph TD
    A[Start: Dashboard] --> B{Choose "Create Workflow"};
    B --> C[Select "Guided Mode"];
    C --> D[Step 1: Describe Idea];
    D -- "When a new HubSpot contact is created, send a welcome email via Mailchimp" --> E[Step 2: AI Suggests Nodes];
    E --> F{Review Nodes?};
    F -- Yes --> G[Modify/Approve Nodes];
    F -- No --> H[Accept Defaults];
    G --> I[Step 3: AI Connects Nodes & Sets Parameters];
    H --> I;
    I --> J{Review Connections?};
    J -- Yes --> K[Adjust Parameters];
    J -- No --> L[Accept Defaults];
    K --> M[Step 4: Validate Workflow];
    L --> M;
    M --> N{Validation OK?};
    N -- Yes --> O[Activate Workflow];
    N -- No --> P[Show Simple Error & Suggestion];
    P --> K;
    O --> Q[End: Workflow Running];
```

---

## 2. Paul (Rapid Prototyper): Expert Mode Flow

This flow shows how Paul uses the command palette and code nodes to quickly build a custom backend.

```mermaid
graph TD
    A[Start: Dashboard] --> B{Open Command Palette (Ctrl+K)};
    B --> C["Type: 'Create new workflow'"];
    C --> D[n8n Editor Opens];
    D --> E{Use Palette: 'Add Node: HTTP Request'};
    E --> F[Configure HTTP Node manually];
    F --> G{Use Palette: 'Add Node: Code'};
    G --> H["Write custom JS to process data"];
    H --> I[Connect Nodes Manually];
    I --> J["Use Palette: 'Test Workflow'"];
    J --> K{Execution OK?};
    K -- Yes --> L[Save as Template];
    K -- No --> M[Debug in Editor];
    M --> J;
    L --> N[End: Template Saved];
``` 