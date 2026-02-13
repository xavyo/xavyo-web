import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import TrendsTable from './trends-table.svelte';
import type { CorrelationTrends, DailyTrend } from '$lib/api/types';

function makeDailyTrend(overrides: Partial<DailyTrend> = {}): DailyTrend {
	return {
		date: '2025-01-15',
		total_evaluated: 100,
		auto_confirmed: 60,
		manual_review: 25,
		no_match: 15,
		average_confidence: 0.82,
		...overrides
	};
}

function makeTrends(overrides: Partial<CorrelationTrends> = {}): CorrelationTrends {
	return {
		connector_id: 'conn-1',
		period_start: '2025-01-01',
		period_end: '2025-01-31',
		daily_trends: [
			makeDailyTrend({ date: '2025-01-15' }),
			makeDailyTrend({ date: '2025-01-16', total_evaluated: 120, auto_confirmed: 80 })
		],
		suggestions: [],
		...overrides
	};
}

describe('TrendsTable', () => {
	afterEach(cleanup);

	it('renders table with daily trend data', () => {
		render(TrendsTable, { props: { trends: makeTrends() } });
		expect(screen.getByText('100')).toBeTruthy();
		expect(screen.getByText('60')).toBeTruthy();
		// '25' appears in both rows (manual_review default), so use getAllByText
		expect(screen.getAllByText('25').length).toBe(2);
		// '15' also appears in both rows (no_match default)
		expect(screen.getAllByText('15').length).toBe(2);
		expect(screen.getAllByText('82%').length).toBe(2);
	});

	it('renders table column headers', () => {
		render(TrendsTable, { props: { trends: makeTrends() } });
		expect(screen.getByText('Date')).toBeTruthy();
		expect(screen.getByText('Total Evaluated')).toBeTruthy();
		expect(screen.getByText('Auto-Confirmed')).toBeTruthy();
		expect(screen.getByText('Manual Review')).toBeTruthy();
		expect(screen.getByText('No Match')).toBeTruthy();
		expect(screen.getByText('Avg Confidence')).toBeTruthy();
	});

	it('renders multiple daily trend rows', () => {
		render(TrendsTable, { props: { trends: makeTrends() } });
		expect(screen.getByText('120')).toBeTruthy();
		expect(screen.getByText('80')).toBeTruthy();
	});

	it('renders loading skeleton state', () => {
		const { container } = render(TrendsTable, {
			props: { trends: null, isLoading: true }
		});
		const skeletons = container.querySelectorAll('.animate-pulse');
		expect(skeletons.length).toBeGreaterThan(0);
		// Loading state still shows table headers
		expect(screen.getByText('Date')).toBeTruthy();
	});

	it('renders empty state when trends is null and not loading', () => {
		render(TrendsTable, { props: { trends: null, isLoading: false } });
		expect(screen.getByText('No trend data available.')).toBeTruthy();
	});

	it('renders empty state when daily_trends is empty', () => {
		render(TrendsTable, {
			props: { trends: makeTrends({ daily_trends: [] }) }
		});
		expect(screen.getByText('No trend data available.')).toBeTruthy();
	});

	it('formats dates using toLocaleDateString', () => {
		const trends = makeTrends({
			daily_trends: [makeDailyTrend({ date: '2025-06-15' })]
		});
		render(TrendsTable, { props: { trends } });
		// The date "2025-06-15" should be formatted via toLocaleDateString()
		const formatted = new Date('2025-06-15').toLocaleDateString();
		expect(screen.getByText(formatted)).toBeTruthy();
	});

	it('shows period start and end dates', () => {
		const trends = makeTrends({
			period_start: '2025-01-01',
			period_end: '2025-01-31'
		});
		render(TrendsTable, { props: { trends } });
		const startFormatted = new Date('2025-01-01').toLocaleDateString();
		const endFormatted = new Date('2025-01-31').toLocaleDateString();
		expect(screen.getByText(`${startFormatted} to ${endFormatted}`)).toBeTruthy();
	});

	it('renders average confidence as percentage', () => {
		render(TrendsTable, {
			props: {
				trends: makeTrends({
					daily_trends: [makeDailyTrend({ average_confidence: 0.934 })]
				})
			}
		});
		expect(screen.getByText('93%')).toBeTruthy();
	});

	it('renders suggestions when present', () => {
		const trends = makeTrends({
			suggestions: ['Add more rules', 'Review threshold']
		});
		render(TrendsTable, { props: { trends } });
		expect(screen.getByText('Suggestions')).toBeTruthy();
		expect(screen.getByText('Add more rules')).toBeTruthy();
		expect(screen.getByText('Review threshold')).toBeTruthy();
	});

	it('does not render suggestions section when suggestions is empty', () => {
		render(TrendsTable, { props: { trends: makeTrends({ suggestions: [] }) } });
		expect(screen.queryByText('Suggestions')).toBeFalsy();
	});

	it('handles invalid date strings gracefully', () => {
		const trends = makeTrends({
			period_start: 'not-a-date',
			period_end: 'also-not-a-date',
			daily_trends: [makeDailyTrend({ date: 'bad-date' })]
		});
		render(TrendsTable, { props: { trends } });
		// Invalid dates fall back to the raw string
		expect(screen.getByText('bad-date')).toBeTruthy();
	});
});
