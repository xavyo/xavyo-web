import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import UsageSummaryStats from './usage-summary-stats.svelte';
import type { NhiUsageSummary } from '$lib/api/types';

function makeSummary(overrides: Partial<NhiUsageSummary> = {}): NhiUsageSummary {
	return {
		nhi_id: 'nhi-1',
		total_events: 150,
		last_activity_at: '2026-02-10T15:30:00Z',
		first_activity_at: '2026-01-01T08:00:00Z',
		activity_types: { api_call: 100, token_refresh: 30, login: 20 },
		daily_average: 3.5,
		...overrides
	};
}

describe('UsageSummaryStats', () => {
	afterEach(cleanup);

	it('renders card labels', () => {
		render(UsageSummaryStats, { props: { summary: makeSummary() } });
		expect(screen.getByText('Total Events')).toBeTruthy();
		expect(screen.getByText('Daily Average')).toBeTruthy();
		expect(screen.getByText('First Activity')).toBeTruthy();
		expect(screen.getByText('Last Activity')).toBeTruthy();
	});

	it('renders total events count', () => {
		render(UsageSummaryStats, { props: { summary: makeSummary() } });
		expect(screen.getByText('150')).toBeTruthy();
	});

	it('renders daily average with one decimal', () => {
		render(UsageSummaryStats, { props: { summary: makeSummary() } });
		expect(screen.getByText('3.5')).toBeTruthy();
	});

	it('renders activity by type section', () => {
		render(UsageSummaryStats, { props: { summary: makeSummary() } });
		expect(screen.getByText('Activity by Type')).toBeTruthy();
		expect(screen.getByText('api_call')).toBeTruthy();
		expect(screen.getByText('100')).toBeTruthy();
		expect(screen.getByText('token_refresh')).toBeTruthy();
		expect(screen.getByText('30')).toBeTruthy();
		expect(screen.getByText('login')).toBeTruthy();
		expect(screen.getByText('20')).toBeTruthy();
	});

	it('renders Never when first_activity_at is null', () => {
		render(UsageSummaryStats, {
			props: { summary: makeSummary({ first_activity_at: null }) }
		});
		const nevers = screen.getAllByText('Never');
		expect(nevers.length).toBeGreaterThanOrEqual(1);
	});

	it('renders Never when last_activity_at is null', () => {
		render(UsageSummaryStats, {
			props: { summary: makeSummary({ last_activity_at: null }) }
		});
		const nevers = screen.getAllByText('Never');
		expect(nevers.length).toBeGreaterThanOrEqual(1);
	});

	it('renders no data message when summary is null', () => {
		render(UsageSummaryStats, { props: { summary: null } });
		expect(screen.getByText('No usage data available.')).toBeTruthy();
	});

	it('does not render activity types section when empty', () => {
		render(UsageSummaryStats, {
			props: { summary: makeSummary({ activity_types: {} }) }
		});
		expect(screen.queryByText('Activity by Type')).toBeNull();
	});

	it('renders zero total events', () => {
		render(UsageSummaryStats, {
			props: { summary: makeSummary({ total_events: 0, daily_average: 0 }) }
		});
		expect(screen.getByText('0')).toBeTruthy();
		expect(screen.getByText('0.0')).toBeTruthy();
	});
});
