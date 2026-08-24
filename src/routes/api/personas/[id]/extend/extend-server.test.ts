import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/persona-expiry', () => ({
	extendPersona: vi.fn()
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

import { POST } from './+server';
import { extendPersona } from '$lib/api/persona-expiry';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/personas/p1/extend', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/personas/:id/extend', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('extends with required fields', async () => {
		vi.mocked(extendPersona).mockResolvedValue({ status: 'approved' } as any);
		const response = await POST(makeEvent(JSON.stringify({ new_valid_until: '2026-12-01' })) as any);
		expect(response.status).toBe(200);
		expect(extendPersona).toHaveBeenCalled();
	});

	it('does not extend on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(extendPersona).not.toHaveBeenCalled();
	});

	it('does not extend when new_valid_until is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({ reason: 'x' })) as any);
		expect(response.status).toBe(400);
		expect(extendPersona).not.toHaveBeenCalled();
	});
});
