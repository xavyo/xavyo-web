import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import DateRangeFilter from './date-range-filter.svelte';

describe('DateRangeFilter', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders two date inputs with labels', () => {
		render(DateRangeFilter);
		expect(screen.getByLabelText('From')).toBeTruthy();
		expect(screen.getByLabelText('To')).toBeTruthy();
	});

	it('renders date inputs with type="date"', () => {
		render(DateRangeFilter);
		const startInput = screen.getByLabelText('From') as HTMLInputElement;
		const endInput = screen.getByLabelText('To') as HTMLInputElement;
		expect(startInput.type).toBe('date');
		expect(endInput.type).toBe('date');
	});

	it('initializes with provided startDate and endDate', () => {
		render(DateRangeFilter, {
			props: { startDate: '2025-01-01', endDate: '2025-01-31' }
		});
		const startInput = screen.getByLabelText('From') as HTMLInputElement;
		const endInput = screen.getByLabelText('To') as HTMLInputElement;
		expect(startInput.value).toBe('2025-01-01');
		expect(endInput.value).toBe('2025-01-31');
	});

	it('shows validation error when end date precedes start date', async () => {
		render(DateRangeFilter);
		const startInput = screen.getByLabelText('From') as HTMLInputElement;
		const endInput = screen.getByLabelText('To') as HTMLInputElement;

		// Set start after end to trigger validation
		await fireEvent.input(startInput, { target: { value: '2025-06-15' } });
		await fireEvent.change(startInput);
		await fireEvent.input(endInput, { target: { value: '2025-06-01' } });
		await fireEvent.change(endInput);

		expect(screen.getByText('End date must not precede start date')).toBeTruthy();
	});

	it('calls onchange with ISO 8601 strings when dates are valid', async () => {
		const onchange = vi.fn();
		render(DateRangeFilter, { props: { onchange } });

		const startInput = screen.getByLabelText('From') as HTMLInputElement;
		const endInput = screen.getByLabelText('To') as HTMLInputElement;

		await fireEvent.input(startInput, { target: { value: '2025-01-01' } });
		await fireEvent.change(startInput);
		await fireEvent.input(endInput, { target: { value: '2025-01-31' } });
		await fireEvent.change(endInput);

		expect(onchange).toHaveBeenCalledWith({
			start_date: '2025-01-01T00:00:00Z',
			end_date: '2025-01-31T23:59:59Z'
		});
	});

	it('does not call onchange when validation fails', async () => {
		const onchange = vi.fn();
		render(DateRangeFilter, { props: { onchange } });

		const startInput = screen.getByLabelText('From') as HTMLInputElement;
		const endInput = screen.getByLabelText('To') as HTMLInputElement;

		await fireEvent.input(startInput, { target: { value: '2025-06-15' } });
		await fireEvent.change(startInput);

		// Reset the mock to ignore the first valid call
		onchange.mockReset();

		await fireEvent.input(endInput, { target: { value: '2025-06-01' } });
		await fireEvent.change(endInput);

		expect(onchange).not.toHaveBeenCalled();
	});

	it('does not show validation error initially', () => {
		render(DateRangeFilter);
		expect(screen.queryByText('End date must not precede start date')).toBeNull();
	});
});
