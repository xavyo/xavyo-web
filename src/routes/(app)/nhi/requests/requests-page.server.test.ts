import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/nhi-requests', () => ({
	listNhiRequests: vi.fn(),
	getNhiRequestSummary: vi.fn()
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

import { load } from './+page.server';
import { listNhiRequests, getNhiRequestSummary } from '$lib/api/nhi-requests';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('load /nhi/requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getNhiRequestSummary).mockResolvedValue({} as any);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listNhiRequests).mockResolvedValue({ items: [], total: 0 } as any);
		await load({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/nhi/requests?offset=nope&limit=abc')
		} as any);
		expect(listNhiRequests).toHaveBeenCalledWith(
			{ status: undefined, limit: 20, offset: 0 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
