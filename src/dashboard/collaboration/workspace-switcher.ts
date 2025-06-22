/**
 * @file Manages the UI component for switching between workspaces.
 * This component will display the current workspace and allow users to select from a list
 * of workspaces they are a member of.
 */

// A mock API client to interact with the collaboration API.
// In a real application, this would be a proper, shared API client.
const apiClient = {
    async get(path: string, userId: string) {
        // This is a placeholder for a real API call.
        console.log(`[API Client] GET ${path} for user ${userId}`);
        // In a real app, you'd fetch from the live backend.
        // For now, we return mock data.
        if (path === '/workspaces') {
            return [
                { workspace_id: 'ws_1', name: 'My Personal Workspace' },
                { workspace_id: 'ws_2', name: 'Team Awesome' },
            ];
        }
        return [];
    },
};

export class WorkspaceSwitcher {
    private element: HTMLElement;
    private currentUserId: string;

    constructor(container: HTMLElement, currentUserId: string) {
        this.element = document.createElement('div');
        this.element.className = 'workspace-switcher';
        container.appendChild(this.element);

        this.currentUserId = currentUserId;
        this.render();
    }

    private async render() {
        this.element.innerHTML = `<span>Loading workspaces...</span>`;

        try {
            const workspaces = await apiClient.get('/workspaces', this.currentUserId);
            
            const selectElement = document.createElement('select');
            selectElement.className = 'workspace-select';

            workspaces.forEach((ws: { workspace_id: string, name: string }) => {
                const option = document.createElement('option');
                option.value = ws.workspace_id;
                option.textContent = ws.name;
                selectElement.appendChild(option);
            });
            
            selectElement.addEventListener('change', (event) => {
                const newWorkspaceId = (event.target as HTMLSelectElement).value;
                this.handleWorkspaceChange(newWorkspaceId);
            });
            
            this.element.innerHTML = ''; // Clear loading text
            this.element.appendChild(new Text('Workspace: '));
            this.element.appendChild(selectElement);

        } catch (error) {
            this.element.innerHTML = `<span class="error">Failed to load workspaces.</span>`;
            console.error('Error rendering workspace switcher:', error);
        }
    }

    private handleWorkspaceChange(workspaceId: string) {
        // In a real app, this would trigger a global state change,
        // potentially reloading the dashboard or updating the context.
        console.log(`[WorkspaceSwitcher] Switched to workspace: ${workspaceId}`);
        
        // Dispatch a custom event to notify other components of the change.
        const event = new CustomEvent('workspaceChanged', {
            detail: { workspaceId },
        });
        document.dispatchEvent(event);
    }
} 