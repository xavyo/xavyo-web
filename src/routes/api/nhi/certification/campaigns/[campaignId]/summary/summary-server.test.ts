import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	getNhiCertCampaignSummary: vi.fn()
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
import { getNhiCertCampaignSummary } from '$lib/api/nhi-cert-campaigns';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/certification/campaigns/:id/summary', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(getNhiCertCampaignSummary).mockResolvedValue({ pending: 2 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			params: { campaignId: 'camp-1' }
		} as any);
		expect(response.status).toBe(200);
		expect(getNhiCertCampaignSummary).toHaveBeenCalledWith(
			'camp-1',
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
