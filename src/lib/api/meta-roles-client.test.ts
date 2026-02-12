import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

const META_ROLE_ID = '00000000-0000-0000-0000-000000000001';
const CRITERIA_ID = '00000000-0000-0000-0000-000000000002';
const ENTITLEMENT_ID = '00000000-0000-0000-0000-000000000003';
const CONSTRAINT_ID = '00000000-0000-0000-0000-000000000004';
const CONFLICT_ID = '00000000-0000-0000-0000-000000000005';

describe('meta-roles-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Meta-Role CRUD ---

	describe('fetchMetaRoles', () => {
		it('fetches from /api/governance/meta-roles with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMetaRoles } = await import('./meta-roles-client');

			const result = await fetchMetaRoles({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/meta-roles');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchMetaRoles } = await import('./meta-roles-client');

			await fetchMetaRoles({ limit: 50, offset: 10, status: 'active' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/meta-roles?');
			expect(calledUrl).toContain('limit=50');
			expect(calledUrl).toContain('offset=10');
			expect(calledUrl).toContain('status=active');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchMetaRoles } = await import('./meta-roles-client');

			await expect(fetchMetaRoles({}, mockFetch)).rejects.toThrow(
				'Failed to fetch meta-roles: 500'
			);
		});
	});

	describe('createMetaRoleClient', () => {
		it('sends POST to /api/governance/meta-roles with body', async () => {
			const created = { id: META_ROLE_ID, name: 'Auto Finance', priority: 10 };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createMetaRoleClient } = await import('./meta-roles-client');

			const body = { name: 'Auto Finance', priority: 10 };
			const result = await createMetaRoleClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/meta-roles', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createMetaRoleClient } = await import('./meta-roles-client');

			await expect(
				createMetaRoleClient({ name: 'X', priority: 1 }, mockFetch)
			).rejects.toThrow('Failed to create meta-role: 400');
		});
	});

	describe('fetchMetaRole', () => {
		it('fetches from /api/governance/meta-roles/:id', async () => {
			const data = {
				id: META_ROLE_ID,
				name: 'Auto Finance',
				criteria: [],
				entitlements: [],
				constraints: [],
				stats: null
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMetaRole } = await import('./meta-roles-client');

			const result = await fetchMetaRole(META_ROLE_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}`
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchMetaRole } = await import('./meta-roles-client');

			await expect(fetchMetaRole('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch meta-role: 404'
			);
		});
	});

	describe('updateMetaRoleClient', () => {
		it('sends PUT to /api/governance/meta-roles/:id with body', async () => {
			const updated = { id: META_ROLE_ID, name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateMetaRoleClient } = await import('./meta-roles-client');

			const body = { name: 'Updated', priority: 20 };
			const result = await updateMetaRoleClient(META_ROLE_ID, body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}`,
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
			const { updateMetaRoleClient } = await import('./meta-roles-client');

			await expect(
				updateMetaRoleClient(META_ROLE_ID, { name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to update meta-role: 422');
		});
	});

	describe('deleteMetaRoleClient', () => {
		it('sends DELETE to /api/governance/meta-roles/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteMetaRoleClient } = await import('./meta-roles-client');

			await deleteMetaRoleClient(META_ROLE_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}`,
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteMetaRoleClient } = await import('./meta-roles-client');

			await expect(deleteMetaRoleClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete meta-role: 404'
			);
		});
	});

	// --- Enable / Disable ---

	describe('enableMetaRoleClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/enable', async () => {
			const data = { id: META_ROLE_ID, status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { enableMetaRoleClient } = await import('./meta-roles-client');

			const result = await enableMetaRoleClient(META_ROLE_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/enable`,
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { enableMetaRoleClient } = await import('./meta-roles-client');

			await expect(enableMetaRoleClient(META_ROLE_ID, mockFetch)).rejects.toThrow(
				'Failed to enable meta-role: 409'
			);
		});
	});

	describe('disableMetaRoleClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/disable', async () => {
			const data = { id: META_ROLE_ID, status: 'disabled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { disableMetaRoleClient } = await import('./meta-roles-client');

			const result = await disableMetaRoleClient(META_ROLE_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/disable`,
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { disableMetaRoleClient } = await import('./meta-roles-client');

			await expect(disableMetaRoleClient(META_ROLE_ID, mockFetch)).rejects.toThrow(
				'Failed to disable meta-role: 409'
			);
		});
	});

	// --- Criteria ---

	describe('addCriterionClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/criteria with body', async () => {
			const created = {
				id: CRITERIA_ID,
				meta_role_id: META_ROLE_ID,
				field: 'department',
				operator: 'eq',
				value: 'finance'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { addCriterionClient } = await import('./meta-roles-client');

			const body = { field: 'department', operator: 'eq' as const, value: 'finance' };
			const result = await addCriterionClient(META_ROLE_ID, body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/criteria`,
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
			const { addCriterionClient } = await import('./meta-roles-client');

			await expect(
				addCriterionClient(
					META_ROLE_ID,
					{ field: 'x', operator: 'eq' as const, value: 'y' },
					mockFetch
				)
			).rejects.toThrow('Failed to add criterion: 400');
		});
	});

	describe('removeCriterionClient', () => {
		it('sends DELETE to /api/governance/meta-roles/:id/criteria/:criteriaId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeCriterionClient } = await import('./meta-roles-client');

			await removeCriterionClient(META_ROLE_ID, CRITERIA_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/criteria/${CRITERIA_ID}`,
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeCriterionClient } = await import('./meta-roles-client');

			await expect(
				removeCriterionClient(META_ROLE_ID, 'bad-id', mockFetch)
			).rejects.toThrow('Failed to remove criterion: 404');
		});
	});

	// --- Entitlements ---

	describe('addEntitlementClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/entitlements with body', async () => {
			const created = {
				id: 'mapping-1',
				meta_role_id: META_ROLE_ID,
				entitlement_id: ENTITLEMENT_ID,
				permission_type: 'grant'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { addEntitlementClient } = await import('./meta-roles-client');

			const body = { entitlement_id: ENTITLEMENT_ID, permission_type: 'grant' as const };
			const result = await addEntitlementClient(META_ROLE_ID, body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/entitlements`,
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
			const { addEntitlementClient } = await import('./meta-roles-client');

			await expect(
				addEntitlementClient(
					META_ROLE_ID,
					{ entitlement_id: 'ent-1' },
					mockFetch
				)
			).rejects.toThrow('Failed to add entitlement: 400');
		});
	});

	describe('removeEntitlementClient', () => {
		it('sends DELETE to /api/governance/meta-roles/:id/entitlements/:eid', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeEntitlementClient } = await import('./meta-roles-client');

			await removeEntitlementClient(META_ROLE_ID, ENTITLEMENT_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/entitlements/${ENTITLEMENT_ID}`,
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeEntitlementClient } = await import('./meta-roles-client');

			await expect(
				removeEntitlementClient(META_ROLE_ID, 'bad-id', mockFetch)
			).rejects.toThrow('Failed to remove entitlement: 404');
		});
	});

	// --- Constraints ---

	describe('addConstraintClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/constraints with body', async () => {
			const created = {
				id: CONSTRAINT_ID,
				meta_role_id: META_ROLE_ID,
				constraint_type: 'require_mfa',
				constraint_value: { enabled: true }
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { addConstraintClient } = await import('./meta-roles-client');

			const body = {
				constraint_type: 'require_mfa' as const,
				constraint_value: { enabled: true }
			};
			const result = await addConstraintClient(META_ROLE_ID, body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/constraints`,
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
			const { addConstraintClient } = await import('./meta-roles-client');

			await expect(
				addConstraintClient(
					META_ROLE_ID,
					{ constraint_type: 'require_mfa' as const, constraint_value: {} },
					mockFetch
				)
			).rejects.toThrow('Failed to add constraint: 400');
		});
	});

	describe('removeConstraintClient', () => {
		it('sends DELETE to /api/governance/meta-roles/:id/constraints/:cid', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeConstraintClient } = await import('./meta-roles-client');

			await removeConstraintClient(META_ROLE_ID, CONSTRAINT_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/constraints/${CONSTRAINT_ID}`,
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeConstraintClient } = await import('./meta-roles-client');

			await expect(
				removeConstraintClient(META_ROLE_ID, 'bad-id', mockFetch)
			).rejects.toThrow('Failed to remove constraint: 404');
		});
	});

	// --- Inheritances ---

	describe('fetchInheritances', () => {
		it('fetches from /api/governance/meta-roles/:id/inheritances with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchInheritances } = await import('./meta-roles-client');

			const result = await fetchInheritances(META_ROLE_ID, {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/inheritances`
			);
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchInheritances } = await import('./meta-roles-client');

			await fetchInheritances(META_ROLE_ID, { status: 'active', limit: 50 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain(
				`/api/governance/meta-roles/${META_ROLE_ID}/inheritances?`
			);
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=50');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchInheritances } = await import('./meta-roles-client');

			await expect(
				fetchInheritances(META_ROLE_ID, {}, mockFetch)
			).rejects.toThrow('Failed to fetch inheritances: 500');
		});
	});

	// --- Reevaluate ---

	describe('reevaluateMetaRoleClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/reevaluate', async () => {
			const data = {
				active_inheritances: 5,
				unresolved_conflicts: 0,
				criteria_count: 2,
				entitlements_count: 3,
				constraints_count: 1
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { reevaluateMetaRoleClient } = await import('./meta-roles-client');

			const result = await reevaluateMetaRoleClient(META_ROLE_ID, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/reevaluate`,
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { reevaluateMetaRoleClient } = await import('./meta-roles-client');

			await expect(
				reevaluateMetaRoleClient(META_ROLE_ID, mockFetch)
			).rejects.toThrow('Failed to reevaluate meta-role: 500');
		});
	});

	// --- Simulate ---

	describe('simulateMetaRoleClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/simulate with body', async () => {
			const simResult = {
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
			mockFetch.mockResolvedValueOnce(mockResponse(simResult));
			const { simulateMetaRoleClient } = await import('./meta-roles-client');

			const body = { simulation_type: 'update' as const, limit: 100 };
			const result = await simulateMetaRoleClient(META_ROLE_ID, body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/simulate`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(simResult);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { simulateMetaRoleClient } = await import('./meta-roles-client');

			await expect(
				simulateMetaRoleClient(
					META_ROLE_ID,
					{ simulation_type: 'create' as const },
					mockFetch
				)
			).rejects.toThrow('Failed to simulate meta-role: 400');
		});
	});

	// --- Cascade ---

	describe('cascadeMetaRoleClient', () => {
		it('sends POST to /api/governance/meta-roles/:id/cascade with body', async () => {
			const cascadeResult = {
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
			mockFetch.mockResolvedValueOnce(mockResponse(cascadeResult));
			const { cascadeMetaRoleClient } = await import('./meta-roles-client');

			const body = { meta_role_id: META_ROLE_ID, dry_run: true };
			const result = await cascadeMetaRoleClient(META_ROLE_ID, body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/${META_ROLE_ID}/cascade`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(cascadeResult);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { cascadeMetaRoleClient } = await import('./meta-roles-client');

			await expect(
				cascadeMetaRoleClient(
					META_ROLE_ID,
					{ meta_role_id: META_ROLE_ID },
					mockFetch
				)
			).rejects.toThrow('Failed to cascade meta-role: 500');
		});
	});

	// --- Conflicts ---

	describe('fetchConflicts', () => {
		it('fetches from /api/governance/meta-roles/conflicts with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchConflicts } = await import('./meta-roles-client');

			const result = await fetchConflicts({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/meta-roles/conflicts');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchConflicts } = await import('./meta-roles-client');

			await fetchConflicts(
				{ resolution_status: 'unresolved', limit: 50 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/meta-roles/conflicts?');
			expect(calledUrl).toContain('resolution_status=unresolved');
			expect(calledUrl).toContain('limit=50');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchConflicts } = await import('./meta-roles-client');

			await expect(fetchConflicts({}, mockFetch)).rejects.toThrow(
				'Failed to fetch conflicts: 500'
			);
		});
	});

	describe('resolveConflictClient', () => {
		it('sends POST to /api/governance/meta-roles/conflicts/:conflictId/resolve with body', async () => {
			const resolved = {
				id: CONFLICT_ID,
				resolution_status: 'resolved_manual',
				resolved_at: '2026-01-01T00:00:00Z'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(resolved));
			const { resolveConflictClient } = await import('./meta-roles-client');

			const body = {
				resolution_status: 'resolved_manual' as const,
				comment: 'Resolved via admin'
			};
			const result = await resolveConflictClient(CONFLICT_ID, body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				`/api/governance/meta-roles/conflicts/${CONFLICT_ID}/resolve`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(resolved);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { resolveConflictClient } = await import('./meta-roles-client');

			await expect(
				resolveConflictClient(
					CONFLICT_ID,
					{ resolution_status: 'resolved_manual' as const },
					mockFetch
				)
			).rejects.toThrow('Failed to resolve conflict: 400');
		});
	});

	// --- Events ---

	describe('fetchEvents', () => {
		it('fetches from /api/governance/meta-roles/events with meta_role_id', async () => {
			const data = { items: [], total: 0, limit: 50, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchEvents } = await import('./meta-roles-client');

			const result = await fetchEvents(
				{ meta_role_id: META_ROLE_ID, event_type: 'created', limit: 50 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/meta-roles/events?');
			expect(calledUrl).toContain(`meta_role_id=${META_ROLE_ID}`);
			expect(calledUrl).toContain('event_type=created');
			expect(calledUrl).toContain('limit=50');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchEvents } = await import('./meta-roles-client');

			await expect(
				fetchEvents({ meta_role_id: META_ROLE_ID }, mockFetch)
			).rejects.toThrow('Failed to fetch events: 500');
		});
	});

	describe('getEventStatsClient', () => {
		it('fetches from /api/governance/meta-roles/events/stats with query params', async () => {
			const data = {
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
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getEventStatsClient } = await import('./meta-roles-client');

			const result = await getEventStatsClient(
				{ meta_role_id: META_ROLE_ID },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/meta-roles/events/stats?');
			expect(calledUrl).toContain(`meta_role_id=${META_ROLE_ID}`);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { getEventStatsClient } = await import('./meta-roles-client');

			await expect(
				getEventStatsClient({ meta_role_id: META_ROLE_ID }, mockFetch)
			).rejects.toThrow('Failed to fetch event stats: 500');
		});
	});
});
