import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	grantToolPermission,
	revokeToolPermission,
	listAgentTools,
	listToolAgents,
	grantNhiPermission,
	revokeNhiPermission,
	listCallers,
	listCallees,
	grantUserPermission,
	revokeUserPermission,
	listNhiUsers
} from './nhi-permissions';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('NHI Permissions API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Agent-Tool Permissions ---

	describe('grantToolPermission', () => {
		it('calls POST /nhi/agents/:agent_id/tools/:tool_id/grant with body', async () => {
			const mockResponse = { agent_id: 'agent-1', tool_id: 'tool-1', expires_at: null, created_at: '2026-01-01' };
			mockApiClient.mockResolvedValue(mockResponse);

			const body = { expires_at: '2026-12-31' };
			const result = await grantToolPermission('agent-1', 'tool-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/agents/agent-1/tools/tool-1/grant', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('revokeToolPermission', () => {
		it('calls POST /nhi/agents/:agent_id/tools/:tool_id/revoke', async () => {
			mockApiClient.mockResolvedValue({ revoked: true });

			const result = await revokeToolPermission('agent-1', 'tool-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/agents/agent-1/tools/tool-1/revoke', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.revoked).toBe(true);
		});
	});

	describe('listAgentTools', () => {
		it('calls GET /nhi/agents/:agent_id/tools with no params', async () => {
			const mockResponse = { data: [], limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listAgentTools('agent-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/agents/agent-1/tools', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ data: [], limit: 10, offset: 5 });

			await listAgentTools('agent-1', { limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('listToolAgents', () => {
		it('calls GET /nhi/tools/:tool_id/agents with pagination', async () => {
			mockApiClient.mockResolvedValue({ data: [], limit: 20, offset: 0 });

			await listToolAgents('tool-1', { limit: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/nhi/tools/tool-1/agents');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('20');
		});
	});

	// --- NHI-to-NHI Permissions ---

	describe('grantNhiPermission', () => {
		it('calls POST /nhi/:id/call/:target_id/grant with body', async () => {
			const body = { permission_type: 'invoke', max_calls_per_hour: 100 };
			const mockResponse = {
				source_id: 'nhi-1',
				target_id: 'nhi-2',
				permission_type: 'invoke',
				allowed_actions: null,
				max_calls_per_hour: 100,
				expires_at: null,
				created_at: '2026-01-01'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await grantNhiPermission('nhi-1', 'nhi-2', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/call/nhi-2/grant', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('revokeNhiPermission', () => {
		it('calls POST /nhi/:id/call/:target_id/revoke', async () => {
			mockApiClient.mockResolvedValue({ revoked: true });

			const result = await revokeNhiPermission('nhi-1', 'nhi-2', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/call/nhi-2/revoke', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.revoked).toBe(true);
		});
	});

	describe('listCallers', () => {
		it('calls GET /nhi/:id/callers with pagination', async () => {
			mockApiClient.mockResolvedValue({ data: [], limit: 20, offset: 0 });

			await listCallers('nhi-1', { limit: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/nhi/nhi-1/callers');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
		});
	});

	describe('listCallees', () => {
		it('calls GET /nhi/:id/callees with no params', async () => {
			mockApiClient.mockResolvedValue({ data: [], limit: 20, offset: 0 });

			const result = await listCallees('nhi-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/callees', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual({ data: [], limit: 20, offset: 0 });
		});
	});

	// --- NHI-User Permissions ---

	describe('grantUserPermission', () => {
		it('calls POST /nhi/:id/users/:user_id/grant with body', async () => {
			const mockResponse = { nhi_id: 'nhi-1', user_id: 'user-1', created_at: '2026-01-01' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await grantUserPermission('nhi-1', 'user-1', { permission_type: 'use' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/users/user-1/grant', {
				method: 'POST',
				body: { permission_type: 'use' },
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('revokeUserPermission', () => {
		it('calls POST /nhi/:id/users/:user_id/revoke with body', async () => {
			mockApiClient.mockResolvedValue({ revoked: true });

			const result = await revokeUserPermission('nhi-1', 'user-1', { permission_type: 'use' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/users/user-1/revoke', {
				method: 'POST',
				body: { permission_type: 'use' },
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.revoked).toBe(true);
		});
	});

	describe('listNhiUsers', () => {
		it('calls GET /nhi/:id/users with pagination', async () => {
			mockApiClient.mockResolvedValue({ data: [], limit: 10, offset: 0 });

			await listNhiUsers('nhi-1', { limit: 10, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/nhi/nhi-1/users');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('0');
		});
	});
});
