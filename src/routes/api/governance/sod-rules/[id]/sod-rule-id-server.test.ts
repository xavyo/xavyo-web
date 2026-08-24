import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	getSodRule: vi.fn(),
	updateSodRule: vi.fn(),
	deleteSodRule: vi.fn()
}));

import { PUT } from './+server';
import { updateSodRule } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/sod-rules/r1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/sod-rules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a rule with known fields', async () => {
		vi.mocked(updateSodRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', severity: 'high' })) as any);
		expect(response.status).toBe(200);
		expect(updateSodRule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateSodRule).not.toHaveBeenCalled();
	});

	it('does not update when severity is invalid', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ severity: 'urgent' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateSodRule).not.toHaveBeenCalled();
	});
});
