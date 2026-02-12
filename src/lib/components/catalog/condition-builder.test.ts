import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ConditionBuilder from './condition-builder.svelte';
import type { BirthrightCondition } from '$lib/api/types';

describe('ConditionBuilder', () => {
	afterEach(cleanup);

	it('renders data-testid attribute', () => {
		const onUpdate = vi.fn();
		render(ConditionBuilder, { props: { conditions: [], onUpdate } });
		expect(screen.getByTestId('condition-builder')).toBeTruthy();
	});

	it('renders "Add Condition" button', () => {
		const onUpdate = vi.fn();
		render(ConditionBuilder, { props: { conditions: [], onUpdate } });
		expect(screen.getByText('Add Condition')).toBeTruthy();
	});

	it('calls onUpdate with new empty condition when "Add Condition" is clicked', async () => {
		const onUpdate = vi.fn();
		render(ConditionBuilder, { props: { conditions: [], onUpdate } });
		await fireEvent.click(screen.getByText('Add Condition'));
		expect(onUpdate).toHaveBeenCalledWith([
			{ attribute: '', operator: 'equals', value: '' }
		]);
	});

	it('renders existing conditions', () => {
		const onUpdate = vi.fn();
		const conditions: BirthrightCondition[] = [
			{ attribute: 'department', operator: 'equals', value: 'Engineering' },
			{ attribute: 'location', operator: 'in', value: ['US', 'UK'] }
		];
		render(ConditionBuilder, { props: { conditions, onUpdate } });
		// Should render 2 remove buttons
		const removeButtons = screen.getAllByLabelText('Remove condition');
		expect(removeButtons.length).toBe(2);
	});

	it('calls onUpdate without the removed condition when remove is clicked', async () => {
		const onUpdate = vi.fn();
		const conditions: BirthrightCondition[] = [
			{ attribute: 'department', operator: 'equals', value: 'Engineering' },
			{ attribute: 'location', operator: 'contains', value: 'US' }
		];
		render(ConditionBuilder, { props: { conditions, onUpdate } });
		const removeButtons = screen.getAllByLabelText('Remove condition');
		await fireEvent.click(removeButtons[0]);
		expect(onUpdate).toHaveBeenCalledWith([
			{ attribute: 'location', operator: 'contains', value: 'US' }
		]);
	});
});
