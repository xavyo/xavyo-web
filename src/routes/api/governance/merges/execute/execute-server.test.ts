import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	executeMerge: vi.fn()
}));

import { POST } from './+server';
import { executeMerge } from '$lib/api/dedup';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/merges/execute', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/merges/execute', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('executes a valid merge', async () => {
		vi.mocked(executeMerge).mockResolvedValue({ id: 'op-1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					source_identity_id: 's1',
					target_identity_id: 't1',
					entitlement_strategy: 'union'
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(executeMerge).toHaveBeenCalled();
	});

	it('does not execute on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(executeMerge).not.toHaveBeenCalled();
	});

	it('does not execute when identities are missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(executeMerge).not.toHaveBeenCalled();
	});
});
