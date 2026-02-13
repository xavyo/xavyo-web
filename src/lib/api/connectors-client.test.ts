import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('connectors-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	describe('fetchConnectors', () => {
		it('fetches from /api/connectors with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchConnectors } = await import('./connectors-client');

			const result = await fetchConnectors({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ items: [], total: 0, limit: 10, offset: 0 })
			);
			const { fetchConnectors } = await import('./connectors-client');

			await fetchConnectors(
				{ name_contains: 'ldap-prod', connector_type: 'ldap', status: 'active', limit: 10, offset: 5 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('name_contains=ldap-prod');
			expect(calledUrl).toContain('connector_type=ldap');
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchConnectors } = await import('./connectors-client');

			await expect(fetchConnectors({}, mockFetch)).rejects.toThrow(
				'Failed to fetch connectors: 500'
			);
		});
	});

	describe('createConnectorClient', () => {
		it('sends POST to /api/connectors with body', async () => {
			const created = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'inactive',
				created_at: '2026-01-01T00:00:00Z'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createConnectorClient } = await import('./connectors-client');

			const body = {
				name: 'LDAP Production',
				description: 'Production LDAP connector',
				connector_type: 'ldap' as const,
				config: { host: 'ldap.example.com', port: 389 },
				credentials: { bind_dn: 'cn=admin', bind_password: 'secret' }
			};
			const result = await createConnectorClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createConnectorClient } = await import('./connectors-client');

			await expect(
				createConnectorClient(
					{
						name: 'bad',
						connector_type: 'ldap',
						config: {},
						credentials: {}
					},
					mockFetch
				)
			).rejects.toThrow('Failed to create connector: 400');
		});
	});

	describe('getConnectorClient', () => {
		it('fetches from /api/connectors/:id', async () => {
			const data = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'active'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getConnectorClient } = await import('./connectors-client');

			const result = await getConnectorClient('conn-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { getConnectorClient } = await import('./connectors-client');

			await expect(getConnectorClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch connector: 404'
			);
		});
	});

	describe('updateConnectorClient', () => {
		it('sends PUT to /api/connectors/:id with body', async () => {
			const updated = {
				id: 'conn-1',
				name: 'LDAP Production Updated',
				connector_type: 'ldap',
				status: 'active'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateConnectorClient } = await import('./connectors-client');

			const body = { name: 'LDAP Production Updated', description: 'Updated description' };
			const result = await updateConnectorClient('conn-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { updateConnectorClient } = await import('./connectors-client');

			await expect(
				updateConnectorClient('conn-1', { name: '' }, mockFetch)
			).rejects.toThrow('Failed to update connector: 400');
		});
	});

	describe('deleteConnectorClient', () => {
		it('sends DELETE to /api/connectors/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { deleteConnectorClient } = await import('./connectors-client');

			await deleteConnectorClient('conn-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1', {
				method: 'DELETE'
			});
		});

		it('returns void (does not parse response body)', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null));
			const { deleteConnectorClient } = await import('./connectors-client');

			const result = await deleteConnectorClient('conn-1', mockFetch);

			expect(result).toBeUndefined();
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteConnectorClient } = await import('./connectors-client');

			await expect(deleteConnectorClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete connector: 404'
			);
		});
	});

	describe('testConnectionClient', () => {
		it('sends POST to /api/connectors/:id/test', async () => {
			const testResult = {
				success: true,
				tested_at: '2026-01-01T00:00:00Z'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(testResult));
			const { testConnectionClient } = await import('./connectors-client');

			const result = await testConnectionClient('conn-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/test', {
				method: 'POST'
			});
			expect(result).toEqual(testResult);
		});

		it('uses POST method (not GET)', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ success: false, error: 'Connection failed', tested_at: '2026-01-01' })
			);
			const { testConnectionClient } = await import('./connectors-client');

			await testConnectionClient('conn-1', mockFetch);

			const calledOptions = mockFetch.mock.calls[0][1] as RequestInit;
			expect(calledOptions.method).toBe('POST');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { testConnectionClient } = await import('./connectors-client');

			await expect(testConnectionClient('conn-1', mockFetch)).rejects.toThrow(
				'Failed to test connection: 500'
			);
		});
	});

	describe('activateConnectorClient', () => {
		it('sends POST to /api/connectors/:id/activate', async () => {
			const data = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'active'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { activateConnectorClient } = await import('./connectors-client');

			const result = await activateConnectorClient('conn-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/activate', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { activateConnectorClient } = await import('./connectors-client');

			await expect(activateConnectorClient('conn-1', mockFetch)).rejects.toThrow(
				'Failed to activate connector: 409'
			);
		});
	});

	describe('deactivateConnectorClient', () => {
		it('sends POST to /api/connectors/:id/deactivate', async () => {
			const data = {
				id: 'conn-1',
				name: 'LDAP Production',
				connector_type: 'ldap',
				status: 'inactive'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { deactivateConnectorClient } = await import('./connectors-client');

			const result = await deactivateConnectorClient('conn-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/deactivate', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { deactivateConnectorClient } = await import('./connectors-client');

			await expect(deactivateConnectorClient('conn-1', mockFetch)).rejects.toThrow(
				'Failed to deactivate connector: 409'
			);
		});
	});

	describe('getConnectorHealthClient', () => {
		it('fetches from /api/connectors/:id/health', async () => {
			const data = {
				connector_id: 'conn-1',
				is_online: true,
				consecutive_failures: 0,
				last_check_at: '2026-01-01T00:00:00Z'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getConnectorHealthClient } = await import('./connectors-client');

			const result = await getConnectorHealthClient('conn-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/connectors/conn-1/health');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { getConnectorHealthClient } = await import('./connectors-client');

			await expect(getConnectorHealthClient('conn-1', mockFetch)).rejects.toThrow(
				'Failed to fetch connector health: 500'
			);
		});
	});
});
