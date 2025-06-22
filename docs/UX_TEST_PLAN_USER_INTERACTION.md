# UX Test Plan: Intelligent Interaction Patterns

> **Feature:** Guided Generation, Expert Mode Command Palette, Adaptive UI
> 
> **Target Personas:** Business Automator (Beginner), Rapid Prototyper (Expert)
>
> **Date:** <!-- timestamp -->

---

## 1. Test Objectives

-   Validate that the **Guided Generation** wizard is intuitive for beginners.
-   Assess the efficiency of the **Command Palette** for expert users.
-   Confirm that the **Adaptive UI** appropriately adjusts to user skill level.
-   Measure task completion time and error rates for key workflows.

---

## 2. Test Scenarios & Tasks

### Scenario 1: Beginner User (Guided Generation)

**Task:** "You've been asked to build a workflow that sends a welcome email to new HubSpot contacts. Use the 'Create Workflow' feature to build this."

**Success Criteria:**
-   User successfully navigates and completes all steps of the wizard.
-   User understands the purpose of each step.
-   User generates a valid workflow without needing external help.
-   **Metric:** Task completion time < 5 minutes.

### Scenario 2: Expert User (Command Palette)

**Task:** "You need to quickly generate a new workflow, check the system status, and then navigate to the template gallery. Use only keyboard shortcuts and the command palette."

**Success Criteria:**
-   User opens command palette via `Ctrl/Cmd+K`.
-   User successfully finds and executes all three actions.
-   User verbalizes that the palette is faster than UI navigation.
-   **Metric:** Task completion time < 1 minute.

### Scenario 3: Adaptive UI

**Task:**
1.  **As Beginner:** "Explore the dashboard. What features are most prominent?"
2.  (Switch user context to Expert)
3.  **As Expert:** "Explore the dashboard again. What has changed?"

**Success Criteria:**
-   Beginner user focuses on "Create Workflow" and "User Guide".
-   Expert user sees "Control Panel" and "System Status" and notices new quick actions.
-   AI low-confidence banner appears when appropriate.

---

## 3. Key Metrics

-   **Task Success Rate (TSR):** % of users who complete a task successfully.
-   **Time on Task (ToT):** Average time taken to complete a task.
-   **System Usability Scale (SUS):** 10-item questionnaire for perceived usability.
-   **Error Rate:** # of user errors per task.
-   **Qualitative Feedback:** User comments, frustrations, and suggestions.

---

## 4. Refinement Checklist

Based on test results, prioritize fixes:

- [ ] **High:** User is blocked or cannot complete a core task.
- [ ] **Medium:** User is confused but eventually finds a workaround.
- [ ] **Low:** Minor UI tweaks, label changes, or "nice-to-have" features.

All findings will be logged as new subtasks in Task Master. 