import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	rollbackScript: vi.fn()
}));

import { POST } from './+server';
import { rollbackScript } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/s1/rollback', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/provisioning-scripts/:id/rollback', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('rolls back with required fields', async () => {
		vi.mocked(rollbackScript).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ target_version: 1 })) as any);
		expect(response.status).toBe(200);
		expect(rollbackScript).toHaveBeenCalled();
	});

	it('does not rollback on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(rollbackScript).not.toHaveBeenCalled();
	});

	it('does not rollback when target_version is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(rollbackScript).not.toHaveBeenCalled();
	});
});
