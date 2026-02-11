import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listEntitlements,
	createEntitlement,
	getEntitlement,
	updateEntitlement,
	deleteEntitlement,
	setEntitlementOwner,
	removeEntitlementOwner,
	listSodRules,
	createSodRule,
	getSodRule,
	updateSodRule,
	deleteSodRule,
	enableSodRule,
	disableSodRule,
	listSodViolations,
	listCampaigns,
	createCampaign,
	getCampaign,
	updateCampaign,
	deleteCampaign,
	launchCampaign,
	cancelCampaign,
	getCampaignProgress,
	listCampaignItems,
	decideCertificationItem,
	listMyCertifications
} from './governance';

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

describe('Governance API — Entitlements', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listEntitlements', () => {
		it('calls GET /governance/entitlements with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listEntitlements({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/entitlements', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listEntitlements({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/entitlements?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
		});

		it('includes risk_level filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listEntitlements({ risk_level: 'high' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('risk_level')).toBe('high');
		});

		it('includes classification filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listEntitlements({ classification: 'sensitive' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('classification')).toBe('sensitive');
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listEntitlements({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});

		it('omits undefined params from query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listEntitlements({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.has('risk_level')).toBe(false);
			expect(params.has('classification')).toBe(false);
			expect(params.has('limit')).toBe(false);
			expect(params.has('offset')).toBe(false);
		});
	});

	describe('createEntitlement', () => {
		it('calls POST /governance/entitlements with body', async () => {
			const data = {
				application_id: 'app-1',
				name: 'Admin Access',
				risk_level: 'high' as const,
				data_protection_classification: 'sensitive' as const
			};
			mockApiClient.mockResolvedValue({ id: 'ent-1', ...data });

			const result = await createEntitlement(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/entitlements', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getEntitlement', () => {
		it('calls GET /governance/entitlements/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'ent-1', name: 'Admin Access' });

			await getEntitlement('ent-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/entitlements/ent-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateEntitlement', () => {
		it('calls PATCH /governance/entitlements/:id with body', async () => {
			const data = { name: 'Updated Entitlement', risk_level: 'critical' as const };
			mockApiClient.mockResolvedValue({ id: 'ent-1', ...data });

			await updateEntitlement('ent-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/entitlements/ent-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteEntitlement', () => {
		it('calls DELETE /governance/entitlements/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteEntitlement('ent-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/entitlements/ent-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('setEntitlementOwner', () => {
		it('calls PUT /governance/entitlements/:id/owner with owner_id body', async () => {
			mockApiClient.mockResolvedValue({ id: 'ent-1', owner_id: 'user-42' });

			const result = await setEntitlementOwner('ent-1', 'user-42', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/entitlements/ent-1/owner', {
				method: 'PUT',
				body: { owner_id: 'user-42' },
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('removeEntitlementOwner', () => {
		it('calls DELETE /governance/entitlements/:id/owner', async () => {
			mockApiClient.mockResolvedValue({ id: 'ent-1', owner_id: null });

			const result = await removeEntitlementOwner('ent-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/entitlements/ent-1/owner', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});
});

describe('Governance API — SoD Rules', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listSodRules', () => {
		it('calls GET /governance/sod-rules with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSodRules({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listSodRules({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
		});

		it('includes severity filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listSodRules({ severity: 'critical' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('severity')).toBe('critical');
		});

		it('includes entitlement_id filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listSodRules({ entitlement_id: 'ent-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('entitlement_id')).toBe('ent-1');
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listSodRules({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('createSodRule', () => {
		it('calls POST /governance/sod-rules with body', async () => {
			const data = {
				name: 'No Admin + Finance',
				first_entitlement_id: 'ent-1',
				second_entitlement_id: 'ent-2',
				severity: 'high' as const
			};
			mockApiClient.mockResolvedValue({ id: 'sod-1', ...data });

			const result = await createSodRule(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getSodRule', () => {
		it('calls GET /governance/sod-rules/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'sod-1', name: 'No Admin + Finance' });

			await getSodRule('sod-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules/sod-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateSodRule', () => {
		it('calls PATCH /governance/sod-rules/:id with body', async () => {
			const data = { name: 'Updated Rule', severity: 'critical' as const };
			mockApiClient.mockResolvedValue({ id: 'sod-1', ...data });

			await updateSodRule('sod-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules/sod-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteSodRule', () => {
		it('calls DELETE /governance/sod-rules/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteSodRule('sod-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules/sod-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('enableSodRule', () => {
		it('calls POST /governance/sod-rules/:id/enable', async () => {
			mockApiClient.mockResolvedValue({ id: 'sod-1', status: 'active' });

			const result = await enableSodRule('sod-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules/sod-1/enable', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('disableSodRule', () => {
		it('calls POST /governance/sod-rules/:id/disable', async () => {
			mockApiClient.mockResolvedValue({ id: 'sod-1', status: 'inactive' });

			const result = await disableSodRule('sod-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-rules/sod-1/disable', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('listSodViolations', () => {
		it('calls GET /governance/sod-violations with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSodViolations({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-violations', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 5 });

			await listSodViolations({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});
});

describe('Governance API — Certifications', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listCampaigns', () => {
		it('calls GET /governance/certification-campaigns with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCampaigns({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-campaigns', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listCampaigns({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 30 });

			await listCampaigns({ limit: 10, offset: 30 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('30');
		});
	});

	describe('createCampaign', () => {
		it('calls POST /governance/certification-campaigns with body', async () => {
			const data = {
				name: 'Q1 Access Review',
				scope_type: 'all_users' as const,
				reviewer_type: 'user_manager' as const,
				deadline: '2024-03-31T00:00:00Z'
			};
			mockApiClient.mockResolvedValue({ id: 'camp-1', ...data });

			const result = await createCampaign(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-campaigns', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getCampaign', () => {
		it('calls GET /governance/certification-campaigns/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'camp-1', name: 'Q1 Access Review' });

			await getCampaign('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-campaigns/camp-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateCampaign', () => {
		it('calls PATCH /governance/certification-campaigns/:id with body', async () => {
			const data = { name: 'Updated Campaign', deadline: '2024-06-30T00:00:00Z' };
			mockApiClient.mockResolvedValue({ id: 'camp-1', ...data });

			await updateCampaign('camp-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-campaigns/camp-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteCampaign', () => {
		it('calls DELETE /governance/certification-campaigns/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteCampaign('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-campaigns/camp-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('launchCampaign', () => {
		it('calls POST /governance/certification-campaigns/:id/launch', async () => {
			mockApiClient.mockResolvedValue({ id: 'camp-1', status: 'active' });

			const result = await launchCampaign('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-campaigns/camp-1/launch', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('cancelCampaign', () => {
		it('calls POST /governance/certification-campaigns/:id/cancel', async () => {
			mockApiClient.mockResolvedValue({ id: 'camp-1', status: 'cancelled' });

			const result = await cancelCampaign('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-campaigns/camp-1/cancel', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getCampaignProgress', () => {
		it('calls GET /governance/certification-campaigns/:id/progress', async () => {
			const mockProgress = {
				total_items: 100,
				pending_items: 40,
				approved_items: 50,
				revoked_items: 10,
				completion_percentage: 60
			};
			mockApiClient.mockResolvedValue(mockProgress);

			const result = await getCampaignProgress('camp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/certification-campaigns/camp-1/progress',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockProgress);
		});
	});

	describe('listCampaignItems', () => {
		it('calls GET /governance/certification-campaigns/:id/items with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCampaignItems('camp-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/certification-campaigns/camp-1/items',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listCampaignItems('camp-1', { limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/certification-campaigns/camp-1/items?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('decideCertificationItem', () => {
		it('calls POST /governance/certification-items/:id/decide with body', async () => {
			const data = { decision: 'approved' as const, notes: 'Looks good' };
			mockApiClient.mockResolvedValue({ id: 'item-1', status: 'approved' });

			const result = await decideCertificationItem('item-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-items/item-1/decide', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});

		it('calls POST with revoked decision', async () => {
			const data = { decision: 'revoked' as const, notes: 'No longer needed' };
			mockApiClient.mockResolvedValue({ id: 'item-2', status: 'revoked' });

			await decideCertificationItem('item-2', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-items/item-2/decide', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('listMyCertifications', () => {
		it('calls GET /governance/my-certifications with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listMyCertifications({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/my-certifications', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 5 });

			await listMyCertifications({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/my-certifications?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});
});
