import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import PermissionsTab from './permissions-tab.svelte';

vi.mock('$lib/api/nhi-permissions-client', () => ({
	fetchAgentTools: vi.fn().mockResolvedValue({ data: [], limit: 20, offset: 0 }),
	fetchToolAgents: vi.fn().mockResolvedValue({ data: [], limit: 20, offset: 0 }),
	fetchCallers: vi.fn().mockResolvedValue({ data: [], limit: 20, offset: 0 }),
	fetchCallees: vi.fn().mockResolvedValue({ data: [], limit: 20, offset: 0 }),
	fetchNhiUsers: vi.fn().mockResolvedValue({ data: [], limit: 20, offset: 0 }),
	grantToolPermissionClient: vi.fn(),
	revokeToolPermissionClient: vi.fn(),
	grantNhiPermissionClient: vi.fn(),
	revokeNhiPermissionClient: vi.fn(),
	grantUserPermissionClient: vi.fn(),
	revokeUserPermissionClient: vi.fn()
}));

import {
	fetchAgentTools,
	fetchToolAgents,
	fetchCallers,
	fetchCallees,
	fetchNhiUsers
} from '$lib/api/nhi-permissions-client';

const mockFetchAgentTools = vi.mocked(fetchAgentTools);
const mockFetchToolAgents = vi.mocked(fetchToolAgents);
const mockFetchCallers = vi.mocked(fetchCallers);
const mockFetchCallees = vi.mocked(fetchCallees);
const mockFetchNhiUsers = vi.mocked(fetchNhiUsers);

describe('PermissionsTab', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Restore default resolved values
		mockFetchAgentTools.mockResolvedValue({ data: [], limit: 20, offset: 0 });
		mockFetchToolAgents.mockResolvedValue({ data: [], limit: 20, offset: 0 });
		mockFetchCallers.mockResolvedValue({ data: [], limit: 20, offset: 0 });
		mockFetchCallees.mockResolvedValue({ data: [], limit: 20, offset: 0 });
		mockFetchNhiUsers.mockResolvedValue({ data: [], limit: 20, offset: 0 });
	});

	afterEach(() => {
		cleanup();
	});

	describe('agent entityType', () => {
		it('shows Tool Access, Calling Permissions, and Users sections', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'agent-1', entityType: 'agent' }
			});

			await waitFor(() => {
				expect(screen.getByText('Tool Access')).toBeTruthy();
				expect(screen.getByText('Calling Permissions')).toBeTruthy();
				expect(screen.getByText('Users')).toBeTruthy();
			});
		});

		it('shows empty states when no permissions', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'agent-1', entityType: 'agent' }
			});

			await waitFor(() => {
				expect(screen.getByText('No tool access granted')).toBeTruthy();
				expect(screen.getByText('No outbound permissions')).toBeTruthy();
				expect(screen.getByText('No inbound permissions')).toBeTruthy();
				expect(screen.getByText('No users have access')).toBeTruthy();
			});
		});

		it('calls fetchAgentTools for agent entityType', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'agent-1', entityType: 'agent' }
			});

			await waitFor(() => {
				expect(mockFetchAgentTools).toHaveBeenCalledWith('agent-1');
			});
		});

		it('renders tool permissions data when available', async () => {
			mockFetchAgentTools.mockResolvedValue({
				data: [
					{
						id: 'perm-1',
						agent_nhi_id: 'agent-1',
						tool_nhi_id: 'tool-abc',
						expires_at: null,
						granted_at: '2025-06-01T00:00:00Z',
						granted_by: 'user-1'
					}
				],
				limit: 20,
				offset: 0
			});

			render(PermissionsTab, {
				props: { nhiId: 'agent-1', entityType: 'agent' }
			});

			await waitFor(() => {
				expect(screen.getByText('tool-abc')).toBeTruthy();
			});
		});

		it('shows Grant buttons for tool access and user sections', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'agent-1', entityType: 'agent' }
			});

			await waitFor(() => {
				// There should be Grant buttons: one for Tool Access, one for Calling Permissions, one for Users
				const grantButtons = screen.getAllByText('Grant');
				expect(grantButtons.length).toBeGreaterThanOrEqual(3);
			});
		});

		it('shows Revoke button for each permission entry', async () => {
			mockFetchNhiUsers.mockResolvedValue({
				data: [
					{
						id: 'perm-2',
						nhi_id: 'agent-1',
						user_id: 'user-1',
						permission_type: 'use',
						granted_at: '2025-06-01T00:00:00Z',
						granted_by: null,
						expires_at: null
					}
				],
				limit: 20,
				offset: 0
			});

			render(PermissionsTab, {
				props: { nhiId: 'agent-1', entityType: 'agent' }
			});

			await waitFor(() => {
				expect(screen.getByText('Revoke')).toBeTruthy();
			});
		});
	});

	describe('tool entityType', () => {
		it('shows Agents with Access and Users sections only', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'tool-1', entityType: 'tool' }
			});

			await waitFor(() => {
				expect(screen.getByText('Agents with Access')).toBeTruthy();
				expect(screen.getByText('Users')).toBeTruthy();
				// Calling Permissions should not be present for tools
				expect(screen.queryByText('Calling Permissions')).toBeNull();
			});
		});

		it('calls fetchToolAgents for tool entityType', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'tool-1', entityType: 'tool' }
			});

			await waitFor(() => {
				expect(mockFetchToolAgents).toHaveBeenCalledWith('tool-1');
			});
		});

		it('shows empty states for tool entity', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'tool-1', entityType: 'tool' }
			});

			await waitFor(() => {
				expect(screen.getByText('No agents have access')).toBeTruthy();
				expect(screen.getByText('No users have access')).toBeTruthy();
			});
		});
	});

	describe('service_account entityType', () => {
		it('shows Calling Permissions and Users sections', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'sa-1', entityType: 'service_account' }
			});

			await waitFor(() => {
				expect(screen.getByText('Calling Permissions')).toBeTruthy();
				expect(screen.getByText('Users')).toBeTruthy();
				// Tool Access / Agents with Access should not be present
				expect(screen.queryByText('Tool Access')).toBeNull();
				expect(screen.queryByText('Agents with Access')).toBeNull();
			});
		});

		it('calls fetchCallees and fetchCallers for service_account', async () => {
			render(PermissionsTab, {
				props: { nhiId: 'sa-1', entityType: 'service_account' }
			});

			await waitFor(() => {
				expect(mockFetchCallees).toHaveBeenCalledWith('sa-1');
				expect(mockFetchCallers).toHaveBeenCalledWith('sa-1');
			});
		});
	});

	describe('loading states', () => {
		it('shows loading skeletons initially for agent', () => {
			// Make the fetches hang so we can observe loading state
			mockFetchAgentTools.mockReturnValue(new Promise(() => {}));
			mockFetchCallees.mockReturnValue(new Promise(() => {}));
			mockFetchCallers.mockReturnValue(new Promise(() => {}));
			mockFetchNhiUsers.mockReturnValue(new Promise(() => {}));

			render(PermissionsTab, {
				props: { nhiId: 'agent-1', entityType: 'agent' }
			});

			const skeletons = document.querySelectorAll('.animate-pulse');
			expect(skeletons.length).toBeGreaterThan(0);
		});
	});
});
