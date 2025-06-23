/**
 * @file Renders the UI for the workflow review system.
 */
// Mock API client
const apiClient = {
    async get(path, userId) {
        console.log(`[API Client] GET ${path} for user ${userId}`);
        if (path.includes('/wcrs')) {
            return [
                { wcr_id: 'wcr_1', title: 'Feat: Add HubSpot integration', proposer_id: 'user_2', status: 'open', updated_at: new Date() },
                { wcr_id: 'wcr_2', title: 'Fix: Correct Mixpanel event name', proposer_id: 'user_3', status: 'approved', updated_at: new Date() },
            ];
        }
        return [];
    },
    async post(path, body, userId) {
        console.log(`[API Client] POST ${path} for user ${userId}`, body);
        const wcrId = path.split('/')[2];
        return { wcr_id: wcrId, status: 'merged', updated_at: new Date() };
    }
};
export class WorkflowReviewUI {
    element;
    currentWorkspaceId;
    currentUserId;
    workflowId; // The workflow being viewed
    constructor(container, workspaceId, userId, workflowId) {
        this.element = document.createElement('div');
        this.element.className = 'workflow-review-ui';
        container.appendChild(this.element);
        this.currentWorkspaceId = workspaceId;
        this.currentUserId = userId;
        this.workflowId = workflowId;
        this.render();
    }
    async render() {
        this.element.innerHTML = '<h3>Change Requests</h3>';
        const wcrList = document.createElement('ul');
        wcrList.className = 'wcr-list';
        this.element.appendChild(wcrList);
        wcrList.innerHTML = '<li>Loading change requests...</li>';
        try {
            const wcrs = await apiClient.get(`/workspaces/${this.currentWorkspaceId}/workflows/${this.workflowId}/wcrs`, this.currentUserId);
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
        }
        catch (error) {
            wcrList.innerHTML = `<li class="error">Failed to load change requests.</li>`;
        }
    }
    async handleMerge(wcrId) {
        console.log(`Attempting to merge WCR: ${wcrId}`);
        try {
            await apiClient.post(`/workspaces/${this.currentWorkspaceId}/wcrs/${wcrId}/merge`, {}, this.currentUserId);
            // Re-render to reflect the status change
            this.render();
        }
        catch (error) {
            console.error(`Failed to merge WCR ${wcrId}:`, error);
        }
    }
}
//# sourceMappingURL=workflow-review-ui.js.map