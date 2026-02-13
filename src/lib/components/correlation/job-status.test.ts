import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import JobStatus from './job-status.svelte';
import type { CorrelationJob } from '$lib/api/types';

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

vi.mock('$lib/api/correlation-client', () => ({
	triggerCorrelationClient: vi.fn(),
	fetchCorrelationJobStatus: vi.fn()
}));

import { triggerCorrelationClient } from '$lib/api/correlation-client';

function makeJob(overrides: Partial<CorrelationJob> = {}): CorrelationJob {
	return {
		job_id: 'job-123',
		status: 'running',
		total_accounts: 100,
		processed_accounts: 50,
		auto_confirmed: 20,
		queued_for_review: 15,
		no_match: 10,
		errors: 5,
		started_at: '2025-06-01T10:00:00Z',
		completed_at: null,
		...overrides
	};
}

function makeCompletedJob(): CorrelationJob {
	return makeJob({
		status: 'completed',
		processed_accounts: 100,
		auto_confirmed: 60,
		queued_for_review: 25,
		no_match: 12,
		errors: 3,
		completed_at: '2025-06-01T10:15:00Z'
	});
}

function makeFailedJob(): CorrelationJob {
	return makeJob({
		status: 'failed',
		processed_accounts: 30,
		auto_confirmed: 10,
		queued_for_review: 5,
		no_match: 5,
		errors: 10,
		completed_at: '2025-06-01T10:05:00Z'
	});
}

describe('JobStatus', () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders the trigger button with "Run Correlation" text', () => {
		render(JobStatus, { props: { connectorId: 'conn-1' } });
		expect(screen.getByText('Run Correlation')).toBeTruthy();
	});

	it('does not display job status before trigger', () => {
		render(JobStatus, { props: { connectorId: 'conn-1' } });
		expect(screen.queryByText('Progress')).toBeNull();
		expect(screen.queryByText('Auto-Confirmed')).toBeNull();
	});

	it('shows job status after successful trigger', async () => {
		const runningJob = makeJob();
		vi.mocked(triggerCorrelationClient).mockResolvedValue(runningJob);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			expect(screen.getByText('running')).toBeTruthy();
		});
		expect(screen.getByText('Progress')).toBeTruthy();
		expect(screen.getByText('job-123')).toBeTruthy();
	});

	it('shows progress percentage', async () => {
		const runningJob = makeJob({ total_accounts: 100, processed_accounts: 50 });
		vi.mocked(triggerCorrelationClient).mockResolvedValue(runningJob);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			// 50 / 100 = 50%
			expect(screen.getByText('50 / 100 accounts (50%)')).toBeTruthy();
		});
	});

	it('shows result summary cards with job data', async () => {
		const job = makeJob({
			processed_accounts: 50,
			auto_confirmed: 20,
			queued_for_review: 15,
			no_match: 10,
			errors: 5
		});
		vi.mocked(triggerCorrelationClient).mockResolvedValue(job);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			expect(screen.getByText('Auto-Confirmed')).toBeTruthy();
		});
		expect(screen.getByText('20')).toBeTruthy();
		expect(screen.getByText('For Review')).toBeTruthy();
		expect(screen.getByText('15')).toBeTruthy();
		expect(screen.getByText('No Match')).toBeTruthy();
		expect(screen.getByText('10')).toBeTruthy();
		expect(screen.getByText('Errors')).toBeTruthy();
		expect(screen.getByText('5')).toBeTruthy();
	});

	it('shows "Job in progress..." text while running', async () => {
		const runningJob = makeJob();
		vi.mocked(triggerCorrelationClient).mockResolvedValue(runningJob);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			expect(screen.getByText('Job in progress...')).toBeTruthy();
		});
	});

	it('disables trigger button when job is running', async () => {
		const runningJob = makeJob();
		vi.mocked(triggerCorrelationClient).mockResolvedValue(runningJob);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			expect(screen.getByText('running')).toBeTruthy();
		});

		// The button should be disabled while job is running
		const button = screen.getByText('Run Correlation').closest('button');
		expect(button?.disabled).toBe(true);
	});

	it('shows completed status badge for completed job', async () => {
		const completedJob = makeCompletedJob();
		vi.mocked(triggerCorrelationClient).mockResolvedValue(completedJob);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			expect(screen.getByText('completed')).toBeTruthy();
		});
	});

	it('shows failed status badge for failed job', async () => {
		const failedJob = makeFailedJob();
		vi.mocked(triggerCorrelationClient).mockResolvedValue(failedJob);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			expect(screen.getByText('failed')).toBeTruthy();
		});
	});

	it('enables trigger button after job completes', async () => {
		const completedJob = makeCompletedJob();
		vi.mocked(triggerCorrelationClient).mockResolvedValue(completedJob);

		render(JobStatus, { props: { connectorId: 'conn-1' } });
		await fireEvent.click(screen.getByText('Run Correlation'));

		await waitFor(() => {
			expect(screen.getByText('completed')).toBeTruthy();
		});

		// After completion, button should be re-enabled
		const button = screen.getByText('Run Correlation').closest('button');
		expect(button?.disabled).toBe(false);
	});
});
