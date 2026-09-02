import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/groups', () => ({
	listGroups: vi.fn(),
	createGroup: vi.fn()
}));

import { GET, POST } from './+server';
import { createGroup, listGroups } from '$lib/api/groups';

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

describe('GET /api/admin/groups', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised group_type filter', async () => {
		vi.mocked(listGroups).mockResolvedValue({ groups: [], pagination: {} } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/admin/groups?group_type=department')
		} as any);
		expect(listGroups).toHaveBeenCalledWith(
			expect.objectContaining({ group_type: 'department' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

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

	it('accepts advertised name alias', async () => {
		vi.mocked(createGroup).mockResolvedValue({ id: 'g1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'eng' })) as any);
		expect(response.status).toBe(201);
		expect(createGroup).toHaveBeenCalledWith(
			expect.objectContaining({ display_name: 'eng' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
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
