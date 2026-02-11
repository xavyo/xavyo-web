import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('governance-roles-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Role CRUD ---

	describe('fetchRoles', () => {
		it('fetches from /api/governance/roles with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoles } = await import('./governance-roles-client');

			const result = await fetchRoles({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchRoles } = await import('./governance-roles-client');

			await fetchRoles({ limit: 50, offset: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/roles?');
			expect(calledUrl).toContain('limit=50');
			expect(calledUrl).toContain('offset=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRoles } = await import('./governance-roles-client');

			await expect(fetchRoles({}, mockFetch)).rejects.toThrow(
				'Failed to fetch roles: 500'
			);
		});
	});

	describe('fetchRole', () => {
		it('fetches from /api/governance/roles/:id', async () => {
			const data = { id: 'role-1', name: 'Admin' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRole } = await import('./governance-roles-client');

			const result = await fetchRole('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchRole } = await import('./governance-roles-client');

			await expect(fetchRole('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch role: 404'
			);
		});
	});

	describe('createRoleClient', () => {
		it('sends POST to /api/governance/roles with body', async () => {
			const created = { id: 'role-1', name: 'Finance Manager' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createRoleClient } = await import('./governance-roles-client');

			const body = { name: 'Finance Manager', description: 'Manages finance' };
			const result = await createRoleClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createRoleClient } = await import('./governance-roles-client');

			await expect(
				createRoleClient({ name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to create role: 400');
		});
	});

	describe('updateRoleClient', () => {
		it('sends PUT to /api/governance/roles/:id with body', async () => {
			const updated = { id: 'role-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateRoleClient } = await import('./governance-roles-client');

			const body = { name: 'Updated', version: 2 };
			const result = await updateRoleClient('role-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateRoleClient } = await import('./governance-roles-client');

			await expect(
				updateRoleClient('role-1', { name: 'X', version: 1 }, mockFetch)
			).rejects.toThrow('Failed to update role: 422');
		});
	});

	describe('deleteRoleClient', () => {
		it('sends DELETE to /api/governance/roles/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteRoleClient } = await import('./governance-roles-client');

			await deleteRoleClient('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteRoleClient } = await import('./governance-roles-client');

			await expect(deleteRoleClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete role: 404'
			);
		});
	});

	// --- Hierarchy ---

	describe('fetchRoleTree', () => {
		it('fetches from /api/governance/roles/tree', async () => {
			const data = { roots: [], total_roles: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleTree } = await import('./governance-roles-client');

			const result = await fetchRoleTree(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/tree');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRoleTree } = await import('./governance-roles-client');

			await expect(fetchRoleTree(mockFetch)).rejects.toThrow(
				'Failed to fetch role tree: 500'
			);
		});
	});

	describe('fetchRoleAncestors', () => {
		it('fetches from /api/governance/roles/:id/ancestors', async () => {
			const data = [{ id: 'parent-1', name: 'Parent' }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleAncestors } = await import('./governance-roles-client');

			const result = await fetchRoleAncestors('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/ancestors');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchRoleAncestors } = await import('./governance-roles-client');

			await expect(fetchRoleAncestors('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch role ancestors: 404'
			);
		});
	});

	describe('fetchRoleChildren', () => {
		it('fetches from /api/governance/roles/:id/children', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse([]));
			const { fetchRoleChildren } = await import('./governance-roles-client');

			const result = await fetchRoleChildren('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/children');
			expect(result).toEqual([]);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchRoleChildren } = await import('./governance-roles-client');

			await expect(fetchRoleChildren('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch role children: 404'
			);
		});
	});

	describe('fetchRoleDescendants', () => {
		it('fetches from /api/governance/roles/:id/descendants', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse([]));
			const { fetchRoleDescendants } = await import('./governance-roles-client');

			const result = await fetchRoleDescendants('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/descendants');
			expect(result).toEqual([]);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRoleDescendants } = await import('./governance-roles-client');

			await expect(fetchRoleDescendants('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch role descendants: 500'
			);
		});
	});

	describe('moveRoleClient', () => {
		it('sends POST to /api/governance/roles/:id/move with body', async () => {
			const moveResult = { role: { id: 'role-1' }, previous_parent_id: null };
			mockFetch.mockResolvedValueOnce(mockResponse(moveResult));
			const { moveRoleClient } = await import('./governance-roles-client');

			const body = { new_parent_id: 'parent-1', version: 2 };
			const result = await moveRoleClient('role-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/move', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(moveResult);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { moveRoleClient } = await import('./governance-roles-client');

			await expect(
				moveRoleClient('role-1', { new_parent_id: null, version: 1 }, mockFetch)
			).rejects.toThrow('Failed to move role: 409');
		});
	});

	describe('fetchRoleImpact', () => {
		it('fetches from /api/governance/roles/:id/impact', async () => {
			const data = { affected_users: 5, affected_entitlements: 3 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleImpact } = await import('./governance-roles-client');

			const result = await fetchRoleImpact('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/impact');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchRoleImpact } = await import('./governance-roles-client');

			await expect(fetchRoleImpact('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch role impact: 404'
			);
		});
	});

	// --- Entitlements ---

	describe('fetchRoleEntitlements', () => {
		it('fetches from /api/governance/roles/:id/entitlements', async () => {
			const data = [{ id: 'ent-1', name: 'Read Access' }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleEntitlements } = await import('./governance-roles-client');

			const result = await fetchRoleEntitlements('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/entitlements');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRoleEntitlements } = await import('./governance-roles-client');

			await expect(fetchRoleEntitlements('role-1', mockFetch)).rejects.toThrow(
				'Failed to fetch role entitlements: 500'
			);
		});
	});

	describe('addRoleEntitlementClient', () => {
		it('sends POST to /api/governance/roles/:id/entitlements with body', async () => {
			const created = { id: 'mapping-1', entitlement_id: 'ent-1', role_name: 'Admin' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { addRoleEntitlementClient } = await import('./governance-roles-client');

			const body = { entitlement_id: 'ent-1', role_name: 'Admin' };
			const result = await addRoleEntitlementClient('role-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/entitlements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addRoleEntitlementClient } = await import('./governance-roles-client');

			await expect(
				addRoleEntitlementClient(
					'role-1',
					{ entitlement_id: 'ent-1', role_name: 'X' },
					mockFetch
				)
			).rejects.toThrow('Failed to add role entitlement: 400');
		});
	});

	describe('removeRoleEntitlementClient', () => {
		it('sends DELETE to /api/governance/roles/:id/entitlements/:entitlementId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeRoleEntitlementClient } = await import('./governance-roles-client');

			await removeRoleEntitlementClient('role-1', 'ent-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/entitlements/ent-1',
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeRoleEntitlementClient } = await import('./governance-roles-client');

			await expect(
				removeRoleEntitlementClient('role-1', 'bad-id', mockFetch)
			).rejects.toThrow('Failed to remove role entitlement: 404');
		});
	});

	describe('fetchEffectiveEntitlements', () => {
		it('fetches from /api/governance/roles/:id/effective-entitlements', async () => {
			const data = { entitlements: [], role_id: 'role-1' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchEffectiveEntitlements } = await import('./governance-roles-client');

			const result = await fetchEffectiveEntitlements('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/effective-entitlements'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchEffectiveEntitlements } = await import('./governance-roles-client');

			await expect(fetchEffectiveEntitlements('role-1', mockFetch)).rejects.toThrow(
				'Failed to fetch effective entitlements: 500'
			);
		});
	});

	describe('recomputeEntitlementsClient', () => {
		it('sends POST to /api/governance/roles/:id/effective-entitlements/recompute', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ status: 'ok' }));
			const { recomputeEntitlementsClient } = await import('./governance-roles-client');

			const result = await recomputeEntitlementsClient('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/effective-entitlements/recompute',
				{ method: 'POST' }
			);
			expect(result).toEqual({ status: 'ok' });
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { recomputeEntitlementsClient } = await import('./governance-roles-client');

			await expect(recomputeEntitlementsClient('role-1', mockFetch)).rejects.toThrow(
				'Failed to recompute entitlements: 500'
			);
		});
	});

	// --- Parameters ---

	describe('fetchRoleParameters', () => {
		it('fetches from /api/governance/roles/:id/parameters', async () => {
			const data = { parameters: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleParameters } = await import('./governance-roles-client');

			const result = await fetchRoleParameters('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/parameters');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchRoleParameters } = await import('./governance-roles-client');

			await expect(fetchRoleParameters('role-1', mockFetch)).rejects.toThrow(
				'Failed to fetch role parameters: 500'
			);
		});
	});

	describe('addRoleParameterClient', () => {
		it('sends POST to /api/governance/roles/:id/parameters with body', async () => {
			const created = { id: 'param-1', name: 'region', parameter_type: 'enum' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { addRoleParameterClient } = await import('./governance-roles-client');

			const body = { name: 'region', parameter_type: 'enum' as const };
			const result = await addRoleParameterClient('role-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/roles/role-1/parameters', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addRoleParameterClient } = await import('./governance-roles-client');

			await expect(
				addRoleParameterClient(
					'role-1',
					{ name: 'x', parameter_type: 'string' as const },
					mockFetch
				)
			).rejects.toThrow('Failed to add role parameter: 400');
		});
	});

	describe('fetchRoleParameter', () => {
		it('fetches from /api/governance/roles/:id/parameters/:parameterId', async () => {
			const data = { id: 'param-1', name: 'region' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchRoleParameter } = await import('./governance-roles-client');

			const result = await fetchRoleParameter('role-1', 'param-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/parameters/param-1'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchRoleParameter } = await import('./governance-roles-client');

			await expect(fetchRoleParameter('role-1', 'bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch role parameter: 404'
			);
		});
	});

	describe('updateRoleParameterClient', () => {
		it('sends PUT to /api/governance/roles/:id/parameters/:parameterId with body', async () => {
			const updated = { id: 'param-1', description: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateRoleParameterClient } = await import('./governance-roles-client');

			const body = { description: 'Updated', is_required: true };
			const result = await updateRoleParameterClient('role-1', 'param-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/parameters/param-1',
				{
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateRoleParameterClient } = await import('./governance-roles-client');

			await expect(
				updateRoleParameterClient('role-1', 'param-1', { description: 'X' }, mockFetch)
			).rejects.toThrow('Failed to update role parameter: 422');
		});
	});

	describe('deleteRoleParameterClient', () => {
		it('sends DELETE to /api/governance/roles/:id/parameters/:parameterId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteRoleParameterClient } = await import('./governance-roles-client');

			await deleteRoleParameterClient('role-1', 'param-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/parameters/param-1',
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteRoleParameterClient } = await import('./governance-roles-client');

			await expect(
				deleteRoleParameterClient('role-1', 'bad-id', mockFetch)
			).rejects.toThrow('Failed to delete role parameter: 404');
		});
	});

	describe('validateRoleParametersClient', () => {
		it('sends POST to /api/governance/roles/:id/parameters/validate with body', async () => {
			const validationResult = { valid: true, errors: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(validationResult));
			const { validateRoleParametersClient } = await import('./governance-roles-client');

			const body = { parameters: [{ name: 'region', value: 'us-east' }] };
			const result = await validateRoleParametersClient('role-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/parameters/validate',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(validationResult);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { validateRoleParametersClient } = await import('./governance-roles-client');

			await expect(
				validateRoleParametersClient('role-1', { parameters: [] }, mockFetch)
			).rejects.toThrow('Failed to validate role parameters: 400');
		});
	});

	// --- Inheritance Blocks ---

	describe('fetchInheritanceBlocks', () => {
		it('fetches from /api/governance/roles/:id/inheritance-blocks', async () => {
			const data = [{ id: 'block-1', entitlement_id: 'ent-1', entitlement_name: 'View Users', application_name: null, created_by: 'user-1', created_at: '2026-01-01T00:00:00Z' }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchInheritanceBlocks } = await import('./governance-roles-client');

			const result = await fetchInheritanceBlocks('role-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/inheritance-blocks'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchInheritanceBlocks } = await import('./governance-roles-client');

			await expect(fetchInheritanceBlocks('role-1', mockFetch)).rejects.toThrow(
				'Failed to fetch inheritance blocks: 500'
			);
		});
	});

	describe('addInheritanceBlockClient', () => {
		it('sends POST to /api/governance/roles/:id/inheritance-blocks with body', async () => {
			const created = {
				id: 'block-1',
				entitlement_id: 'ent-1',
				entitlement_name: 'View Users',
				application_name: null,
				created_by: 'user-1',
				created_at: '2026-01-01T00:00:00Z'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { addInheritanceBlockClient } = await import('./governance-roles-client');

			const body = { entitlement_id: 'ent-1' };
			const result = await addInheritanceBlockClient('role-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/inheritance-blocks',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addInheritanceBlockClient } = await import('./governance-roles-client');

			await expect(
				addInheritanceBlockClient(
					'role-1',
					{ entitlement_id: 'ent-1' },
					mockFetch
				)
			).rejects.toThrow('Failed to add inheritance block: 400');
		});
	});

	describe('removeInheritanceBlockClient', () => {
		it('sends DELETE to /api/governance/roles/:id/inheritance-blocks/:blockId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeInheritanceBlockClient } = await import('./governance-roles-client');

			await removeInheritanceBlockClient('role-1', 'block-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/roles/role-1/inheritance-blocks/block-1',
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeInheritanceBlockClient } = await import('./governance-roles-client');

			await expect(
				removeInheritanceBlockClient('role-1', 'bad-id', mockFetch)
			).rejects.toThrow('Failed to remove inheritance block: 404');
		});
	});
});
