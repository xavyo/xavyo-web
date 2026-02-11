import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/api/nhi-governance', () => ({
	listNhiCertCampaigns: vi.fn()
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
import { listNhiCertCampaigns } from '$lib/api/nhi-governance';
import { listNhi } from '$lib/api/nhi';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('NHI Certification Campaign detail +page.server', () => {
	it('redirects non-admin users', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		try {
			await load({
				params: { id: 'camp-1' },
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);
			expect.fail('should redirect');
		} catch (e: any) {
			expect(e.status).toBe(302);
		}
	});

	it('returns campaign and nhiEntities when found', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const campaign = {
			id: 'camp-1',
			name: 'Q1 Cert',
			status: 'active',
			scope: 'all',
			nhi_type_filter: null
		};
		vi.mocked(listNhiCertCampaigns).mockResolvedValue([campaign] as any);
		vi.mocked(listNhi).mockResolvedValue({
			data: [{ id: 'e1', name: 'Tool A', nhi_type: 'tool' }],
			total: 1,
			limit: 100,
			offset: 0
		} as any);

		const result: any = await load({
			params: { id: 'camp-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		expect(result.campaign).toEqual(campaign);
		expect(result.nhiEntities).toHaveLength(1);
	});

	it('throws 404 when campaign not found', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(listNhiCertCampaigns).mockResolvedValue([]);

		try {
			await load({
				params: { id: 'nonexistent' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should throw 404');
		} catch (e: any) {
			expect(e.status).toBe(404);
		}
	});

	it('filters NHI entities by campaign nhi_type_filter', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const campaign = {
			id: 'camp-2',
			name: 'Agent Cert',
			status: 'active',
			scope: 'by_type',
			nhi_type_filter: 'agent'
		};
		vi.mocked(listNhiCertCampaigns).mockResolvedValue([campaign] as any);
		vi.mocked(listNhi).mockResolvedValue({
			data: [{ id: 'a1', name: 'Agent A', nhi_type: 'agent' }],
			total: 1,
			limit: 100,
			offset: 0
		} as any);

		const result: any = await load({
			params: { id: 'camp-2' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any);

		// Verify listNhi was called with nhi_type filter
		expect(listNhi).toHaveBeenCalledWith(
			expect.objectContaining({ nhi_type: 'agent' }),
			'tok',
			'tid',
			expect.any(Function)
		);
		expect(result.nhiEntities).toHaveLength(1);
	});
});
