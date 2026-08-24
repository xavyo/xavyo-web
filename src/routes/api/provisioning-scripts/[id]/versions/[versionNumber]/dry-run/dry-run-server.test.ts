import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	dryRunScriptVersion: vi.fn()
}));

import { POST } from './+server';
import { dryRunScriptVersion } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 's1', versionNumber: '2' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/s1/versions/2/dry-run', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/provisioning-scripts/:id/versions/:versionNumber/dry-run', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('dry-runs with required fields', async () => {
		vi.mocked(dryRunScriptVersion).mockResolvedValue({ ok: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ context: { user: 'u1' } })) as any);
		expect(response.status).toBe(200);
		expect(dryRunScriptVersion).toHaveBeenCalled();
	});

	it('does not dry-run on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(dryRunScriptVersion).not.toHaveBeenCalled();
	});

	it('does not dry-run when context is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(dryRunScriptVersion).not.toHaveBeenCalled();
	});
});
