import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listMetaRoles,
	createMetaRole,
	getMetaRole,
	updateMetaRole,
	deleteMetaRole,
	enableMetaRole,
	disableMetaRole,
	addCriterion,
	removeCriterion,
	addEntitlement,
	removeEntitlement,
	addConstraint,
	removeConstraint,
	listInheritances,
	reevaluateMetaRole,
	simulateMetaRole,
	cascadeMetaRole,
	listConflicts,
	resolveConflict,
	listEvents,
	getEventStats
} from './meta-roles';

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

const META_ROLE_ID = '00000000-0000-0000-0000-000000000001';
const CRITERIA_ID = '00000000-0000-0000-0000-000000000002';
const ENTITLEMENT_ID = '00000000-0000-0000-0000-000000000003';
const CONSTRAINT_ID = '00000000-0000-0000-0000-000000000004';
const CONFLICT_ID = '00000000-0000-0000-0000-000000000005';

describe('Meta-Roles API — CRUD', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listMetaRoles', () => {
		it('calls GET /governance/meta-roles with query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listMetaRoles(
				{ limit: 50, offset: 0, status: 'active' },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledOnce();
			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/meta-roles?');
			expect(calledPath).toContain('limit=50');
			expect(calledPath).toContain('offset=0');
			expect(calledPath).toContain('status=active');
			expect((mockApiClient.mock.calls[0] as unknown[])[1]).toMatchObject({
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('calls GET /governance/meta-roles with no params when empty', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listMetaRoles({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/meta-roles', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('createMetaRole', () => {
		it('calls POST /governance/meta-roles with body', async () => {
			const data = { name: 'Auto Finance', priority: 10 };
			const mockResponse = { id: META_ROLE_ID, ...data, status: 'active' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createMetaRole(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/meta-roles', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getMetaRole', () => {
		it('calls GET /governance/meta-roles/:id', async () => {
			const mockResponse = {
				id: META_ROLE_ID,
				name: 'Auto Finance',
				criteria: [],
				entitlements: [],
				constraints: [],
				stats: null
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getMetaRole(META_ROLE_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}`,
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateMetaRole', () => {
		it('calls PUT /governance/meta-roles/:id with body', async () => {
			const data = { name: 'Updated Meta-Role', priority: 20 };
			mockApiClient.mockResolvedValue({ id: META_ROLE_ID, ...data });

			const result = await updateMetaRole(META_ROLE_ID, data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}`,
				{
					method: 'PUT',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toBeDefined();
		});
	});

	describe('deleteMetaRole', () => {
		it('calls DELETE /governance/meta-roles/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteMetaRole(META_ROLE_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}`,
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Meta-Roles API — Enable / Disable', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('enableMetaRole', () => {
		it('calls POST /governance/meta-roles/:id/enable', async () => {
			const mockResponse = { id: META_ROLE_ID, status: 'active' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await enableMetaRole(META_ROLE_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/enable`,
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('disableMetaRole', () => {
		it('calls POST /governance/meta-roles/:id/disable', async () => {
			const mockResponse = { id: META_ROLE_ID, status: 'disabled' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await disableMetaRole(META_ROLE_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/disable`,
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});
});

describe('Meta-Roles API — Criteria', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('addCriterion', () => {
		it('calls POST /governance/meta-roles/:id/criteria with body', async () => {
			const data = { field: 'department', operator: 'eq' as const, value: 'finance' };
			const mockResponse = { id: CRITERIA_ID, meta_role_id: META_ROLE_ID, ...data };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await addCriterion(META_ROLE_ID, data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/criteria`,
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeCriterion', () => {
		it('calls DELETE /governance/meta-roles/:id/criteria/:criteriaId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeCriterion(META_ROLE_ID, CRITERIA_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/criteria/${CRITERIA_ID}`,
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Meta-Roles API — Entitlements', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('addEntitlement', () => {
		it('calls POST /governance/meta-roles/:id/entitlements with body', async () => {
			const data = { entitlement_id: ENTITLEMENT_ID, permission_type: 'grant' as const };
			const mockResponse = {
				id: 'mapping-1',
				meta_role_id: META_ROLE_ID,
				entitlement_id: ENTITLEMENT_ID,
				permission_type: 'grant'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await addEntitlement(META_ROLE_ID, data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/entitlements`,
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeEntitlement', () => {
		it('calls DELETE /governance/meta-roles/:id/entitlements/:eid', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeEntitlement(META_ROLE_ID, ENTITLEMENT_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/entitlements/${ENTITLEMENT_ID}`,
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Meta-Roles API — Constraints', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('addConstraint', () => {
		it('calls POST /governance/meta-roles/:id/constraints with body', async () => {
			const data = {
				constraint_type: 'require_mfa' as const,
				constraint_value: { enabled: true }
			};
			const mockResponse = {
				id: CONSTRAINT_ID,
				meta_role_id: META_ROLE_ID,
				...data
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await addConstraint(META_ROLE_ID, data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/constraints`,
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeConstraint', () => {
		it('calls DELETE /governance/meta-roles/:id/constraints/:cid', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeConstraint(META_ROLE_ID, CONSTRAINT_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/constraints/${CONSTRAINT_ID}`,
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Meta-Roles API — Inheritances', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listInheritances', () => {
		it('calls GET /governance/meta-roles/:id/inheritances with query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listInheritances(
				META_ROLE_ID,
				{ limit: 50, offset: 0, status: 'active' },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledOnce();
			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain(`/governance/meta-roles/${META_ROLE_ID}/inheritances?`);
			expect(calledPath).toContain('limit=50');
			expect(calledPath).toContain('status=active');
			expect((mockApiClient.mock.calls[0] as unknown[])[1]).toMatchObject({
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('calls without query string when params are empty', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listInheritances(META_ROLE_ID, {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/inheritances`,
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Meta-Roles API — Operations', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('reevaluateMetaRole', () => {
		it('calls POST /governance/meta-roles/:id/reevaluate', async () => {
			const mockResponse = {
				active_inheritances: 5,
				unresolved_conflicts: 0,
				criteria_count: 2,
				entitlements_count: 3,
				constraints_count: 1
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await reevaluateMetaRole(META_ROLE_ID, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/reevaluate`,
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('simulateMetaRole', () => {
		it('calls POST /governance/meta-roles/:id/simulate with body', async () => {
			const data = { simulation_type: 'update' as const, limit: 100 };
			const mockResponse = {
				simulation_type: 'update',
				roles_to_add: [],
				roles_to_remove: [],
				potential_conflicts: [],
				conflicts_to_resolve: [],
				summary: {
					total_roles_affected: 0,
					roles_gaining_inheritance: 0,
					roles_losing_inheritance: 0,
					new_conflicts: 0,
					resolved_conflicts: 0,
					is_safe: true,
					warnings: []
				}
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await simulateMetaRole(META_ROLE_ID, data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/simulate`,
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('cascadeMetaRole', () => {
		it('calls POST /governance/meta-roles/:id/cascade with body', async () => {
			const data = { meta_role_id: META_ROLE_ID, dry_run: true };
			const mockResponse = {
				meta_role_id: META_ROLE_ID,
				in_progress: false,
				processed_count: 10,
				remaining_count: 0,
				success_count: 10,
				failure_count: 0,
				started_at: '2026-01-01T00:00:00Z',
				completed_at: '2026-01-01T00:00:05Z',
				failures: null
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await cascadeMetaRole(META_ROLE_ID, data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/${META_ROLE_ID}/cascade`,
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});
});

describe('Meta-Roles API — Conflicts', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listConflicts', () => {
		it('calls GET /governance/meta-roles/conflicts with query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listConflicts(
				{ resolution_status: 'unresolved', limit: 50, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledOnce();
			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/meta-roles/conflicts?');
			expect(calledPath).toContain('resolution_status=unresolved');
			expect(calledPath).toContain('limit=50');
			expect((mockApiClient.mock.calls[0] as unknown[])[1]).toMatchObject({
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('calls without query string when params are empty', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listConflicts({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/meta-roles/conflicts', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('resolveConflict', () => {
		it('calls POST /governance/meta-roles/conflicts/:conflictId/resolve with body', async () => {
			const data = {
				resolution_status: 'resolved_manual' as const,
				comment: 'Resolved via admin review'
			};
			const mockResponse = {
				id: CONFLICT_ID,
				resolution_status: 'resolved_manual',
				resolved_at: '2026-01-01T00:00:00Z'
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await resolveConflict(CONFLICT_ID, data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/meta-roles/conflicts/${CONFLICT_ID}/resolve`,
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});
});

describe('Meta-Roles API — Events', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listEvents', () => {
		it('calls GET /governance/meta-roles/events with query params (meta_role_id required)', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listEvents(
				{ meta_role_id: META_ROLE_ID, event_type: 'created', limit: 50, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledOnce();
			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/meta-roles/events?');
			expect(calledPath).toContain(`meta_role_id=${META_ROLE_ID}`);
			expect(calledPath).toContain('event_type=created');
			expect(calledPath).toContain('limit=50');
			expect((mockApiClient.mock.calls[0] as unknown[])[1]).toMatchObject({
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getEventStats', () => {
		it('calls GET /governance/meta-roles/events/stats with query params', async () => {
			const mockResponse = {
				total: 42,
				created: 10,
				updated: 8,
				deleted: 2,
				disabled: 1,
				enabled: 3,
				inheritance_applied: 5,
				inheritance_removed: 2,
				conflict_detected: 4,
				conflict_resolved: 3,
				cascade_started: 2,
				cascade_completed: 1,
				cascade_failed: 1
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getEventStats(
				{ meta_role_id: META_ROLE_ID },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledOnce();
			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/meta-roles/events/stats?');
			expect(calledPath).toContain(`meta_role_id=${META_ROLE_ID}`);
			expect((mockApiClient.mock.calls[0] as unknown[])[1]).toMatchObject({
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});
});
