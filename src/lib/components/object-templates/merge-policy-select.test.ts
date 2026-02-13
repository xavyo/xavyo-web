import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/svelte';
import MergePolicySelect from './merge-policy-select.svelte';
import type { TemplateMergePolicy } from '$lib/api/types';

function makePolicy(overrides: Partial<TemplateMergePolicy> = {}): TemplateMergePolicy {
	return {
		id: 'mp-1',
		template_id: 'tmpl-1',
		attribute: 'department',
		strategy: 'source_precedence',
		source_precedence: null,
		null_handling: 'merge',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		...overrides
	};
}

describe('MergePolicySelect', () => {
	afterEach(cleanup);

	it('renders Merge Policies heading', () => {
		render(MergePolicySelect, { props: { policies: [] } });
		expect(screen.getByText('Merge Policies')).toBeTruthy();
	});

	it('renders Add Policy button', () => {
		render(MergePolicySelect, { props: { policies: [] } });
		expect(screen.getByText('Add Policy')).toBeTruthy();
	});

	it('shows empty state when no policies', () => {
		render(MergePolicySelect, { props: { policies: [] } });
		expect(screen.getByText('No merge policies defined.')).toBeTruthy();
	});

	it('renders policy attribute and strategy', () => {
		const policies = [makePolicy()];
		render(MergePolicySelect, { props: { policies } });
		expect(screen.getByText('department')).toBeTruthy();
		expect(screen.getByText('Source Precedence')).toBeTruthy();
	});

	it('renders null_handling for each policy', () => {
		const policies = [makePolicy({ null_handling: 'preserve_empty' })];
		render(MergePolicySelect, { props: { policies } });
		expect(screen.getByText('(preserve_empty)')).toBeTruthy();
	});

	it('renders multiple policies', () => {
		const policies = [
			makePolicy({ id: 'mp-1', attribute: 'department', strategy: 'source_precedence' }),
			makePolicy({ id: 'mp-2', attribute: 'title', strategy: 'timestamp_wins' }),
			makePolicy({ id: 'mp-3', attribute: 'email', strategy: 'first_wins' })
		];
		render(MergePolicySelect, { props: { policies } });
		expect(screen.getByText('department')).toBeTruthy();
		expect(screen.getByText('title')).toBeTruthy();
		expect(screen.getByText('email')).toBeTruthy();
		expect(screen.getByText('Source Precedence')).toBeTruthy();
		expect(screen.getByText('Timestamp Wins')).toBeTruthy();
		expect(screen.getByText('First Wins')).toBeTruthy();
	});

	it('shows Delete button for each policy when onDelete is provided', () => {
		const policies = [makePolicy(), makePolicy({ id: 'mp-2', attribute: 'title' })];
		render(MergePolicySelect, { props: { policies, onDelete: vi.fn() } });
		const deleteButtons = screen.getAllByText('Delete');
		expect(deleteButtons.length).toBe(2);
	});

	it('does not show Delete button when onDelete is not provided', () => {
		const policies = [makePolicy()];
		render(MergePolicySelect, { props: { policies } });
		expect(screen.queryByText('Delete')).toBeNull();
	});

	it('calls onDelete with policy id when Delete is clicked', async () => {
		const onDelete = vi.fn();
		const policies = [makePolicy({ id: 'mp-99' })];
		render(MergePolicySelect, { props: { policies, onDelete } });
		await fireEvent.click(screen.getByText('Delete'));
		expect(onDelete).toHaveBeenCalledWith('mp-99');
	});

	it('toggles add form when Add Policy button is clicked', async () => {
		render(MergePolicySelect, { props: { policies: [], onAdd: vi.fn() } });
		expect(screen.queryByLabelText('Attribute')).toBeNull();
		await fireEvent.click(screen.getByText('Add Policy'));
		expect(screen.getByLabelText('Attribute')).toBeTruthy();
		expect(screen.getByLabelText('Strategy')).toBeTruthy();
		expect(screen.getByLabelText('Null Handling')).toBeTruthy();
	});

	it('shows Cancel text on button when form is open', async () => {
		render(MergePolicySelect, { props: { policies: [], onAdd: vi.fn() } });
		await fireEvent.click(screen.getByText('Add Policy'));
		expect(screen.getByText('Cancel')).toBeTruthy();
	});

	it('renders all strategy options in the form', async () => {
		const { container } = render(MergePolicySelect, { props: { policies: [], onAdd: vi.fn() } });
		await fireEvent.click(screen.getByText('Add Policy'));
		const strategySelect = container.querySelector('#mp-strategy') as HTMLSelectElement;
		const options = Array.from(strategySelect.options).map((o) => o.value);
		expect(options).toContain('source_precedence');
		expect(options).toContain('timestamp_wins');
		expect(options).toContain('concatenate_unique');
		expect(options).toContain('first_wins');
		expect(options).toContain('manual_only');
	});

	it('renders both null handling options in the form', async () => {
		const { container } = render(MergePolicySelect, { props: { policies: [], onAdd: vi.fn() } });
		await fireEvent.click(screen.getByText('Add Policy'));
		const nullSelect = container.querySelector('#mp-null-handling') as HTMLSelectElement;
		const options = Array.from(nullSelect.options).map((o) => o.value);
		expect(options).toContain('merge');
		expect(options).toContain('preserve_empty');
	});

	it('renders strategy badge with correct color', () => {
		const policies = [makePolicy({ strategy: 'timestamp_wins' })];
		render(MergePolicySelect, { props: { policies } });
		const badge = screen.getByText('Timestamp Wins');
		expect(badge.className).toContain('bg-purple-100');
	});
});
