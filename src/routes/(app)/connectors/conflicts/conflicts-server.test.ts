import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/operations', () => ({
	listConflicts: vi.fn()
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
import { listConflicts } from '$lib/api/operations';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Connector conflicts +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listConflicts).mockResolvedValue({
			conflicts: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);
		const result = await load({
			locals: mockLocals(false),
			url: new URL('http://localhost/connectors/conflicts'),
			fetch: vi.fn()
		} as any);
		expect(result).toBeDefined();
		expect(listConflicts).toHaveBeenCalled();
	});

	it('returns conflicts for admin', async () => {
		vi.mocked(listConflicts).mockResolvedValue({
			conflicts: [{ id: 'c1' }],
			total: 1,
			limit: 20,
			offset: 0
		} as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/conflicts'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.conflicts.conflicts).toHaveLength(1);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listConflicts).mockResolvedValue({ conflicts: [], total: 0 } as any);
		await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/conflicts?limit=abc&offset=nope'),
			fetch: vi.fn()
		} as any);
		expect(listConflicts).toHaveBeenCalledWith(
			{ conflict_type: undefined, pending_only: undefined, limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('fails closed when list API throws', async () => {
		vi.mocked(listConflicts).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/conflicts'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listConflicts).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/conflicts'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
