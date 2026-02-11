import { describe, it, expect, vi } from 'vitest';

// Mock modules needed by the server load
vi.mock('$lib/api/nhi-governance', () => ({
	getNhiRiskSummary: vi.fn(),
	detectInactiveNhis: vi.fn(),
	detectOrphanNhis: vi.fn()
}));
vi.mock('$lib/api/nhi', () => ({
	listNhi: vi.fn()
}));
vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(s: number, m: string) {
			super(m);
			this.status = s;
		}
	}
}));
vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { getNhiRiskSummary, detectInactiveNhis, detectOrphanNhis } from '$lib/api/nhi-governance';
import { listNhi } from '$lib/api/nhi';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('NHI Governance hub +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
			expect(e.location).toBe('/dashboard');
		}
	});

	it('loads risk summary, inactive, orphans, and nhiNameMap', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const summary = { total_entities: 5, by_type: [], by_level: [] };
		const inactive = [{ id: 'i1', name: 'stale-tool' }];
		const orphans = [{ id: 'o1', name: 'orphan-agent' }];
		const nhiList = {
			data: [
				{ id: 'i1', name: 'stale-tool' },
				{ id: 'o1', name: 'orphan-agent' }
			],
			total: 2,
			limit: 200,
			offset: 0
		};

		vi.mocked(getNhiRiskSummary).mockResolvedValue(summary as any);
		vi.mocked(detectInactiveNhis).mockResolvedValue(inactive as any);
		vi.mocked(detectOrphanNhis).mockResolvedValue(orphans as any);
		vi.mocked(listNhi).mockResolvedValue(nhiList as any);

		const result: any = await load({
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		expect(result.riskSummary).toEqual(summary);
		expect(result.inactiveEntities).toEqual(inactive);
		expect(result.orphanEntities).toEqual(orphans);
		expect(result.nhiNameMap).toEqual({
			i1: 'stale-tool',
			o1: 'orphan-agent'
		});
	});

	it('throws 500 on unknown errors', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(getNhiRiskSummary).mockRejectedValue(new Error('network'));
		vi.mocked(detectInactiveNhis).mockResolvedValue([]);
		vi.mocked(detectOrphanNhis).mockResolvedValue([]);
		vi.mocked(listNhi).mockResolvedValue({ data: [], total: 0, limit: 200, offset: 0 } as any);

		try {
			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});
