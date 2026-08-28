import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	getMyPendingCertItems: vi.fn()
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
import { getMyPendingCertItems } from '$lib/api/nhi-cert-campaigns';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/nhi/certification/my-pending', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getMyPendingCertItems).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('maps page/page_size onto limit/offset', async () => {
		const response = await GET(
			makeEvent('http://localhost/api/nhi/certification/my-pending?page=4&page_size=5') as any
		);
		expect(response.status).toBe(200);
		expect(getMyPendingCertItems).toHaveBeenCalledWith(
			{ limit: 5, offset: 15 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
