import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/groups', () => ({
	getGroup: vi.fn(),
	updateGroup: vi.fn(),
	deleteGroup: vi.fn()
}));

import { PUT } from './+server';
import { updateGroup } from '$lib/api/groups';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'g1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/groups/g1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/admin/groups/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a group with known fields', async () => {
		vi.mocked(updateGroup).mockResolvedValue({ id: 'g1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ display_name: 'ops' })) as any);
		expect(response.status).toBe(200);
		expect(updateGroup).toHaveBeenCalled();
	});

	it('accepts advertised name alias', async () => {
		vi.mocked(updateGroup).mockResolvedValue({ id: 'g1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'ops' })) as any);
		expect(response.status).toBe(200);
		expect(updateGroup).toHaveBeenCalledWith(
			'g1',
			expect.objectContaining({ display_name: 'ops' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateGroup).not.toHaveBeenCalled();
	});

	it('does not update when display_name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ display_name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateGroup).not.toHaveBeenCalled();
	});
});
