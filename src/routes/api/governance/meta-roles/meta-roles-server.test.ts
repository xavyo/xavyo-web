import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	listMetaRoles: vi.fn(),
	createMetaRole: vi.fn()
}));

import { POST } from './+server';
import { createMetaRole } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/meta-roles', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a meta-role with required fields', async () => {
		vi.mocked(createMetaRole).mockResolvedValue({ id: 'm1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'n', priority: 1 })) as any);
		expect(response.status).toBe(201);
		expect(createMetaRole).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createMetaRole).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ priority: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createMetaRole).not.toHaveBeenCalled();
	});
});
