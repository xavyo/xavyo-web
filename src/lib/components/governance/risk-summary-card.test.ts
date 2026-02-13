import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RiskSummaryCard from './risk-summary-card.svelte';
import type { RiskScoreSummary } from '$lib/api/types';

describe('RiskSummaryCard', () => {
	const summary: RiskScoreSummary = {
		by_level: [
			{ level: 'low', count: 60 },
			{ level: 'medium', count: 25 },
			{ level: 'high', count: 10 },
			{ level: 'critical', count: 5 }
		],
		total_users: 100,
		average_score: 32.5
	};

	it('renders all risk level counts', () => {
		render(RiskSummaryCard, { props: { summary } });
		expect(screen.getByText('60')).toBeTruthy();
		expect(screen.getByText('25')).toBeTruthy();
		expect(screen.getByText('10')).toBeTruthy();
		expect(screen.getByText('5')).toBeTruthy();
	});

	it('renders risk level labels', () => {
		render(RiskSummaryCard, { props: { summary } });
		expect(screen.getByText('Low Risk')).toBeTruthy();
		expect(screen.getByText('Medium Risk')).toBeTruthy();
		expect(screen.getByText('High Risk')).toBeTruthy();
		expect(screen.getByText('Critical Risk')).toBeTruthy();
	});

	it('renders total users count', () => {
		render(RiskSummaryCard, { props: { summary } });
		expect(screen.getByText('100')).toBeTruthy();
	});

	it('renders average score formatted to 1 decimal', () => {
		render(RiskSummaryCard, { props: { summary } });
		expect(screen.getByText('32.5')).toBeTruthy();
	});

	it('handles zero counts', () => {
		const emptySummary: RiskScoreSummary = {
			by_level: [],
			total_users: 0,
			average_score: 0
		};
		render(RiskSummaryCard, { props: { summary: emptySummary } });
		expect(screen.getByText('0.0')).toBeTruthy();
	});

	it('handles missing levels in by_level array', () => {
		const partialSummary: RiskScoreSummary = {
			by_level: [{ level: 'high', count: 7 }],
			total_users: 7,
			average_score: 75.0
		};
		render(RiskSummaryCard, { props: { summary: partialSummary } });
		expect(screen.getByText('75.0')).toBeTruthy();
		// Low, medium, critical should show 0
		const zeros = screen.getAllByText('0');
		expect(zeros.length).toBe(3);
	});
});
