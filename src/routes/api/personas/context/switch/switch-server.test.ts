import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/persona-context', () => ({
	switchContext: vi.fn()
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
	replaceAccessTokenIfJwt: vi.fn().mockReturnValue(false)
}));

import { POST } from './+server';
import { switchContext } from '$lib/api/persona-context';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		cookies: { set: vi.fn(), get: vi.fn(), delete: vi.fn() },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/personas/context/switch', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/personas/context/switch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('switches with a valid persona_id', async () => {
		vi.mocked(switchContext).mockResolvedValue({ access_token: 'new' } as any);
		const response = await POST(makeEvent(JSON.stringify({ persona_id: 'p1' })) as any);
		expect(response.status).toBe(200);
		expect(switchContext).toHaveBeenCalledWith(
			{ persona_id: 'p1', reason: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not switch on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(switchContext).not.toHaveBeenCalled();
	});

	it('does not switch when persona_id is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(switchContext).not.toHaveBeenCalled();
	});
});
