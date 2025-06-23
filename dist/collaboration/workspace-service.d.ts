/**
 * @file Manages workspaces, user invitations, and roles for collaboration features.
 * This service will eventually interact with a database based on the schemas defined
 * in docs/COLLABORATION_DATA_MODELS.md.
 */
type Role = 'owner' | 'admin' | 'editor' | 'viewer';
interface Workspace {
    workspace_id: string;
    name: string;
    owner_id: string;
    created_at: Date;
    updated_at: Date;
}
interface WorkspaceMember {
    workspace_id: string;
    user_id: string;
    role: Role;
    joined_at: Date;
}
/**
 * Creates a new workspace and assigns the creator as the owner.
 * @param name - The name of the new workspace.
 * @param ownerId - The ID of the user creating the workspace.
 * @returns The newly created workspace object.
 */
export declare function createWorkspace(name: string, ownerId: string): Promise<Workspace>;
/**
 * Adds a user to a workspace with a specific role.
 * @param workspaceId - The ID of the workspace.
 * @param userId - The ID of the user to add.
 * @param role - The role to assign to the user.
 * @returns The new member object.
 */
export declare function addUserToWorkspace(workspaceId: string, userId: string, role: Role): Promise<WorkspaceMember>;
/**
 * Removes a user from a workspace.
 * @param workspaceId - The ID of the workspace.
 * @param userIdToRemove - The ID of the user to remove.
 * @param performingUserId - The ID of the user performing the action (for permission checks).
 */
export declare function removeUserFromWorkspace(workspaceId: string, userIdToRemove: string, performingUserId: string): Promise<void>;
/**
 * Retrieves the role of a user in a specific workspace.
 * @param workspaceId - The ID of the workspace.
 * @param userId - The ID of the user.
 * @returns The user's role, or null if not a member.
 */
export declare function getUserRole(workspaceId: string, userId: string): Promise<Role | null>;
/**
 * Retrieves all members of a specific workspace.
 * @param workspaceId The ID of the workspace.
 * @returns An array of workspace members.
 */
export declare function getWorkspaceMembers(workspaceId: string): WorkspaceMember[];
export {};
//# sourceMappingURL=workspace-service.d.ts.map