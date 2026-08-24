import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	validateRoleParameters: vi.fn()
}));

import { POST } from './+server';
import { validateRoleParameters } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'role1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/role1/parameters/validate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles/:id/parameters/validate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('validates with required fields', async () => {
		vi.mocked(validateRoleParameters).mockResolvedValue({ is_valid: true } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ parameters: [{ name: 'dept', value: 'eng' }] })) as any
		);
		expect(response.status).toBe(200);
		expect(validateRoleParameters).toHaveBeenCalled();
	});

	it('does not validate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(validateRoleParameters).not.toHaveBeenCalled();
	});

	it('does not validate when parameters is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(validateRoleParameters).not.toHaveBeenCalled();
	});
});
