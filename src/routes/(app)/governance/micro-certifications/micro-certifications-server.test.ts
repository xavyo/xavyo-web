import { describe, it, expect, vi } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	getMyPendingCertifications: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
	listMicroCertifications: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
	getMicroCertificationStats: vi.fn().mockResolvedValue({ total: 0, pending: 0, approved: 0, revoked: 0, auto_revoked: 0, flagged_for_review: 0, expired: 0, skipped: 0, escalated: 0, past_deadline: 0, by_trigger_type: null }),
	listTriggerRules: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 })
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

const { load } = await import('./+page.server');
const { hasAdminRole } = await import('$lib/server/auth');

const mockLocals = {
	accessToken: 'test-token',
	tenantId: 'test-tenant',
	user: { roles: ['admin'] }
};

describe('micro-certifications page server load', () => {
	it('loads my pending for all users', async () => {
		const result = await load({
			locals: mockLocals,
			fetch: vi.fn()
		} as any) as any;
		expect(result.myPending).toBeDefined();
		expect(result.myPending.items).toEqual([]);
	});

	it('loads admin data when admin', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const result = await load({
			locals: mockLocals,
			fetch: vi.fn()
		} as any) as any;
		expect(result.isAdmin).toBe(true);
	});

	it('skips admin data when non-admin', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		const result = await load({
			locals: { ...mockLocals, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any) as any;
		expect(result.isAdmin).toBe(false);
		expect(result.allCertifications.items).toEqual([]);
	});
});
