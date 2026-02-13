import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import JobStatusBadge from './job-status-badge.svelte';

describe('JobStatusBadge', () => {
	afterEach(cleanup);

	it('renders Pending for pending status', () => {
		render(JobStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders Running for running status', () => {
		render(JobStatusBadge, { props: { status: 'running' } });
		expect(screen.getByText('Running')).toBeTruthy();
	});

	it('renders Completed for completed status', () => {
		render(JobStatusBadge, { props: { status: 'completed' } });
		expect(screen.getByText('Completed')).toBeTruthy();
	});

	it('renders Failed for failed status', () => {
		render(JobStatusBadge, { props: { status: 'failed' } });
		expect(screen.getByText('Failed')).toBeTruthy();
	});

	it('renders Cancelled for cancelled status', () => {
		render(JobStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});
});
