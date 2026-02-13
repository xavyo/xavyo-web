import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import HealthSummaryCards from './health-summary-cards.svelte';
import type { SiemHealthSummary } from '$lib/api/types';

function makeHealth(overrides: Partial<SiemHealthSummary> = {}): SiemHealthSummary {
	return {
		destination_id: 'dest-1',
		total_events_sent: 10000,
		total_events_delivered: 9500,
		total_events_failed: 300,
		total_events_dropped: 200,
		avg_latency_ms: 45.3,
		last_success_at: '2025-06-15T10:30:00Z',
		last_failure_at: '2025-06-15T09:00:00Z',
		success_rate_percent: 95.0,
		circuit_state: 'closed',
		dead_letter_count: 15,
		...overrides
	};
}

describe('HealthSummaryCards', () => {
	afterEach(cleanup);

	it('renders all metric cards', () => {
		render(HealthSummaryCards, { props: { health: makeHealth() } });
		expect(screen.getByText('Total Sent')).toBeTruthy();
		expect(screen.getByText('Delivered')).toBeTruthy();
		expect(screen.getByText('Failed')).toBeTruthy();
		expect(screen.getByText('Dropped')).toBeTruthy();
		expect(screen.getByText('Success Rate')).toBeTruthy();
		expect(screen.getByText('Avg Latency')).toBeTruthy();
		expect(screen.getByText('Dead Letters')).toBeTruthy();
		expect(screen.getByText('Circuit State')).toBeTruthy();
	});

	it('formats numbers correctly', () => {
		render(HealthSummaryCards, { props: { health: makeHealth({ total_events_sent: 10000 }) } });
		// 10000 may render as "10,000" depending on locale
		expect(screen.getByText(/10[,.]?000/)).toBeTruthy();
	});

	it('shows circuit state badge', () => {
		render(HealthSummaryCards, { props: { health: makeHealth({ circuit_state: 'closed' }) } });
		expect(screen.getByText('Closed')).toBeTruthy();
	});

	it('shows last success/failure timestamps', () => {
		render(HealthSummaryCards, {
			props: {
				health: makeHealth({
					last_success_at: '2025-06-15T10:30:00Z',
					last_failure_at: '2025-06-15T09:00:00Z'
				})
			}
		});
		expect(screen.getByText(/Last success:/)).toBeTruthy();
		expect(screen.getByText(/Last failure:/)).toBeTruthy();
	});

	it('handles null avg_latency_ms', () => {
		render(HealthSummaryCards, { props: { health: makeHealth({ avg_latency_ms: null }) } });
		expect(screen.getByText('N/A')).toBeTruthy();
	});

	it('shows avg latency with ms suffix when present', () => {
		render(HealthSummaryCards, { props: { health: makeHealth({ avg_latency_ms: 45.3 }) } });
		expect(screen.getByText('45.3ms')).toBeTruthy();
	});

	it('handles null timestamps', () => {
		render(HealthSummaryCards, {
			props: {
				health: makeHealth({
					last_success_at: null,
					last_failure_at: null
				})
			}
		});
		const neverElements = screen.getAllByText(/Never/);
		expect(neverElements.length).toBeGreaterThanOrEqual(2);
	});

	it('shows success rate with 2 decimal places', () => {
		render(HealthSummaryCards, { props: { health: makeHealth({ success_rate_percent: 95.123 }) } });
		expect(screen.getByText('95.12%')).toBeTruthy();
	});

	it('renders delivered count', () => {
		render(HealthSummaryCards, { props: { health: makeHealth({ total_events_delivered: 9500 }) } });
		expect(screen.getByText(/9[,.]?500/)).toBeTruthy();
	});

	it('renders dead letter count', () => {
		render(HealthSummaryCards, { props: { health: makeHealth({ dead_letter_count: 15 }) } });
		expect(screen.getByText('15')).toBeTruthy();
	});
});
