import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listRoles,
	createRole,
	getRole,
	updateRole,
	deleteRole,
	getRoleTree,
	getRoleAncestors,
	getRoleChildren,
	getRoleDescendants,
	moveRole,
	getRoleImpact,
	listRoleEntitlements,
	addRoleEntitlement,
	removeRoleEntitlement,
	getEffectiveEntitlements,
	recomputeEffectiveEntitlements,
	listRoleParameters,
	addRoleParameter,
	getRoleParameter,
	updateRoleParameter,
	deleteRoleParameter,
	validateRoleParameters,
	listInheritanceBlocks,
	addInheritanceBlock,
	removeInheritanceBlock
} from './governance-roles';

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

describe('Governance Roles API — Role CRUD', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listRoles', () => {
		it('calls GET /governance/roles with pagination params', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listRoles({ limit: 50, offset: 0 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles?limit=50&offset=0', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('calls GET /governance/roles with no params when empty', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listRoles({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('omits undefined params from query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listRoles({ limit: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.has('offset')).toBe(false);
		});
	});

	describe('createRole', () => {
		it('calls POST /governance/roles with body', async () => {
			const data = { name: 'Admin Role', description: 'Full admin access' };
			mockApiClient.mockResolvedValue({ id: 'role-1', ...data });

			const result = await createRole(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getRole', () => {
		it('calls GET /governance/roles/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'role-1', name: 'Admin Role' });

			await getRole('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateRole', () => {
		it('calls PUT /governance/roles/:id with body', async () => {
			const data = { name: 'Updated Role', version: 2 };
			mockApiClient.mockResolvedValue({ id: 'role-1', ...data });

			await updateRole('role-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteRole', () => {
		it('calls DELETE /governance/roles/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteRole('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});

describe('Governance Roles API — Hierarchy', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getRoleTree', () => {
		it('calls GET /governance/roles/tree', async () => {
			const mockResponse = { roots: [], total_roles: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getRoleTree(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/tree', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getRoleAncestors', () => {
		it('calls GET /governance/roles/:id/ancestors', async () => {
			mockApiClient.mockResolvedValue([]);

			await getRoleAncestors('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/ancestors', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('getRoleChildren', () => {
		it('calls GET /governance/roles/:id/children', async () => {
			mockApiClient.mockResolvedValue([]);

			await getRoleChildren('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/children', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('getRoleDescendants', () => {
		it('calls GET /governance/roles/:id/descendants', async () => {
			mockApiClient.mockResolvedValue([]);

			await getRoleDescendants('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/descendants', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('moveRole', () => {
		it('calls POST /governance/roles/:id/move with body', async () => {
			const data = { new_parent_id: 'parent-1', version: 3 };
			const mockResponse = { role: { id: 'role-1' }, previous_parent_id: null };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await moveRole('role-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/move', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getRoleImpact', () => {
		it('calls GET /governance/roles/:id/impact', async () => {
			const mockResponse = { affected_users: 0, affected_entitlements: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getRoleImpact('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/impact', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});
});

describe('Governance Roles API — Entitlements', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listRoleEntitlements', () => {
		it('calls GET /governance/roles/:id/entitlements', async () => {
			mockApiClient.mockResolvedValue([]);

			const result = await listRoleEntitlements('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/entitlements', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual([]);
		});
	});

	describe('addRoleEntitlement', () => {
		it('calls POST /governance/roles/:id/entitlements with body', async () => {
			const data = { entitlement_id: 'ent-1', role_name: 'Admin' };
			mockApiClient.mockResolvedValue({ id: 'mapping-1', ...data });

			const result = await addRoleEntitlement('role-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/entitlements', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('removeRoleEntitlement', () => {
		it('calls DELETE /governance/roles/:id/entitlements/:entitlementId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeRoleEntitlement('role-1', 'ent-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/entitlements/ent-1',
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});

	describe('getEffectiveEntitlements', () => {
		it('calls GET /governance/roles/:id/effective-entitlements', async () => {
			const mockResponse = { entitlements: [], role_id: 'role-1' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getEffectiveEntitlements('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/effective-entitlements',
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

	describe('recomputeEffectiveEntitlements', () => {
		it('calls POST /governance/roles/:id/effective-entitlements/recompute', async () => {
			mockApiClient.mockResolvedValue({ status: 'ok' });

			await recomputeEffectiveEntitlements('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/effective-entitlements/recompute',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Governance Roles API — Parameters', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listRoleParameters', () => {
		it('calls GET /governance/roles/:id/parameters', async () => {
			const mockResponse = { parameters: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listRoleParameters('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/parameters', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('addRoleParameter', () => {
		it('calls POST /governance/roles/:id/parameters with body', async () => {
			const data = { name: 'region', parameter_type: 'enum' as const };
			mockApiClient.mockResolvedValue({ id: 'param-1', ...data });

			const result = await addRoleParameter('role-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/roles/role-1/parameters', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getRoleParameter', () => {
		it('calls GET /governance/roles/:id/parameters/:parameterId', async () => {
			mockApiClient.mockResolvedValue({ id: 'param-1', name: 'region' });

			await getRoleParameter('role-1', 'param-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/parameters/param-1',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});

	describe('updateRoleParameter', () => {
		it('calls PUT /governance/roles/:id/parameters/:parameterId with body', async () => {
			const data = { description: 'Updated', is_required: true };
			mockApiClient.mockResolvedValue({ id: 'param-1', ...data });

			await updateRoleParameter('role-1', 'param-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/parameters/param-1',
				{
					method: 'PUT',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});

	describe('deleteRoleParameter', () => {
		it('calls DELETE /governance/roles/:id/parameters/:parameterId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteRoleParameter('role-1', 'param-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/parameters/param-1',
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});

	describe('validateRoleParameters', () => {
		it('calls POST /governance/roles/:id/parameters/validate with body', async () => {
			const data = { parameters: [{ name: 'region', value: 'us-east' }] };
			const mockResponse = { valid: true, errors: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await validateRoleParameters('role-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/parameters/validate',
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

describe('Governance Roles API — Inheritance Blocks', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listInheritanceBlocks', () => {
		it('calls GET /governance/roles/:id/inheritance-blocks', async () => {
			mockApiClient.mockResolvedValue([]);

			const result = await listInheritanceBlocks('role-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/inheritance-blocks',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual([]);
		});
	});

	describe('addInheritanceBlock', () => {
		it('calls POST /governance/roles/:id/inheritance-blocks with body', async () => {
			const data = { entitlement_id: 'ent-1' };
			mockApiClient.mockResolvedValue({ id: 'block-1', ...data });

			const result = await addInheritanceBlock('role-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/inheritance-blocks',
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toBeDefined();
		});
	});

	describe('removeInheritanceBlock', () => {
		it('calls DELETE /governance/roles/:id/inheritance-blocks/:blockId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeInheritanceBlock('role-1', 'block-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/roles/role-1/inheritance-blocks/block-1',
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
