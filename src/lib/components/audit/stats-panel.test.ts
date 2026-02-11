import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import StatsPanel from './stats-panel.svelte';
import type { LoginAttemptStats } from '$lib/api/types';

function makeStats(overrides: Partial<LoginAttemptStats> = {}): LoginAttemptStats {
	return {
		total_attempts: 1500,
		successful_attempts: 1350,
		failed_attempts: 150,
		success_rate: 90.0,
		failure_reasons: [
			{ reason: 'Invalid password', count: 100 },
			{ reason: 'Account locked', count: 50 }
		],
		hourly_distribution: [
			{ hour: 9, count: 120 },
			{ hour: 14, count: 95 }
		],
		unique_users: 320,
		new_device_logins: 45,
		new_location_logins: 18,
		...overrides
	};
}

describe('StatsPanel', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders stat cards with correct values when stats are provided', () => {
		render(StatsPanel, { props: { stats: makeStats() } });
		expect(screen.getByText('Total Attempts')).toBeTruthy();
		expect(screen.getByText('1,500')).toBeTruthy();
		expect(screen.getByText('Successful')).toBeTruthy();
		expect(screen.getByText('1,350')).toBeTruthy();
		expect(screen.getByText('Failed')).toBeTruthy();
		expect(screen.getByText('150')).toBeTruthy();
		expect(screen.getByText('Success Rate')).toBeTruthy();
		expect(screen.getByText('90.0%')).toBeTruthy();
	});

	it('renders secondary stat cards', () => {
		render(StatsPanel, { props: { stats: makeStats() } });
		expect(screen.getByText('Unique Users')).toBeTruthy();
		expect(screen.getByText('320')).toBeTruthy();
		expect(screen.getByText('New Device Logins')).toBeTruthy();
		expect(screen.getByText('45')).toBeTruthy();
		expect(screen.getByText('New Location Logins')).toBeTruthy();
		expect(screen.getByText('18')).toBeTruthy();
	});

	it('renders failure reasons when present', () => {
		render(StatsPanel, { props: { stats: makeStats() } });
		expect(screen.getByText('Top Failure Reasons')).toBeTruthy();
		expect(screen.getByText('Invalid password')).toBeTruthy();
		expect(screen.getByText('100')).toBeTruthy();
		expect(screen.getByText('Account locked')).toBeTruthy();
		expect(screen.getByText('50')).toBeTruthy();
	});

	it('shows loading skeleton when loading=true', () => {
		const { container } = render(StatsPanel, {
			props: { stats: null, loading: true }
		});
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBe(4);
	});

	it('does not render stat cards when loading', () => {
		render(StatsPanel, { props: { stats: null, loading: true } });
		expect(screen.queryByText('Total Attempts')).toBeNull();
	});

	it('shows error message when error is set', () => {
		render(StatsPanel, {
			props: { stats: null, error: 'Failed to load statistics' }
		});
		expect(screen.getByText('Failed to load statistics')).toBeTruthy();
	});

	it('shows retry button when error and onretry provided', () => {
		const onretry = vi.fn();
		render(StatsPanel, {
			props: { stats: null, error: 'Something went wrong', onretry }
		});
		expect(screen.getByText('Retry')).toBeTruthy();
	});

	it('calls onretry when retry button is clicked', async () => {
		const onretry = vi.fn();
		render(StatsPanel, {
			props: { stats: null, error: 'Something went wrong', onretry }
		});
		const retryBtn = screen.getByText('Retry');
		await fireEvent.click(retryBtn);
		expect(onretry).toHaveBeenCalledOnce();
	});

	it('renders nothing when stats is null and not loading and no error', () => {
		const { container } = render(StatsPanel, { props: { stats: null } });
		// The component should render the outer shell but no stat cards, no skeleton, no error
		expect(screen.queryByText('Total Attempts')).toBeNull();
		expect(container.querySelectorAll('.animate-pulse').length).toBe(0);
	});

	it('renders hourly chart when hourly_distribution is non-empty', () => {
		render(StatsPanel, { props: { stats: makeStats() } });
		expect(screen.getByText('Hourly Distribution')).toBeTruthy();
	});

	it('does not render hourly chart when hourly_distribution is empty', () => {
		render(StatsPanel, {
			props: { stats: makeStats({ hourly_distribution: [] }) }
		});
		expect(screen.queryByText('Hourly Distribution')).toBeNull();
	});

	it('does not render failure reasons when list is empty', () => {
		render(StatsPanel, {
			props: { stats: makeStats({ failure_reasons: [] }) }
		});
		expect(screen.queryByText('Top Failure Reasons')).toBeNull();
	});
});
