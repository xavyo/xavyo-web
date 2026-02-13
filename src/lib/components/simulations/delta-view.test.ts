import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DeltaView from './delta-view.svelte';
import type { ComparisonSummary, DeltaResults } from '$lib/api/types';

function makeComparisonSummary(overrides: Partial<ComparisonSummary> = {}): ComparisonSummary {
	return {
		users_in_both: 80,
		users_only_in_a: 10,
		users_only_in_b: 5,
		different_impacts: 15,
		total_additions: 20,
		total_removals: 12,
		...overrides
	};
}

function makeDeltaResults(overrides: Partial<DeltaResults> = {}): DeltaResults {
	return {
		added: [
			{
				user_id: 'user-aaaa-bbbb-cccc-dddddddddddd',
				impact_type: 'entitlement_gain',
				severity: 'low',
				details: null
			}
		],
		removed: [
			{
				user_id: 'user-eeee-ffff-gggg-hhhhhhhhhhhh',
				impact_type: 'entitlement_loss',
				severity: 'medium',
				details: null
			}
		],
		modified: [
			{
				user_id: 'user-iiii-jjjj-kkkk-llllllllllll',
				impact_a: { type: 'violation', severity: 'high' },
				impact_b: { type: 'warning', severity: 'low' }
			}
		],
		...overrides
	};
}

describe('DeltaView', () => {
	describe('with summary and delta data', () => {
		it('renders summary cards with correct numbers', () => {
			const summary = makeComparisonSummary();
			const delta = makeDeltaResults();
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('80')).toBeTruthy();
			expect(screen.getByText('10')).toBeTruthy();
			expect(screen.getByText('5')).toBeTruthy();
			expect(screen.getByText('15')).toBeTruthy();
			expect(screen.getByText('20')).toBeTruthy();
			expect(screen.getByText('12')).toBeTruthy();
		});

		it('renders summary card labels', () => {
			const summary = makeComparisonSummary();
			const delta = makeDeltaResults();
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('Users in Both')).toBeTruthy();
			expect(screen.getByText('Only in A')).toBeTruthy();
			expect(screen.getByText('Only in B')).toBeTruthy();
			expect(screen.getByText('Different Impacts')).toBeTruthy();
			expect(screen.getByText('Additions')).toBeTruthy();
			expect(screen.getByText('Removals')).toBeTruthy();
		});

		it('renders added table', () => {
			const summary = makeComparisonSummary();
			const delta = makeDeltaResults();
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('Added (1)')).toBeTruthy();
			expect(screen.getByText('entitlement_gain')).toBeTruthy();
		});

		it('renders removed table', () => {
			const summary = makeComparisonSummary();
			const delta = makeDeltaResults();
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('Removed (1)')).toBeTruthy();
			expect(screen.getByText('entitlement_loss')).toBeTruthy();
		});

		it('renders modified table', () => {
			const summary = makeComparisonSummary();
			const delta = makeDeltaResults();
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('Modified (1)')).toBeTruthy();
		});
	});

	describe('with empty delta arrays', () => {
		it('shows "No differences found" when all arrays empty', () => {
			const summary = makeComparisonSummary({ total_additions: 0, total_removals: 0, different_impacts: 0 });
			const delta: DeltaResults = { added: [], removed: [], modified: [] };
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('No differences found between the two simulations.')).toBeTruthy();
		});
	});

	describe('with null props', () => {
		it('shows "No comparison data available" when both summary and delta are null', () => {
			render(DeltaView, { props: { summary: null, delta: null } });

			expect(screen.getByText('No comparison data available.')).toBeTruthy();
		});

		it('does not show summary cards when summary is null', () => {
			render(DeltaView, { props: { summary: null, delta: null } });

			expect(screen.queryByText('Users in Both')).toBeNull();
		});

		it('does not show delta tables when delta is null', () => {
			const summary = makeComparisonSummary();
			render(DeltaView, { props: { summary, delta: null } });

			expect(screen.queryByText('Added')).toBeNull();
			expect(screen.queryByText('Removed')).toBeNull();
			expect(screen.queryByText('Modified')).toBeNull();
		});
	});

	describe('with partial data', () => {
		it('shows only added table when only added has entries', () => {
			const summary = makeComparisonSummary();
			const delta: DeltaResults = {
				added: [{ user_id: 'user-aaaa-bbbb-cccc-dddddddddddd', impact_type: 'violation', severity: 'high', details: null }],
				removed: [],
				modified: []
			};
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('Added (1)')).toBeTruthy();
			expect(screen.queryByText(/^Removed/)).toBeNull();
			expect(screen.queryByText(/^Modified/)).toBeNull();
		});

		it('shows only removed table when only removed has entries', () => {
			const summary = makeComparisonSummary();
			const delta: DeltaResults = {
				added: [],
				removed: [{ user_id: 'user-eeee-ffff-gggg-hhhhhhhhhhhh', impact_type: 'entitlement_loss', severity: 'low', details: null }],
				modified: []
			};
			render(DeltaView, { props: { summary, delta } });

			expect(screen.queryByText(/^Added/)).toBeNull();
			expect(screen.getByText('Removed (1)')).toBeTruthy();
			expect(screen.queryByText(/^Modified/)).toBeNull();
		});
	});

	describe('user_id truncation', () => {
		it('displays truncated user IDs in delta tables', () => {
			const summary = makeComparisonSummary();
			const delta = makeDeltaResults();
			render(DeltaView, { props: { summary, delta } });

			// user_id.slice(0, 8) + '...'
			expect(screen.getByText('user-aaa...')).toBeTruthy();
			expect(screen.getByText('user-eee...')).toBeTruthy();
			expect(screen.getByText('user-iii...')).toBeTruthy();
		});
	});

	describe('severity display', () => {
		it('shows severity when present', () => {
			const summary = makeComparisonSummary();
			const delta: DeltaResults = {
				added: [{ user_id: 'user-aaaa-bbbb-cccc-dddddddddddd', impact_type: 'violation', severity: 'critical', details: null }],
				removed: [],
				modified: []
			};
			render(DeltaView, { props: { summary, delta } });

			expect(screen.getByText('critical')).toBeTruthy();
		});
	});
});
