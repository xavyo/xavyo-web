import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	listDiscrepancies: vi.fn(),
	remediateDiscrepancy: vi.fn(),
	ignoreDiscrepancy: vi.fn(),
	bulkRemediate: vi.fn()
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
import { listDiscrepancies } from '$lib/api/reconciliation';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Connector discrepancies +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns discrepancies for admin', async () => {
		vi.mocked(listDiscrepancies).mockResolvedValue({
			discrepancies: [{ id: 'd1' }],
			total: 1,
			limit: 20,
			offset: 0
		} as any);

		const result = (await load({
			params: { id: 'conn-1' },
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/conn-1/reconciliation/discrepancies'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.discrepancies.discrepancies).toHaveLength(1);
		expect(result.connectorId).toBe('conn-1');
	});

	it('fails closed when list API throws', async () => {
		vi.mocked(listDiscrepancies).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/conn-1/reconciliation/discrepancies'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listDiscrepancies).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/conn-1/reconciliation/discrepancies'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
