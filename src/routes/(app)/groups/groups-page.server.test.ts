import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/groups', () => ({
	listGroups: vi.fn()
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
import { listGroups } from '$lib/api/groups';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('load /groups', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listGroups).mockResolvedValue({ groups: [], pagination: {} } as any);
		await load({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/groups?page=3&page_size=10')
		} as any);
		expect(listGroups).toHaveBeenCalledWith(
			{ limit: 10, offset: 20 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listGroups).mockResolvedValue({ groups: [], pagination: {} } as any);
		await load({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/groups?limit=abc&offset=nope')
		} as any);
		expect(listGroups).toHaveBeenCalledWith(
			{ limit: 20, offset: 0 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
