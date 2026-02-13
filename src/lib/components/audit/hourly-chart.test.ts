import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import HourlyChart from './hourly-chart.svelte';
import type { HourlyCount } from '$lib/api/types';

describe('HourlyChart', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders "Hourly Distribution" title', () => {
		render(HourlyChart, { props: { data: [] } });
		expect(screen.getByText('Hourly Distribution')).toBeTruthy();
	});

	it('renders 24 bars', () => {
		const data: HourlyCount[] = [
			{ hour: 0, count: 5 },
			{ hour: 12, count: 10 }
		];
		const { container } = render(HourlyChart, { props: { data } });
		// The bars are inside the h-32 flex container
		const barContainer = container.querySelector('.h-32');
		expect(barContainer).toBeTruthy();
		const bars = barContainer!.querySelectorAll('.group');
		expect(bars.length).toBe(24);
	});

	it('handles empty data gracefully', () => {
		const { container } = render(HourlyChart, { props: { data: [] } });
		// Should still render 24 bars, just with minimal height
		const barContainer = container.querySelector('.h-32');
		expect(barContainer).toBeTruthy();
		const bars = barContainer!.querySelectorAll('.group');
		expect(bars.length).toBe(24);
	});

	it('shows hour labels at every 4th hour', () => {
		render(HourlyChart, { props: { data: [] } });
		// Hours 0, 4, 8, 12, 16, 20 should be rendered
		expect(screen.getByText('0')).toBeTruthy();
		expect(screen.getByText('4')).toBeTruthy();
		expect(screen.getByText('8')).toBeTruthy();
		expect(screen.getByText('12')).toBeTruthy();
		expect(screen.getByText('16')).toBeTruthy();
		expect(screen.getByText('20')).toBeTruthy();
	});

	it('sets bar title with hour and count', () => {
		const data: HourlyCount[] = [{ hour: 9, count: 42 }];
		const { container } = render(HourlyChart, { props: { data } });
		const barWithTitle = container.querySelector('[title="9:00 — 42 attempts"]');
		expect(barWithTitle).toBeTruthy();
	});

	it('sets bar title with 0 count for hours not in data', () => {
		const data: HourlyCount[] = [{ hour: 5, count: 3 }];
		const { container } = render(HourlyChart, { props: { data } });
		const emptyBar = container.querySelector('[title="0:00 — 0 attempts"]');
		expect(emptyBar).toBeTruthy();
	});
});
