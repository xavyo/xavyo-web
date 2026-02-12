import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	listDuplicates: vi.fn(),
	detectDuplicates: vi.fn()
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

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn((form, msg, opts) => ({ form, message: msg, ...opts }))
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

import { listDuplicates, detectDuplicates } from '$lib/api/dedup';
import { hasAdminRole } from '$lib/server/auth';

const mockListDuplicates = vi.mocked(listDuplicates);
const mockDetectDuplicates = vi.mocked(detectDuplicates);
const mockHasAdminRole = vi.mocked(hasAdminRole);

describe('dedup hub page server', () => {
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
					url: new URL('http://localhost/governance/dedup'),
					locals: { user: { roles: ['user'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('returns duplicates with pagination', async () => {
			mockListDuplicates.mockResolvedValue({
				items: [
					{ id: 'd1', identity_a_id: 'a1', identity_b_id: 'b1', confidence_score: 85, status: 'pending', detected_at: '2026-01-01T00:00:00Z' }
				],
				total: 1,
				limit: 50,
				offset: 0
			});

			const { load } = await import('./+page.server');
			const result = await load({
				url: new URL('http://localhost/governance/dedup'),
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect((result as any).duplicates.items).toHaveLength(1);
			expect((result as any).duplicates.total).toBe(1);
		});

		it('filters by status and min_confidence', async () => {
			mockListDuplicates.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			const { load } = await import('./+page.server');
			await load({
				url: new URL('http://localhost/governance/dedup?status=pending&min_confidence=80'),
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(mockListDuplicates).toHaveBeenCalledWith(
				expect.objectContaining({ status: 'pending', min_confidence: 80 }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});

	describe('actions.detect', () => {
		it('returns scan results', async () => {
			mockDetectDuplicates.mockResolvedValue({
				scan_id: 'scan-1',
				users_processed: 100,
				duplicates_found: 5,
				new_duplicates: 3,
				duration_ms: 1500
			});

			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.set('min_confidence', '70');
			const result = await actions.detect({
				request: { formData: () => Promise.resolve(formData) } as any,
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result).toBeDefined();
		});
	});
});
