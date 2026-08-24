import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/groups', () => ({
	listGroups: vi.fn(),
	createGroup: vi.fn()
}));

import { POST } from './+server';
import { createGroup } from '$lib/api/groups';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/groups', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/admin/groups', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a group with display_name', async () => {
		vi.mocked(createGroup).mockResolvedValue({ id: 'g1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ display_name: 'eng' })) as any);
		expect(response.status).toBe(201);
		expect(createGroup).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createGroup).not.toHaveBeenCalled();
	});

	it('does not create when display_name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(createGroup).not.toHaveBeenCalled();
	});
});
