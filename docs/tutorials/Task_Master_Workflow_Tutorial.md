# Tutorial: End-to-End Task Master Workflow

> **Target Audience:** Developers & AI agents managing a project with Task Master.
>
> **Goal:** Take a new feature from idea to completion using `task-master-ai` tools.
>
> **Scenario:** We're building a new "User Profile" page.

---

## 1. Create a Feature Branch & Tag

To keep our new feature's tasks isolated from `master`, we'll use a git branch and a matching Task Master tag.

```bash
# 1. Create and switch to a new git branch
git checkout -b feature/user-profile

# 2. Create a tag that mirrors the branch name
mcp_task-master-ai_add_tag --fromBranch=true
# Or CLI: task-master add-tag --from-branch

# 3. Switch to the new tag context
mcp_task-master-ai_use_tag --name="feature-user-profile"
# Or CLI: task-master use-tag feature-user-profile
```

All subsequent commands will now operate on the `feature-user-profile` tag.

---

## 2. Generate Tasks from a PRD

With our context set, we'll parse a simple Product Requirements Document to generate the initial tasks.

```bash
# docs/prd/user-profile.txt
#
# Feature: User Profile Page
#
# 1. Create a database schema for user profiles.
# 2. Develop a backend API endpoint to fetch profile data.
# 3. Build a React frontend component to display the data.
# 4. Add an "Edit Profile" button and form.

mcp_task-master-ai_parse_prd --input="docs/prd/user-profile.txt" --numTasks=4
# Or CLI: task-master parse-prd docs/prd/user-profile.txt -n 4
```

This creates a `tasks.json` file inside our tag with four high-level tasks.

---

## 3. The Development Loop

### 3.1 What's Next?

```bash
# See what's ready to be worked on
mcp_task-master-ai_next_task
# Or CLI: task-master next
```

Task Master will return "Task 1: Create database schema" since it has no dependencies.

### 3.2 Expand the Task

```bash
# Break down the schema task into subtasks
mcp_task-master-ai_expand_task --id=1 --research=true
# Or CLI: task-master expand -i 1 --research
```

The AI generates subtasks like `1.1: Design 'users' table`, `1.2: Write SQL migration script`, etc.

### 3.3 Implement & Log Progress

```bash
# 1. Mark the first subtask as in-progress
mcp_task-master-ai_set_task_status --id=1.1 --status="in-progress"
# Or CLI: task-master set-status -i 1.1 --status in-progress

# 2. After implementing, log your findings
mcp_task-master-ai_update_subtask --id=1.1 --prompt="Designed 'users' table with fields: id, email, name, avatar_url. Used Postgres."
# Or CLI: task-master update-subtask -i 1.1 -p "..."

# 3. Mark it as done
mcp_task-master-ai_set_task_status --id=1.1 --status="done"
# Or CLI: task-master set-status -i 1.1 --status done
```

Repeat this loop for all subtasks.

### 3.4 Mark Parent Task Complete

Once all subtasks (1.1, 1.2, etc.) are done, close out the parent task.

```bash
mcp_task-master-ai_set_task_status --id=1 --status="done"
# Or CLI: task-master set-status -i 1 --status done
```

---

## 4. Merging Back to Master

When the feature is complete and the branch is merged:

1. Switch back to the master branch (`git checkout master`).
2. Switch back to the master tag (`mcp_task-master-ai_use_tag --name="master"`).
3. The isolated `tasks.json` from your feature branch can be integrated as needed. Often, the feature branch tasks are for development tracking and don't need to be merged back into the master task list.

---

> **Complexity Note (O(T * S))**: The total work is a function of the number of Tasks (T) and Subtasks (S). The `expand` and `parse-prd` commands help manage this complexity by automating planning.

---

## 5. Next Steps

* Review this tutorial for clarity.
* Link to the full `task-master-ai` command reference. 