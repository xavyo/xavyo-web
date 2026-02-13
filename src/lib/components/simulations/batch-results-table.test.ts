import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import BatchResultsTable from './batch-results-table.svelte';
import type { BatchSimulationResult, AccessItem } from '$lib/api/types';

function makeAccessItem(overrides: Partial<AccessItem> = {}): AccessItem {
	return {
		type: 'role',
		id: 'role-1',
		name: 'Engineering Role',
		...overrides
	};
}

function makeBatchResult(overrides: Partial<BatchSimulationResult> = {}): BatchSimulationResult {
	return {
		id: 'res-1',
		simulation_id: 'bat-1',
		user_id: 'user-aaaa-bbbb-cccc-dddddddddddd',
		access_gained: [],
		access_lost: [],
		warnings: [],
		created_at: '2026-01-21T00:00:00Z',
		...overrides
	};
}

describe('BatchResultsTable', () => {
	describe('with results', () => {
		it('renders table with results', () => {
			const results = [
				makeBatchResult({
					access_gained: [makeAccessItem({ name: 'Finance Role' })],
					access_lost: [makeAccessItem({ name: 'Engineering Role' })]
				})
			];
			render(BatchResultsTable, { props: { results, total: 1 } });

			expect(screen.getByText('User ID')).toBeTruthy();
			expect(screen.getByText('Access Gained')).toBeTruthy();
			expect(screen.getByText('Access Lost')).toBeTruthy();
			expect(screen.getByText('Warnings')).toBeTruthy();
		});

		it('shows total count', () => {
			const results = [makeBatchResult(), makeBatchResult({ id: 'res-2', user_id: 'user-bbbb-cccc-dddd-eeeeeeeeeeee' })];
			render(BatchResultsTable, { props: { results, total: 2 } });

			expect(screen.getByText('2 results')).toBeTruthy();
		});

		it('shows singular count for 1 result', () => {
			const results = [makeBatchResult()];
			render(BatchResultsTable, { props: { results, total: 1 } });

			expect(screen.getByText('1 result')).toBeTruthy();
		});

		it('shows access gained badges', () => {
			const results = [
				makeBatchResult({
					access_gained: [
						makeAccessItem({ name: 'Read Access' }),
						makeAccessItem({ name: 'Write Access', id: 'ent-2' })
					]
				})
			];
			render(BatchResultsTable, { props: { results, total: 1 } });

			expect(screen.getByText('Read Access')).toBeTruthy();
			expect(screen.getByText('Write Access')).toBeTruthy();
		});

		it('shows access lost badges', () => {
			const results = [
				makeBatchResult({
					access_lost: [makeAccessItem({ name: 'Admin Role' })]
				})
			];
			render(BatchResultsTable, { props: { results, total: 1 } });

			expect(screen.getByText('Admin Role')).toBeTruthy();
		});

		it('shows warnings', () => {
			const results = [
				makeBatchResult({
					warnings: ['SoD conflict detected', 'Pending access request exists']
				})
			];
			render(BatchResultsTable, { props: { results, total: 1 } });

			expect(screen.getByText('SoD conflict detected')).toBeTruthy();
			expect(screen.getByText('Pending access request exists')).toBeTruthy();
		});

		it('shows truncated user ID', () => {
			const results = [makeBatchResult()];
			render(BatchResultsTable, { props: { results, total: 1 } });

			expect(screen.getByText('user-aaa...')).toBeTruthy();
		});
	});

	describe('empty state', () => {
		it('shows empty state when no results', () => {
			render(BatchResultsTable, { props: { results: [], total: 0 } });

			expect(screen.getByText('No results found')).toBeTruthy();
		});
	});

	describe('filter dropdown', () => {
		it('renders filter dropdown', () => {
			const results = [makeBatchResult()];
			const onFilterChange = vi.fn();
			render(BatchResultsTable, { props: { results, total: 1, onFilterChange } });

			expect(screen.getByText('All Results')).toBeTruthy();
			expect(screen.getByText('Has Warnings')).toBeTruthy();
			expect(screen.getByText('No Warnings')).toBeTruthy();
		});
	});

	describe('dash display for empty arrays', () => {
		it('shows dash when no access gained', () => {
			const results = [makeBatchResult({ access_gained: [] })];
			const { container } = render(BatchResultsTable, { props: { results, total: 1 } });

			// The component shows em-dash for empty arrays
			const dashes = container.querySelectorAll('.text-muted-foreground');
			expect(dashes.length).toBeGreaterThan(0);
		});

		it('shows dash when no access lost', () => {
			const results = [makeBatchResult({ access_lost: [] })];
			const { container } = render(BatchResultsTable, { props: { results, total: 1 } });

			const dashes = container.querySelectorAll('.text-muted-foreground');
			expect(dashes.length).toBeGreaterThan(0);
		});

		it('shows dash when no warnings', () => {
			const results = [makeBatchResult({ warnings: [] })];
			const { container } = render(BatchResultsTable, { props: { results, total: 1 } });

			const dashes = container.querySelectorAll('.text-muted-foreground');
			expect(dashes.length).toBeGreaterThan(0);
		});
	});
});
