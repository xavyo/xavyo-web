import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/users', () => ({
	getUser: vi.fn(),
	updateUser: vi.fn(),
	deleteUser: vi.fn(),
	resetUserPassword: vi.fn()
}));

vi.mock('$lib/api/lifecycle', () => ({
	getUserLifecycleStatus: vi.fn()
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
import { getUser } from '$lib/api/users';
import { getUserLifecycleStatus } from '$lib/api/lifecycle';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { id: 'admin-1' }
});

describe('User detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getUser).mockResolvedValue({
			id: 'user-1',
			email: 'a@b.com',
			roles: ['user']
		} as any);
	});

	it('returns lifecycle status when present', async () => {
		vi.mocked(getUserLifecycleStatus).mockResolvedValue({ model: 'direct' } as any);

		const result = (await load({
			params: { id: 'user-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.lifecycleStatus.model).toBe('direct');
	});

	it('treats missing lifecycle 404 as null', async () => {
		vi.mocked(getUserLifecycleStatus).mockRejectedValue(new ApiError('Not found', 404));

		const result = (await load({
			params: { id: 'user-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.lifecycleStatus).toBeNull();
	});

	it('degrades gracefully when the lifecycle API errors (page still loads)', async () => {
		// Lifecycle status is supplementary; a backend error there must not take down
		// the whole user detail/edit page (which is where role management lives).
		vi.mocked(getUserLifecycleStatus).mockRejectedValue(new ApiError('boom', 500));

		const result: any = await load({
			params: { id: 'user-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any);

		expect(result.user).toBeDefined();
		expect(result.lifecycleStatus).toBeNull();
	});
});
