import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	getApplication: vi.fn(),
	updateApplication: vi.fn(),
	deleteApplication: vi.fn()
}));

import { PUT } from './+server';
import { updateApplication } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'a1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/applications/a1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/applications/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates an application with known fields', async () => {
		vi.mocked(updateApplication).mockResolvedValue({ id: 'a1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'App' })) as any);
		expect(response.status).toBe(200);
		expect(updateApplication).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateApplication).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateApplication).not.toHaveBeenCalled();
	});
});
