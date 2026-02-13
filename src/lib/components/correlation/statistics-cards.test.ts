import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import StatisticsCards from './statistics-cards.svelte';
import type { CorrelationStatistics } from '$lib/api/types';

function makeStatistics(overrides: Partial<CorrelationStatistics> = {}): CorrelationStatistics {
	return {
		connector_id: 'conn-1',
		period_start: '2025-01-01',
		period_end: '2025-01-31',
		total_evaluated: 1500,
		auto_confirmed_count: 1000,
		auto_confirmed_percentage: 66.7,
		manual_review_count: 300,
		manual_review_percentage: 20,
		no_match_count: 200,
		no_match_percentage: 13.3,
		average_confidence: 0.78,
		review_queue_depth: 45,
		suggestions: [],
		...overrides
	};
}

describe('StatisticsCards', () => {
	afterEach(cleanup);

	it('renders all 6 stat cards', () => {
		render(StatisticsCards, { props: { statistics: makeStatistics() } });
		expect(screen.getByText('Total Evaluated')).toBeTruthy();
		expect(screen.getByText('Auto-Confirmed')).toBeTruthy();
		expect(screen.getByText('Manual Review')).toBeTruthy();
		expect(screen.getByText('No Match')).toBeTruthy();
		expect(screen.getByText('Average Confidence')).toBeTruthy();
		expect(screen.getByText('Review Queue Depth')).toBeTruthy();
	});

	it('renders total evaluated value with locale formatting', () => {
		render(StatisticsCards, { props: { statistics: makeStatistics({ total_evaluated: 1500 }) } });
		// 1500 may render as "1,500" depending on locale
		expect(screen.getByText(/1[,.]?500/)).toBeTruthy();
	});

	it('renders auto-confirmed count with percentage', () => {
		render(StatisticsCards, {
			props: {
				statistics: makeStatistics({
					auto_confirmed_count: 1000,
					auto_confirmed_percentage: 66.7
				})
			}
		});
		// Format: "1,000 (67%)"
		expect(screen.getByText(/1[,.]?000 \(67%\)/)).toBeTruthy();
	});

	it('renders manual review count with percentage', () => {
		render(StatisticsCards, {
			props: {
				statistics: makeStatistics({
					manual_review_count: 300,
					manual_review_percentage: 20
				})
			}
		});
		expect(screen.getByText('300 (20%)')).toBeTruthy();
	});

	it('renders no match count with percentage', () => {
		render(StatisticsCards, {
			props: {
				statistics: makeStatistics({
					no_match_count: 200,
					no_match_percentage: 13.3
				})
			}
		});
		expect(screen.getByText('200 (13%)')).toBeTruthy();
	});

	it('renders average confidence as percentage', () => {
		render(StatisticsCards, {
			props: { statistics: makeStatistics({ average_confidence: 0.78 }) }
		});
		expect(screen.getByText('78%')).toBeTruthy();
	});

	it('renders review queue depth', () => {
		render(StatisticsCards, {
			props: { statistics: makeStatistics({ review_queue_depth: 45 }) }
		});
		expect(screen.getByText('45')).toBeTruthy();
	});

	it('renders loading skeleton state', () => {
		const { container } = render(StatisticsCards, {
			props: { statistics: null, isLoading: true }
		});
		const skeletons = container.querySelectorAll('.animate-pulse');
		expect(skeletons.length).toBe(6);
	});

	it('renders empty state when statistics is null and not loading', () => {
		render(StatisticsCards, { props: { statistics: null, isLoading: false } });
		expect(screen.getByText('No statistics data available.')).toBeTruthy();
	});

	it('renders suggestions when present', () => {
		const stats = makeStatistics({
			suggestions: ['Consider lowering the threshold', 'Add more fuzzy rules']
		});
		render(StatisticsCards, { props: { statistics: stats } });
		expect(screen.getByText('Suggestions')).toBeTruthy();
		expect(screen.getByText('Consider lowering the threshold')).toBeTruthy();
		expect(screen.getByText('Add more fuzzy rules')).toBeTruthy();
	});

	it('does not render suggestions section when suggestions is empty', () => {
		render(StatisticsCards, { props: { statistics: makeStatistics({ suggestions: [] }) } });
		expect(screen.queryByText('Suggestions')).toBeFalsy();
	});

	it('rounds percentages correctly', () => {
		render(StatisticsCards, {
			props: {
				statistics: makeStatistics({
					auto_confirmed_percentage: 66.4,
					manual_review_percentage: 20.6,
					no_match_percentage: 12.9
				})
			}
		});
		// 66.4 rounds to 66, 20.6 rounds to 21, 12.9 rounds to 13
		expect(screen.getByText(/\(66%\)/)).toBeTruthy();
		expect(screen.getByText(/\(21%\)/)).toBeTruthy();
		expect(screen.getByText(/\(13%\)/)).toBeTruthy();
	});

	it('renders average confidence at 100%', () => {
		render(StatisticsCards, {
			props: { statistics: makeStatistics({ average_confidence: 1.0 }) }
		});
		expect(screen.getByText('100%')).toBeTruthy();
	});

	it('renders average confidence at 0%', () => {
		render(StatisticsCards, {
			props: { statistics: makeStatistics({ average_confidence: 0 }) }
		});
		expect(screen.getByText('0%')).toBeTruthy();
	});
});
