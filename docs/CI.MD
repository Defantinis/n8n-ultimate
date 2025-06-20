# Continuous Integration (CI)

This document outlines the Continuous Integration (CI) strategy to ensure the reliability and quality of our AI agent system and the n8n workflows it generates.

## Goals

1.  **Reliability:** Automatically verify that changes to the agent system do not introduce regressions.
2.  **Quality:** Ensure that the generated n8n workflows are syntactically valid, functional, and adhere to best practices.
3.  **Velocity:** Enable rapid iteration by providing fast feedback on changes.

## Proposed CI Pipeline (using GitHub Actions)

The pipeline will be triggered on every push to the main branch or on pull requests.

### Stage 1: Code & Syntax Validation (Fast Checks)

-   **Linting:** Run a linter (e.g., ESLint, if we use JavaScript/TypeScript) on the agent's source code to enforce code style and catch simple errors.
-   **JSON Validation:** For any manually created or modified workflow files in the repository, validate their JSON syntax. This is a basic sanity check.

### Stage 2: Agent Unit Testing

-   **Objective:** Test the individual components (agents) in isolation.
-   **Examples:**
    -   Provide the `IdeaRefiner` with a sample prompt and assert that the output specification is structured correctly.
    -   Give the `N8nExpert` a predefined logical plan and assert that it selects the correct n8n nodes.
    -   Feed an invalid JSON to the `WorkflowValidator` and ensure it correctly identifies the errors.

### Stage 3: End-to-End Workflow Generation Testing

-   **Objective:** This is the most critical stage. We will test the entire system's ability to generate a complete workflow from a prompt.
-   **Methodology:**
    1.  **Golden Dataset:** We will maintain a directory (`/tests/golden_workflows`) containing pairs of files:
        -   `prompt-01.txt`: A user prompt.
        -   `expected-workflow-01.json`: The ideal, human-verified n8n workflow for that prompt.
    2.  **Test Execution:** The CI job will iterate through this dataset. For each pair, it will:
        -   Feed the content of the `prompt-*.txt` file to the AI agent system.
        -   Capture the generated `workflow.json` output.
    3.  **Semantic Comparison:**
        -   A simple text-based `diff` is too brittle. Instead, we will perform a semantic comparison:
            -   Parse both the `generated` and `expected` JSON files.
            -   Compare the list of nodes, their types, and their core parameters.
            -   Compare the connections between the nodes.
        -   The test passes if the generated workflow is functionally equivalent to the expected one.
    4.  **Continuous Improvement:** This dataset will be expanded over time, specifically with test cases derived from the challenges and solutions documented in `docs/LEARNINGS.md`.

### Stage 4: (Future) Workflow Execution Testing

-   **Objective:** Go beyond static analysis and actually run the generated workflows.
-   **Methodology:**
    -   Set up a dedicated n8n instance running in a Docker container within the CI environment.
    -   For certain key test cases from the golden dataset, the CI pipeline will:
        -   Import the generated workflow into the test n8n instance via its API.
        -   Execute the workflow.
        -   Check the output of the final node to ensure it matches the expected result.
    -   This provides the ultimate confirmation that the generated workflow is not just valid, but actually works. 