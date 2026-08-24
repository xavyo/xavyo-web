import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	addConstraint: vi.fn()
}));

import { POST } from './+server';
import { addConstraint } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'm1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles/m1/constraints', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/meta-roles/:id/constraints', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds a constraint with required fields', async () => {
		vi.mocked(addConstraint).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ constraint_type: 'require_mfa', constraint_value: { enabled: true } })) as any
		);
		expect(response.status).toBe(201);
		expect(addConstraint).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addConstraint).not.toHaveBeenCalled();
	});

	it('does not add when constraint_type is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ constraint_type: 'other', constraint_value: {} })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(addConstraint).not.toHaveBeenCalled();
	});
});
