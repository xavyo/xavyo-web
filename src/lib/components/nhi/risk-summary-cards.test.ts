import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RiskSummaryCards from './risk-summary-cards.svelte';
import type { NhiRiskSummary } from '$lib/api/types';

function makeSummary(overrides: Partial<NhiRiskSummary> = {}): NhiRiskSummary {
	return {
		total_count: 25,
		by_type: { service_account: 10, ai_agent: 15 },
		by_risk_level: { critical: 2, high: 5, medium: 8, low: 10 },
		pending_certification: 3,
		inactive_30_days: 4,
		expiring_7_days: 1,
		...overrides
	};
}

describe('RiskSummaryCards', () => {
	afterEach(cleanup);

	it('renders total entities count', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('25')).toBeTruthy();
	});

	it('renders type counts', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		// '10' appears both as service_account count and as low risk count
		expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('15')).toBeTruthy(); // ai agents
	});

	it('renders risk level distribution', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText(/critical/i)).toBeTruthy();
		expect(screen.getByText(/high/i)).toBeTruthy();
		expect(screen.getByText(/medium/i)).toBeTruthy();
		expect(screen.getByText(/low/i)).toBeTruthy();
	});

	it('renders pending certification count', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('renders attention required counts', () => {
		render(RiskSummaryCards, { props: { summary: makeSummary() } });
		expect(screen.getByText('4')).toBeTruthy(); // inactive 30 days
		expect(screen.getByText('1')).toBeTruthy(); // expiring 7 days
	});

	it('handles zero total entities', () => {
		render(RiskSummaryCards, {
			props: {
				summary: makeSummary({
					total_count: 0,
					by_type: { service_account: 0, ai_agent: 0 },
					by_risk_level: { critical: 0, high: 0, medium: 0, low: 0 },
					pending_certification: 0,
					inactive_30_days: 0,
					expiring_7_days: 0
				})
			}
		});
		expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
	});
});
