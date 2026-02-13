import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import OrphanEntitiesTable from './orphan-entities-table.svelte';
import type { OrphanDetectionListResponse } from '$lib/api/types';

const defaultItems: OrphanDetectionListResponse['items'] = [
	{
		id: 'det-1',
		user_id: 'user-99',
		run_id: 'run-1',
		detection_reason: 'owner_inactive',
		status: 'open',
		detected_at: '2026-01-10T00:00:00Z',
		last_activity_at: '2025-09-01T00:00:00Z',
		days_inactive: 130
	},
	{
		id: 'det-2',
		user_id: 'user-88',
		run_id: 'run-1',
		detection_reason: 'no_owner',
		status: 'open',
		detected_at: '2026-01-10T00:00:00Z',
		last_activity_at: null,
		days_inactive: null
	},
	{
		id: 'det-3',
		user_id: 'user-77',
		run_id: 'run-1',
		detection_reason: 'owner_deleted',
		status: 'resolved',
		detected_at: '2026-01-09T00:00:00Z',
		last_activity_at: '2025-12-01T00:00:00Z',
		days_inactive: 45
	}
];

function makeDetections(items?: OrphanDetectionListResponse['items']): OrphanDetectionListResponse {
	const finalItems = items !== undefined ? items : defaultItems;
	return {
		items: finalItems,
		total: finalItems.length,
		limit: 50,
		offset: 0
	};
}

describe('OrphanEntitiesTable', () => {
	afterEach(cleanup);

	it('renders count of orphan detections', () => {
		render(OrphanEntitiesTable, { props: { detections: makeDetections() } });
		expect(screen.getByText(/3 orphan detections found/)).toBeTruthy();
	});

	it('renders detection reasons', () => {
		render(OrphanEntitiesTable, { props: { detections: makeDetections() } });
		// reasonLabel default: replace '_' with ' ' → e.g. 'owner_inactive' → 'owner inactive'
		expect(screen.getByText('owner inactive')).toBeTruthy();
		expect(screen.getByText('no owner')).toBeTruthy();
		expect(screen.getByText('owner deleted')).toBeTruthy();
	});

	it('renders status badges', () => {
		render(OrphanEntitiesTable, { props: { detections: makeDetections() } });
		expect(screen.getAllByText('open').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('resolved')).toBeTruthy();
	});

	it('shows empty state when no detections', () => {
		render(OrphanEntitiesTable, { props: { detections: makeDetections([]) } });
		expect(screen.getByText(/0 orphan detections found/)).toBeTruthy();
	});

	it('renders days inactive when available', () => {
		render(OrphanEntitiesTable, { props: { detections: makeDetections() } });
		expect(screen.getByText('130')).toBeTruthy();
		expect(screen.getByText('45')).toBeTruthy();
	});
});
