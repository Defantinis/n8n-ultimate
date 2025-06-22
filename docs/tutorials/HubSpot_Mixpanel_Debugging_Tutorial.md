# Tutorial: Debugging the HubSpot → Mixpanel Integration Workflow

> **Target Audience:** Workflow builders & AI agents troubleshooting production issues.
>
> **Prerequisites:**
> * Local clone of `n8n-ultimate` project
> * `workflows/hubspot-mixpanel-integration.json` imported (or running in n8n)
> * Node ≥ 18, Docker (optional for RealWorldTestingFramework)

---

## 1. Reproduce the Failure

1. **Import** the JSON into a local n8n instance.
2. **Trigger** a manual execution.
3. Observe the **HTTP 500** error on the Mixpanel node.

> **Symptom Recap:** Mixpanel returns 500 because `customer_id` field was empty for some HubSpot contacts.

---

## 2. Static Validation Pass

```bash
# 1. Run the full validation stack
node run-validation.ts --file workflows/hubspot-mixpanel-integration.json

# 2. Review the consolidated report (saved as validation-results.json)
```

Expected findings:
* `ConnectionValidator` passes (all nodes connect).
* `DataFlowValidator` flags possible `mixpanel_customer_id` null.
* `ErrorHandlingValidator` warns on missing IF guard before Mixpanel node (✅ we will add one).

---

## 3. Add Guard Clause

Open the workflow in n8n UI:

1. Insert an **IF** node before **Mixpanel: Fetch Page Views**.
2. Condition: `$json.customer_id` **isNotEmpty**.
3. Route **true** branch to Mixpanel node; route **false** to **Error Handler**.

Re-run static validation – warnings resolved.

---

## 4. Real-World Testing Framework

```bash
node src/testing/real-world-testing-framework.ts \
     --workflow workflows/hubspot-mixpanel-integration.json \
     --mock-input tests/mocks/hubspot-contacts.json \
     --docker-image n8nio/n8n:latest
```

* Framework spins up container, imports workflow, feeds mock data.
* **Pass Criteria:**
  * 0 runtime errors
  * Contacts with empty `customer_id` are routed to Error Handler
  * Execution summary logs show successful updates

HTML report generated at `.taskmaster/reports/hubspot-mixpanel-debug.html`.

---

## 5. Performance Check

```bash
node src/performance/performance-monitor.ts \
     --workflow workflows/hubspot-mixpanel-integration.json
```

Verify:
* Memory < **300 MB** peak
* Average execution time < **2 s** per contact

If limits exceeded, lower **Split In Batches** size or enable caching.

---

## 6. Commit & Log Progress

```bash
git add workflows/hubspot-mixpanel-integration.json
mcp_task-master-ai_update_subtask --id=13.3 \
  --prompt="HubSpot→Mixpanel tutorial drafted & workflow patched with IF guard. Validation + tests pass."
```

> **Complexity Note (O(N))**: Processing time scales linearly with number of contacts. Batch size tunes memory/time trade-off.

---

## 7. Next Steps

* Peer-review this tutorial for clarity.
* Extend with Mixpanel auth-failure scenario.
* Publish to docs site after review. 