import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import PolicyResultsTable from './policy-results-table.svelte';
import type { PolicySimulationResult } from '$lib/api/types';

function makeResult(overrides: Partial<PolicySimulationResult> = {}): PolicySimulationResult {
	return {
		id: 'res-001',
		simulation_id: 'sim-001',
		user_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
		impact_type: 'violation',
		details: { rule: 'SoD-001', message: 'Conflicting entitlements' },
		severity: 'high',
		created_at: '2026-01-15T10:00:00Z',
		...overrides
	};
}

describe('PolicyResultsTable', () => {
	afterEach(cleanup);

	// --- Results rendering ---

	it('renders table with results showing user_id', () => {
		const results = [makeResult()];
		render(PolicyResultsTable, { props: { results, total: 1 } });
		// user_id is truncated to first 8 chars + "..."
		expect(screen.getByText('aaaaaaaa...')).toBeTruthy();
	});

	it('renders impact type badge for each result', () => {
		const results = [makeResult({ impact_type: 'violation' })];
		render(PolicyResultsTable, { props: { results, total: 1 } });
		expect(screen.getByText('violation')).toBeTruthy();
	});

	it('renders severity badge for each result', () => {
		const results = [makeResult({ severity: 'high' })];
		render(PolicyResultsTable, { props: { results, total: 1 } });
		expect(screen.getByText('high')).toBeTruthy();
	});

	it('renders details column with truncated JSON', () => {
		const results = [makeResult({ details: { rule: 'SoD-001' } })];
		render(PolicyResultsTable, { props: { results, total: 1 } });
		expect(screen.getByText(/SoD-001/)).toBeTruthy();
	});

	it('renders multiple results as table rows', () => {
		const results = [
			makeResult({ id: 'r1', user_id: '11111111-0000-0000-0000-000000000000', impact_type: 'violation' }),
			makeResult({ id: 'r2', user_id: '22222222-0000-0000-0000-000000000000', impact_type: 'entitlement_gain' })
		];
		render(PolicyResultsTable, { props: { results, total: 2 } });
		expect(screen.getByText('11111111...')).toBeTruthy();
		expect(screen.getByText('22222222...')).toBeTruthy();
	});

	// --- Empty state ---

	it('shows "No results found" when results array is empty', () => {
		render(PolicyResultsTable, { props: { results: [], total: 0 } });
		expect(screen.getByText('No results found')).toBeTruthy();
	});

	// --- Total count ---

	it('shows total count text for single result', () => {
		render(PolicyResultsTable, { props: { results: [makeResult()], total: 1 } });
		expect(screen.getByText('1 result')).toBeTruthy();
	});

	it('shows total count text for multiple results', () => {
		render(PolicyResultsTable, { props: { results: [makeResult()], total: 42 } });
		expect(screen.getByText('42 results')).toBeTruthy();
	});

	// --- Filter dropdown ---

	it('renders filter dropdown with All Impact Types option', () => {
		render(PolicyResultsTable, { props: { results: [], total: 0 } });
		const select = screen.getByRole('combobox') as HTMLSelectElement;
		expect(select).toBeTruthy();
		// Check that there are option elements
		const options = select.querySelectorAll('option');
		expect(options.length).toBe(6); // All + 5 impact types
	});

	it('includes all impact type options in filter dropdown', () => {
		render(PolicyResultsTable, { props: { results: [], total: 0 } });
		expect(screen.getByText('All Impact Types')).toBeTruthy();
		expect(screen.getByText('Violation')).toBeTruthy();
		expect(screen.getByText('Entitlement Gain')).toBeTruthy();
		expect(screen.getByText('Entitlement Loss')).toBeTruthy();
		expect(screen.getByText('No Change')).toBeTruthy();
		expect(screen.getByText('Warning')).toBeTruthy();
	});

	it('calls onFilterChange when filter is changed', async () => {
		const onFilterChange = vi.fn();
		render(PolicyResultsTable, { props: { results: [], total: 0, onFilterChange } });
		const select = screen.getByRole('combobox') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'violation' } });
		expect(onFilterChange).toHaveBeenCalledWith('violation');
	});

	it('calls onFilterChange with null when All Impact Types is selected', async () => {
		const onFilterChange = vi.fn();
		render(PolicyResultsTable, { props: { results: [], total: 0, onFilterChange } });
		const select = screen.getByRole('combobox') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: '' } });
		expect(onFilterChange).toHaveBeenCalledWith(null);
	});

	// --- Table headers ---

	it('renders table headers when results exist', () => {
		render(PolicyResultsTable, { props: { results: [makeResult()], total: 1 } });
		expect(screen.getByText('User ID')).toBeTruthy();
		expect(screen.getByText('Impact Type')).toBeTruthy();
		expect(screen.getByText('Severity')).toBeTruthy();
		expect(screen.getByText('Details')).toBeTruthy();
	});

	// --- Truncation ---

	it('truncates long user_id to 8 characters', () => {
		const results = [makeResult({ user_id: 'abcdefgh-1234-5678-9012-345678901234' })];
		render(PolicyResultsTable, { props: { results, total: 1 } });
		expect(screen.getByText('abcdefgh...')).toBeTruthy();
	});

	it('truncates long details JSON', () => {
		const longDetails: Record<string, unknown> = {};
		for (let i = 0; i < 20; i++) {
			longDetails[`key_${i}`] = `value_${i}_with_some_extra_text_to_make_it_long`;
		}
		const results = [makeResult({ details: longDetails })];
		render(PolicyResultsTable, { props: { results, total: 1 } });
		// The rendered details should be truncated — just verify something renders
		const cells = document.querySelectorAll('td');
		const detailsCell = cells[cells.length - 1];
		expect(detailsCell).toBeTruthy();
		// The full JSON would be much longer than 100 chars
		expect(detailsCell.textContent!.length).toBeLessThanOrEqual(101);
	});
});
