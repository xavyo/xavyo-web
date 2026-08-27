import { describe, it, expect, vi, beforeEach } from 'vitest';

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

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string, roles: string[] = ['user']) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles } },
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
	});

	it('extends with required fields', async () => {
		vi.mocked(extendPersona).mockResolvedValue({ status: 'approved', persona: null, approval_request_id: null });
		const response = await POST(makeEvent(JSON.stringify({ new_valid_until: '2026-12-01' })) as any);
		expect(response.status).toBe(200);
		expect(extendPersona).toHaveBeenCalled();
	});

	it('does not 403 a non-admin owner', async () => {
		vi.mocked(extendPersona).mockResolvedValue({ status: 'approved', persona: {}, approval_request_id: null });
		const response = await POST(
			makeEvent(JSON.stringify({ new_valid_until: '2026-12-01' }), ['user']) as any
		);
		expect(response.status).toBe(200);
		expect(extendPersona).toHaveBeenCalledWith(
			'p1',
			{ new_valid_until: '2026-12-01' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
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
