import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/a2a', () => ({
	listA2aTasks: vi.fn()
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
import { listA2aTasks } from '$lib/api/a2a';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('load /nhi/a2a', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listA2aTasks).mockResolvedValue({ tasks: [], total: 0 } as any);
		await load({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/nhi/a2a?page=2&page_size=5')
		} as any);
		expect(listA2aTasks).toHaveBeenCalledWith(
			{ state: undefined, limit: 5, offset: 5 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listA2aTasks).mockResolvedValue({ tasks: [], total: 0 } as any);
		await load({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/nhi/a2a?limit=abc&offset=nope')
		} as any);
		expect(listA2aTasks).toHaveBeenCalledWith(
			{ state: undefined, limit: 20, offset: 0 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
