import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	validateScript: vi.fn()
}));

import { POST } from './+server';
import { validateScript } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/validate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/provisioning-scripts/validate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('validates with required fields', async () => {
		vi.mocked(validateScript).mockResolvedValue({ valid: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ script_body: 'return 1' })) as any);
		expect(response.status).toBe(200);
		expect(validateScript).toHaveBeenCalled();
	});

	it('does not validate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(validateScript).not.toHaveBeenCalled();
	});

	it('does not validate when script_body is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(validateScript).not.toHaveBeenCalled();
	});
});
