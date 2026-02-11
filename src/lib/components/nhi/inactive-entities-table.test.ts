import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import InactiveEntitiesTable from './inactive-entities-table.svelte';
import type { InactiveNhiEntity } from '$lib/api/types';

function makeEntities(): InactiveNhiEntity[] {
	return [
		{
			id: 'nhi-1',
			name: 'Dormant Tool',
			nhi_type: 'tool',
			days_inactive: 90,
			threshold_days: 60,
			last_activity_at: '2025-10-01T00:00:00Z',
			grace_period_ends_at: null
		},
		{
			id: 'nhi-2',
			name: 'Stale Agent',
			nhi_type: 'agent',
			days_inactive: 120,
			threshold_days: 60,
			last_activity_at: null,
			grace_period_ends_at: '2026-06-01T00:00:00Z'
		},
		{
			id: 'nhi-3',
			name: 'Old SA',
			nhi_type: 'service_account',
			days_inactive: 75,
			threshold_days: 60,
			last_activity_at: '2025-11-01T00:00:00Z',
			grace_period_ends_at: null
		}
	];
}

const noop = async () => {};

describe('InactiveEntitiesTable', () => {
	afterEach(cleanup);

	it('renders inactive entity count', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('3 inactive entities detected')).toBeTruthy();
	});

	it('renders entity names as links', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('Dormant Tool')).toBeTruthy();
		expect(screen.getByText('Stale Agent')).toBeTruthy();
		expect(screen.getByText('Old SA')).toBeTruthy();
	});

	it('renders correct links for each entity type', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		const links = document.querySelectorAll('a[href]');
		const hrefs = Array.from(links).map((l) => l.getAttribute('href'));
		expect(hrefs).toContain('/nhi/tools/nhi-1');
		expect(hrefs).toContain('/nhi/agents/nhi-2');
		expect(hrefs).toContain('/nhi/service-accounts/nhi-3');
	});

	it('renders type badges', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('tool')).toBeTruthy();
		expect(screen.getByText('agent')).toBeTruthy();
		expect(screen.getByText('service_account')).toBeTruthy();
	});

	it('renders days inactive', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('90')).toBeTruthy();
		expect(screen.getByText('120')).toBeTruthy();
		expect(screen.getByText('75')).toBeTruthy();
	});

	it('renders Auto-Suspend All button when entities exist', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('Auto-Suspend All Expired')).toBeTruthy();
	});

	it('shows Grant Grace button for entities without grace period', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		const grantButtons = screen.getAllByText('Grant Grace');
		// nhi-1 and nhi-3 have no grace period, so 2 buttons
		expect(grantButtons).toHaveLength(2);
	});

	it('shows Grace active for entities with grace period', () => {
		render(InactiveEntitiesTable, {
			props: { entities: makeEntities(), onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('Grace active')).toBeTruthy();
	});

	it('shows empty state when no entities', () => {
		render(InactiveEntitiesTable, {
			props: { entities: [], onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.getByText('No inactive NHI entities detected.')).toBeTruthy();
		expect(screen.getByText('0 inactive entities detected')).toBeTruthy();
	});

	it('does not show Auto-Suspend button when list is empty', () => {
		render(InactiveEntitiesTable, {
			props: { entities: [], onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		expect(screen.queryByText('Auto-Suspend All Expired')).toBeNull();
	});

	it('renders em-dash for null last_activity_at', () => {
		// nhi-2 has null last_activity_at
		render(InactiveEntitiesTable, {
			props: { entities: [makeEntities()[1]], onGrantGracePeriod: noop, onAutoSuspend: noop }
		});
		const cells = document.querySelectorAll('td');
		const dashCells = Array.from(cells).filter((c) => c.textContent?.trim() === '\u2014');
		expect(dashCells.length).toBeGreaterThanOrEqual(1);
	});
});
