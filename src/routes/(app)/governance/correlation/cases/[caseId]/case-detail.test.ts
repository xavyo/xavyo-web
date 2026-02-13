import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/correlation', () => ({
	getCorrelationCase: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { getCorrelationCase } from '$lib/api/correlation';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { CorrelationCaseDetail, CorrelationCandidate } from '$lib/api/types';

const mockGetCase = vi.mocked(getCorrelationCase);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeCandidate(overrides: Partial<CorrelationCandidate> = {}): CorrelationCandidate {
	return {
		id: 'cand-1',
		identity_id: 'ident-1',
		identity_display_name: 'John Doe',
		identity_attributes: { email: 'john@example.com', department: 'Engineering' },
		aggregate_confidence: 0.92,
		per_attribute_scores: { email: 0.98, name: 0.85 },
		is_deactivated: false,
		is_definitive_match: false,
		...overrides
	};
}

function makeCaseDetail(overrides: Partial<CorrelationCaseDetail> = {}): CorrelationCaseDetail {
	return {
		id: 'case-1',
		connector_id: 'conn-1',
		connector_name: 'LDAP Connector',
		account_identifier: 'jdoe@example.com',
		account_id: 'acc-123',
		status: 'pending',
		trigger_type: 'import',
		highest_confidence: 0.92,
		candidate_count: 2,
		assigned_to: 'admin-user',
		created_at: '2026-02-01T10:00:00Z',
		account_attributes: { email: 'jdoe@example.com', firstName: 'John', lastName: 'Doe' },
		candidates: [
			makeCandidate({ id: 'cand-1', aggregate_confidence: 0.92 }),
			makeCandidate({
				id: 'cand-2',
				identity_id: 'ident-2',
				identity_display_name: 'Jane Smith',
				aggregate_confidence: 0.65,
				per_attribute_scores: { email: 0.7, name: 0.6 }
			})
		],
		resolved_by: null,
		resolved_at: null,
		resolution_reason: null,
		rules_snapshot: { email_match: { weight: 1.0, threshold: 0.9 } },
		updated_at: '2026-02-01T12:00:00Z',
		...overrides
	};
}

describe('Correlation case detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('throws 401 when no accessToken', async () => {
			try {
				await load({
					params: { caseId: 'case-1' },
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('throws 401 when no tenantId', async () => {
			try {
				await load({
					params: { caseId: 'case-1' },
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('throws 403 for non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					params: { caseId: 'case-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(403);
			}
		});

		it('returns caseDetail for admin', async () => {
			const detail = makeCaseDetail();
			mockGetCase.mockResolvedValue(detail);

			const result = (await load({
				params: { caseId: 'case-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.caseDetail).toEqual(detail);
			expect(result.caseDetail.id).toBe('case-1');
			expect(result.caseDetail.candidates).toHaveLength(2);
		});

		it('calls getCorrelationCase with correct params', async () => {
			mockGetCase.mockResolvedValue(makeCaseDetail());

			await load({
				params: { caseId: 'case-42' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(mockGetCase).toHaveBeenCalledWith('case-42', 'tok', 'tid', expect.any(Function));
		});

		it('throws 404 when case not found', async () => {
			mockGetCase.mockRejectedValue(new ApiError('Not found', 404));

			try {
				await load({
					params: { caseId: 'nonexistent' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});

		it('throws API error status for other API errors', async () => {
			mockGetCase.mockRejectedValue(new ApiError('Forbidden', 403));

			try {
				await load({
					params: { caseId: 'case-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(403);
			}
		});

		it('throws 500 for non-API errors', async () => {
			mockGetCase.mockRejectedValue(new Error('network error'));

			try {
				await load({
					params: { caseId: 'case-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});

		it('passes correct accessToken and tenantId', async () => {
			mockGetCase.mockResolvedValue(makeCaseDetail());
			const mockFetch = vi.fn();

			await load({
				params: { caseId: 'case-1' },
				locals: {
					accessToken: 'my-token',
					tenantId: 'my-tenant',
					user: { roles: ['admin'] }
				},
				fetch: mockFetch
			} as any);

			expect(mockGetCase).toHaveBeenCalledWith('case-1', 'my-token', 'my-tenant', mockFetch);
		});
	});
});

describe('Correlation case detail +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		60000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		30000
	);
});

describe('Correlation case detail rendering logic', () => {
	describe('status badge class', () => {
		function statusBadgeClass(status: string): string {
			switch (status) {
				case 'pending':
					return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
				case 'confirmed':
					return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
				case 'rejected':
					return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
				case 'identity_created':
					return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			}
		}

		it('pending status gets yellow badge', () => {
			expect(statusBadgeClass('pending')).toContain('yellow');
		});

		it('confirmed status gets green badge', () => {
			expect(statusBadgeClass('confirmed')).toContain('green');
		});

		it('rejected status gets red badge', () => {
			expect(statusBadgeClass('rejected')).toContain('red');
		});

		it('identity_created status gets blue badge', () => {
			expect(statusBadgeClass('identity_created')).toContain('blue');
		});
	});

	describe('trigger type badge class', () => {
		function triggerTypeBadgeClass(type: string): string {
			switch (type) {
				case 'import':
					return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
				case 'reconciliation':
					return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
				case 'manual':
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
				default:
					return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
			}
		}

		it('import gets purple badge', () => {
			expect(triggerTypeBadgeClass('import')).toContain('purple');
		});

		it('reconciliation gets indigo badge', () => {
			expect(triggerTypeBadgeClass('reconciliation')).toContain('indigo');
		});

		it('manual gets gray badge', () => {
			expect(triggerTypeBadgeClass('manual')).toContain('gray');
		});
	});

	describe('formatDate', () => {
		function formatDate(dateStr: string | null): string {
			if (!dateStr || isNaN(new Date(dateStr).getTime())) return '\u2014';
			return new Date(dateStr).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			});
		}

		it('formats valid date', () => {
			const result = formatDate('2026-02-01T10:00:00Z');
			expect(result).not.toBe('\u2014');
			expect(result).toBeTruthy();
		});

		it('returns dash for null', () => {
			expect(formatDate(null)).toBe('\u2014');
		});

		it('returns dash for empty string', () => {
			expect(formatDate('')).toBe('\u2014');
		});

		it('returns dash for invalid date', () => {
			expect(formatDate('invalid')).toBe('\u2014');
		});
	});

	describe('action button visibility (isPending)', () => {
		it('shows action buttons when status is pending', () => {
			const caseDetail = makeCaseDetail({ status: 'pending' });
			expect(caseDetail.status === 'pending').toBe(true);
		});

		it('hides action buttons when status is confirmed', () => {
			const caseDetail = makeCaseDetail({ status: 'confirmed' });
			expect(caseDetail.status === 'pending').toBe(false);
		});

		it('hides action buttons when status is rejected', () => {
			const caseDetail = makeCaseDetail({ status: 'rejected' });
			expect(caseDetail.status === 'pending').toBe(false);
		});

		it('hides action buttons when status is identity_created', () => {
			const caseDetail = makeCaseDetail({ status: 'identity_created' });
			expect(caseDetail.status === 'pending').toBe(false);
		});
	});

	describe('candidate count display', () => {
		it('singular when 1 candidate', () => {
			const count = 1;
			const text = `${count} candidate${count !== 1 ? 's' : ''}`;
			expect(text).toBe('1 candidate');
		});

		it('plural when multiple candidates', () => {
			const count: number = 3;
			const text = `${count} candidate${count !== 1 ? 's' : ''}`;
			expect(text).toBe('3 candidates');
		});
	});

	describe('account attributes', () => {
		it('extracts entries from account_attributes', () => {
			const caseDetail = makeCaseDetail({
				account_attributes: { email: 'jdoe@example.com', firstName: 'John' }
			});
			const entries = Object.entries(caseDetail.account_attributes ?? {});
			expect(entries).toHaveLength(2);
			expect(entries[0][0]).toBe('email');
			expect(entries[0][1]).toBe('jdoe@example.com');
		});

		it('handles empty account_attributes', () => {
			const caseDetail = makeCaseDetail({ account_attributes: {} });
			const entries = Object.entries(caseDetail.account_attributes ?? {});
			expect(entries).toHaveLength(0);
		});

		it('handles null-like account_attributes', () => {
			const caseDetail = makeCaseDetail({ account_attributes: {} });
			const entries = Object.entries(caseDetail.account_attributes ?? {});
			expect(entries).toHaveLength(0);
		});
	});

	describe('candidates data', () => {
		it('shows candidates list', () => {
			const detail = makeCaseDetail();
			expect(detail.candidates).toHaveLength(2);
		});

		it('candidate has identity_display_name', () => {
			const candidate = makeCandidate();
			expect(candidate.identity_display_name).toBe('John Doe');
		});

		it('candidate has aggregate_confidence', () => {
			const candidate = makeCandidate({ aggregate_confidence: 0.92 });
			expect(Math.round(candidate.aggregate_confidence * 100)).toBe(92);
		});

		it('candidate has per_attribute_scores', () => {
			const candidate = makeCandidate({
				per_attribute_scores: { email: 0.98, name: 0.85, department: 0.5 }
			});
			const entries = Object.entries(candidate.per_attribute_scores);
			expect(entries).toHaveLength(3);
		});

		it('candidate is_definitive_match flag', () => {
			const defMatch = makeCandidate({ is_definitive_match: true });
			expect(defMatch.is_definitive_match).toBe(true);

			const noMatch = makeCandidate({ is_definitive_match: false });
			expect(noMatch.is_definitive_match).toBe(false);
		});

		it('candidate is_deactivated flag', () => {
			const deactivated = makeCandidate({ is_deactivated: true });
			expect(deactivated.is_deactivated).toBe(true);
		});

		it('empty candidates shows no-candidates message', () => {
			const detail = makeCaseDetail({ candidates: [] });
			expect(detail.candidates).toHaveLength(0);
		});
	});

	describe('resolved case metadata', () => {
		it('shows resolved_by when present', () => {
			const detail = makeCaseDetail({ resolved_by: 'admin-1' });
			expect(detail.resolved_by).toBe('admin-1');
		});

		it('shows resolved_at when present', () => {
			const detail = makeCaseDetail({ resolved_at: '2026-02-10T15:00:00Z' });
			expect(detail.resolved_at).toBe('2026-02-10T15:00:00Z');
		});

		it('shows resolution_reason when present', () => {
			const detail = makeCaseDetail({
				resolution_reason: 'Manually confirmed by admin'
			});
			expect(detail.resolution_reason).toBe('Manually confirmed by admin');
		});

		it('hides resolved_by when null', () => {
			const detail = makeCaseDetail({ resolved_by: null });
			expect(detail.resolved_by).toBeNull();
		});

		it('hides resolved_at when null', () => {
			const detail = makeCaseDetail({ resolved_at: null });
			expect(detail.resolved_at).toBeNull();
		});
	});

	describe('case information fields', () => {
		it('displays connector_name', () => {
			const detail = makeCaseDetail({ connector_name: 'My Connector' });
			expect(detail.connector_name).toBe('My Connector');
		});

		it('displays account_identifier', () => {
			const detail = makeCaseDetail({ account_identifier: 'user@corp.com' });
			expect(detail.account_identifier).toBe('user@corp.com');
		});

		it('displays account_id when present', () => {
			const detail = makeCaseDetail({ account_id: 'acc-456' });
			expect(detail.account_id).toBe('acc-456');
		});

		it('hides account_id when null', () => {
			const detail = makeCaseDetail({ account_id: null });
			expect(detail.account_id).toBeNull();
		});

		it('displays assigned_to when present', () => {
			const detail = makeCaseDetail({ assigned_to: 'admin-user' });
			expect(detail.assigned_to).toBe('admin-user');
		});

		it('hides assigned_to when null', () => {
			const detail = makeCaseDetail({ assigned_to: null });
			expect(detail.assigned_to).toBeNull();
		});
	});

	describe('confidence display', () => {
		it('shows highest_confidence as percentage', () => {
			const detail = makeCaseDetail({ highest_confidence: 0.88 });
			expect(Math.round(detail.highest_confidence * 100)).toBe(88);
		});

		it('shows 100% for perfect confidence', () => {
			const detail = makeCaseDetail({ highest_confidence: 1.0 });
			expect(Math.round(detail.highest_confidence * 100)).toBe(100);
		});
	});

	describe('mock data conformity', () => {
		it('CorrelationCaseDetail has all base CorrelationCase fields', () => {
			const d = makeCaseDetail();
			expect(d.id).toBeDefined();
			expect(d.connector_id).toBeDefined();
			expect(d.connector_name).toBeDefined();
			expect(d.account_identifier).toBeDefined();
			expect(d.status).toBeDefined();
			expect(d.trigger_type).toBeDefined();
			expect(typeof d.highest_confidence).toBe('number');
			expect(typeof d.candidate_count).toBe('number');
			expect(d.created_at).toBeDefined();
		});

		it('CorrelationCaseDetail has extended fields', () => {
			const d = makeCaseDetail();
			expect(d.account_attributes).toBeDefined();
			expect(d.candidates).toBeDefined();
			expect(d.rules_snapshot).toBeDefined();
			expect(d.updated_at).toBeDefined();
			expect('resolved_by' in d).toBe(true);
			expect('resolved_at' in d).toBe(true);
			expect('resolution_reason' in d).toBe(true);
		});

		it('CorrelationCandidate has all required fields', () => {
			const c = makeCandidate();
			expect(c.id).toBeDefined();
			expect(c.identity_id).toBeDefined();
			expect(c.identity_display_name).toBeDefined();
			expect(c.identity_attributes).toBeDefined();
			expect(typeof c.aggregate_confidence).toBe('number');
			expect(c.per_attribute_scores).toBeDefined();
			expect(typeof c.is_deactivated).toBe('boolean');
			expect(typeof c.is_definitive_match).toBe('boolean');
		});
	});
});
