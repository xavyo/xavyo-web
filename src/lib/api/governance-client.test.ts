import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('governance-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Entitlements ---

	describe('fetchEntitlements', () => {
		it('fetches from /api/governance/entitlements with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchEntitlements } = await import('./governance-client');

			const result = await fetchEntitlements({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/entitlements');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchEntitlements } = await import('./governance-client');

			await fetchEntitlements(
				{ status: 'active', risk_level: 'high', limit: 10, offset: 5 },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/governance/entitlements?');
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('risk_level=high');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchEntitlements } = await import('./governance-client');

			await expect(fetchEntitlements({}, mockFetch)).rejects.toThrow(
				'Failed to fetch entitlements: 500'
			);
		});
	});

	describe('createEntitlementClient', () => {
		it('sends POST to /api/governance/entitlements with body', async () => {
			const created = { id: 'ent-1', name: 'Read Access' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createEntitlementClient } = await import('./governance-client');

			const body = {
				application_id: 'app-1',
				name: 'Read Access',
				risk_level: 'low' as const,
				data_protection_classification: 'none' as const
			};
			const result = await createEntitlementClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/entitlements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createEntitlementClient } = await import('./governance-client');

			await expect(
				createEntitlementClient(
					{
						application_id: 'app-1',
						name: 'X',
						risk_level: 'low',
						data_protection_classification: 'none'
					},
					mockFetch
				)
			).rejects.toThrow('Failed to create entitlement: 400');
		});
	});

	describe('fetchEntitlement', () => {
		it('fetches from /api/governance/entitlements/:id', async () => {
			const data = { id: 'ent-1', name: 'Read Access' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchEntitlement } = await import('./governance-client');

			const result = await fetchEntitlement('ent-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/entitlements/ent-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchEntitlement } = await import('./governance-client');

			await expect(fetchEntitlement('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch entitlement: 404'
			);
		});
	});

	describe('updateEntitlementClient', () => {
		it('sends PUT to /api/governance/entitlements/:id with body', async () => {
			const updated = { id: 'ent-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateEntitlementClient } = await import('./governance-client');

			const body = { name: 'Updated' };
			const result = await updateEntitlementClient('ent-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/entitlements/ent-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateEntitlementClient } = await import('./governance-client');

			await expect(updateEntitlementClient('ent-1', { name: 'X' }, mockFetch)).rejects.toThrow(
				'Failed to update entitlement: 422'
			);
		});
	});

	describe('deleteEntitlementClient', () => {
		it('sends DELETE to /api/governance/entitlements/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteEntitlementClient } = await import('./governance-client');

			await deleteEntitlementClient('ent-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/entitlements/ent-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteEntitlementClient } = await import('./governance-client');

			await expect(deleteEntitlementClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete entitlement: 404'
			);
		});
	});

	describe('setEntitlementOwnerClient', () => {
		it('sends PUT to /api/governance/entitlements/:id/owner with owner_id', async () => {
			const updated = { id: 'ent-1', owner_id: 'user-1' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { setEntitlementOwnerClient } = await import('./governance-client');

			const result = await setEntitlementOwnerClient('ent-1', 'user-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/entitlements/ent-1/owner', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ owner_id: 'user-1' })
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { setEntitlementOwnerClient } = await import('./governance-client');

			await expect(
				setEntitlementOwnerClient('ent-1', 'bad-user', mockFetch)
			).rejects.toThrow('Failed to set entitlement owner: 400');
		});
	});

	describe('removeEntitlementOwnerClient', () => {
		it('sends DELETE to /api/governance/entitlements/:id/owner', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeEntitlementOwnerClient } = await import('./governance-client');

			await removeEntitlementOwnerClient('ent-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/entitlements/ent-1/owner', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeEntitlementOwnerClient } = await import('./governance-client');

			await expect(removeEntitlementOwnerClient('ent-1', mockFetch)).rejects.toThrow(
				'Failed to remove entitlement owner: 404'
			);
		});
	});

	// --- SoD Rules ---

	describe('fetchSodRules', () => {
		it('fetches from /api/governance/sod-rules with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSodRules } = await import('./governance-client');

			const result = await fetchSodRules({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-rules');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchSodRules } = await import('./governance-client');

			await fetchSodRules({ severity: 'critical', limit: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('severity=critical');
			expect(calledUrl).toContain('limit=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSodRules } = await import('./governance-client');

			await expect(fetchSodRules({}, mockFetch)).rejects.toThrow(
				'Failed to fetch SoD rules: 500'
			);
		});
	});

	describe('createSodRuleClient', () => {
		it('sends POST to /api/governance/sod-rules with body', async () => {
			const created = { id: 'sod-1', name: 'Rule 1' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createSodRuleClient } = await import('./governance-client');

			const body = {
				name: 'Rule 1',
				first_entitlement_id: 'ent-1',
				second_entitlement_id: 'ent-2',
				severity: 'high' as const
			};
			const result = await createSodRuleClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createSodRuleClient } = await import('./governance-client');

			await expect(
				createSodRuleClient(
					{
						name: 'X',
						first_entitlement_id: 'a',
						second_entitlement_id: 'b',
						severity: 'low'
					},
					mockFetch
				)
			).rejects.toThrow('Failed to create SoD rule: 400');
		});
	});

	describe('fetchSodRule', () => {
		it('fetches from /api/governance/sod-rules/:id', async () => {
			const data = { id: 'sod-1', name: 'Rule 1' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSodRule } = await import('./governance-client');

			const result = await fetchSodRule('sod-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-rules/sod-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchSodRule } = await import('./governance-client');

			await expect(fetchSodRule('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch SoD rule: 404'
			);
		});
	});

	describe('updateSodRuleClient', () => {
		it('sends PUT to /api/governance/sod-rules/:id with body', async () => {
			const updated = { id: 'sod-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateSodRuleClient } = await import('./governance-client');

			const body = { name: 'Updated' };
			const result = await updateSodRuleClient('sod-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-rules/sod-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateSodRuleClient } = await import('./governance-client');

			await expect(
				updateSodRuleClient('sod-1', { name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to update SoD rule: 422');
		});
	});

	describe('deleteSodRuleClient', () => {
		it('sends DELETE to /api/governance/sod-rules/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteSodRuleClient } = await import('./governance-client');

			await deleteSodRuleClient('sod-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-rules/sod-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteSodRuleClient } = await import('./governance-client');

			await expect(deleteSodRuleClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete SoD rule: 404'
			);
		});
	});

	describe('enableSodRuleClient', () => {
		it('sends POST to /api/governance/sod-rules/:id/enable', async () => {
			const data = { id: 'sod-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { enableSodRuleClient } = await import('./governance-client');

			const result = await enableSodRuleClient('sod-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-rules/sod-1/enable', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { enableSodRuleClient } = await import('./governance-client');

			await expect(enableSodRuleClient('sod-1', mockFetch)).rejects.toThrow(
				'Failed to enable SoD rule: 400'
			);
		});
	});

	describe('disableSodRuleClient', () => {
		it('sends POST to /api/governance/sod-rules/:id/disable', async () => {
			const data = { id: 'sod-1', status: 'inactive' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { disableSodRuleClient } = await import('./governance-client');

			const result = await disableSodRuleClient('sod-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-rules/sod-1/disable', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { disableSodRuleClient } = await import('./governance-client');

			await expect(disableSodRuleClient('sod-1', mockFetch)).rejects.toThrow(
				'Failed to disable SoD rule: 400'
			);
		});
	});

	describe('fetchSodViolations', () => {
		it('fetches from /api/governance/sod-violations with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSodViolations } = await import('./governance-client');

			const result = await fetchSodViolations({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-violations');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchSodViolations } = await import('./governance-client');

			await fetchSodViolations({ rule_id: 'sod-1', severity: 'high' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('rule_id=sod-1');
			expect(calledUrl).toContain('severity=high');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSodViolations } = await import('./governance-client');

			await expect(fetchSodViolations({}, mockFetch)).rejects.toThrow(
				'Failed to fetch SoD violations: 500'
			);
		});
	});

	// --- Certification Campaigns ---

	describe('fetchCampaigns', () => {
		it('fetches from /api/governance/certification-campaigns with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCampaigns } = await import('./governance-client');

			const result = await fetchCampaigns({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/certification-campaigns');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchCampaigns } = await import('./governance-client');

			await fetchCampaigns({ status: 'active', limit: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCampaigns } = await import('./governance-client');

			await expect(fetchCampaigns({}, mockFetch)).rejects.toThrow(
				'Failed to fetch campaigns: 500'
			);
		});
	});

	describe('createCampaignClient', () => {
		it('sends POST to /api/governance/certification-campaigns with body', async () => {
			const created = { id: 'camp-1', name: 'Q1 Review' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createCampaignClient } = await import('./governance-client');

			const body = {
				name: 'Q1 Review',
				scope_type: 'all_users' as const,
				reviewer_type: 'user_manager' as const,
				deadline: '2026-03-31'
			};
			const result = await createCampaignClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/certification-campaigns', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createCampaignClient } = await import('./governance-client');

			await expect(
				createCampaignClient(
					{
						name: 'X',
						scope_type: 'all_users',
						reviewer_type: 'user_manager',
						deadline: '2026-01-01'
					},
					mockFetch
				)
			).rejects.toThrow('Failed to create campaign: 400');
		});
	});

	describe('fetchCampaign', () => {
		it('fetches from /api/governance/certification-campaigns/:id', async () => {
			const data = { id: 'camp-1', name: 'Q1 Review' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCampaign } = await import('./governance-client');

			const result = await fetchCampaign('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/certification-campaigns/camp-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchCampaign } = await import('./governance-client');

			await expect(fetchCampaign('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch campaign: 404'
			);
		});
	});

	describe('updateCampaignClient', () => {
		it('sends PUT to /api/governance/certification-campaigns/:id with body', async () => {
			const updated = { id: 'camp-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateCampaignClient } = await import('./governance-client');

			const body = { name: 'Updated' };
			const result = await updateCampaignClient('camp-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/certification-campaigns/camp-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateCampaignClient } = await import('./governance-client');

			await expect(
				updateCampaignClient('camp-1', { name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to update campaign: 422');
		});
	});

	describe('deleteCampaignClient', () => {
		it('sends DELETE to /api/governance/certification-campaigns/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteCampaignClient } = await import('./governance-client');

			await deleteCampaignClient('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/certification-campaigns/camp-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteCampaignClient } = await import('./governance-client');

			await expect(deleteCampaignClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete campaign: 404'
			);
		});
	});

	describe('launchCampaignClient', () => {
		it('sends POST to /api/governance/certification-campaigns/:id/launch', async () => {
			const data = { id: 'camp-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { launchCampaignClient } = await import('./governance-client');

			const result = await launchCampaignClient('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/certification-campaigns/camp-1/launch',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { launchCampaignClient } = await import('./governance-client');

			await expect(launchCampaignClient('camp-1', mockFetch)).rejects.toThrow(
				'Failed to launch campaign: 400'
			);
		});
	});

	describe('cancelCampaignClient', () => {
		it('sends POST to /api/governance/certification-campaigns/:id/cancel', async () => {
			const data = { id: 'camp-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelCampaignClient } = await import('./governance-client');

			const result = await cancelCampaignClient('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/certification-campaigns/camp-1/cancel',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { cancelCampaignClient } = await import('./governance-client');

			await expect(cancelCampaignClient('camp-1', mockFetch)).rejects.toThrow(
				'Failed to cancel campaign: 400'
			);
		});
	});

	describe('fetchCampaignProgress', () => {
		it('fetches from /api/governance/certification-campaigns/:id/progress', async () => {
			const data = {
				total_items: 100,
				pending_items: 50,
				approved_items: 30,
				revoked_items: 20,
				completion_percentage: 50
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCampaignProgress } = await import('./governance-client');

			const result = await fetchCampaignProgress('camp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/certification-campaigns/camp-1/progress'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchCampaignProgress } = await import('./governance-client');

			await expect(fetchCampaignProgress('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch campaign progress: 404'
			);
		});
	});

	describe('fetchCampaignItems', () => {
		it('fetches from /api/governance/certification-campaigns/:id/items with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchCampaignItems } = await import('./governance-client');

			const result = await fetchCampaignItems('camp-1', {}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/certification-campaigns/camp-1/items'
			);
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchCampaignItems } = await import('./governance-client');

			await fetchCampaignItems('camp-1', { status: 'pending', limit: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('limit=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchCampaignItems } = await import('./governance-client');

			await expect(fetchCampaignItems('camp-1', {}, mockFetch)).rejects.toThrow(
				'Failed to fetch campaign items: 500'
			);
		});
	});

	describe('decideCertificationItemClient', () => {
		it('sends POST to /api/governance/certification-items/:id/decide with body', async () => {
			const decided = { id: 'item-1', status: 'approved' };
			mockFetch.mockResolvedValueOnce(mockResponse(decided));
			const { decideCertificationItemClient } = await import('./governance-client');

			const body = { decision: 'approved' as const, notes: 'Looks good' };
			const result = await decideCertificationItemClient('item-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/certification-items/item-1/decide',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(decided);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { decideCertificationItemClient } = await import('./governance-client');

			await expect(
				decideCertificationItemClient('item-1', { decision: 'approved' }, mockFetch)
			).rejects.toThrow('Failed to decide certification item: 400');
		});
	});

	describe('fetchMyCertifications', () => {
		it('fetches from /api/governance/my-certifications with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchMyCertifications } = await import('./governance-client');

			const result = await fetchMyCertifications({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/my-certifications');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchMyCertifications } = await import('./governance-client');

			await fetchMyCertifications(
				{ status: 'pending', campaign_id: 'camp-1' },
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('campaign_id=camp-1');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { fetchMyCertifications } = await import('./governance-client');

			await expect(fetchMyCertifications({}, mockFetch)).rejects.toThrow(
				'Failed to fetch my certifications: 403'
			);
		});
	});
});
