import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RiskBreakdown from './risk-breakdown.svelte';
import type { NhiRiskBreakdown } from '$lib/api/types';

function makeBreakdown(overrides: Partial<NhiRiskBreakdown> = {}): NhiRiskBreakdown {
	return {
		nhi_id: 'nhi-1',
		total_score: 65,
		risk_level: 'high',
		common_factors: [
			{ name: 'Credential Age', score: 80, weight: 0.3, description: 'Credentials are old' },
			{ name: 'Permission Count', score: 50, weight: 0.2, description: 'Many permissions granted' }
		],
		type_specific_factors: [
			{ name: 'Tool Calls', score: 70, weight: 0.5, description: 'High call frequency' }
		],
		...overrides
	};
}

describe('RiskBreakdown', () => {
	afterEach(cleanup);

	it('renders the total score', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown() } });
		expect(screen.getByText('65')).toBeTruthy();
	});

	it('renders the risk level badge', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown() } });
		expect(screen.getByText('high')).toBeTruthy();
	});

	it('renders common factors', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown() } });
		expect(screen.getByText('Credential Age')).toBeTruthy();
		expect(screen.getByText('Credentials are old')).toBeTruthy();
		expect(screen.getByText('Permission Count')).toBeTruthy();
	});

	it('renders type-specific factors', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown() } });
		expect(screen.getByText('Tool Calls')).toBeTruthy();
		expect(screen.getByText('High call frequency')).toBeTruthy();
	});

	it('renders section headings', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown() } });
		expect(screen.getByText('Common Factors')).toBeTruthy();
		expect(screen.getByText('Type-Specific Factors')).toBeTruthy();
	});

	it('handles empty factors arrays', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown({ common_factors: [], type_specific_factors: [] }) } });
		expect(screen.getByText('65')).toBeTruthy();
		expect(screen.getByText('Risk Score')).toBeTruthy();
	});

	it('renders low risk level correctly', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown({ total_score: 15, risk_level: 'low' }) } });
		expect(screen.getByText('low')).toBeTruthy();
		expect(screen.getByText('15')).toBeTruthy();
	});

	it('renders critical risk level correctly', () => {
		render(RiskBreakdown, { props: { breakdown: makeBreakdown({ total_score: 90, risk_level: 'critical' }) } });
		expect(screen.getByText('critical')).toBeTruthy();
		expect(screen.getByText('90')).toBeTruthy();
	});
});
