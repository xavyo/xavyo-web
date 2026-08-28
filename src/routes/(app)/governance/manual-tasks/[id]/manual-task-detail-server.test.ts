import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/manual-tasks', () => ({
	getManualTask: vi.fn(),
	claimTask: vi.fn(),
	startTask: vi.fn(),
	confirmTask: vi.fn(),
	rejectTask: vi.fn(),
	cancelTask: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import { getManualTask } from '$lib/api/manual-tasks';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Manual task detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getManualTask).mockResolvedValue({ id: 'task-1', status: 'pending' } as any);

		const { load } = await import('./+page.server');
		const result = await load({
			params: { id: 'task-1' },
			locals: mockLocals(false),
			fetch: vi.fn()
		} as any);

		expect(result.task).toBeDefined();
		expect(getManualTask).toHaveBeenCalled();
	});
});
