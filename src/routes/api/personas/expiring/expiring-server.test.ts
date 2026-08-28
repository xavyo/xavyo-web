import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/persona-expiry', () => ({
	listExpiringPersonas: vi.fn()
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

import { GET } from './+server';
import { listExpiringPersonas } from '$lib/api/persona-expiry';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url = 'http://localhost/api/personas/expiring') {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/personas/expiring', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin self-service user', async () => {
		vi.mocked(listExpiringPersonas).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET(makeEvent() as any);
		expect(response.status).toBe(200);
		expect(listExpiringPersonas).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listExpiringPersonas).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(makeEvent('http://localhost/api/personas/expiring?page=2&page_size=10') as any);
		expect(listExpiringPersonas).toHaveBeenCalledWith(
			{ days_ahead: undefined, limit: 10, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('returns 401 without a token', async () => {
		const response = await GET({
			...makeEvent(),
			locals: { tenantId: TENANT, user: { roles: ['user'] } }
		} as any);
		expect(response.status).toBe(401);
		expect(listExpiringPersonas).not.toHaveBeenCalled();
	});
});
