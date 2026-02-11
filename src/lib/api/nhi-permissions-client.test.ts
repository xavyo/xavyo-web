import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('nhi-permissions-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Agent-Tool Permissions ---

	describe('grantToolPermissionClient', () => {
		it('sends POST to /api/nhi/permissions/agents/:agent_id/tools/:tool_id/grant with body', async () => {
			const data = { agent_id: 'agent-1', tool_id: 'tool-1', expires_at: '2026-12-31', created_at: '2026-01-01' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { grantToolPermissionClient } = await import('./nhi-permissions-client');

			const body = { expires_at: '2026-12-31' };
			const result = await grantToolPermissionClient('agent-1', 'tool-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/nhi/permissions/agents/agent-1/tools/tool-1/grant',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { grantToolPermissionClient } = await import('./nhi-permissions-client');

			await expect(
				grantToolPermissionClient('agent-1', 'tool-1', {}, mockFetch)
			).rejects.toThrow('Failed to grant tool permission: 403');
		});
	});

	describe('revokeToolPermissionClient', () => {
		it('sends POST to /api/nhi/permissions/agents/:agent_id/tools/:tool_id/revoke', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ revoked: true }));
			const { revokeToolPermissionClient } = await import('./nhi-permissions-client');

			const result = await revokeToolPermissionClient('agent-1', 'tool-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/nhi/permissions/agents/agent-1/tools/tool-1/revoke',
				{ method: 'POST' }
			);
			expect(result.revoked).toBe(true);
		});
	});

	describe('fetchAgentTools', () => {
		it('fetches from /api/nhi/permissions/agents/:agent_id/tools with pagination', async () => {
			const data = { data: [], limit: 10, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAgentTools } = await import('./nhi-permissions-client');

			const result = await fetchAgentTools('agent-1', { limit: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/nhi/permissions/agents/agent-1/tools');
			expect(calledUrl).toContain('limit=10');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchAgentTools } = await import('./nhi-permissions-client');

			await expect(fetchAgentTools('agent-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch agent tools: 500'
			);
		});
	});

	describe('fetchToolAgents', () => {
		it('fetches from /api/nhi/permissions/tools/:tool_id/agents', async () => {
			const data = { data: [], limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchToolAgents } = await import('./nhi-permissions-client');

			const result = await fetchToolAgents('tool-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/permissions/tools/tool-1/agents');
			expect(result).toEqual(data);
		});
	});

	// --- NHI-to-NHI Permissions ---

	describe('grantNhiPermissionClient', () => {
		it('sends POST to /api/nhi/permissions/:id/call/:target_id/grant with body', async () => {
			const permData = { source_id: 'nhi-1', target_id: 'nhi-2', permission_type: 'invoke' };
			mockFetch.mockResolvedValueOnce(mockResponse(permData));
			const { grantNhiPermissionClient } = await import('./nhi-permissions-client');

			const body = { permission_type: 'invoke', max_calls_per_hour: 100 };
			const result = await grantNhiPermissionClient('nhi-1', 'nhi-2', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/nhi/permissions/nhi-1/call/nhi-2/grant',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(permData);
		});
	});

	describe('revokeNhiPermissionClient', () => {
		it('sends POST to /api/nhi/permissions/:id/call/:target_id/revoke', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ revoked: true }));
			const { revokeNhiPermissionClient } = await import('./nhi-permissions-client');

			const result = await revokeNhiPermissionClient('nhi-1', 'nhi-2', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/nhi/permissions/nhi-1/call/nhi-2/revoke',
				{ method: 'POST' }
			);
			expect(result.revoked).toBe(true);
		});
	});

	describe('fetchCallers', () => {
		it('fetches from /api/nhi/permissions/:id/callers with pagination', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ data: [], limit: 10, offset: 5 }));
			const { fetchCallers } = await import('./nhi-permissions-client');

			await fetchCallers('nhi-1', { limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/nhi/permissions/nhi-1/callers');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchCallers } = await import('./nhi-permissions-client');

			await expect(fetchCallers('bad-id', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch callers: 404'
			);
		});
	});

	// --- NHI-User Permissions ---

	describe('grantUserPermissionClient', () => {
		it('sends POST to /api/nhi/permissions/:id/users/:user_id/grant', async () => {
			const data = { nhi_id: 'nhi-1', user_id: 'user-1', created_at: '2026-01-01' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { grantUserPermissionClient } = await import('./nhi-permissions-client');

			const result = await grantUserPermissionClient('nhi-1', 'user-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/nhi/permissions/nhi-1/users/user-1/grant',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});
	});

	describe('revokeUserPermissionClient', () => {
		it('sends POST to /api/nhi/permissions/:id/users/:user_id/revoke', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ revoked: true }));
			const { revokeUserPermissionClient } = await import('./nhi-permissions-client');

			const result = await revokeUserPermissionClient('nhi-1', 'user-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/nhi/permissions/nhi-1/users/user-1/revoke',
				{ method: 'POST' }
			);
			expect(result.revoked).toBe(true);
		});
	});

	describe('fetchNhiUsers', () => {
		it('fetches from /api/nhi/permissions/:id/users with pagination', async () => {
			const data = { data: [], limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchNhiUsers } = await import('./nhi-permissions-client');

			const result = await fetchNhiUsers('nhi-1', { limit: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/nhi/permissions/nhi-1/users');
			expect(calledUrl).toContain('limit=20');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { fetchNhiUsers } = await import('./nhi-permissions-client');

			await expect(fetchNhiUsers('nhi-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch NHI users: 403'
			);
		});
	});
});
