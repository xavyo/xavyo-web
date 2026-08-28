import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	listRuns: vi.fn(),
	triggerRun: vi.fn()
}));

vi.mock('$lib/api/connectors', () => ({
	getConnector: vi.fn()
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
import { listRuns } from '$lib/api/reconciliation';
import { getConnector } from '$lib/api/connectors';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Connector reconciliation runs +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns runs and connector for admin', async () => {
		vi.mocked(listRuns).mockResolvedValue({
			runs: [{ id: 'run-1' }],
			total: 1,
			limit: 20,
			offset: 0
		} as any);
		vi.mocked(getConnector).mockResolvedValue({ id: 'conn-1', name: 'LDAP' } as any);

		const result = (await load({
			params: { id: 'conn-1' },
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/conn-1/reconciliation'),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.runs.runs).toHaveLength(1);
		expect(result.connector.id).toBe('conn-1');
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listRuns).mockResolvedValue({ runs: [], total: 0 } as any);
		vi.mocked(getConnector).mockResolvedValue({ id: 'conn-1' } as any);
		await load({
			params: { id: 'conn-1' },
			locals: mockLocals(true),
			url: new URL('http://localhost/connectors/conn-1/reconciliation?limit=abc&offset=nope'),
			fetch: vi.fn()
		} as any);
		expect(listRuns).toHaveBeenCalledWith(
			'conn-1',
			{ mode: undefined, status: undefined, limit: 20, offset: 0 },
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('fails closed when runs API throws', async () => {
		vi.mocked(listRuns).mockRejectedValue(new Error('network'));
		vi.mocked(getConnector).mockResolvedValue({ id: 'conn-1' } as any);

		try {
			await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/conn-1/reconciliation'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(listRuns).mockRejectedValue(new ApiError('Not found', 404));
		vi.mocked(getConnector).mockResolvedValue({ id: 'conn-1' } as any);

		try {
			await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/connectors/conn-1/reconciliation'),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(404);
		}
	});
});
