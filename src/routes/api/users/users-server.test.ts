import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/users', () => ({
	listUsers: vi.fn()
}));

import { GET } from './+server';
import { listUsers } from '$lib/api/users';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/users', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(listUsers).mockResolvedValue({ users: [], pagination: {} } as any);
	});

	it('forwards advertised is_active filter', async () => {
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/users?is_active=false')
		} as any);
		expect(listUsers).toHaveBeenCalledWith(
			expect.objectContaining({ is_active: false }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
