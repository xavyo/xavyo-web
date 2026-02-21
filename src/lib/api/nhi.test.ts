import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listNhi,
	createTool,
	getTool,
	updateTool,
	deleteTool,
	createAgent,
	getAgent,
	updateAgent,
	deleteAgent,
	createServiceAccount,
	getServiceAccount,
	updateServiceAccount,
	deleteServiceAccount,
	activateNhi,
	suspendNhi,
	reactivateNhi,
	deprecateNhi,
	archiveNhi
} from './nhi';

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

describe('NHI API — unified list', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listNhi', () => {
		it('calls GET /nhi with no params', async () => {
			const mockResponse = { data: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listNhi({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes nhi_type filter in query string', async () => {
			mockApiClient.mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 });

			await listNhi({ nhi_type: 'tool' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi?nhi_type=tool', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('includes lifecycle_state filter in query string', async () => {
			mockApiClient.mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 });

			await listNhi({ lifecycle_state: 'active' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi?lifecycle_state=active', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});

describe('NHI API — tools', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createTool', () => {
		it('calls POST /nhi/tools with body', async () => {
			const data = { name: 'Weather API', input_schema: { type: 'object' } };
			mockApiClient.mockResolvedValue({ id: 'nhi-1', nhi_type: 'tool', ...data });

			const result = await createTool(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/tools', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getTool', () => {
		it('calls GET /nhi/tools/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'nhi-1', nhi_type: 'tool' });

			await getTool('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/tools/nhi-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateTool', () => {
		it('calls PATCH /nhi/tools/:id with body', async () => {
			const data = { name: 'Updated Tool' };
			mockApiClient.mockResolvedValue({ id: 'nhi-1', name: 'Updated Tool' });

			await updateTool('nhi-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/tools/nhi-1', {
				method: 'PATCH',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteTool', () => {
		it('calls DELETE /nhi/tools/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteTool('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/tools/nhi-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});

describe('NHI API — agents', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createAgent', () => {
		it('calls POST /nhi/agents with body', async () => {
			const data = { name: 'Code Assistant', agent_type: 'copilot' };
			mockApiClient.mockResolvedValue({ id: 'nhi-2', nhi_type: 'agent', ...data });

			await createAgent(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/agents', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('getAgent', () => {
		it('calls GET /nhi/agents/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'nhi-2', nhi_type: 'agent' });

			await getAgent('nhi-2', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/agents/nhi-2', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateAgent', () => {
		it('calls PATCH /nhi/agents/:id with body', async () => {
			const data = { model_name: 'claude-4' };
			mockApiClient.mockResolvedValue({ id: 'nhi-2', model_name: 'claude-4' });

			await updateAgent('nhi-2', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/agents/nhi-2', {
				method: 'PATCH',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteAgent', () => {
		it('calls DELETE /nhi/agents/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteAgent('nhi-2', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/agents/nhi-2', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});

describe('NHI API — service accounts', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createServiceAccount', () => {
		it('calls POST /nhi/service-accounts with body', async () => {
			const data = { name: 'CI Pipeline', purpose: 'CI builds' };
			mockApiClient.mockResolvedValue({ id: 'nhi-3', nhi_type: 'service_account', ...data });

			await createServiceAccount(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/service-accounts', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('getServiceAccount', () => {
		it('calls GET /nhi/service-accounts/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'nhi-3', nhi_type: 'service_account' });

			await getServiceAccount('nhi-3', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/service-accounts/nhi-3', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateServiceAccount', () => {
		it('calls PATCH /nhi/service-accounts/:id with body', async () => {
			const data = { environment: 'production' };
			mockApiClient.mockResolvedValue({ id: 'nhi-3', environment: 'production' });

			await updateServiceAccount('nhi-3', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/service-accounts/nhi-3', {
				method: 'PATCH',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteServiceAccount', () => {
		it('calls DELETE /nhi/service-accounts/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteServiceAccount('nhi-3', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/service-accounts/nhi-3', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});

describe('NHI API — lifecycle', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('activateNhi', () => {
		it('calls POST /nhi/:id/activate', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await activateNhi('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/activate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('suspendNhi', () => {
		it('calls POST /nhi/:id/suspend with reason', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await suspendNhi('nhi-1', 'Security review', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/suspend', {
				method: 'POST',
				body: { reason: 'Security review' },
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('calls POST /nhi/:id/suspend without reason', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await suspendNhi('nhi-1', undefined, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/suspend', {
				method: 'POST',
				body: undefined,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('reactivateNhi', () => {
		it('calls POST /nhi/:id/reactivate', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await reactivateNhi('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/reactivate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deprecateNhi', () => {
		it('calls POST /nhi/:id/deprecate', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deprecateNhi('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/deprecate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('archiveNhi', () => {
		it('calls POST /nhi/:id/archive', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await archiveNhi('nhi-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/nhi/nhi-1/archive', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});

