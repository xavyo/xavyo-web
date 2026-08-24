import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/object-templates', () => ({
	getObjectTemplate: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { getObjectTemplate } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Object template detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns template', async () => {
		vi.mocked(getObjectTemplate).mockResolvedValue({ id: 'tpl-1', name: 'User' } as any);

		const result = (await load({
			params: { id: 'tpl-1' },
			locals: mockLocals(true)
		} as any)) as any;

		expect(result.template.name).toBe('User');
	});

	it('propagates ApiError 404', async () => {
		vi.mocked(getObjectTemplate).mockRejectedValue(new ApiError('Not found', 404));

		try {
			await load({
				params: { id: 'missing' },
				locals: mockLocals(true)
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(404);
		}
	});

	it('fails closed with 500 on network error instead of fake 404', async () => {
		vi.mocked(getObjectTemplate).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'tpl-1' },
				locals: mockLocals(true)
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});
