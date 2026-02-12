import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('birthright-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Birthright Policies ---

	describe('fetchBirthrightPolicies', () => {
		it('fetches from /api/governance/birthright-policies', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			const result = await fetchBirthrightPolicies({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies');
			expect(result).toEqual(data);
		});

		it('includes status query param', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 20, offset: 0 }));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			await fetchBirthrightPolicies({ status: 'active' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
		});

		it('includes limit and offset query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 10, offset: 20 }));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			await fetchBirthrightPolicies({ limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			await expect(fetchBirthrightPolicies({}, mockFetch)).rejects.toThrow(
				'Failed to fetch birthright policies: 500'
			);
		});
	});

	describe('fetchBirthrightPolicy', () => {
		it('fetches from /api/governance/birthright-policies/:id', async () => {
			const data = { id: 'pol-1', name: 'Default Policy', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBirthrightPolicy } = await import('./birthright-client');

			const result = await fetchBirthrightPolicy('pol-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/pol-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchBirthrightPolicy } = await import('./birthright-client');

			await expect(fetchBirthrightPolicy('bad', mockFetch)).rejects.toThrow(
				'Failed to fetch birthright policy: 404'
			);
		});
	});

	describe('createBirthrightPolicyClient', () => {
		it('sends POST to /api/governance/birthright-policies', async () => {
			const body = { name: 'New Policy', description: 'A new birthright policy' };
			const data = { id: 'pol-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createBirthrightPolicyClient } = await import('./birthright-client');

			const result = await createBirthrightPolicyClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createBirthrightPolicyClient } = await import('./birthright-client');

			await expect(createBirthrightPolicyClient({} as any, mockFetch)).rejects.toThrow(
				'Failed to create birthright policy: 400'
			);
		});
	});

	describe('updateBirthrightPolicyClient', () => {
		it('sends PUT to /api/governance/birthright-policies/:id', async () => {
			const body = { name: 'Updated Policy', description: 'Updated description' };
			const data = { id: 'pol-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateBirthrightPolicyClient } = await import('./birthright-client');

			const result = await updateBirthrightPolicyClient('pol-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/pol-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateBirthrightPolicyClient } = await import('./birthright-client');

			await expect(updateBirthrightPolicyClient('pol-1', {} as any, mockFetch)).rejects.toThrow(
				'Failed to update birthright policy: 422'
			);
		});
	});

	describe('archiveBirthrightPolicyClient', () => {
		it('sends DELETE to /api/governance/birthright-policies/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { archiveBirthrightPolicyClient } = await import('./birthright-client');

			await archiveBirthrightPolicyClient('pol-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/pol-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { archiveBirthrightPolicyClient } = await import('./birthright-client');

			await expect(archiveBirthrightPolicyClient('bad', mockFetch)).rejects.toThrow(
				'Failed to archive birthright policy: 404'
			);
		});
	});

	describe('enableBirthrightPolicyClient', () => {
		it('sends POST to /api/governance/birthright-policies/:id/enable', async () => {
			const data = { id: 'pol-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { enableBirthrightPolicyClient } = await import('./birthright-client');

			const result = await enableBirthrightPolicyClient('pol-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/pol-1/enable', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { enableBirthrightPolicyClient } = await import('./birthright-client');

			await expect(enableBirthrightPolicyClient('pol-1', mockFetch)).rejects.toThrow(
				'Failed to enable birthright policy: 400'
			);
		});
	});

	describe('disableBirthrightPolicyClient', () => {
		it('sends POST to /api/governance/birthright-policies/:id/disable', async () => {
			const data = { id: 'pol-1', status: 'disabled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { disableBirthrightPolicyClient } = await import('./birthright-client');

			const result = await disableBirthrightPolicyClient('pol-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/birthright-policies/pol-1/disable',
				{
					method: 'POST'
				}
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { disableBirthrightPolicyClient } = await import('./birthright-client');

			await expect(disableBirthrightPolicyClient('pol-1', mockFetch)).rejects.toThrow(
				'Failed to disable birthright policy: 400'
			);
		});
	});

	describe('simulatePolicyClient', () => {
		it('sends POST to /api/governance/birthright-policies/:id/simulate', async () => {
			const body = { user_ids: ['user-1', 'user-2'] };
			const data = { policy_id: 'pol-1', affected_users: 2, results: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { simulatePolicyClient } = await import('./birthright-client');

			const result = await simulatePolicyClient('pol-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/birthright-policies/pol-1/simulate',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { simulatePolicyClient } = await import('./birthright-client');

			await expect(simulatePolicyClient('pol-1', {} as any, mockFetch)).rejects.toThrow(
				'Failed to simulate policy: 500'
			);
		});
	});

	describe('simulateAllPoliciesClient', () => {
		it('sends POST to /api/governance/birthright-policies/simulate', async () => {
			const body = { user_ids: ['user-1'] };
			const data = { total_affected: 5, policy_results: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { simulateAllPoliciesClient } = await import('./birthright-client');

			const result = await simulateAllPoliciesClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { simulateAllPoliciesClient } = await import('./birthright-client');

			await expect(simulateAllPoliciesClient({} as any, mockFetch)).rejects.toThrow(
				'Failed to simulate all policies: 500'
			);
		});
	});

	describe('analyzeImpactClient', () => {
		it('sends POST to /api/governance/birthright-policies/:id/impact', async () => {
			const data = { policy_id: 'pol-1', total_affected_users: 15, entitlements_added: 30 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { analyzeImpactClient } = await import('./birthright-client');

			const result = await analyzeImpactClient('pol-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/birthright-policies/pol-1/impact',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({})
				}
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { analyzeImpactClient } = await import('./birthright-client');

			await expect(analyzeImpactClient('pol-1', mockFetch)).rejects.toThrow(
				'Failed to analyze impact: 500'
			);
		});
	});

	// --- Lifecycle Events ---

	describe('fetchLifecycleEvents', () => {
		it('fetches from /api/governance/lifecycle-events', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchLifecycleEvents } = await import('./birthright-client');

			const result = await fetchLifecycleEvents({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle-events');
			expect(result).toEqual(data);
		});

		it('includes event_type and processed query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchLifecycleEvents } = await import('./birthright-client');

			await fetchLifecycleEvents({ event_type: 'onboarding', processed: false }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('event_type=onboarding');
			expect(calledUrl).toContain('processed=false');
		});

		it('includes all query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchLifecycleEvents } = await import('./birthright-client');

			await fetchLifecycleEvents(
				{
					user_id: 'user-1',
					event_type: 'role_change',
					from: '2026-01-01',
					to: '2026-01-31',
					processed: true,
					limit: 10,
					offset: 20
				},
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('user_id=user-1');
			expect(calledUrl).toContain('event_type=role_change');
			expect(calledUrl).toContain('from=2026-01-01');
			expect(calledUrl).toContain('to=2026-01-31');
			expect(calledUrl).toContain('processed=true');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchLifecycleEvents } = await import('./birthright-client');

			await expect(fetchLifecycleEvents({}, mockFetch)).rejects.toThrow(
				'Failed to fetch lifecycle events: 500'
			);
		});
	});

	describe('fetchLifecycleEvent', () => {
		it('fetches from /api/governance/lifecycle-events/:id', async () => {
			const data = { id: 'evt-1', event_type: 'onboarding', processed: false };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchLifecycleEvent } = await import('./birthright-client');

			const result = await fetchLifecycleEvent('evt-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle-events/evt-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchLifecycleEvent } = await import('./birthright-client');

			await expect(fetchLifecycleEvent('bad', mockFetch)).rejects.toThrow(
				'Failed to fetch lifecycle event: 404'
			);
		});
	});

	describe('createLifecycleEventClient', () => {
		it('sends POST to /api/governance/lifecycle-events', async () => {
			const body = { user_id: 'user-1', event_type: 'onboarding' };
			const data = { id: 'evt-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createLifecycleEventClient } = await import('./birthright-client');

			const result = await createLifecycleEventClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle-events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createLifecycleEventClient } = await import('./birthright-client');

			await expect(createLifecycleEventClient({} as any, mockFetch)).rejects.toThrow(
				'Failed to create lifecycle event: 400'
			);
		});
	});

	describe('processLifecycleEventClient', () => {
		it('sends POST to /api/governance/lifecycle-events/:id/process', async () => {
			const data = { id: 'evt-1', status: 'processed', entitlements_granted: 3 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { processLifecycleEventClient } = await import('./birthright-client');

			const result = await processLifecycleEventClient('evt-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle-events/evt-1/process', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { processLifecycleEventClient } = await import('./birthright-client');

			await expect(processLifecycleEventClient('evt-1', mockFetch)).rejects.toThrow(
				'Failed to process lifecycle event: 500'
			);
		});
	});

	describe('triggerLifecycleEventClient', () => {
		it('sends POST to /api/governance/lifecycle-events/trigger', async () => {
			const body = { user_id: 'user-1', event_type: 'role_change' };
			const data = { id: 'evt-1', status: 'processed', entitlements_granted: 5 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { triggerLifecycleEventClient } = await import('./birthright-client');

			const result = await triggerLifecycleEventClient(body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle-events/trigger', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { triggerLifecycleEventClient } = await import('./birthright-client');

			await expect(triggerLifecycleEventClient({} as any, mockFetch)).rejects.toThrow(
				'Failed to trigger lifecycle event: 500'
			);
		});
	});
});
