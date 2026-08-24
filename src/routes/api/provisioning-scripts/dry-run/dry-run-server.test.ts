import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	dryRunScript: vi.fn()
}));

import { POST } from './+server';
import { dryRunScript } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/dry-run', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/provisioning-scripts/dry-run', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('dry-runs with required fields', async () => {
		vi.mocked(dryRunScript).mockResolvedValue({ ok: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ context: { user: 'u1' } })) as any);
		expect(response.status).toBe(200);
		expect(dryRunScript).toHaveBeenCalled();
	});

	it('does not dry-run on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(dryRunScript).not.toHaveBeenCalled();
	});

	it('does not dry-run when context is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(dryRunScript).not.toHaveBeenCalled();
	});
});
