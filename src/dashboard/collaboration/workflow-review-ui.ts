/**
 * @file Renders the UI for the workflow review system.
 */

// Mock data and types
type WcrStatus = 'open' | 'approved' | 'rejected' | 'merged';
interface WorkflowChangeRequest {
    wcr_id: string;
    title: string;
    proposer_id: string;
    status: WcrStatus;
    updated_at: Date;
}

// Mock API client
const apiClient = {
    async get(path: string, userId: string) {
        console.log(`[API Client] GET ${path} for user ${userId}`);
        if (path.includes('/wcrs')) {
            return [
                { wcr_id: 'wcr_1', title: 'Feat: Add HubSpot integration', proposer_id: 'user_2', status: 'open' as WcrStatus, updated_at: new Date() },
                { wcr_id: 'wcr_2', title: 'Fix: Correct Mixpanel event name', proposer_id: 'user_3', status: 'approved' as WcrStatus, updated_at: new Date() },
            ];
        }
        return [];
    },
    async post(path: string, body: any, userId: string) {
        console.log(`[API Client] POST ${path} for user ${userId}`, body);
        const wcrId = path.split('/')[2];
        return { wcr_id: wcrId, status: 'merged', updated_at: new Date() };
    }
};

export class WorkflowReviewUI {
    private element: HTMLElement;
    private currentWorkspaceId: string;
    private currentUserId: string;
    private workflowId: string; // The workflow being viewed

    constructor(container: HTMLElement, workspaceId: string, userId: string, workflowId: string) {
        this.element = document.createElement('div');
        this.element.className = 'workflow-review-ui';
        container.appendChild(this.element);

        this.currentWorkspaceId = workspaceId;
        this.currentUserId = userId;
        this.workflowId = workflowId;

        this.render();
    }

    private async render() {
        this.element.innerHTML = '<h3>Change Requests</h3>';
        
        const wcrList = document.createElement('ul');
        wcrList.className = 'wcr-list';
        this.element.appendChild(wcrList);
        
        wcrList.innerHTML = '<li>Loading change requests...</li>';

        try {
            const wcrs: WorkflowChangeRequest[] = await apiClient.get(
                `/workspaces/${this.currentWorkspaceId}/workflows/${this.workflowId}/wcrs`,
                this.currentUserId
            );

            wcrList.innerHTML = '';
            if (wcrs.length === 0) {
                wcrList.innerHTML = '<li>No open change requests for this workflow.</li>';
                return;
            }

            wcrs.forEach(wcr => {
                const item = document.createElement('li');
                item.className = `wcr-item status-${wcr.status}`;
                item.innerHTML = `
                    <span class="wcr-title">${wcr.title}</span>
                    <span class="wcr-proposer">by ${wcr.proposer_id}</span>
                    <span class="wcr-status">${wcr.status}</span>
                `;

                if (wcr.status === 'approved') {
                    const mergeButton = document.createElement('button');
                    mergeButton.textContent = 'Merge';
                    mergeButton.onclick = () => this.handleMerge(wcr.wcr_id);
                    item.appendChild(mergeButton);
                }
                
                wcrList.appendChild(item);
            });

        } catch (error) {
            wcrList.innerHTML = `<li class="error">Failed to load change requests.</li>`;
        }
    }

    private async handleMerge(wcrId: string) {
        console.log(`Attempting to merge WCR: ${wcrId}`);
        try {
            await apiClient.post(
                `/workspaces/${this.currentWorkspaceId}/wcrs/${wcrId}/merge`,
                {},
                this.currentUserId
            );
            // Re-render to reflect the status change
            this.render();
        } catch (error) {
            console.error(`Failed to merge WCR ${wcrId}:`, error);
        }
    }
} 