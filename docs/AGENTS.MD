# AI Agents

This document defines the specialized AI agents that form the collaborative system for generating n8n workflows.

## Core Principle

Our system is a multi-agent collaboration. Instead of a single monolithic AI, we use a team of specialized agents, each with a distinct role. This improves accuracy, simplifies debugging, and allows for more complex problem-solving.

## Operating Modes
The agent team can operate in two modes:
1.  **Greenfield Mode:** The agents generate a brand new workflow from a text-based idea.
2.  **Enhancement Mode:** The agents ingest an existing "skeleton" workflow and modify it based on user instructions. This requires the agents to first parse and understand the provided workflow.

---

### 1. The Analyst (`IdeaRefiner`)

-   **Role:** To transform a raw, high-level user idea into a clear, unambiguous, and actionable specification.
-   **Responsibilities:**
    -   Parses the initial user prompt.
    -   Identifies ambiguities, missing information, or logical gaps.
    -   Asks clarifying questions to the user (a future-phase feature).
    -   Structures the clarified requirements into a detailed brief for the next agent.
-   **Input:** 
    -   In Greenfield mode: A raw idea from the user.
    -   In Enhancement mode: A raw idea *and* the path to a skeleton workflow JSON.
-   **Output:** A structured specification. In enhancement mode, this specification will focus on the *changes* required to the existing workflow.

---

### 2. The Architect (`WorkflowPlanner`)

-   **Role:** To design the high-level logical structure of the workflow without getting bogged down in n8n-specific details.
-   **Responsibilities:**
    -   Takes the specification from the `IdeaRefiner`.
    -   Determines the sequence of operations (e.g., "Trigger -> Filter -> HTTP Request -> Loop -> Write File").
    -   Defines the necessary data flow and transformations between steps.
    -   Outlines conditional logic (IFs, Switches) and error handling paths.
-   **Input:** The structured specification from the `IdeaRefiner`.
-   **Output:** A logical blueprint. In enhancement mode, this blueprint will represent the *delta* (additions, modifications, deletions) to be applied to the workflow.

---

### 3. The Builder (`N8nExpert`)

-   **Role:** To translate the logical blueprint into a concrete, valid n8n workflow.
-   **Responsibilities:**
    -   **Reading:** In Enhancement mode, parse and build an internal model of the provided skeleton workflow.
    -   **Mapping & Modification:** Map each logical step from the blueprint to the most appropriate n8n node, either by creating a new node or modifying an existing one.
    -   Populates the parameters for each node, including setting up expressions where needed.
    -   Constructs or modifies the `connections` object to link the nodes correctly.
    -   Ensures the final output is a syntactically correct n8n JSON file.
    -   Continuously improves its logic based on the documented findings in `docs/LEARNINGS.md`.
-   **Input:** The logical blueprint from the `WorkflowPlanner` (and a skeleton workflow in Enhancement mode).
-   **Output:** A complete, ready-to-import `workflow.json` file, either new or modified.

---

### 4. The QA Inspector (`WorkflowValidator`)

-   **Role:** To perform quality assurance on the generated workflow to ensure it's functional and robust.
-   **Responsibilities:**
    -   Validates the generated JSON against the n8n workflow schema.
    -   Checks for common errors, such as dangling connections or malformed expressions.
    -   Verifies that the workflow adheres to best practices for efficiency and readability.
    -   Its validation ruleset will be dynamically updated based on the solutions documented in `docs/LEARNINGS.md`.
    -   (Future) Runs simulated executions to test the workflow's logic against predefined conditions.
-   **Input:** The `workflow.json` file from the `N8nExpert`.
-   **Output:** A validation report. If issues are found, it can send the report back to the `N8nExpert` for revision. 