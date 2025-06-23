/**
 * @file Manages the logic for the workflow review system.
 * This includes creating and managing Workflow Change Requests (WCRs).
 */
type WcrStatus = 'open' | 'approved' | 'rejected' | 'merged';
type ReviewState = 'approved' | 'request_changes' | 'comment';
interface WorkflowChangeRequest {
    wcr_id: string;
    workspace_id: string;
    workflow_id: string;
    proposer_id: string;
    title: string;
    description: string;
    status: WcrStatus;
    proposed_workflow_json: object;
    created_at: Date;
    updated_at: Date;
}
interface WCR_Review {
    review_id: string;
    wcr_id: string;
    reviewer_id: string;
    state: ReviewState;
    comment: string;
    created_at: Date;
}
/**
 * Creates a new Workflow Change Request.
 */
export declare function createWorkflowChangeRequest(workspaceId: string, proposerId: string, workflowId: string, title: string, description: string, proposedJson: object): Promise<WorkflowChangeRequest>;
/**
 * Adds a review to a WCR.
 */
export declare function addReview(workspaceId: string, reviewerId: string, wcrId: string, state: ReviewState, comment: string): Promise<WCR_Review>;
/**
 * Merges a WCR, updating the "official" workflow.
 */
export declare function mergeWCR(workspaceId: string, userId: string, wcrId: string): Promise<WorkflowChangeRequest>;
/**
 * Retrieves all WCRs for a given workflow.
 */
export declare function getWCRsForWorkflow(workflowId: string): WorkflowChangeRequest[];
export {};
//# sourceMappingURL=workflow-review-service.d.ts.map