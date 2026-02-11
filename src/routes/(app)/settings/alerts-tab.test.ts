import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import AlertsTab from './alerts-tab.svelte';

const mockAlertsResponse = {
	items: [
		{
			id: 'alert-1',
			user_id: 'user-1',
			alert_type: 'new_device',
			severity: 'warning',
			title: 'New device detected',
			description: 'A login from a new device was detected.',
			metadata: {},
			acknowledged: false,
			acknowledged_at: null,
			created_at: '2024-06-01T10:00:00Z'
		},
		{
			id: 'alert-2',
			user_id: 'user-1',
			alert_type: 'failed_attempts',
			severity: 'critical',
			title: 'Multiple failed login attempts',
			description: '5 failed login attempts detected in the last hour.',
			metadata: {},
			acknowledged: true,
			acknowledged_at: '2024-06-02T12:00:00Z',
			created_at: '2024-06-02T11:00:00Z'
		}
	],
	total: 2,
	next_cursor: null,
	unacknowledged_count: 1
};

describe('AlertsTab', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockAlertsResponse)
			})
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders AlertList component with filter controls', () => {
		render(AlertsTab);
		// AlertList renders filter dropdowns for Type, Severity, and Status
		expect(screen.getByLabelText('Type')).toBeTruthy();
		expect(screen.getByLabelText('Severity')).toBeTruthy();
		expect(screen.getByLabelText('Status')).toBeTruthy();
	});

	it('shows loading skeleton initially', () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockReturnValue(new Promise(() => {}))
		);
		const { container } = render(AlertsTab);
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('shows alert items after fetch', async () => {
		render(AlertsTab);
		expect(await screen.findByText('New device detected')).toBeTruthy();
		expect(await screen.findByText('Multiple failed login attempts')).toBeTruthy();
	});

	it('passes onUnacknowledgedCountChange prop', async () => {
		const countChangeSpy = vi.fn();
		render(AlertsTab, { props: { onUnacknowledgedCountChange: countChangeSpy } });
		// Wait for data to load and callback to fire
		await screen.findByText('New device detected');
		expect(countChangeSpy).toHaveBeenCalledWith(1);
	});

	it('shows error message when fetch fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({ error: 'Unauthorized' })
			})
		);
		render(AlertsTab);
		expect(await screen.findByText('Failed to load security alerts. Please try again.')).toBeTruthy();
	});
});
