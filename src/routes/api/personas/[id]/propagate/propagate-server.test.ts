import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/persona-expiry', () => ({
	propagateAttributes: vi.fn()
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
import { propagateAttributes } from '$lib/api/persona-expiry';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(roles: string[] = ['user']) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles } },
		fetch: vi.fn()
	};
}

describe('POST /api/personas/:id/propagate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('propagates for a non-admin authenticated user', async () => {
		vi.mocked(propagateAttributes).mockResolvedValue({
			persona_id: 'p1',
			attributes_updated: 2
		});
		const response = await POST(makeEvent(['user']) as any);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.attributes_updated).toBe(2);
		expect(propagateAttributes).toHaveBeenCalledWith('p1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 without a session', async () => {
		const response = await POST({
			params: { id: 'p1' },
			locals: { accessToken: null, tenantId: TENANT, user: { roles: ['admin'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(401);
		expect(propagateAttributes).not.toHaveBeenCalled();
	});
});
