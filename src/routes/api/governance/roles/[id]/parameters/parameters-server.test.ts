import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	listRoleParameters: vi.fn(),
	addRoleParameter: vi.fn()
}));

import { POST } from './+server';
import { addRoleParameter } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/r1/parameters', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles/:id/parameters', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds a parameter with required fields', async () => {
		vi.mocked(addRoleParameter).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'region', parameter_type: 'string' })) as any
		);
		expect(response.status).toBe(201);
		expect(addRoleParameter).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addRoleParameter).not.toHaveBeenCalled();
	});

	it('does not add when parameter_type is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'region', parameter_type: 'uuid' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(addRoleParameter).not.toHaveBeenCalled();
	});
});
