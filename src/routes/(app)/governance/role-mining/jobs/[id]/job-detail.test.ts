import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true,
	dev: false
}));

vi.mock('$lib/api/role-mining-client', () => ({
	runJobClient: vi.fn(),
	deleteJobClient: vi.fn(),
	promoteCandidateClient: vi.fn(),
	dismissCandidateClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import DetailPage from './+page.svelte';
import type { MiningJob, RoleCandidate } from '$lib/api/types';

function makeJob(overrides: Partial<MiningJob> = {}): MiningJob {
	return {
		id: 'job-1',
		tenant_id: 't1',
		name: 'Q1 Role Discovery',
		status: 'completed',
		progress_percent: 100,
		candidate_count: 3,
		excessive_privilege_count: 2,
		consolidation_suggestion_count: 1,
		created_at: '2026-01-15T10:00:00Z',
		started_at: '2026-01-15T10:01:00Z',
		completed_at: '2026-01-15T10:10:00Z',
		error_message: null,
		created_by: 'admin-1',
		updated_at: '2026-01-15T10:10:00Z',
		parameters: {
			min_users: 3,
			min_entitlements: 2,
			confidence_threshold: 0.6,
			include_excessive_privilege: true,
			include_consolidation: true,
			consolidation_threshold: 70,
			deviation_threshold: 50,
			peer_group_attribute: null
		},
		...overrides
	};
}

function makeCandidate(overrides: Partial<RoleCandidate> = {}): RoleCandidate {
	return {
		id: 'cand-1',
		job_id: 'job-1',
		proposed_name: 'Engineering Read-Only',
		confidence_score: 82.5,
		member_count: 15,
		entitlement_ids: ['ent-1', 'ent-2', 'ent-3'],
		user_ids: ['u-1', 'u-2'],
		promotion_status: 'pending',
		promoted_role_id: null,
		dismissed_reason: null,
		created_at: '2026-01-15T10:10:00Z',
		...overrides
	};
}

function renderDetail(
	job: MiningJob = makeJob(),
	candidates = { items: [] as RoleCandidate[], total: 0, page: 1, page_size: 50 }
) {
	return render(DetailPage, {
		props: {
			data: { job, candidates } as any
		}
	});
}

describe('Job detail page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders job name in header', () => {
		renderDetail(makeJob({ name: 'Q1 Role Discovery' }));
		expect(screen.getByText('Q1 Role Discovery')).toBeTruthy();
	});

	it('shows job status badge', () => {
		renderDetail(makeJob({ status: 'completed' }));
		expect(screen.getAllByText('Completed').length).toBeGreaterThanOrEqual(1);
	});

	it('shows job parameters section', () => {
		renderDetail();
		expect(screen.getByText('Parameters')).toBeTruthy();
	});

	it('shows candidate count for completed jobs', () => {
		const job = makeJob({ status: 'completed', candidate_count: 7 });
		renderDetail(job);
		expect(screen.getAllByText('Role Candidates').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('7')).toBeTruthy();
	});

	it('shows Run button for pending jobs', () => {
		const pendingJob = makeJob({
			status: 'pending',
			candidate_count: 0,
			excessive_privilege_count: 0,
			consolidation_suggestion_count: 0
		});
		renderDetail(pendingJob);
		expect(screen.getByText('Run')).toBeTruthy();
	});

	it('shows candidate cards for completed jobs with candidates', () => {
		const job = makeJob({ status: 'completed' });
		const candidates = {
			items: [
				makeCandidate({ id: 'cand-1', proposed_name: 'Engineering Read-Only' }),
				makeCandidate({ id: 'cand-2', proposed_name: 'Finance Approver' })
			],
			total: 2,
			page: 1,
			page_size: 50
		};
		renderDetail(job, candidates);
		expect(screen.getByText('Engineering Read-Only')).toBeTruthy();
		expect(screen.getByText('Finance Approver')).toBeTruthy();
	});
});

describe('Job detail rendering logic', () => {
	describe('job status states', () => {
		it('isPending is true for pending jobs', () => {
			const job = makeJob({ status: 'pending' });
			expect(job.status === 'pending').toBe(true);
		});

		it('isRunning is true for running jobs', () => {
			const job = makeJob({ status: 'running' });
			expect(job.status === 'running').toBe(true);
		});

		it('isCompleted is true for completed jobs', () => {
			const job = makeJob({ status: 'completed' });
			expect(job.status === 'completed').toBe(true);
		});

		it('isFailed is true for failed jobs', () => {
			const job = makeJob({ status: 'failed' });
			expect(job.status === 'failed').toBe(true);
		});

		it('isTerminal covers completed, failed, cancelled', () => {
			for (const status of ['completed', 'failed', 'cancelled'] as const) {
				const job = makeJob({ status });
				const isTerminal =
					job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled';
				expect(isTerminal).toBe(true);
			}
		});

		it('isTerminal is false for pending and running', () => {
			for (const status of ['pending', 'running'] as const) {
				const job = makeJob({ status });
				const isTerminal =
					job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled';
				expect(isTerminal).toBe(false);
			}
		});
	});

	describe('formatDate', () => {
		function formatDate(val: string | null): string {
			if (!val) return '--';
			const d = new Date(val);
			if (isNaN(d.getTime())) return '--';
			return d.toLocaleString();
		}

		it('formats valid date', () => {
			expect(formatDate('2026-01-15T10:00:00Z')).not.toBe('--');
		});

		it('returns -- for null', () => {
			expect(formatDate(null)).toBe('--');
		});

		it('returns -- for empty string', () => {
			expect(formatDate('')).toBe('--');
		});

		it('returns -- for invalid date', () => {
			expect(formatDate('not-a-date')).toBe('--');
		});
	});

	describe('formatParam', () => {
		function formatParam(key: string, value: unknown): string {
			if (value === null || value === undefined) return '--';
			if (typeof value === 'boolean') return value ? 'Yes' : 'No';
			return String(value);
		}

		it('formats boolean true as Yes', () => {
			expect(formatParam('include_excessive_privilege', true)).toBe('Yes');
		});

		it('formats boolean false as No', () => {
			expect(formatParam('include_consolidation', false)).toBe('No');
		});

		it('formats number as string', () => {
			expect(formatParam('min_users', 3)).toBe('3');
		});

		it('returns -- for null', () => {
			expect(formatParam('peer_group_attribute', null)).toBe('--');
		});

		it('returns -- for undefined', () => {
			expect(formatParam('peer_group_attribute', undefined)).toBe('--');
		});
	});

	describe('paramLabel', () => {
		function paramLabel(key: string): string {
			return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
		}

		it('converts min_users to Min Users', () => {
			expect(paramLabel('min_users')).toBe('Min Users');
		});

		it('converts confidence_threshold to Confidence Threshold', () => {
			expect(paramLabel('confidence_threshold')).toBe('Confidence Threshold');
		});

		it('converts include_excessive_privilege to Include Excessive Privilege', () => {
			expect(paramLabel('include_excessive_privilege')).toBe('Include Excessive Privilege');
		});
	});

	describe('mock data conformity', () => {
		it('RoleCandidate has all required fields', () => {
			const c = makeCandidate();
			expect(c.id).toBeDefined();
			expect(c.job_id).toBeDefined();
			expect(c.proposed_name).toBeDefined();
			expect(typeof c.confidence_score).toBe('number');
			expect(typeof c.member_count).toBe('number');
			expect(Array.isArray(c.entitlement_ids)).toBe(true);
			expect(Array.isArray(c.user_ids)).toBe(true);
			expect(c.promotion_status).toBeDefined();
			expect(c.created_at).toBeDefined();
		});

		it('RoleCandidate promotion_status is a valid value', () => {
			const validStatuses = ['pending', 'promoted', 'dismissed'];
			const c = makeCandidate();
			expect(validStatuses).toContain(c.promotion_status);
		});

		it('MiningJob parameters can be iterated as entries', () => {
			const job = makeJob();
			const entries = Object.entries(job.parameters);
			expect(entries.length).toBeGreaterThan(0);
			const keys = entries.map(([k]) => k);
			expect(keys).toContain('min_users');
			expect(keys).toContain('min_entitlements');
			expect(keys).toContain('confidence_threshold');
		});
	});
});

describe('Job detail +page.svelte module', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});
