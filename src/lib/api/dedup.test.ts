import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listDuplicates,
	getDuplicate,
	dismissDuplicate,
	detectDuplicates,
	listMergeOperations,
	previewMerge,
	executeMerge,
	getMergeOperation,
	executeBatchMerge,
	previewBatchMerge,
	listMergeAudits,
	getMergeAudit
} from './dedup';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';
const mockApiClient = vi.mocked(apiClient);

const TOKEN = 'test-token';
const TENANT_ID = 'test-tenant';

describe('dedup API client', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listDuplicates', () => {
		it('calls correct endpoint with params', async () => {
			const mockResult = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResult);

			const result = await listDuplicates(
				{ status: 'pending', min_confidence: 70, limit: 20 },
				TOKEN,
				TENANT_ID
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/duplicates?status=pending&min_confidence=70&limit=20',
				{ method: 'GET', token: TOKEN, tenantId: TENANT_ID, fetch: undefined }
			);
			expect(result).toEqual(mockResult);
		});

		it('omits undefined params', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
			await listDuplicates({}, TOKEN, TENANT_ID);
			expect(mockApiClient).toHaveBeenCalledWith('/governance/duplicates', expect.anything());
		});
	});

	describe('getDuplicate', () => {
		it('calls correct endpoint', async () => {
			const mockDetail = { id: 'dup-1' };
			mockApiClient.mockResolvedValue(mockDetail);

			const result = await getDuplicate('dup-1', TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/duplicates/dup-1', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
			expect(result).toEqual(mockDetail);
		});
	});

	describe('dismissDuplicate', () => {
		it('calls correct endpoint with reason', async () => {
			mockApiClient.mockResolvedValue({ id: 'dup-1', status: 'dismissed' });

			await dismissDuplicate('dup-1', 'False positive', TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/duplicates/dup-1/dismiss', {
				method: 'POST',
				body: { reason: 'False positive' },
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});

	describe('detectDuplicates', () => {
		it('calls detect with confidence', async () => {
			mockApiClient.mockResolvedValue({ scan_id: 'scan-1', users_processed: 100 });

			await detectDuplicates(80, TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/duplicates/detect', {
				method: 'POST',
				body: { min_confidence: 80 },
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});

		it('defaults to 70 when undefined', async () => {
			mockApiClient.mockResolvedValue({ scan_id: 'scan-1' });

			await detectDuplicates(undefined, TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/duplicates/detect', {
				method: 'POST',
				body: { min_confidence: 70 },
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});

	describe('listMergeOperations', () => {
		it('calls correct endpoint', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await listMergeOperations({ limit: 10, offset: 5 }, TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/merges?limit=10&offset=5',
				expect.anything()
			);
		});
	});

	describe('previewMerge', () => {
		it('calls preview endpoint', async () => {
			const body = {
				source_identity_id: 'src-1',
				target_identity_id: 'tgt-1',
				entitlement_strategy: 'union' as const
			};
			mockApiClient.mockResolvedValue({});

			await previewMerge(body, TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/merges/preview', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});

	describe('executeMerge', () => {
		it('calls execute endpoint', async () => {
			const body = {
				source_identity_id: 'src-1',
				target_identity_id: 'tgt-1',
				entitlement_strategy: 'union' as const
			};
			mockApiClient.mockResolvedValue({ id: 'merge-1', status: 'completed' });

			await executeMerge(body, TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/merges/execute', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});

	describe('getMergeOperation', () => {
		it('calls correct endpoint', async () => {
			mockApiClient.mockResolvedValue({ id: 'merge-1' });

			await getMergeOperation('merge-1', TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/merges/merge-1', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});

	describe('executeBatchMerge', () => {
		it('calls batch endpoint', async () => {
			const body = {
				candidate_ids: ['c1', 'c2'],
				entitlement_strategy: 'union' as const,
				attribute_rule: 'newest_wins' as const,
				skip_sod_violations: false
			};
			mockApiClient.mockResolvedValue({ job_id: 'job-1' });

			await executeBatchMerge(body, TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/merges/batch', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});

	describe('previewBatchMerge', () => {
		it('calls batch preview endpoint', async () => {
			const body = {
				candidate_ids: ['c1'],
				entitlement_strategy: 'union' as const,
				attribute_rule: 'newest_wins' as const
			};
			mockApiClient.mockResolvedValue({ total_candidates: 1, candidates: [] });

			await previewBatchMerge(body, TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/merges/batch/preview', {
				method: 'POST',
				body,
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});

	describe('listMergeAudits', () => {
		it('calls audit endpoint with filters', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await listMergeAudits(
				{ identity_id: 'user-1', from_date: '2026-01-01' },
				TOKEN,
				TENANT_ID
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/merges/audit?identity_id=user-1&from_date=2026-01-01',
				expect.anything()
			);
		});
	});

	describe('getMergeAudit', () => {
		it('calls audit detail endpoint', async () => {
			mockApiClient.mockResolvedValue({ id: 'audit-1' });

			await getMergeAudit('audit-1', TOKEN, TENANT_ID);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/merges/audit/audit-1', {
				method: 'GET',
				token: TOKEN,
				tenantId: TENANT_ID,
				fetch: undefined
			});
		});
	});
});
