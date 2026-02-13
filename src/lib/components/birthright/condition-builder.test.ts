import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ConditionBuilder from './condition-builder.svelte';
import type { BirthrightCondition } from '$lib/api/types';

function makeCondition(overrides: Partial<BirthrightCondition> = {}): BirthrightCondition {
	return {
		attribute: 'department',
		operator: 'equals',
		value: 'Engineering',
		...overrides
	};
}

describe('ConditionBuilder', () => {
	afterEach(cleanup);

	it('renders the "Conditions" heading', () => {
		const conditions = [makeCondition()];
		render(ConditionBuilder, { props: { conditions, onchange: vi.fn() } });
		expect(screen.getByText('Conditions')).toBeTruthy();
	});

	it('renders the "Add Condition" button', () => {
		const conditions = [makeCondition()];
		render(ConditionBuilder, { props: { conditions, onchange: vi.fn() } });
		expect(screen.getByText('Add Condition')).toBeTruthy();
	});

	it('renders one ConditionRow per condition', () => {
		const conditions = [
			makeCondition({ attribute: 'department' }),
			makeCondition({ attribute: 'location' })
		];
		render(ConditionBuilder, { props: { conditions, onchange: vi.fn() } });
		expect(screen.getByTestId('condition-row-0')).toBeTruthy();
		expect(screen.getByTestId('condition-row-1')).toBeTruthy();
	});

	it('shows empty state message when conditions array is empty', () => {
		render(ConditionBuilder, { props: { conditions: [], onchange: vi.fn() } });
		expect(screen.getByText('No conditions added. At least one condition is required.')).toBeTruthy();
	});

	it('calls onchange with new condition appended when "Add Condition" is clicked', async () => {
		const onchange = vi.fn();
		const conditions = [makeCondition()];
		render(ConditionBuilder, { props: { conditions, onchange } });

		const addBtn = screen.getByText('Add Condition');
		await fireEvent.click(addBtn);

		expect(onchange).toHaveBeenCalledTimes(1);
		const arg = onchange.mock.calls[0][0];
		expect(arg).toHaveLength(2);
		expect(arg[1]).toEqual({ attribute: '', operator: 'equals', value: '' });
	});

	it('does not remove the last remaining condition', async () => {
		const onchange = vi.fn();
		const conditions = [makeCondition()];
		render(ConditionBuilder, { props: { conditions, onchange } });

		// Click the remove button on the only condition
		const removeBtn = screen.getByRole('button', { name: 'Remove condition' });
		await fireEvent.click(removeBtn);

		// onchange should NOT be called because we prevent removing the last condition
		expect(onchange).not.toHaveBeenCalled();
	});

	it('calls onchange with condition removed when remove is clicked (multiple conditions)', async () => {
		const onchange = vi.fn();
		const conditions = [
			makeCondition({ attribute: 'department' }),
			makeCondition({ attribute: 'location' })
		];
		render(ConditionBuilder, { props: { conditions, onchange } });

		// Remove the first condition
		const removeBtns = screen.getAllByRole('button', { name: 'Remove condition' });
		await fireEvent.click(removeBtns[0]);

		expect(onchange).toHaveBeenCalledTimes(1);
		const arg = onchange.mock.calls[0][0];
		expect(arg).toHaveLength(1);
		expect(arg[0].attribute).toBe('location');
	});

	it('preserves existing conditions when adding a new one', async () => {
		const onchange = vi.fn();
		const conditions = [
			makeCondition({ attribute: 'dept', operator: 'contains', value: 'Eng' })
		];
		render(ConditionBuilder, { props: { conditions, onchange } });

		await fireEvent.click(screen.getByText('Add Condition'));
		const arg = onchange.mock.calls[0][0];
		expect(arg[0]).toEqual({ attribute: 'dept', operator: 'contains', value: 'Eng' });
	});
});
