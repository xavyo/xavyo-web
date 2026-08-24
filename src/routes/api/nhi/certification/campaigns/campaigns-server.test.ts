import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	listNhiCertCampaignsV2: vi.fn(),
	createNhiCertCampaignV2: vi.fn()
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
import { createNhiCertCampaignV2 } from '$lib/api/nhi-cert-campaigns';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/certification/campaigns', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/certification/campaigns', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a campaign with required fields', async () => {
		vi.mocked(createNhiCertCampaignV2).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Q1 review' })) as any);
		expect(response.status).toBe(201);
		expect(createNhiCertCampaignV2).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createNhiCertCampaignV2).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(createNhiCertCampaignV2).not.toHaveBeenCalled();
	});
});
