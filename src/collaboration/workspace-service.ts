/**
 * @file Manages workspaces, user invitations, and roles for collaboration features.
 * This service will eventually interact with a database based on the schemas defined
 * in docs/COLLABORATION_DATA_MODELS.md.
 */

import { v4 as uuidv4 } from 'uuid';

// --- Type Definitions (based on data models) ---

type Role = 'owner' | 'admin' | 'editor' | 'viewer';

interface Workspace {
    workspace_id: string;
    name: string;
    owner_id: string;
    created_at: Date;
    updated_at: Date;
}

interface User {
    user_id: string;
    email: string;
    name: string;
}

interface WorkspaceMember {
    workspace_id: string;
    user_id: string;
    role: Role;
    joined_at: Date;
}

// In-memory store for demonstration purposes.
// In a real application, this would be a database (e.g., PostgreSQL, MongoDB).
const db = {
    workspaces: new Map<string, Workspace>(),
    users: new Map<string, User>(),
    members: new Map<string, WorkspaceMember[]>(),
};


// --- Service Functions ---

/**
 * Creates a new workspace and assigns the creator as the owner.
 * @param name - The name of the new workspace.
 * @param ownerId - The ID of the user creating the workspace.
 * @returns The newly created workspace object.
 */
export async function createWorkspace(name: string, ownerId: string): Promise<Workspace> {
    const workspaceId = uuidv4();
    const now = new Date();

    const newWorkspace: Workspace = {
        workspace_id: workspaceId,
        name,
        owner_id: ownerId,
        created_at: now,
        updated_at: now,
    };

    db.workspaces.set(workspaceId, newWorkspace);

    // Add the owner as a member
    await addUserToWorkspace(workspaceId, ownerId, 'owner');

    console.log(`[WorkspaceService] Workspace created: "${name}" (ID: ${workspaceId})`);
    return newWorkspace;
}

/**
 * Adds a user to a workspace with a specific role.
 * @param workspaceId - The ID of the workspace.
 * @param userId - The ID of the user to add.
 * @param role - The role to assign to the user.
 * @returns The new member object.
 */
export async function addUserToWorkspace(workspaceId: string, userId: string, role: Role): Promise<WorkspaceMember> {
    if (!db.workspaces.has(workspaceId)) {
        throw new Error(`Workspace with ID "${workspaceId}" not found.`);
    }

    const newMember: WorkspaceMember = {
        workspace_id: workspaceId,
        user_id: userId,
        role,
        joined_at: new Date(),
    };

    const members = db.members.get(workspaceId) || [];
    members.push(newMember);
    db.members.set(workspaceId, members);
    
    console.log(`[WorkspaceService] User ${userId} added to workspace ${workspaceId} as ${role}.`);
    return newMember;
}

/**
 * Removes a user from a workspace.
 * @param workspaceId - The ID of the workspace.
 * @param userIdToRemove - The ID of the user to remove.
 * @param performingUserId - The ID of the user performing the action (for permission checks).
 */
export async function removeUserFromWorkspace(workspaceId: string, userIdToRemove: string, performingUserId: string): Promise<void> {
    // Placeholder for permission check: only admin/owner can remove users
    const performingUserRole = await getUserRole(workspaceId, performingUserId);
    if (performingUserRole !== 'owner' && performingUserRole !== 'admin') {
        throw new Error('Permission denied: You must be an owner or admin to remove users.');
    }
    if (userIdToRemove === performingUserId) {
        throw new Error('Action not allowed: You cannot remove yourself from the workspace.');
    }

    const members = db.members.get(workspaceId) || [];
    const updatedMembers = members.filter(member => member.user_id !== userIdToRemove);

    if (members.length === updatedMembers.length) {
        throw new Error(`User ${userIdToRemove} not found in workspace ${workspaceId}.`);
    }

    db.members.set(workspaceId, updatedMembers);
    console.log(`[WorkspaceService] User ${userIdToRemove} removed from workspace ${workspaceId}.`);
}

/**
 * Retrieves the role of a user in a specific workspace.
 * @param workspaceId - The ID of the workspace.
 * @param userId - The ID of the user.
 * @returns The user's role, or null if not a member.
 */
export async function getUserRole(workspaceId: string, userId: string): Promise<Role | null> {
    const members = db.members.get(workspaceId) || [];
    const member = members.find(m => m.user_id === userId);
    return member ? member.role : null;
}

/**
 * Retrieves all members of a specific workspace.
 * @param workspaceId The ID of the workspace.
 * @returns An array of workspace members.
 */
export function getWorkspaceMembers(workspaceId: string): WorkspaceMember[] {
    return db.members.get(workspaceId) || [];
} 