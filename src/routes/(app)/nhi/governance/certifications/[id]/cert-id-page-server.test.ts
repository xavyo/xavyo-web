import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	getNhiCertCampaign: vi.fn(),
	listNhiCertCampaignItems: vi.fn()
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

import { load } from './+page.server';
import { getNhiCertCampaign, listNhiCertCampaignItems } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

describe('NHI certification campaign +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getNhiCertCampaign).mockResolvedValue({ id: 'c1' } as any);
		vi.mocked(listNhiCertCampaignItems).mockResolvedValue({ items: [] } as any);
		const result = await load({
			params: { id: 'c1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(result.campaign).toEqual({ id: 'c1' });
		expect(getNhiCertCampaign).toHaveBeenCalled();
	});
});
