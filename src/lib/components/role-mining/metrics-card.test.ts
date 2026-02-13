import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import MetricsCard from './metrics-card.svelte';
import type { RoleMetrics } from '$lib/api/types';

function makeMetrics(overrides: Partial<RoleMetrics> = {}): RoleMetrics {
	return {
		id: 'test-id-1',
		tenant_id: 'tenant-1',
		role_id: 'role-1',
		utilization_rate: 78.3,
		coverage_rate: 92.1,
		user_count: 45,
		active_user_count: 38,
		entitlement_usage: [
			{
				entitlement_id: 'ent-1',
				used_by_count: 30,
				total_users: 45,
				usage_rate: 66.7
			}
		],
		trend_direction: 'up',
		calculated_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('MetricsCard', () => {
	afterEach(cleanup);

	it('renders utilization rate', () => {
		render(MetricsCard, { props: { metrics: makeMetrics() } });
		expect(screen.getByText('78.3%')).toBeTruthy();
	});

	it('renders coverage rate', () => {
		render(MetricsCard, { props: { metrics: makeMetrics() } });
		expect(screen.getByText('92.1%')).toBeTruthy();
	});

	it('shows user counts', () => {
		render(MetricsCard, { props: { metrics: makeMetrics() } });
		expect(screen.getByText('45 users')).toBeTruthy();
		expect(screen.getByText('(38 active)')).toBeTruthy();
	});

	it('shows trend direction', () => {
		render(MetricsCard, { props: { metrics: makeMetrics({ trend_direction: 'up' }) } });
		expect(screen.getByText('Trend: Up')).toBeTruthy();
	});
});
