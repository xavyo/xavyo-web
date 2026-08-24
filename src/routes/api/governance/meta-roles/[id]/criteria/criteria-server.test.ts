import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	addCriterion: vi.fn()
}));

import { POST } from './+server';
import { addCriterion } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'm1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles/m1/criteria', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/meta-roles/:id/criteria', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds a criterion with required fields', async () => {
		vi.mocked(addCriterion).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ field: 'dept', operator: 'eq', value: 'eng' })) as any
		);
		expect(response.status).toBe(201);
		expect(addCriterion).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addCriterion).not.toHaveBeenCalled();
	});

	it('does not add when operator is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ field: 'dept', operator: 'equals', value: 'eng' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(addCriterion).not.toHaveBeenCalled();
	});
});
