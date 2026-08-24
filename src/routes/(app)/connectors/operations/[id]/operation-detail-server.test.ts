import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/operations', () => ({
	getOperation: vi.fn(),
	getOperationAttempts: vi.fn(),
	getOperationLogs: vi.fn(),
	retryOperation: vi.fn(),
	cancelOperation: vi.fn(),
	resolveOperation: vi.fn()
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
import { getOperation, getOperationAttempts, getOperationLogs } from '$lib/api/operations';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Operation detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns operation, attempts, and logs for admin', async () => {
		vi.mocked(getOperation).mockResolvedValue({ id: 'op-1' } as any);
		vi.mocked(getOperationAttempts).mockResolvedValue({
			attempts: [{ id: 'a1' }],
			operation_id: 'op-1'
		} as any);
		vi.mocked(getOperationLogs).mockResolvedValue({
			logs: [{ id: 'l1' }],
			operation_id: 'op-1'
		} as any);

		const result = (await load({
			params: { id: 'op-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.operation.id).toBe('op-1');
		expect(result.attempts).toHaveLength(1);
		expect(result.logs).toHaveLength(1);
	});

	it('fails closed when attempts API throws', async () => {
		vi.mocked(getOperation).mockResolvedValue({ id: 'op-1' } as any);
		vi.mocked(getOperationAttempts).mockRejectedValue(new Error('network'));
		vi.mocked(getOperationLogs).mockResolvedValue({ logs: [], operation_id: 'op-1' } as any);

		try {
			await load({
				params: { id: 'op-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('fails closed when logs API throws', async () => {
		vi.mocked(getOperation).mockResolvedValue({ id: 'op-1' } as any);
		vi.mocked(getOperationAttempts).mockResolvedValue({
			attempts: [],
			operation_id: 'op-1'
		} as any);
		vi.mocked(getOperationLogs).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'op-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(getOperation).mockRejectedValue(new ApiError('Not found', 404));
		vi.mocked(getOperationAttempts).mockResolvedValue({
			attempts: [],
			operation_id: 'op-1'
		} as any);
		vi.mocked(getOperationLogs).mockResolvedValue({ logs: [], operation_id: 'op-1' } as any);

		try {
			await load({
				params: { id: 'op-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(404);
		}
	});
});
