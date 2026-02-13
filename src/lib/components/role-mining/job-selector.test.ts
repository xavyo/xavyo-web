import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import JobSelector from './job-selector.svelte';
import type { MiningJob, MiningJobParameters } from '$lib/api/types';

function makeJob(overrides: Partial<MiningJob> = {}): MiningJob {
	return {
		id: 'job-1',
		tenant_id: 'tenant-1',
		name: 'Mining Job Alpha',
		status: 'completed',
		parameters: {} as MiningJobParameters,
		progress_percent: 100,
		candidate_count: 5,
		excessive_privilege_count: 2,
		consolidation_suggestion_count: 1,
		started_at: '2025-06-01T09:00:00Z',
		completed_at: '2025-06-01T10:00:00Z',
		error_message: null,
		created_by: 'admin',
		created_at: '2025-06-01T08:00:00Z',
		updated_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('JobSelector', () => {
	afterEach(cleanup);

	it('renders select element', () => {
		render(JobSelector, { props: { jobs: [makeJob()] } });
		expect(screen.getByRole('combobox')).toBeTruthy();
	});

	it('shows only completed jobs', () => {
		const jobs = [
			makeJob({ id: 'job-1', name: 'Completed Job', status: 'completed' }),
			makeJob({ id: 'job-2', name: 'Running Job', status: 'running' }),
			makeJob({ id: 'job-3', name: 'Failed Job', status: 'failed' })
		];
		render(JobSelector, { props: { jobs } });
		expect(screen.getByText('Completed Job')).toBeTruthy();
		expect(screen.queryByText('Running Job')).toBeNull();
		expect(screen.queryByText('Failed Job')).toBeNull();
	});

	it('has placeholder option', () => {
		render(JobSelector, { props: { jobs: [makeJob()] } });
		expect(screen.getByText('Select a completed job...')).toBeTruthy();
	});
});
