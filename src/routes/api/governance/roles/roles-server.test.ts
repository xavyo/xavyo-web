import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	listRoles: vi.fn(),
	createRole: vi.fn()
}));

import { POST } from './+server';
import { createRole } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a role with required fields', async () => {
		vi.mocked(createRole).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'admin' })) as any);
		expect(response.status).toBe(201);
		expect(createRole).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createRole).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ description: 'x' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createRole).not.toHaveBeenCalled();
	});
});
