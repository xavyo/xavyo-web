import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listConnectors,
	createConnector,
	getConnector,
	updateConnector,
	deleteConnector,
	testConnection,
	activateConnector,
	deactivateConnector,
	getConnectorHealth
} from './connectors';

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

describe('Connectors API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listConnectors', () => {
		it('calls GET /connectors with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listConnectors({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes name_contains filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listConnectors({ name_contains: 'ldap-prod' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('name_contains')).toBe('ldap-prod');
		});

		it('includes connector_type filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listConnectors({ connector_type: 'ldap' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('connector_type')).toBe('ldap');
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listConnectors({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listConnectors({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});

		it('includes all params together in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 });

			await listConnectors(
				{ name_contains: 'prod', connector_type: 'database', status: 'active', limit: 10, offset: 5 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('name_contains')).toBe('prod');
			expect(params.get('connector_type')).toBe('database');
			expect(params.get('status')).toBe('active');
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('createConnector', () => {
		it('calls POST /connectors with body', async () => {
			const body = {
				name: 'LDAP Production',
				description: 'Production LDAP connector',
				connector_type: 'ldap' as const,
				config: { host: 'ldap.example.com', port: 389 },
				credentials: { bind_dn: 'cn=admin', bind_password: 'secret' }
			};
			const mockConnector = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'inactive',
				created_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockConnector);

			const result = await createConnector(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors', {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.id).toBe('conn-1');
		});
	});

	describe('getConnector', () => {
		it('calls GET /connectors/:id', async () => {
			const mockConnector = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'active'
			};
			mockApiClient.mockResolvedValue(mockConnector);

			const result = await getConnector('conn-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors/conn-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockConnector);
		});
	});

	describe('updateConnector', () => {
		it('calls PUT /connectors/:id with body', async () => {
			const body = {
				name: 'LDAP Production Updated',
				description: 'Updated description'
			};
			const mockConnector = {
				id: 'conn-1',
				name: 'LDAP Production Updated',
				description: 'Updated description',
				connector_type: 'ldap',
				status: 'active'
			};
			mockApiClient.mockResolvedValue(mockConnector);

			const result = await updateConnector('conn-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors/conn-1', {
				method: 'PUT',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.name).toBe('LDAP Production Updated');
		});
	});

	describe('deleteConnector', () => {
		it('calls DELETE /connectors/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteConnector('conn-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors/conn-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('returns void (does not return parsed body)', async () => {
			mockApiClient.mockResolvedValue(undefined);

			const result = await deleteConnector('conn-1', token, tenantId, mockFetch);

			expect(result).toBeUndefined();
		});
	});

	describe('testConnection', () => {
		it('calls POST /connectors/:id/test', async () => {
			const mockResult = {
				success: true,
				tested_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockResult);

			const result = await testConnection('conn-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors/conn-1/test', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.success).toBe(true);
		});
	});

	describe('activateConnector', () => {
		it('calls POST /connectors/:id/activate', async () => {
			const mockConnector = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'active'
			};
			mockApiClient.mockResolvedValue(mockConnector);

			const result = await activateConnector('conn-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors/conn-1/activate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.status).toBe('active');
		});
	});

	describe('deactivateConnector', () => {
		it('calls POST /connectors/:id/deactivate', async () => {
			const mockConnector = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'inactive'
			};
			mockApiClient.mockResolvedValue(mockConnector);

			const result = await deactivateConnector('conn-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors/conn-1/deactivate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.status).toBe('inactive');
		});
	});

	describe('getConnectorHealth', () => {
		it('calls GET /connectors/:id/health', async () => {
			const mockHealth = {
				connector_id: 'conn-1',
				is_online: true,
				consecutive_failures: 0,
				last_check_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockHealth);

			const result = await getConnectorHealth('conn-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/connectors/conn-1/health', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.is_online).toBe(true);
		});
	});
});
