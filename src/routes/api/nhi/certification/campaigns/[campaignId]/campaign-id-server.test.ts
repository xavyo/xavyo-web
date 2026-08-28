import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	getNhiCertCampaignV2: vi.fn()
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

import { GET } from './+server';
import { getNhiCertCampaignV2 } from '$lib/api/nhi-cert-campaigns';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/certification/campaigns/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(getNhiCertCampaignV2).mockResolvedValue({ id: 'camp-1' } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			params: { campaignId: 'camp-1' }
		} as any);
		expect(response.status).toBe(200);
		expect(getNhiCertCampaignV2).toHaveBeenCalledWith('camp-1', TOKEN, TENANT, expect.any(Function));
	});
});
