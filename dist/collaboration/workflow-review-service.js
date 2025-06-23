/**
 * @file Manages the logic for the workflow review system.
 * This includes creating and managing Workflow Change Requests (WCRs).
 */
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore - TS extension import handled by ts-node register
import { hasPermission } from '../api/rbac-middleware.ts';
// In-memory store
const db = {
    wcrs: new Map(),
    reviews: new Map(),
};
// --- Service Functions ---
/**
 * Creates a new Workflow Change Request.
 */
export async function createWorkflowChangeRequest(workspaceId, proposerId, workflowId, title, description, proposedJson) {
    await hasPermission('workflows:manage')(workspaceId, proposerId);
    const wcrId = uuidv4();
    const now = new Date();
    const newWcr = {
        wcr_id: wcrId,
        workspace_id: workspaceId,
        workflow_id: workflowId,
        proposer_id: proposerId,
        title,
        description,
        status: 'open',
        proposed_workflow_json: proposedJson,
        created_at: now,
        updated_at: now,
    };
    db.wcrs.set(wcrId, newWcr);
    console.log(`[ReviewService] WCR created: "${title}" (ID: ${wcrId})`);
    return newWcr;
}
/**
 * Adds a review to a WCR.
 */
export async function addReview(workspaceId, reviewerId, wcrId, state, comment) {
    await hasPermission('workflows:manage')(workspaceId, reviewerId);
    if (!db.wcrs.has(wcrId)) {
        throw new Error(`WCR with ID "${wcrId}" not found.`);
    }
    const reviewId = uuidv4();
    const newReview = {
        review_id: reviewId,
        wcr_id: wcrId,
        reviewer_id: reviewerId,
        state,
        comment,
        created_at: new Date(),
    };
    const wcrReviews = db.reviews.get(wcrId) || [];
    wcrReviews.push(newReview);
    db.reviews.set(wcrId, wcrReviews);
    console.log(`[ReviewService] Review added to WCR ${wcrId} by user ${reviewerId}.`);
    return newReview;
}
/**
 * Merges a WCR, updating the "official" workflow.
 */
export async function mergeWCR(workspaceId, userId, wcrId) {
    await hasPermission('workflows:manage')(workspaceId, userId);
    const wcr = db.wcrs.get(wcrId);
    if (!wcr) {
        throw new Error(`Workflow Change Request with ID "${wcrId}" not found.`);
    }
    // In a real application, you would save `wcr.proposed_workflow_json` as the new
    // version of the workflow with ID `wcr.workflow_id`.
    console.log(`[ReviewService] Merging WCR ${wcrId}...`);
    console.log(`[ReviewService] New JSON for workflow ${wcr.workflow_id}:`, wcr.proposed_workflow_json);
    wcr.status = 'merged';
    wcr.updated_at = new Date();
    db.wcrs.set(wcrId, wcr);
    console.log(`[ReviewService] WCR ${wcrId} has been merged.`);
    return wcr;
}
/**
 * Retrieves all WCRs for a given workflow.
 */
export function getWCRsForWorkflow(workflowId) {
    const allWcrs = Array.from(db.wcrs.values());
    return allWcrs.filter(wcr => wcr.workflow_id === workflowId);
}
//# sourceMappingURL=workflow-review-service.js.map