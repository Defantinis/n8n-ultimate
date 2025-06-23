/**
 * @file Manages the UI for viewing team members and inviting new ones.
 */
// Mock API client
const apiClient = {
    async get(path, userId) {
        console.log(`[API Client] GET ${path} for user ${userId}`);
        if (path.endsWith('/members')) {
            return [
                { user_id: 'user_1', role: 'owner', joined_at: new Date(), name: 'Alice (You)' },
                { user_id: 'user_2', role: 'admin', joined_at: new Date(), name: 'Bob' },
                { user_id: 'user_3', role: 'editor', joined_at: new Date(), name: 'Charlie' },
            ];
        }
        return [];
    },
    async post(path, body, userId) {
        console.log(`[API Client] POST ${path} for user ${userId} with body:`, body);
        return { ...body, joined_at: new Date() };
    }
};
export class TeamManager {
    element;
    currentWorkspaceId;
    currentUserId;
    constructor(container, workspaceId, userId) {
        this.element = document.createElement('div');
        this.element.className = 'team-manager';
        container.appendChild(this.element);
        this.currentWorkspaceId = workspaceId;
        this.currentUserId = userId;
        this.render();
        // Listen for workspace changes to re-render
        document.addEventListener('workspaceChanged', (event) => {
            this.currentWorkspaceId = event.detail.workspaceId;
            console.log(`[TeamManager] Workspace changed to ${this.currentWorkspaceId}. Re-rendering.`);
            this.render();
        });
    }
    async render() {
        this.element.innerHTML = '<h2>Team Members</h2>';
        // Render invitation form
        this.renderInviteForm();
        // Render member list
        const memberList = document.createElement('ul');
        memberList.className = 'member-list';
        this.element.appendChild(memberList);
        memberList.innerHTML = '<li>Loading members...</li>';
        try {
            const members = await apiClient.get(`/workspaces/${this.currentWorkspaceId}/members`, this.currentUserId);
            memberList.innerHTML = ''; // Clear loading text
            members.forEach(member => {
                const item = document.createElement('li');
                item.innerHTML = `
                    <span class="member-name">${member.name || member.user_id}</span>
                    <span class="member-role">${member.role}</span>
                `;
                memberList.appendChild(item);
            });
        }
        catch (error) {
            memberList.innerHTML = `<li class="error">Failed to load members.</li>`;
        }
    }
    renderInviteForm() {
        const form = document.createElement('form');
        form.className = 'invite-form';
        form.innerHTML = `
            <input type="email" name="email" placeholder="Enter user email" required />
            <select name="role">
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
                <option value="admin">Admin</option>
            </select>
            <button type="submit">Invite User</button>
        `;
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(form);
            const email = formData.get('email');
            const role = formData.get('role');
            if (email && role) {
                await this.handleInvite(email, role);
                form.reset();
            }
        });
        this.element.appendChild(form);
    }
    async handleInvite(email, role) {
        try {
            // In a real app, we'd first look up the user by email to get their ID.
            const invitedUserId = `user_${email.split('@')[0]}`; // Mock user ID
            await apiClient.post(`/workspaces/${this.currentWorkspaceId}/members`, { userId: invitedUserId, role }, this.currentUserId);
            // Re-render the list to show the new member
            this.render();
        }
        catch (error) {
            console.error('Failed to invite user:', error);
            // In a real app, show an error message to the user
        }
    }
}
//# sourceMappingURL=team-manager.js.map