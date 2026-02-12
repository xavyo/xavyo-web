import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listLicensePools,
	createLicensePool,
	getLicensePool,
	updateLicensePool,
	deleteLicensePool,
	archiveLicensePool,
	listLicenseAssignments,
	createLicenseAssignment,
	getLicenseAssignment,
	deallocateLicenseAssignment,
	bulkAssignLicenses,
	bulkReclaimLicenses,
	listReclamationRules,
	createReclamationRule,
	getReclamationRule,
	updateReclamationRule,
	deleteReclamationRule,
	listLicenseIncompatibilities,
	createLicenseIncompatibility,
	getLicenseIncompatibility,
	deleteLicenseIncompatibility,
	listLicenseEntitlementLinks,
	createLicenseEntitlementLink,
	getLicenseEntitlementLink,
	deleteLicenseEntitlementLink,
	toggleLicenseEntitlementLink,
	getLicenseDashboard,
	getLicenseRecommendations,
	getExpiringLicensePools,
	generateComplianceReport,
	getLicenseAuditTrail
} from './licenses';

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

describe('Licenses API client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- License Pools ---

	describe('listLicensePools', () => {
		it('calls GET /governance/license-pools with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listLicensePools({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-pools', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes vendor filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLicensePools({ vendor: 'Microsoft' }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/license-pools?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('vendor')).toBe('Microsoft');
		});

		it('includes status and license_type filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLicensePools(
				{ status: 'active', license_type: 'named' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
			expect(params.get('license_type')).toBe('named');
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listLicensePools({ limit: 10, offset: 20 }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('createLicensePool', () => {
		it('calls POST /governance/license-pools with body', async () => {
			const body = {
				name: 'Office 365 E3',
				vendor: 'Microsoft',
				license_type: 'named',
				total_seats: 100
			};
			const mockPool = { id: 'pool-1', ...body };
			mockApiClient.mockResolvedValue(mockPool);

			const result = await createLicensePool(
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-pools', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockPool);
		});
	});

	describe('getLicensePool', () => {
		it('calls GET /governance/license-pools/:id', async () => {
			const mockPool = { id: 'pool-1', name: 'Office 365 E3' };
			mockApiClient.mockResolvedValue(mockPool);

			const result = await getLicensePool('pool-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-pools/pool-1', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockPool);
		});
	});

	describe('updateLicensePool', () => {
		it('calls PUT /governance/license-pools/:id with body', async () => {
			const body = { name: 'Updated Pool', total_seats: 200 };
			const mockPool = { id: 'pool-1', ...body };
			mockApiClient.mockResolvedValue(mockPool);

			const result = await updateLicensePool(
				'pool-1',
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-pools/pool-1', {
				method: 'PUT',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockPool);
		});
	});

	describe('deleteLicensePool', () => {
		it('calls DELETE /governance/license-pools/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteLicensePool('pool-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-pools/pool-1', {
				method: 'DELETE',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
		});
	});

	describe('archiveLicensePool', () => {
		it('calls POST /governance/license-pools/:id/archive', async () => {
			const mockPool = { id: 'pool-1', status: 'archived' };
			mockApiClient.mockResolvedValue(mockPool);

			const result = await archiveLicensePool('pool-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-pools/pool-1/archive', {
				method: 'POST',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockPool);
		});
	});

	// --- License Assignments ---

	describe('listLicenseAssignments', () => {
		it('calls GET /governance/license-assignments with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listLicenseAssignments({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-assignments', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes license_pool_id and user_id filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLicenseAssignments(
				{ license_pool_id: 'pool-1', user_id: 'user-1' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('license_pool_id')).toBe('pool-1');
			expect(params.get('user_id')).toBe('user-1');
		});

		it('includes status and source filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLicenseAssignments(
				{ status: 'active', source: 'manual' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
			expect(params.get('source')).toBe('manual');
		});
	});

	describe('createLicenseAssignment', () => {
		it('calls POST /governance/license-assignments with body', async () => {
			const body = { license_pool_id: 'pool-1', user_id: 'user-1' };
			const mockAssignment = { id: 'assign-1', ...body };
			mockApiClient.mockResolvedValue(mockAssignment);

			const result = await createLicenseAssignment(
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-assignments', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockAssignment);
		});
	});

	describe('getLicenseAssignment', () => {
		it('calls GET /governance/license-assignments/:id', async () => {
			const mockAssignment = { id: 'assign-1', license_pool_id: 'pool-1' };
			mockApiClient.mockResolvedValue(mockAssignment);

			const result = await getLicenseAssignment('assign-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-assignments/assign-1', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockAssignment);
		});
	});

	describe('deallocateLicenseAssignment', () => {
		it('calls DELETE /governance/license-assignments/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deallocateLicenseAssignment('assign-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-assignments/assign-1', {
				method: 'DELETE',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
		});
	});

	describe('bulkAssignLicenses', () => {
		it('calls POST /governance/license-assignments/bulk-assign with body', async () => {
			const body = {
				license_pool_id: 'pool-1',
				user_ids: ['user-1', 'user-2', 'user-3']
			};
			const mockResult = { total: 3, succeeded: 3, failed: 0, errors: [] };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await bulkAssignLicenses(body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-assignments/bulk-assign',
				{
					method: 'POST',
					body,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResult);
		});
	});

	describe('bulkReclaimLicenses', () => {
		it('calls POST /governance/license-assignments/bulk-reclaim with body', async () => {
			const body = {
				license_pool_id: 'pool-1',
				user_ids: ['user-1', 'user-2']
			};
			const mockResult = { total: 2, succeeded: 2, failed: 0, errors: [] };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await bulkReclaimLicenses(body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-assignments/bulk-reclaim',
				{
					method: 'POST',
					body,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResult);
		});
	});

	// --- Reclamation Rules ---

	describe('listReclamationRules', () => {
		it('calls GET /governance/license-reclamation-rules with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listReclamationRules({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-reclamation-rules', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes license_pool_id, trigger_type and enabled filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listReclamationRules(
				{ license_pool_id: 'pool-1', trigger_type: 'inactivity', enabled: true },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('license_pool_id')).toBe('pool-1');
			expect(params.get('trigger_type')).toBe('inactivity');
			expect(params.get('enabled')).toBe('true');
		});
	});

	describe('createReclamationRule', () => {
		it('calls POST /governance/license-reclamation-rules with body', async () => {
			const body = {
				license_pool_id: 'pool-1',
				trigger_type: 'inactivity',
				threshold_days: 90,
				action: 'revoke'
			};
			const mockRule = { id: 'rule-1', ...body };
			mockApiClient.mockResolvedValue(mockRule);

			const result = await createReclamationRule(body as never, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-reclamation-rules', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockRule);
		});
	});

	describe('getReclamationRule', () => {
		it('calls GET /governance/license-reclamation-rules/:id', async () => {
			const mockRule = { id: 'rule-1', trigger_type: 'inactivity' };
			mockApiClient.mockResolvedValue(mockRule);

			const result = await getReclamationRule('rule-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-reclamation-rules/rule-1',
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockRule);
		});
	});

	describe('updateReclamationRule', () => {
		it('calls PUT /governance/license-reclamation-rules/:id with body', async () => {
			const body = { threshold_days: 60 };
			const mockRule = { id: 'rule-1', ...body };
			mockApiClient.mockResolvedValue(mockRule);

			const result = await updateReclamationRule(
				'rule-1',
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-reclamation-rules/rule-1',
				{
					method: 'PUT',
					body,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockRule);
		});
	});

	describe('deleteReclamationRule', () => {
		it('calls DELETE /governance/license-reclamation-rules/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteReclamationRule('rule-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-reclamation-rules/rule-1',
				{
					method: 'DELETE',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
		});
	});

	// --- License Incompatibilities ---

	describe('listLicenseIncompatibilities', () => {
		it('calls GET /governance/license-incompatibilities with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listLicenseIncompatibilities({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-incompatibilities', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pool_id filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLicenseIncompatibilities(
				{ pool_id: 'pool-1' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('pool_id')).toBe('pool-1');
		});
	});

	describe('createLicenseIncompatibility', () => {
		it('calls POST /governance/license-incompatibilities with body', async () => {
			const body = {
				pool_a_id: 'pool-1',
				pool_b_id: 'pool-2',
				reason: 'Conflicting license terms'
			};
			const mockIncompat = { id: 'incompat-1', ...body };
			mockApiClient.mockResolvedValue(mockIncompat);

			const result = await createLicenseIncompatibility(
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-incompatibilities', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockIncompat);
		});
	});

	describe('getLicenseIncompatibility', () => {
		it('calls GET /governance/license-incompatibilities/:id', async () => {
			const mockIncompat = { id: 'incompat-1', pool_a_id: 'pool-1' };
			mockApiClient.mockResolvedValue(mockIncompat);

			const result = await getLicenseIncompatibility('incompat-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-incompatibilities/incompat-1',
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockIncompat);
		});
	});

	describe('deleteLicenseIncompatibility', () => {
		it('calls DELETE /governance/license-incompatibilities/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteLicenseIncompatibility('incompat-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-incompatibilities/incompat-1',
				{
					method: 'DELETE',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
		});
	});

	// --- License-Entitlement Links ---

	describe('listLicenseEntitlementLinks', () => {
		it('calls GET /governance/license-entitlement-links with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listLicenseEntitlementLinks({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-entitlement-links', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes license_pool_id and entitlement_id filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLicenseEntitlementLinks(
				{ license_pool_id: 'pool-1', entitlement_id: 'ent-1' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('license_pool_id')).toBe('pool-1');
			expect(params.get('entitlement_id')).toBe('ent-1');
		});

		it('includes enabled boolean filter', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listLicenseEntitlementLinks({ enabled: true }, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('enabled')).toBe('true');
		});
	});

	describe('createLicenseEntitlementLink', () => {
		it('calls POST /governance/license-entitlement-links with body', async () => {
			const body = {
				license_pool_id: 'pool-1',
				entitlement_id: 'ent-1',
				consumption_model: 'one-per-user'
			};
			const mockLink = { id: 'link-1', ...body, enabled: true };
			mockApiClient.mockResolvedValue(mockLink);

			const result = await createLicenseEntitlementLink(
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/license-entitlement-links', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT,
				fetch: mockFetch
			});
			expect(result).toEqual(mockLink);
		});
	});

	describe('getLicenseEntitlementLink', () => {
		it('calls GET /governance/license-entitlement-links/:id', async () => {
			const mockLink = { id: 'link-1', license_pool_id: 'pool-1' };
			mockApiClient.mockResolvedValue(mockLink);

			const result = await getLicenseEntitlementLink('link-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-entitlement-links/link-1',
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockLink);
		});
	});

	describe('deleteLicenseEntitlementLink', () => {
		it('calls DELETE /governance/license-entitlement-links/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteLicenseEntitlementLink('link-1', TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-entitlement-links/link-1',
				{
					method: 'DELETE',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
		});
	});

	describe('toggleLicenseEntitlementLink', () => {
		it('calls POST /governance/license-entitlement-links/:id/enable when enabled=true', async () => {
			const mockLink = { id: 'link-1', enabled: true };
			mockApiClient.mockResolvedValue(mockLink);

			const result = await toggleLicenseEntitlementLink(
				'link-1',
				true,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-entitlement-links/link-1/enable',
				{
					method: 'POST',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockLink);
		});

		it('calls POST /governance/license-entitlement-links/:id/disable when enabled=false', async () => {
			const mockLink = { id: 'link-1', enabled: false };
			mockApiClient.mockResolvedValue(mockLink);

			const result = await toggleLicenseEntitlementLink(
				'link-1',
				false,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-entitlement-links/link-1/disable',
				{
					method: 'POST',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockLink);
		});
	});

	// --- License Analytics ---

	describe('getLicenseDashboard', () => {
		it('calls GET /governance/license-analytics/dashboard', async () => {
			const mockDashboard = {
				total_pools: 5,
				total_assigned: 120,
				total_available: 80,
				utilization_rate: 0.6
			};
			mockApiClient.mockResolvedValue(mockDashboard);

			const result = await getLicenseDashboard(TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-analytics/dashboard',
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockDashboard);
		});
	});

	describe('getLicenseRecommendations', () => {
		it('calls GET /governance/license-analytics/recommendations', async () => {
			const mockRecs = [
				{ type: 'reclaim', pool_id: 'pool-1', message: 'Low utilization' }
			];
			mockApiClient.mockResolvedValue(mockRecs);

			const result = await getLicenseRecommendations(TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-analytics/recommendations',
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockRecs);
		});
	});

	describe('getExpiringLicensePools', () => {
		it('calls GET /governance/license-analytics/expiring without within_days', async () => {
			const mockResponse = { items: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getExpiringLicensePools(undefined, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-analytics/expiring',
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes within_days param when provided', async () => {
			const mockResponse = { items: [{ id: 'pool-1', expires_at: '2026-03-01' }], total: 1 };
			mockApiClient.mockResolvedValue(mockResponse);

			await getExpiringLicensePools(30, TOKEN, TENANT, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/license-analytics/expiring?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('within_days')).toBe('30');
		});
	});

	// --- License Reports ---

	describe('generateComplianceReport', () => {
		it('calls POST /governance/license-reports/compliance with body', async () => {
			const body = { pool_ids: ['pool-1', 'pool-2'], include_assignments: true };
			const mockReport = { id: 'report-1', status: 'completed', data: {} };
			mockApiClient.mockResolvedValue(mockReport);

			const result = await generateComplianceReport(
				body as never,
				TOKEN,
				TENANT,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-reports/compliance',
				{
					method: 'POST',
					body,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockReport);
		});

		it('calls POST /governance/license-reports/compliance with undefined body', async () => {
			const mockReport = { id: 'report-2', status: 'completed', data: {} };
			mockApiClient.mockResolvedValue(mockReport);

			const result = await generateComplianceReport(undefined, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-reports/compliance',
				{
					method: 'POST',
					body: undefined,
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockReport);
		});
	});

	describe('getLicenseAuditTrail', () => {
		it('calls GET /governance/license-reports/audit-trail with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getLicenseAuditTrail({}, TOKEN, TENANT, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/license-reports/audit-trail',
				{
					method: 'GET',
					token: TOKEN,
					tenantId: TENANT,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes pool_id, user_id, and action filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await getLicenseAuditTrail(
				{ pool_id: 'pool-1', user_id: 'user-1', action: 'assign' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('pool_id')).toBe('pool-1');
			expect(params.get('user_id')).toBe('user-1');
			expect(params.get('action')).toBe('assign');
		});

		it('includes date range filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await getLicenseAuditTrail(
				{ from_date: '2026-01-01', to_date: '2026-01-31' },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('from_date')).toBe('2026-01-01');
			expect(params.get('to_date')).toBe('2026-01-31');
		});

		it('includes limit and offset pagination params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 100 });

			await getLicenseAuditTrail(
				{ limit: 50, offset: 100 },
				TOKEN,
				TENANT,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('50');
			expect(params.get('offset')).toBe('100');
		});
	});
});
