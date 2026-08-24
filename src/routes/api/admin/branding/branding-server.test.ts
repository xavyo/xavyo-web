import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/branding', () => ({
	getBranding: vi.fn(),
	updateBranding: vi.fn()
}));

import { PUT } from './+server';
import { updateBranding } from '$lib/api/branding';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/branding', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/admin/branding', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates branding with known fields', async () => {
		vi.mocked(updateBranding).mockResolvedValue({ primary_color: '#fff' } as any);
		const response = await PUT(
			makeEvent(JSON.stringify({ primary_color: '#fff', logo_url: null })) as any
		);
		expect(response.status).toBe(200);
		expect(updateBranding).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateBranding).not.toHaveBeenCalled();
	});

	it('does not update when a color is not a string', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ primary_color: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateBranding).not.toHaveBeenCalled();
	});
});
