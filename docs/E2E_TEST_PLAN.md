# End-to-End (E2E) Test Plan – Phase 2 Features

_Last updated: <!-- TODO: CI auto-insert timestamp -->_

## 1️⃣ Objectives

* Validate that Phase 2 features work together in real-world scenarios.
* Detect regression across dashboard UI, collaboration APIs, and template services.
* Ensure RBAC enforcement and error-handling remain intact.

## 2️⃣ Environment Setup

| Component | Version / URL |
|-----------|---------------|
| n8n Ultimate dev server | `npm run dev` → http://localhost:5678 |
| Playwright | `@playwright/test@^1.44.0` |
| Browsers   | Chromium (headless), WebKit (smoke) |
| Seed script | TODO: `scripts/seed-test-data.ts` |

## 3️⃣ User Flows Covered

| Flow ID | Description | Spec File |
|---------|-------------|-----------|
| UF-01 | Template gallery browsing & import | `dashboard-template-browsing.spec.ts` |
| UF-02 | Guided generation with feedback bus | `guided-generation.spec.ts` |
| UF-03 | Invite member to workspace | `invite-member.spec.ts` |
| UF-04 | RBAC-protected workflow creation via API | `rbac-workflow.spec.ts` |
| UF-05 | Workflow change request review & merge | `workflow-review.spec.ts` |
| UF-06 | Template A/B management & metrics | `template-ab-test.spec.ts` |

## 4️⃣ Data Seeding Strategy

* Create test workspace via API.
* Seed one owner, one editor, one viewer user.
* Pre-load a template into gallery.

## 5️⃣ Cleanup Steps

* Delete test workspace and users via API.
* Clear local storage / cookies between specs (Playwright handles per‐test context).

## 6️⃣ CI Integration

* GitHub Actions job `e2e.yml` (to be added) will:
  1. Install dependencies, run `npm run build`.
  2. Run `npm run e2e` headless.
  3. Upload Playwright HTML report as artefact.

---

> **Note:** This plan is a living document—update scenarios and coverage as Phase 2 evolves. 