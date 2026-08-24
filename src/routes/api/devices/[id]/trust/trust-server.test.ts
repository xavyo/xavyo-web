import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/devices', () => ({
	trustDevice: vi.fn(),
	untrustDevice: vi.fn()
}));

import { POST } from './+server';
import { trustDevice } from '$lib/api/devices';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		params: { id: 'dev-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/devices/dev-1/trust', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/devices/:id/trust', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('trusts a device from valid JSON', async () => {
		vi.mocked(trustDevice).mockResolvedValue({ id: 'dev-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ trust_duration_days: 30 })) as any);
		expect(response.status).toBe(200);
		expect(trustDevice).toHaveBeenCalledWith(
			'dev-1',
			{ trust_duration_days: 30 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not trust on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(trustDevice).not.toHaveBeenCalled();
	});
});
