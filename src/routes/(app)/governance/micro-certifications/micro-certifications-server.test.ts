import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	getMyPendingCertifications: vi.fn(),
	listMicroCertifications: vi.fn(),
	getMicroCertificationStats: vi.fn(),
	listTriggerRules: vi.fn()
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
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

import { load } from './+page.server';
import {
	getMyPendingCertifications,
	listMicroCertifications,
	getMicroCertificationStats,
	listTriggerRules
} from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const emptyList = { items: [], total: 0, limit: 20, offset: 0 };
const emptyStats = {
	total: 0,
	pending: 0,
	approved: 0,
	revoked: 0,
	auto_revoked: 0,
	flagged_for_review: 0,
	expired: 0,
	skipped: 0,
	escalated: 0,
	past_deadline: 0,
	by_trigger_type: null
};

const mockLocals = {
	accessToken: 'test-token',
	tenantId: 'test-tenant',
	user: { roles: ['admin'] }
};

describe('micro-certifications page server load', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(getMyPendingCertifications).mockResolvedValue(emptyList as any);
		vi.mocked(listMicroCertifications).mockResolvedValue(emptyList as any);
		vi.mocked(getMicroCertificationStats).mockResolvedValue(emptyStats as any);
		vi.mocked(listTriggerRules).mockResolvedValue(emptyList as any);
	});

	it('throws 401 when unauthenticated', async () => {
		try {
			await load({
				locals: { accessToken: null, tenantId: 'tid', user: { roles: [] } },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('loads my pending for all users', async () => {
		const result = (await load({
			locals: mockLocals,
			fetch: vi.fn()
		} as any)) as any;
		expect(result.myPending).toBeDefined();
		expect(result.myPending.items).toEqual([]);
	});

	it('loads admin data when admin', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const result = (await load({
			locals: mockLocals,
			fetch: vi.fn()
		} as any)) as any;
		expect(result.isAdmin).toBe(true);
		expect(listMicroCertifications).toHaveBeenCalled();
	});

	it('skips admin data when non-admin', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		const result = (await load({
			locals: { ...mockLocals, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any)) as any;
		expect(result.isAdmin).toBe(false);
		expect(result.allCertifications.items).toEqual([]);
		expect(listMicroCertifications).not.toHaveBeenCalled();
	});

	it('fails closed when pending list API throws', async () => {
		vi.mocked(getMyPendingCertifications).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals,
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('fails closed when admin list API throws', async () => {
		vi.mocked(listMicroCertifications).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals,
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status', async () => {
		vi.mocked(getMyPendingCertifications).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: mockLocals,
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});
});
