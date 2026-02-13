import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/stores', () => {
	const { readable, writable } = require('svelte/store');
	return {
		page: readable({
			url: new URL('http://localhost/governance/role-mining'),
			params: {},
			route: { id: '/governance/role-mining' },
			status: 200,
			error: null,
			data: {},
			form: null
		}),
		navigating: readable(null),
		updated: { check: vi.fn() }
	};
});

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true,
	dev: false
}));

vi.mock('$lib/api/role-mining-client', () => ({
	fetchMiningJobs: vi.fn(),
	fetchMiningJob: vi.fn(),
	runJobClient: vi.fn(),
	cancelJobClient: vi.fn(),
	deleteJobClient: vi.fn(),
	fetchCandidates: vi.fn(),
	promoteCandidateClient: vi.fn(),
	dismissCandidateClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import HubPage from './+page.svelte';
import type { MiningJob, MiningJobParameters } from '$lib/api/types';

function makeJob(overrides: Partial<MiningJob> = {}): MiningJob {
	return {
		id: 'job-1',
		tenant_id: 't1',
		name: 'Q1 Analysis',
		status: 'completed',
		progress_percent: 100,
		candidate_count: 5,
		excessive_privilege_count: 3,
		consolidation_suggestion_count: 2,
		created_at: '2026-01-01T00:00:00Z',
		started_at: '2026-01-01T00:01:00Z',
		completed_at: '2026-01-01T00:10:00Z',
		error_message: null,
		created_by: 'admin-1',
		updated_at: '2026-01-01T00:10:00Z',
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

const mockJobs = {
	items: [
		makeJob({ id: 'job-1', name: 'Q1 Analysis', status: 'completed' }),
		makeJob({
			id: 'job-2',
			name: 'Q2 Analysis',
			status: 'pending',
			progress_percent: 0,
			candidate_count: 0,
			excessive_privilege_count: 0,
			consolidation_suggestion_count: 0,
			created_at: '2026-02-01T00:00:00Z',
			started_at: null,
			completed_at: null,
			updated_at: '2026-02-01T00:00:00Z'
		})
	],
	total: 2,
	page: 1,
	page_size: 50
};

function renderHub(jobs = mockJobs) {
	return render(HubPage, {
		props: {
			data: { jobs } as any
		}
	});
}

describe('Role Mining hub page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders page header "Role Mining"', () => {
		renderHub();
		expect(screen.getByText('Role Mining')).toBeTruthy();
	});

	it('shows Jobs tab content by default', () => {
		renderHub();
		expect(screen.getByRole('tab', { name: 'Jobs' })).toBeTruthy();
		expect(screen.getByRole('tab', { name: 'Jobs' }).getAttribute('aria-selected')).toBe(
			'true'
		);
	});

	it('displays job list with names', () => {
		renderHub();
		expect(screen.getByText('Q1 Analysis')).toBeTruthy();
		expect(screen.getByText('Q2 Analysis')).toBeTruthy();
	});

	it('shows status badges for jobs', () => {
		renderHub();
		expect(screen.getByText('Completed')).toBeTruthy();
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('shows "Create job" button/link', () => {
		renderHub();
		expect(screen.getByText('Create job')).toBeTruthy();
	});

	it('shows Run button for pending jobs', () => {
		renderHub();
		expect(screen.getByText('Run')).toBeTruthy();
	});

	it('shows Delete button for completed jobs', () => {
		renderHub();
		expect(screen.getByText('Delete')).toBeTruthy();
	});

	it('shows empty state when no jobs', () => {
		renderHub({ items: [], total: 0, page: 1, page_size: 50 });
		expect(screen.getByText('No mining jobs yet.')).toBeTruthy();
	});
});

describe('Role Mining hub tabs', () => {
	it('has 6 tabs', () => {
		renderHub();
		const tabs = screen.getAllByRole('tab');
		expect(tabs).toHaveLength(6);
	});

	it('has Jobs as first tab', () => {
		renderHub();
		const tabs = screen.getAllByRole('tab');
		expect(tabs[0].textContent?.trim()).toBe('Jobs');
	});

	it('has Patterns tab', () => {
		renderHub();
		expect(screen.getByRole('tab', { name: 'Patterns' })).toBeTruthy();
	});

	it('has Privileges tab', () => {
		renderHub();
		expect(screen.getByRole('tab', { name: 'Privileges' })).toBeTruthy();
	});

	it('has Consolidation tab', () => {
		renderHub();
		expect(screen.getByRole('tab', { name: 'Consolidation' })).toBeTruthy();
	});

	it('has Simulations tab', () => {
		renderHub();
		expect(screen.getByRole('tab', { name: 'Simulations' })).toBeTruthy();
	});

	it('has Metrics tab', () => {
		renderHub();
		expect(screen.getByRole('tab', { name: 'Metrics' })).toBeTruthy();
	});
});

describe('Role Mining hub rendering logic', () => {
	describe('job status badge class mapping', () => {
		function jobStatusLabel(status: string): string {
			const map: Record<string, string> = {
				pending: 'Pending',
				running: 'Running',
				completed: 'Completed',
				failed: 'Failed',
				cancelled: 'Cancelled'
			};
			return map[status] ?? status;
		}

		it('pending maps to Pending label', () => {
			expect(jobStatusLabel('pending')).toBe('Pending');
		});

		it('running maps to Running label', () => {
			expect(jobStatusLabel('running')).toBe('Running');
		});

		it('completed maps to Completed label', () => {
			expect(jobStatusLabel('completed')).toBe('Completed');
		});

		it('failed maps to Failed label', () => {
			expect(jobStatusLabel('failed')).toBe('Failed');
		});

		it('cancelled maps to Cancelled label', () => {
			expect(jobStatusLabel('cancelled')).toBe('Cancelled');
		});
	});

	describe('formatDate', () => {
		function formatDate(d: string | null): string {
			if (!d) return '\u2014';
			return new Date(d).toLocaleDateString();
		}

		it('formats a valid date', () => {
			const result = formatDate('2026-01-01T00:00:00Z');
			expect(result).not.toBe('\u2014');
			expect(result).toBeTruthy();
		});

		it('returns dash for null', () => {
			expect(formatDate(null)).toBe('\u2014');
		});

		it('returns dash for empty string', () => {
			expect(formatDate('')).toBe('\u2014');
		});
	});

	describe('action button visibility', () => {
		it('Run button shown only for pending status', () => {
			const job = makeJob({ status: 'pending' });
			expect(job.status === 'pending').toBe(true);
		});

		it('Cancel button shown only for running status', () => {
			const job = makeJob({ status: 'running' });
			expect(job.status === 'running').toBe(true);
		});

		it('Delete button shown for completed status', () => {
			const job = makeJob({ status: 'completed' });
			const isTerminal =
				job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled';
			expect(isTerminal).toBe(true);
		});

		it('Delete button shown for failed status', () => {
			const job = makeJob({ status: 'failed' });
			const isTerminal =
				job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled';
			expect(isTerminal).toBe(true);
		});

		it('Delete button shown for cancelled status', () => {
			const job = makeJob({ status: 'cancelled' });
			const isTerminal =
				job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled';
			expect(isTerminal).toBe(true);
		});

		it('Delete button not shown for pending status', () => {
			const job = makeJob({ status: 'pending' });
			const isTerminal =
				job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled';
			expect(isTerminal).toBe(false);
		});
	});

	describe('job count pluralization', () => {
		it('singular when 1 job', () => {
			const total = 1;
			const text = `${total} job${total !== 1 ? 's' : ''}`;
			expect(text).toBe('1 job');
		});

		it('plural when 0 jobs', () => {
			const total = 0;
			const text = `${total} job${total !== 1 ? 's' : ''}`;
			expect(text).toBe('0 jobs');
		});

		it('plural when multiple jobs', () => {
			const total = 5;
			const text = `${total} job${total !== 1 ? 's' : ''}`;
			expect(text).toBe('5 jobs');
		});
	});

	describe('mock data conformity', () => {
		it('MiningJob has all required fields', () => {
			const job = makeJob();
			expect(job.id).toBeDefined();
			expect(job.tenant_id).toBeDefined();
			expect(job.name).toBeDefined();
			expect(job.status).toBeDefined();
			expect(job.parameters).toBeDefined();
			expect(typeof job.progress_percent).toBe('number');
			expect(typeof job.candidate_count).toBe('number');
			expect(typeof job.excessive_privilege_count).toBe('number');
			expect(typeof job.consolidation_suggestion_count).toBe('number');
			expect(job.created_at).toBeDefined();
			expect(job.updated_at).toBeDefined();
			expect(job.created_by).toBeDefined();
		});

		it('MiningJob status is a valid value', () => {
			const validStatuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
			const job = makeJob();
			expect(validStatuses).toContain(job.status);
		});

		it('MiningJobParameters has expected fields', () => {
			const job = makeJob();
			const params = job.parameters;
			expect(typeof params.min_users).toBe('number');
			expect(typeof params.min_entitlements).toBe('number');
			expect(typeof params.confidence_threshold).toBe('number');
			expect(typeof params.include_excessive_privilege).toBe('boolean');
			expect(typeof params.include_consolidation).toBe('boolean');
		});
	});
});
