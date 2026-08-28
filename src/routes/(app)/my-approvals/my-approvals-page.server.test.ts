import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/my-approvals', () => ({
	listMyApprovals: vi.fn()
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
import { listMyApprovals } from '$lib/api/my-approvals';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('load /my-approvals', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listMyApprovals).mockResolvedValue({ items: [], total: 0 } as any);
		const result = await load({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/my-approvals?page=3&page_size=10')
		} as any);
		expect(listMyApprovals).toHaveBeenCalledWith(
			{ status: 'pending', limit: 10, offset: 20 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
		expect(result).toMatchObject({ limit: 10, offset: 20 });
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listMyApprovals).mockResolvedValue({ items: [], total: 0 } as any);
		const result = await load({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/my-approvals?limit=abc&offset=nope')
		} as any);
		expect(listMyApprovals).toHaveBeenCalledWith(
			{ status: 'pending', limit: 20, offset: 0 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
		expect(result).toMatchObject({ limit: 20, offset: 0 });
	});
});
