import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	getMergeAudit: vi.fn()
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

import { getMergeAudit } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockGetMergeAudit = vi.mocked(getMergeAudit);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockAudit = {
	id: 'audit-1',
	operation_id: 'op-1',
	source_snapshot: { id: 'a1', email: 'john@example.com', display_name: 'John', department: 'Eng', attributes: {}, entitlements: [] as any[] },
	target_snapshot: { id: 'b1', email: 'j.doe@example.com', display_name: 'J. Doe', department: 'Eng', attributes: {}, entitlements: [] as any[] },
	merged_snapshot: { id: 'b1', email: 'j.doe@example.com', display_name: 'John', department: 'Eng', attributes: {}, entitlements: [] as any[] },
	attribute_decisions: [
		{ attribute: 'display_name', source: 'source' as const, selected_value: 'John', source_value: 'John', target_value: 'J. Doe' }
	],
	entitlement_decisions: {
		strategy: 'union' as const,
		source_entitlements: [] as any[],
		target_entitlements: [] as any[],
		merged_entitlements: [] as any[],
		excluded_entitlements: [] as any[]
	},
	sod_violations: null,
	created_at: '2026-01-01T00:00:00Z'
};

describe('audit detail page server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admins', async () => {
			mockHasAdminRole.mockReturnValue(false);
			const { load } = await import('./+page.server');

			await expect(
				load({
					params: { id: 'audit-1' },
					locals: { user: { roles: ['user'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('returns audit detail with snapshots', async () => {
			mockGetMergeAudit.mockResolvedValue(mockAudit);
			const { load } = await import('./+page.server');

			const result = await load({
				params: { id: 'audit-1' },
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result.audit).toEqual(mockAudit);
			expect(result.audit.source_snapshot.email).toBe('john@example.com');
		});

		it('throws 404 on not found', async () => {
			mockGetMergeAudit.mockRejectedValue(new ApiError('Not found', 404));
			const { load } = await import('./+page.server');

			await expect(
				load({
					params: { id: 'nonexistent' },
					locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});
	});
});
