import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	listScriptVersions: vi.fn(),
	createScriptVersion: vi.fn()
}));

import { POST } from './+server';
import { createScriptVersion } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/s1/versions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/provisioning-scripts/:id/versions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a version with required fields', async () => {
		vi.mocked(createScriptVersion).mockResolvedValue({ id: 'v1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ script_body: 'return 1' })) as any);
		expect(response.status).toBe(201);
		expect(createScriptVersion).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createScriptVersion).not.toHaveBeenCalled();
	});

	it('does not create when script_body is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(createScriptVersion).not.toHaveBeenCalled();
	});
});
