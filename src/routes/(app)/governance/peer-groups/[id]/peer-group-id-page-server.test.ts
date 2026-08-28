import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/peer-groups', () => ({
	getPeerGroup: vi.fn(),
	deletePeerGroup: vi.fn(),
	refreshPeerGroup: vi.fn()
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
import { getPeerGroup } from '$lib/api/peer-groups';
import { hasAdminRole } from '$lib/server/auth';

describe('Peer group detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(getPeerGroup).mockResolvedValue({ id: 'pg-1', name: 'Finance' } as any);

		const result = await load({
			params: { id: 'pg-1' },
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);

		expect(result.group.id).toBe('pg-1');
		expect(getPeerGroup).toHaveBeenCalled();
	});
});
