import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import InactiveEntitiesTable from './inactive-entities-table.svelte';
import type { StalenessReportResponse } from '$lib/api/types';

function makeReport(overrides: Partial<StalenessReportResponse> = {}): StalenessReportResponse {
	return {
		generated_at: '2026-01-15T00:00:00Z',
		min_inactive_days: 30,
		total_stale: 3,
		critical_count: 1,
		warning_count: 2,
		stale_nhis: [
			{
				nhi_id: 'nhi-1',
				name: 'Dormant Tool',
				owner_id: 'user-1',
				days_inactive: 90,
				last_used_at: '2025-10-01T00:00:00Z',
				inactivity_threshold_days: 60,
				in_grace_period: false,
				grace_period_ends_at: null
			},
			{
				nhi_id: 'nhi-2',
				name: 'Stale Agent',
				owner_id: 'user-2',
				days_inactive: 120,
				last_used_at: null,
				inactivity_threshold_days: 60,
				in_grace_period: true,
				grace_period_ends_at: '2026-06-01T00:00:00Z'
			},
			{
				nhi_id: 'nhi-3',
				name: 'Old SA',
				owner_id: 'user-3',
				days_inactive: 75,
				last_used_at: '2025-11-01T00:00:00Z',
				inactivity_threshold_days: 60,
				in_grace_period: false,
				grace_period_ends_at: null
			}
		],
		...overrides
	};
}

const noop = async () => {};

describe('InactiveEntitiesTable', () => {
	afterEach(cleanup);

	it('renders stale entity count', () => {
		render(InactiveEntitiesTable, {
			props: { report: makeReport(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText(/3 stale entities detected/)).toBeTruthy();
	});

	it('renders entity names', () => {
		render(InactiveEntitiesTable, {
			props: { report: makeReport(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('Dormant Tool')).toBeTruthy();
		expect(screen.getByText('Stale Agent')).toBeTruthy();
		expect(screen.getByText('Old SA')).toBeTruthy();
	});

	it('renders days inactive', () => {
		render(InactiveEntitiesTable, {
			props: { report: makeReport(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('90')).toBeTruthy();
		expect(screen.getByText('120')).toBeTruthy();
		expect(screen.getByText('75')).toBeTruthy();
	});

	it('renders Auto-Suspend All button when entities exist', () => {
		render(InactiveEntitiesTable, {
			props: { report: makeReport(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('Auto-Suspend All Expired')).toBeTruthy();
	});

	it('shows Grace active for entities in grace period', () => {
		render(InactiveEntitiesTable, {
			props: { report: makeReport(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('Grace active')).toBeTruthy();
	});

	it('shows empty state when no stale entities', () => {
		const emptyReport = makeReport({ total_stale: 0, stale_nhis: [] });
		render(InactiveEntitiesTable, {
			props: { report: emptyReport, onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText(/0 stale entities detected/)).toBeTruthy();
	});

	it('does not show Auto-Suspend button when list is empty', () => {
		const emptyReport = makeReport({ total_stale: 0, stale_nhis: [] });
		render(InactiveEntitiesTable, {
			props: { report: emptyReport, onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.queryByText('Auto-Suspend All Expired')).toBeNull();
	});

	it('renders critical and warning counts', () => {
		render(InactiveEntitiesTable, {
			props: { report: makeReport(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText(/1 critical/i)).toBeTruthy();
		expect(screen.getByText(/2 warning/i)).toBeTruthy();
	});
});
