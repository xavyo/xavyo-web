import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/persona-context', () => ({
	switchBack: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

vi.mock('$lib/server/auth', () => ({
	omitTokenFields: (v: Record<string, unknown>) => v,
	isDecodableJwt: vi.fn().mockReturnValue(false),
	replaceAccessTokenIfJwt: vi.fn()
}));

import { POST } from './+server';
import { switchBack } from '$lib/api/persona-context';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/personas/context/switch-back', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/personas/context/switch-back', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('switches back with valid JSON', async () => {
		vi.mocked(switchBack).mockResolvedValue({ access_token: 'new' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'done' })) as any);
		expect(response.status).toBe(200);
		expect(switchBack).toHaveBeenCalledWith(
			{ reason: 'done' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not switch back on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(switchBack).not.toHaveBeenCalled();
	});
});
