import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	launchNhiCertCampaign: vi.fn()
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

import { POST } from './+server';
import { launchNhiCertCampaign } from '$lib/api/nhi-cert-campaigns';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/nhi/certification/campaigns/:id/launch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin user', async () => {
		vi.mocked(launchNhiCertCampaign).mockResolvedValue({ id: 'camp-1' } as any);
		const response = await POST({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			params: { campaignId: 'camp-1' }
		} as any);
		expect(response.status).toBe(200);
		expect(launchNhiCertCampaign).toHaveBeenCalledWith(
			'camp-1',
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
