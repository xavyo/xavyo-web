import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/outliers', () => ({
	getDisposition: vi.fn(),
	updateDisposition: vi.fn()
}));

import { PUT } from './+server';
import { updateDisposition } from '$lib/api/outliers';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'd1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/outliers/dispositions/d1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/outliers/dispositions/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a disposition with required fields', async () => {
		vi.mocked(updateDisposition).mockResolvedValue({ id: 'd1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ status: 'legitimate' })) as any);
		expect(response.status).toBe(200);
		expect(updateDisposition).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateDisposition).not.toHaveBeenCalled();
	});

	it('does not update when status is invalid', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ status: 'other' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateDisposition).not.toHaveBeenCalled();
	});
});
