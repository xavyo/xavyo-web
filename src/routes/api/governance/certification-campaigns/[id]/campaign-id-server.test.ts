import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	getCampaign: vi.fn(),
	updateCampaign: vi.fn(),
	deleteCampaign: vi.fn()
}));

import { PUT } from './+server';
import { updateCampaign } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'camp1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/certification-campaigns/camp1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/certification-campaigns/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a campaign with known fields', async () => {
		vi.mocked(updateCampaign).mockResolvedValue({ id: 'camp1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Q1' })) as any);
		expect(response.status).toBe(200);
		expect(updateCampaign).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateCampaign).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateCampaign).not.toHaveBeenCalled();
	});
});
