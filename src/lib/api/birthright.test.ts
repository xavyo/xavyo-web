import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listBirthrightPolicies,
	getBirthrightPolicy,
	createBirthrightPolicy,
	updateBirthrightPolicy,
	archiveBirthrightPolicy,
	enableBirthrightPolicy,
	disableBirthrightPolicy,
	simulatePolicy,
	simulateAllPolicies,
	analyzeImpact,
	listLifecycleEvents,
	getLifecycleEvent,
	createLifecycleEvent,
	processLifecycleEvent,
	triggerLifecycleEvent
} from './birthright';

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

const TOKEN = 'test-token';
const TENANT = 'test-tenant';
const mockFetch = vi.fn();

describe('Birthright API client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Birthright Policies ---

	describe('listBirthrightPolicies', () => {
		it('calls GET /governance/birthright-policies with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listBirthrightPolicies({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/birthright-policies', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listBirthrightPolicies({ status: 'active' }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=active');
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listBirthrightPolicies({ limit: 10, offset: 20 }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('getBirthrightPolicy', () => {
		it('calls GET /governance/birthright-policies/:id', async () => {
			const mockPolicy = { id: 'policy-1', name: 'New Hire Policy', status: 'active' };
			mockApiClient.mockResolvedValue(mockPolicy);

			const result = await getBirthrightPolicy('policy-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/birthright-policies/policy-1', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockPolicy);
		});
	});

	describe('createBirthrightPolicy', () => {
		it('calls POST /governance/birthright-policies with body', async () => {
			const body = {
				name: 'New Hire Policy',
				description: 'Auto-assign entitlements for new hires',
				trigger_event: 'user_created',
				entitlement_ids: ['ent-1', 'ent-2']
			};
			const mockPolicy = { id: 'policy-1', ...body };
			mockApiClient.mockResolvedValue(mockPolicy);

			const result = await createBirthrightPolicy(body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/birthright-policies', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockPolicy);
		});
	});

	describe('updateBirthrightPolicy', () => {
		it('calls PUT /governance/birthright-policies/:id with body', async () => {
			const body = { name: 'Updated Policy', description: 'Updated description' };
			const mockPolicy = { id: 'policy-1', ...body };
			mockApiClient.mockResolvedValue(mockPolicy);

			const result = await updateBirthrightPolicy(
				'policy-1',
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/birthright-policies/policy-1', {
				method: 'PUT',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockPolicy);
		});
	});

	describe('archiveBirthrightPolicy', () => {
		it('calls DELETE /governance/birthright-policies/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await archiveBirthrightPolicy('policy-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/birthright-policies/policy-1', {
				method: 'DELETE',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
		});
	});

	describe('enableBirthrightPolicy', () => {
		it('calls POST /governance/birthright-policies/:id/enable', async () => {
			const mockPolicy = { id: 'policy-1', status: 'active' };
			mockApiClient.mockResolvedValue(mockPolicy);

			const result = await enableBirthrightPolicy('policy-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/policy-1/enable',
				{
					method: 'POST',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockPolicy);
		});
	});

	describe('disableBirthrightPolicy', () => {
		it('calls POST /governance/birthright-policies/:id/disable', async () => {
			const mockPolicy = { id: 'policy-1', status: 'disabled' };
			mockApiClient.mockResolvedValue(mockPolicy);

			const result = await disableBirthrightPolicy('policy-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/policy-1/disable',
				{
					method: 'POST',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockPolicy);
		});
	});

	describe('simulatePolicy', () => {
		it('calls POST /governance/birthright-policies/:id/simulate with body', async () => {
			const body = {
				attributes: { department: 'Engineering', role: 'developer' }
			};
			const mockResponse = {
				policy_id: 'policy-1',
				matched: true,
				entitlements: ['ent-1', 'ent-2']
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await simulatePolicy('policy-1', body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/policy-1/simulate',
				{
					method: 'POST',
					body,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('simulateAllPolicies', () => {
		it('calls POST /governance/birthright-policies/simulate with body', async () => {
			const body = {
				attributes: { department: 'Engineering', role: 'developer' }
			};
			const mockResponse = {
				results: [
					{ policy_id: 'policy-1', matched: true, entitlements: ['ent-1'] },
					{ policy_id: 'policy-2', matched: false, entitlements: [] }
				]
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await simulateAllPolicies(body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/simulate',
				{
					method: 'POST',
					body,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('analyzeImpact', () => {
		it('calls POST /governance/birthright-policies/:id/impact', async () => {
			const mockResponse = {
				policy_id: 'policy-1',
				affected_users: 42,
				entitlements_added: 84
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await analyzeImpact('policy-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/birthright-policies/policy-1/impact',
				{
					method: 'POST',
					body: {},
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Lifecycle Events ---

	describe('listLifecycleEvents', () => {
		it('calls GET /governance/lifecycle-events with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listLifecycleEvents({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/lifecycle-events', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes event_type filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLifecycleEvents({ event_type: 'user_created' }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('event_type=user_created');
		});

		it('includes processed boolean filter', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLifecycleEvents({ processed: false }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('processed=false');
		});

		it('includes user_id, from, and to filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLifecycleEvents(
				{ user_id: 'user-1', from: '2026-01-01', to: '2026-01-31' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('user_id')).toBe('user-1');
			expect(params.get('from')).toBe('2026-01-01');
			expect(params.get('to')).toBe('2026-01-31');
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 10 });

			await listLifecycleEvents({ limit: 50, offset: 10 }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('50');
			expect(params.get('offset')).toBe('10');
		});
	});

	describe('getLifecycleEvent', () => {
		it('calls GET /governance/lifecycle-events/:id', async () => {
			const mockEvent = {
				id: 'evt-1',
				event_type: 'user_created',
				user_id: 'user-1',
				processed: true
			};
			mockApiClient.mockResolvedValue(mockEvent);

			const result = await getLifecycleEvent('evt-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/lifecycle-events/evt-1', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockEvent);
		});
	});

	describe('createLifecycleEvent', () => {
		it('calls POST /governance/lifecycle-events with body', async () => {
			const body = {
				event_type: 'user_created',
				user_id: 'user-1',
				attributes: { department: 'Engineering' }
			};
			const mockEvent = { id: 'evt-1', ...body, processed: false };
			mockApiClient.mockResolvedValue(mockEvent);

			const result = await createLifecycleEvent(body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/lifecycle-events', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockEvent);
		});
	});

	describe('processLifecycleEvent', () => {
		it('calls POST /governance/lifecycle-events/:id/process', async () => {
			const mockResult = {
				id: 'evt-1',
				processed: true,
				policies_applied: 2,
				entitlements_granted: 3
			};
			mockApiClient.mockResolvedValue(mockResult);

			const result = await processLifecycleEvent('evt-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle-events/evt-1/process',
				{
					method: 'POST',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResult);
		});
	});

	describe('triggerLifecycleEvent', () => {
		it('calls POST /governance/lifecycle-events/trigger with body', async () => {
			const body = {
				event_type: 'user_created',
				user_id: 'user-1',
				attributes: { department: 'Engineering' }
			};
			const mockResult = {
				id: 'evt-1',
				processed: true,
				policies_applied: 1,
				entitlements_granted: 2
			};
			mockApiClient.mockResolvedValue(mockResult);

			const result = await triggerLifecycleEvent(body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/lifecycle-events/trigger', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResult);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(
				getBirthrightPolicy('policy-1', TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createBirthrightPolicy({} as never, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation error'));

			await expect(
				updateBirthrightPolicy('policy-1', {} as never, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Validation error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				archiveBirthrightPolicy('policy-1', TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for lifecycle events', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				listLifecycleEvents({}, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Unauthorized');
		});

		it('propagates errors from apiClient for simulate', async () => {
			mockApiClient.mockRejectedValue(new Error('Service unavailable'));

			await expect(
				simulatePolicy('policy-1', {} as never, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Service unavailable');
		});

		it('propagates errors from apiClient for impact analysis', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				analyzeImpact('policy-1', TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for trigger', async () => {
			mockApiClient.mockRejectedValue(new Error('Bad request'));

			await expect(
				triggerLifecycleEvent({} as never, TOKEN, TENANT, mockFetch)
			).rejects.toThrow('Bad request');
		});
	});
});
