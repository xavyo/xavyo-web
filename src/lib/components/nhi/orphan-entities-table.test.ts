import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import OrphanEntitiesTable from './orphan-entities-table.svelte';
import type { OrphanNhiEntity } from '$lib/api/types';

function makeOrphans(): OrphanNhiEntity[] {
	return [
		{ id: 'nhi-1', name: 'Old Tool', nhi_type: 'tool', owner_id: 'user-99', reason: 'Owner does not exist' },
		{ id: 'nhi-2', name: 'Stale Agent', nhi_type: 'agent', owner_id: null, reason: 'No owner assigned' },
		{ id: 'nhi-3', name: 'Dead SA', nhi_type: 'service_account', owner_id: 'user-88', reason: 'Owner not active' }
	];
}

describe('OrphanEntitiesTable', () => {
	afterEach(cleanup);

	it('renders count of orphaned entities', () => {
		render(OrphanEntitiesTable, { props: { entities: makeOrphans() } });
		expect(screen.getByText('3 orphaned entities detected')).toBeTruthy();
	});

	it('renders entity names as links', () => {
		render(OrphanEntitiesTable, { props: { entities: makeOrphans() } });
		expect(screen.getByText('Old Tool')).toBeTruthy();
		expect(screen.getByText('Stale Agent')).toBeTruthy();
		expect(screen.getByText('Dead SA')).toBeTruthy();
	});

	it('renders type badges', () => {
		render(OrphanEntitiesTable, { props: { entities: makeOrphans() } });
		expect(screen.getByText('tool')).toBeTruthy();
		expect(screen.getByText('agent')).toBeTruthy();
		expect(screen.getByText('service_account')).toBeTruthy();
	});

	it('renders orphan reasons', () => {
		render(OrphanEntitiesTable, { props: { entities: makeOrphans() } });
		expect(screen.getByText('Owner does not exist')).toBeTruthy();
		expect(screen.getByText('No owner assigned')).toBeTruthy();
		expect(screen.getByText('Owner not active')).toBeTruthy();
	});

	it('renders correct links for each entity type', () => {
		render(OrphanEntitiesTable, { props: { entities: makeOrphans() } });
		const links = document.querySelectorAll('a[href]');
		const hrefs = Array.from(links).map(l => l.getAttribute('href'));
		expect(hrefs).toContain('/nhi/tools/nhi-1');
		expect(hrefs).toContain('/nhi/agents/nhi-2');
		expect(hrefs).toContain('/nhi/service-accounts/nhi-3');
	});

	it('shows empty state when no orphans', () => {
		render(OrphanEntitiesTable, { props: { entities: [] } });
		expect(screen.getByText('No orphaned NHI entities detected.')).toBeTruthy();
		expect(screen.getByText('0 orphaned entities detected')).toBeTruthy();
	});

	it('shows em-dash for null owner_id', () => {
		render(OrphanEntitiesTable, { props: { entities: [makeOrphans()[1]] } });
		// null owner_id renders as '—'
		const cells = document.querySelectorAll('td');
		const ownerCell = Array.from(cells).find(c => c.textContent?.trim() === '\u2014');
		expect(ownerCell).toBeTruthy();
	});
});
