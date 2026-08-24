import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-roles', () => ({
	listInheritanceBlocks: vi.fn(),
	addInheritanceBlock: vi.fn()
}));

import { POST } from './+server';
import { addInheritanceBlock } from '$lib/api/governance-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/roles/r1/inheritance-blocks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/roles/:id/inheritance-blocks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds a block with required fields', async () => {
		vi.mocked(addInheritanceBlock).mockResolvedValue({ id: 'b1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ entitlement_id: 'e1' })) as any);
		expect(response.status).toBe(201);
		expect(addInheritanceBlock).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addInheritanceBlock).not.toHaveBeenCalled();
	});

	it('does not add when entitlement_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(addInheritanceBlock).not.toHaveBeenCalled();
	});
});
