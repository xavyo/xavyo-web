import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/governance', () => ({
	getCampaign: vi.fn(),
	getCampaignProgress: vi.fn(),
	listCampaignItems: vi.fn(),
	updateCampaign: vi.fn(),
	deleteCampaign: vi.fn(),
	launchCampaign: vi.fn(),
	cancelCampaign: vi.fn(),
	decideCertificationItem: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn(async (data: unknown) => ({ data, valid: true })),
	message: vi.fn(),
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

import { hasAdminRole } from '$lib/server/auth';
import { getCampaign, getCampaignProgress, listCampaignItems } from '$lib/api/governance';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Certification campaign detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getCampaign).mockResolvedValue({
			id: 'c1',
			name: 'Q1',
			description: '',
			scope_type: 'all',
			scope_config: {},
			reviewer_type: 'manager',
			deadline: '2026-12-31'
		} as any);
		vi.mocked(getCampaignProgress).mockResolvedValue({} as any);
		vi.mocked(listCampaignItems).mockResolvedValue({ items: [], total: 0 } as any);

		const { load } = await import('./+page.server');
		const result = await load({
			params: { id: 'c1' },
			locals: mockLocals(false),
			fetch: vi.fn()
		} as any);

		expect(result.campaign).toBeDefined();
		expect(getCampaign).toHaveBeenCalled();
	});
});
