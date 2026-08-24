import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	listCampaigns: vi.fn(),
	createCampaign: vi.fn()
}));

import { POST } from './+server';
import { createCampaign } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/certification-campaigns', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/certification-campaigns', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a campaign with required fields', async () => {
		vi.mocked(createCampaign).mockResolvedValue({ id: 'camp1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'Q1',
					scope_type: 'all_users',
					reviewer_type: 'user_manager',
					deadline: '2026-12-31'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createCampaign).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createCampaign).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						scope_type: 'all_users',
						reviewer_type: 'user_manager',
						deadline: '2026-12-31'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createCampaign).not.toHaveBeenCalled();
	});
});
