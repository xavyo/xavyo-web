import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import DashboardMetricCard from './dashboard-metric-card.svelte';

describe('DashboardMetricCard', () => {
	afterEach(() => { cleanup(); });

	it('renders the label', () => {
		render(DashboardMetricCard, { props: { label: 'Total Tasks', value: 42 } });
		expect(screen.getByText('Total Tasks')).toBeTruthy();
	});

	it('renders a numeric value', () => {
		render(DashboardMetricCard, { props: { label: 'Pending', value: 7 } });
		expect(screen.getByText('7')).toBeTruthy();
	});

	it('renders a string value', () => {
		render(DashboardMetricCard, { props: { label: 'Status', value: 'Healthy' } });
		expect(screen.getByText('Healthy')).toBeTruthy();
	});

	it('applies text-foreground class for default variant', () => {
		const { container } = render(DashboardMetricCard, {
			props: { label: 'Tasks', value: 10 }
		});
		const valueEl = container.querySelector('.text-2xl');
		expect(valueEl?.className).toContain('text-foreground');
	});

	it('applies text-orange class for warning variant', () => {
		const { container } = render(DashboardMetricCard, {
			props: { label: 'At Risk', value: 3, variant: 'warning' }
		});
		const valueEl = container.querySelector('.text-2xl');
		expect(valueEl?.className).toContain('text-orange-600');
	});

	it('applies text-red class for danger variant', () => {
		const { container } = render(DashboardMetricCard, {
			props: { label: 'Breached', value: 1, variant: 'danger' }
		});
		const valueEl = container.querySelector('.text-2xl');
		expect(valueEl?.className).toContain('text-red-600');
	});

	it('applies text-green class for success variant', () => {
		const { container } = render(DashboardMetricCard, {
			props: { label: 'Completed', value: 25, variant: 'success' }
		});
		const valueEl = container.querySelector('.text-2xl');
		expect(valueEl?.className).toContain('text-green-600');
	});

	it('renders inside a bordered card container', () => {
		const { container } = render(DashboardMetricCard, {
			props: { label: 'Tasks', value: 5 }
		});
		const card = container.querySelector('div');
		expect(card?.className).toContain('rounded-lg');
		expect(card?.className).toContain('border');
		expect(card?.className).toContain('bg-card');
	});

	it('renders label as muted text', () => {
		const { container } = render(DashboardMetricCard, {
			props: { label: 'My Label', value: 0 }
		});
		const labelEl = container.querySelector('.text-muted-foreground');
		expect(labelEl).toBeTruthy();
		expect(labelEl?.textContent).toBe('My Label');
	});

	it('renders value with bold font', () => {
		const { container } = render(DashboardMetricCard, {
			props: { label: 'Count', value: 99 }
		});
		const valueEl = container.querySelector('.font-bold');
		expect(valueEl).toBeTruthy();
		expect(valueEl?.textContent).toBe('99');
	});
});
