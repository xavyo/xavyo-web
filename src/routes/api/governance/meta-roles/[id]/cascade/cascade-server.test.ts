import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	cascadeMetaRole: vi.fn()
}));

import { POST } from './+server';
import { cascadeMetaRole } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'm1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles/m1/cascade', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/meta-roles/:id/cascade', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('cascades with required fields', async () => {
		vi.mocked(cascadeMetaRole).mockResolvedValue({ in_progress: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ meta_role_id: 'm1', dry_run: true })) as any);
		expect(response.status).toBe(202);
		expect(cascadeMetaRole).toHaveBeenCalled();
	});

	it('does not cascade on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(cascadeMetaRole).not.toHaveBeenCalled();
	});

	it('does not cascade when meta_role_id is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ dry_run: true })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(cascadeMetaRole).not.toHaveBeenCalled();
	});
});
