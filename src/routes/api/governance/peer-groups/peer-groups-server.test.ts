import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/peer-groups', () => ({
	listPeerGroups: vi.fn(),
	createPeerGroup: vi.fn()
}));

import { POST } from './+server';
import { createPeerGroup } from '$lib/api/peer-groups';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/peer-groups', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/peer-groups', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a peer group with required fields', async () => {
		vi.mocked(createPeerGroup).mockResolvedValue({ id: 'pg1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'Engineering',
					group_type: 'department',
					attribute_key: 'dept',
					attribute_value: 'eng'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createPeerGroup).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createPeerGroup).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						group_type: 'department',
						attribute_key: 'dept',
						attribute_value: 'eng'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createPeerGroup).not.toHaveBeenCalled();
	});
});
