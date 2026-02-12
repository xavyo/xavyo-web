import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import ConditionRow from './condition-row.svelte';
import type { BirthrightOperator } from '$lib/api/types';

function defaultProps(overrides: Record<string, unknown> = {}) {
	return {
		attribute: 'department',
		operator: 'equals' as BirthrightOperator,
		value: 'Engineering',
		index: 0,
		onchange: vi.fn(),
		onremove: vi.fn(),
		...overrides
	};
}

describe('ConditionRow', () => {
	afterEach(cleanup);

	it('renders with data-testid based on index', () => {
		render(ConditionRow, { props: defaultProps({ index: 3 }) });
		expect(screen.getByTestId('condition-row-3')).toBeTruthy();
	});

	it('renders attribute input with current value', () => {
		render(ConditionRow, { props: defaultProps({ attribute: 'location' }) });
		const input = screen.getByLabelText('Attribute') as HTMLInputElement;
		expect(input.value).toBe('location');
	});

	it('renders operator select with current value', () => {
		render(ConditionRow, { props: defaultProps({ operator: 'contains' }) });
		const select = screen.getByLabelText('Operator') as HTMLSelectElement;
		expect(select.value).toBe('contains');
	});

	it('renders all six operator options', () => {
		render(ConditionRow, { props: defaultProps() });
		const select = screen.getByLabelText('Operator') as HTMLSelectElement;
		const options = Array.from(select.querySelectorAll('option'));
		const values = options.map((o) => o.value);
		expect(values).toEqual(['equals', 'not_equals', 'in', 'not_in', 'starts_with', 'contains']);
	});

	it('renders value input with string value', () => {
		render(ConditionRow, { props: defaultProps({ value: 'Sales' }) });
		const input = screen.getByLabelText('Value') as HTMLInputElement;
		expect(input.value).toBe('Sales');
	});

	it('shows comma-separated label for "in" operator', () => {
		render(ConditionRow, { props: defaultProps({ operator: 'in', value: ['US', 'UK'] }) });
		expect(screen.getByLabelText('Values (comma-separated)')).toBeTruthy();
	});

	it('shows comma-separated label for "not_in" operator', () => {
		render(ConditionRow, { props: defaultProps({ operator: 'not_in', value: ['X'] }) });
		expect(screen.getByLabelText('Values (comma-separated)')).toBeTruthy();
	});

	it('displays array value as comma-separated string', () => {
		render(ConditionRow, { props: defaultProps({ operator: 'in', value: ['US', 'UK', 'DE'] }) });
		const input = screen.getByLabelText('Values (comma-separated)') as HTMLInputElement;
		expect(input.value).toBe('US, UK, DE');
	});

	it('calls onchange with attribute field on attribute input', async () => {
		const onchange = vi.fn();
		render(ConditionRow, { props: defaultProps({ onchange, index: 2 }) });
		const input = screen.getByLabelText('Attribute') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: 'job_title' } });
		expect(onchange).toHaveBeenCalledWith(2, 'attribute', 'job_title');
	});

	it('calls onchange with operator field on operator change', async () => {
		const onchange = vi.fn();
		render(ConditionRow, { props: defaultProps({ onchange, index: 1 }) });
		const select = screen.getByLabelText('Operator') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'starts_with' } });
		expect(onchange).toHaveBeenCalledWith(1, 'operator', 'starts_with');
	});

	it('calls onchange with string value for single-value operator', async () => {
		const onchange = vi.fn();
		render(ConditionRow, { props: defaultProps({ onchange, operator: 'equals', value: '' }) });
		const input = screen.getByLabelText('Value') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: 'Sales' } });
		expect(onchange).toHaveBeenCalledWith(0, 'value', 'Sales');
	});

	it('calls onchange with array value for multi-value operator', async () => {
		const onchange = vi.fn();
		render(ConditionRow, { props: defaultProps({ onchange, operator: 'in', value: [] }) });
		const input = screen.getByLabelText('Values (comma-separated)') as HTMLInputElement;
		await fireEvent.input(input, { target: { value: 'US, UK, DE' } });
		expect(onchange).toHaveBeenCalledWith(0, 'value', ['US', 'UK', 'DE']);
	});

	it('calls onremove with index when remove button clicked', async () => {
		const onremove = vi.fn();
		render(ConditionRow, { props: defaultProps({ onremove, index: 4 }) });
		const removeBtn = screen.getByRole('button', { name: 'Remove condition' });
		await fireEvent.click(removeBtn);
		expect(onremove).toHaveBeenCalledWith(4);
	});

	it('resets value when switching from single to multi-value operator', async () => {
		const onchange = vi.fn();
		render(ConditionRow, { props: defaultProps({ onchange, operator: 'equals', value: 'test' }) });
		const select = screen.getByLabelText('Operator') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'in' } });
		// First call: operator change, second call: value reset
		expect(onchange).toHaveBeenCalledWith(0, 'operator', 'in');
		expect(onchange).toHaveBeenCalledWith(0, 'value', []);
	});

	it('shows correct placeholder for single-value input', () => {
		render(ConditionRow, { props: defaultProps({ operator: 'equals', value: '' }) });
		const input = screen.getByLabelText('Value') as HTMLInputElement;
		expect(input.placeholder).toBe('e.g. Engineering');
	});

	it('shows correct placeholder for multi-value input', () => {
		render(ConditionRow, { props: defaultProps({ operator: 'in', value: [] }) });
		const input = screen.getByLabelText('Values (comma-separated)') as HTMLInputElement;
		expect(input.placeholder).toBe('e.g. US, UK, DE');
	});
});
