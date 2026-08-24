import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/manual-tasks', () => ({
	getManualTaskDashboard: vi.fn(),
	listManualTasks: vi.fn()
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
import { getManualTaskDashboard, listManualTasks } from '$lib/api/manual-tasks';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Manual tasks +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/manual-tasks'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns dashboard and tasks for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getManualTaskDashboard).mockResolvedValue({
				pending_count: 5,
				in_progress_count: 1
			} as any);
			vi.mocked(listManualTasks).mockResolvedValue({
				items: [{ id: 'task-1' }],
				total: 1,
				limit: 20,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/manual-tasks'),
				fetch: vi.fn()
			} as any);

			expect(result.tasks.items).toHaveLength(1);
			expect(result.dashboard.pending_count).toBe(5);
		});

		it('fails closed when list API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getManualTaskDashboard).mockResolvedValue({ pending_count: 0 } as any);
			vi.mocked(listManualTasks).mockRejectedValue(new Error('Network error'));

			try {
				await load({
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/manual-tasks'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});
});
