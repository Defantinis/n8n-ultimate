# Project Roadmap

This document outlines the development roadmap for our AI-powered n8n workflow generation project. The ultimate goal is to create a system that can take any idea, iterate on it, and transform it into a compatible, easy-to-use n8n workflow.

## Phase 1: Foundation & Discovery (Current)

-   **Objective:** Establish the project's foundation and understand the problem space.
-   **Key Tasks:**
    -   [x] Define the core project goal.
    -   [x] Set up the initial project structure (`docs`, `workflows`, execution log).
    -   [ ] In-depth analysis of the n8n JSON workflow structure, including nodes, connections, and credentials.
    -   [ ] Research and document common n8n nodes and their parameter requirements.
    -   [ ] Actively document all findings, solutions, and compatibility notes in `docs/LEARNINGS.md`.
    -   [ ] Identify a set of sample ideas to be used for prototyping and testing.

## Phase 2: Agent-Based Prototyping

-   **Objective:** Develop a core multi-agent system for workflow generation and enhancement.
-   **Key Strategy: Hybrid Human-AI Model**
    -   The system will support two modes:
        1.  **Greenfield:** Generate a workflow from a text prompt (as originally planned).
        2.  **Enhancement:** Ingest a human-created "skeleton" workflow from the `workflows/skeletons` directory and then build upon it based on user instructions. This is our primary approach for initial development.
-   **Key Tasks:**
    -   [ ] Define the specific roles and responsibilities for each AI agent (see `AGENTS.MD`).
    -   [ ] Develop the core logic for the agents to parse, understand, and modify existing workflow JSON.
    -   [ ] Develop the `IdeaRefiner` agent to process and clarify initial user prompts.
    -   [ ] Develop the `WorkflowPlanner` agent to create a high-level logical flow from a refined idea.
    -   [ ] Develop the `N8nExpert` agent to translate the logical plan into a concrete n8n JSON structure.
    -   [ ] Build an end-to-end prototype that can generate a simple, linear workflow from a well-defined prompt.

## Phase 3: Iteration, Validation & Refinement

-   **Objective:** Enhance the quality of generated workflows and introduce a feedback loop.
-   **Key Tasks:**
    -   [ ] Develop the `WorkflowValidator` agent to check generated JSON for structural integrity and common errors.
    -   [ ] Implement a CI pipeline to automate the testing of the agent system (see `CI.MD`).
    -   [ ] Create a "golden dataset" of prompts and their ideal workflow outputs for regression testing.
    -   [ ] Enhance the `N8nExpert`'s knowledge base to include more nodes, complex configurations, and expressions.
    -   [ ] Implement logic for handling branches, merges, and basic error handling in workflows.

## Phase 4: Advanced Capabilities & User Experience

-   **Objective:** Broaden the system's capabilities and make it more user-friendly.
-   **Key Tasks:**
    -   [ ] Develop a mechanism for the system to ask clarifying questions if a prompt is ambiguous.
    -   [ ] Support for community nodes by allowing the system to learn from new node definitions.
    -   [ ] Introduce a feature to allow users to provide feedback on a generated workflow to guide its revision.
    -   [ ] Explore options for a simple user interface (CLI or web-based) to interact with the system. 