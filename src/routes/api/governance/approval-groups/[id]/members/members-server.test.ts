import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	addGroupMembers: vi.fn()
}));

import { POST } from './+server';
import { addGroupMembers } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'g1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/approval-groups/g1/members', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/approval-groups/:id/members', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds members with required fields', async () => {
		vi.mocked(addGroupMembers).mockResolvedValue({ id: 'g1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ member_ids: ['u1'] })) as any);
		expect(response.status).toBe(201);
		expect(addGroupMembers).toHaveBeenCalled();
	});

	it('does not add members on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addGroupMembers).not.toHaveBeenCalled();
	});

	it('does not add members when member_ids is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(addGroupMembers).not.toHaveBeenCalled();
	});
});
