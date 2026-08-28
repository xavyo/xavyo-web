import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/operations', () => ({
	getOperationsDlq: vi.fn(),
	retryOperation: vi.fn(),
	resolveOperation: vi.fn()
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
import { getOperationsDlq } from '$lib/api/operations';
import { listConnectors } from '$lib/api/connectors';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Operations DLQ +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns dlq and connectors for admin', async () => {
		vi.mocked(getOperationsDlq).mockResolvedValue({
			operations: [{ id: 'op-1' }],
			offset: 0,
			limit: 20
		} as any);
		vi.mocked(listConnectors).mockResolvedValue({
			items: [{ id: 'conn-1' }],
			total: 1,
			limit: 100,
			offset: 0
		} as any);

		const result = (await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/operations/dlq'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.dlq.operations).toHaveLength(1);
		expect(result.connectors).toHaveLength(1);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(getOperationsDlq).mockResolvedValue({ operations: [] } as any);
		vi.mocked(listConnectors).mockResolvedValue({ items: [] } as any);
		await load({
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/operations/dlq?limit=abc&offset=nope'),
			fetch: vi.fn()
		} as any);
		expect(getOperationsDlq).toHaveBeenCalledWith(
			{ connector_id: undefined, limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('fails closed when DLQ API throws', async () => {
		vi.mocked(getOperationsDlq).mockRejectedValue(new Error('network'));
		vi.mocked(listConnectors).mockResolvedValue({ items: [] } as any);

		try {
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/operations/dlq'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(getOperationsDlq).mockRejectedValue(new ApiError('Forbidden', 403));
		vi.mocked(listConnectors).mockResolvedValue({ items: [] } as any);

		try {
			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/operations/dlq'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
