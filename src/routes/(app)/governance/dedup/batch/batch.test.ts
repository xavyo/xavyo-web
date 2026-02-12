import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/dedup', () => ({
	listDuplicates: vi.fn(),
	previewBatchMerge: vi.fn(),
	executeBatchMerge: vi.fn()
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

import { listDuplicates, previewBatchMerge, executeBatchMerge } from '$lib/api/dedup';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockListDuplicates = vi.mocked(listDuplicates);
const mockPreviewBatch = vi.mocked(previewBatchMerge);
const mockExecuteBatch = vi.mocked(executeBatchMerge);
const mockHasAdminRole = vi.mocked(hasAdminRole);

describe('batch merge page server', () => {
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
					locals: { user: { roles: ['user'] }, accessToken: 'tok', tenantId: 'tid' },
					fetch: vi.fn()
				} as any)
			).rejects.toThrow();
		});

		it('returns pending duplicates', async () => {
			mockListDuplicates.mockResolvedValue({
				items: [{ id: 'c1', identity_a_id: 'a1', identity_b_id: 'b1', confidence_score: 90, status: 'pending', detected_at: '2026-01-01' }],
				total: 1,
				limit: 100,
				offset: 0
			});

			const { load } = await import('./+page.server');
			const result = await load({
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect((result as any).pendingDuplicates.items).toHaveLength(1);
		});
	});

	describe('actions.preview', () => {
		it('calls previewBatchMerge', async () => {
			mockPreviewBatch.mockResolvedValue({
				total_candidates: 1,
				candidates: [{ candidate_id: 'c1', source_identity_id: 'a1', target_identity_id: 'b1', confidence_score: 90 }],
				entitlement_strategy: 'union',
				attribute_rule: 'newest_wins'
			});

			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.append('candidate_ids', 'c1');
			formData.set('entitlement_strategy', 'union');
			formData.set('attribute_rule', 'newest_wins');

			const result = await actions.preview({
				request: { formData: () => Promise.resolve(formData) } as any,
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result).toHaveProperty('success', true);
			expect(result).toHaveProperty('preview');
		});
	});

	describe('actions.execute', () => {
		it('returns results with counts', async () => {
			mockExecuteBatch.mockResolvedValue({
				job_id: 'job-1',
				status: 'completed',
				total_pairs: 2,
				processed: 2,
				successful: 1,
				failed: 0,
				skipped: 1
			});

			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.append('candidate_ids', 'c1');
			formData.append('candidate_ids', 'c2');
			formData.set('entitlement_strategy', 'union');
			formData.set('attribute_rule', 'newest_wins');

			const result = await actions.execute({
				request: { formData: () => Promise.resolve(formData) } as any,
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result).toHaveProperty('success', true);
			expect(result?.result).toHaveProperty('successful', 1);
			expect(result?.result).toHaveProperty('skipped', 1);
		});

		it('returns error on ApiError', async () => {
			mockExecuteBatch.mockRejectedValue(new ApiError('Batch failed', 500));

			const { actions } = await import('./+page.server');
			const formData = new FormData();
			formData.append('candidate_ids', 'c1');
			formData.set('entitlement_strategy', 'union');
			formData.set('attribute_rule', 'newest_wins');

			const result = await actions.execute({
				request: { formData: () => Promise.resolve(formData) } as any,
				locals: { user: { roles: ['admin'] }, accessToken: 'tok', tenantId: 'tid' },
				fetch: vi.fn()
			} as any);

			expect(result).toHaveProperty('success', false);
			expect(result).toHaveProperty('error', 'Batch failed');
		});
	});
});
