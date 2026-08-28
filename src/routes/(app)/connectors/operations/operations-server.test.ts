import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/operations', () => ({
	listOperations: vi.fn(),
	getOperationStats: vi.fn()
}));

vi.mock('$lib/api/connectors', () => ({
	listConnectors: vi.fn()
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
import { listOperations, getOperationStats } from '$lib/api/operations';
import { listConnectors } from '$lib/api/connectors';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Connector operations +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns operations, stats, and connectors for admin', async () => {
		vi.mocked(listOperations).mockResolvedValue({
			operations: [{ id: 'op-1' }],
			total: 1,
			limit: 20,
			offset: 0
		} as any);
		vi.mocked(getOperationStats).mockResolvedValue({ pending: 1 } as any);
		vi.mocked(listConnectors).mockResolvedValue({
			items: [{ id: 'conn-1' }],
			total: 1,
			limit: 100,
			offset: 0
		} as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/operations'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.operations.operations).toHaveLength(1);
		expect(result.stats.pending).toBe(1);
		expect(result.connectors).toHaveLength(1);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listOperations).mockResolvedValue({ operations: [], total: 0 } as any);
		vi.mocked(getOperationStats).mockResolvedValue({} as any);
		vi.mocked(listConnectors).mockResolvedValue({ items: [] } as any);
		await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/operations?limit=abc&offset=nope'),
			fetch: vi.fn()
		} as any);
		expect(listOperations).toHaveBeenCalledWith(
			{
				connector_id: undefined,
				status: undefined,
				operation_type: undefined,
				from_date: undefined,
				to_date: undefined,
				limit: 20,
				offset: 0
			},
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('fails closed when operations list throws', async () => {
		vi.mocked(listOperations).mockRejectedValue(new Error('network'));
		vi.mocked(getOperationStats).mockResolvedValue({} as any);
		vi.mocked(listConnectors).mockResolvedValue({ items: [] } as any);

		try {
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/operations'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('fails closed when connectors list throws', async () => {
		vi.mocked(listOperations).mockResolvedValue({
			operations: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);
		vi.mocked(getOperationStats).mockResolvedValue({} as any);
		vi.mocked(listConnectors).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/operations'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listOperations).mockRejectedValue(new ApiError('Forbidden', 403));
		vi.mocked(getOperationStats).mockResolvedValue({} as any);
		vi.mocked(listConnectors).mockResolvedValue({ items: [] } as any);

		try {
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/operations'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
