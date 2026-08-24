import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/groups', () => ({
	addGroupMembers: vi.fn()
}));

import { POST } from './+server';
import { addGroupMembers } from '$lib/api/groups';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		params: { id: 'g1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/groups/g1/members', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/admin/groups/:id/members', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds members with member_ids', async () => {
		vi.mocked(addGroupMembers).mockResolvedValue(undefined as any);
		const response = await POST(makeEvent(JSON.stringify({ member_ids: ['u1'] })) as any);
		expect(response.status).toBe(200);
		expect(addGroupMembers).toHaveBeenCalledWith(
			'g1',
			{ member_ids: ['u1'] },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addGroupMembers).not.toHaveBeenCalled();
	});

	it('does not add when member_ids is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(addGroupMembers).not.toHaveBeenCalled();
	});
});
