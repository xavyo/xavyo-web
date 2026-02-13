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

	// --- fetchBirthrightPolicies ---

	describe('fetchBirthrightPolicies', () => {
		it('fetches from /api/governance/birthright-policies', async () => {
			const data = { items: [], total: 0, limit: 50, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			const result = await fetchBirthrightPolicies({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies');
			expect(result).toEqual(data);
		});

		it('includes status query param', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			await fetchBirthrightPolicies({ status: 'active' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
		});

		it('includes limit and offset query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			await fetchBirthrightPolicies({ limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchBirthrightPolicies } = await import('./birthright-client');

			await expect(fetchBirthrightPolicies({}, mockFetch)).rejects.toThrow('Failed to fetch birthright policies: 500');
		});
	});

	// --- simulatePolicyClient ---

	describe('simulatePolicyClient', () => {
		it('sends POST to /api/governance/birthright-policies/:id/simulate', async () => {
			const requestData = { attributes: { department: 'Engineering', location: 'US' } };
			const data = { matched: true, entitlements: ['ent-1'] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { simulatePolicyClient } = await import('./birthright-client');

			const result = await simulatePolicyClient('pol-1', requestData, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/pol-1/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestData)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { simulatePolicyClient } = await import('./birthright-client');

			await expect(simulatePolicyClient('pol-1', { attributes: { dept: 'IT' } }, mockFetch)).rejects.toThrow('Failed to simulate policy: 400');
		});
	});

	// --- simulateAllPoliciesClient ---

	describe('simulateAllPoliciesClient', () => {
		it('sends POST to /api/governance/birthright-policies/simulate', async () => {
			const requestData = { attributes: { department: 'Engineering' } };
			const data = { policies: [{ id: 'pol-1', matched: true }] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { simulateAllPoliciesClient } = await import('./birthright-client');

			const result = await simulateAllPoliciesClient(requestData, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestData)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { simulateAllPoliciesClient } = await import('./birthright-client');

			await expect(simulateAllPoliciesClient({ attributes: { dept: 'HR' } }, mockFetch)).rejects.toThrow('Failed to simulate all policies: 500');
		});
	});

	// --- analyzeImpactClient ---

	describe('analyzeImpactClient', () => {
		it('sends POST to /api/governance/birthright-policies/:id/impact with empty body', async () => {
			const data = {
				policy_id: 'pol-1',
				policy_name: 'Test Policy',
				summary: {
					total_users_affected: 50,
					users_gaining_access: 30,
					users_losing_access: 10,
					users_unchanged: 10,
					total_entitlements_granted: 5
				},
				by_department: [],
				by_location: [],
				entitlement_impacts: [],
				affected_users: [],
				is_truncated: false
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { analyzeImpactClient } = await import('./birthright-client');

			const result = await analyzeImpactClient('pol-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/birthright-policies/pol-1/impact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { analyzeImpactClient } = await import('./birthright-client');

			await expect(analyzeImpactClient('pol-1', mockFetch)).rejects.toThrow('Failed to analyze impact: 422');
		});
	});
});
