import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/svelte';
import AlertList from './alert-list.svelte';
import type { SecurityAlertsResponse } from '$lib/api/types';

const mockAlertsResponse: SecurityAlertsResponse = {
	items: [
		{
			id: 'alert-1',
			user_id: 'user-1',
			alert_type: 'new_device',
			severity: 'warning',
			title: 'New device detected',
			message: 'Login from an unrecognized device.',
			metadata: {},
			acknowledged_at: null,
			created_at: '2025-06-01T12:00:00Z'
		},
		{
			id: 'alert-2',
			user_id: 'user-1',
			alert_type: 'failed_attempts',
			severity: 'critical',
			title: 'Multiple failed logins',
			message: '5 failed login attempts detected.',
			metadata: {},
			acknowledged_at: '2025-06-01T13:00:00Z',
			created_at: '2025-06-01T11:00:00Z'
		}
	],
	total: 2,
	next_cursor: null,
	unacknowledged_count: 1
};

const emptyAlertsResponse: SecurityAlertsResponse = {
	items: [],
	total: 0,
	next_cursor: null,
	unacknowledged_count: 0
};

// Mock the alerts API module
vi.mock('$lib/api/alerts-client', () => ({
	getAlerts: vi.fn(),
	acknowledgeAlert: vi.fn()
}));

describe('AlertList', () => {
	beforeEach(async () => {
		// Default: getAlerts returns mock data
		const { getAlerts } = await import('$lib/api/alerts-client');
		(getAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(mockAlertsResponse);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders filter controls', () => {
		render(AlertList);
		expect(screen.getByLabelText('Type')).toBeTruthy();
		expect(screen.getByLabelText('Severity')).toBeTruthy();
		expect(screen.getByLabelText('Status')).toBeTruthy();
	});

	it('renders type filter with expected options', () => {
		render(AlertList);
		const typeSelect = screen.getByLabelText('Type') as HTMLSelectElement;
		expect(typeSelect.tagName).toBe('SELECT');
		const options = Array.from(typeSelect.options).map((o) => o.value);
		expect(options).toContain('all');
		expect(options).toContain('new_device');
		expect(options).toContain('failed_attempts');
	});

	it('renders severity filter with expected options', () => {
		render(AlertList);
		const severitySelect = screen.getByLabelText('Severity') as HTMLSelectElement;
		const options = Array.from(severitySelect.options).map((o) => o.value);
		expect(options).toContain('all');
		expect(options).toContain('info');
		expect(options).toContain('warning');
		expect(options).toContain('critical');
	});

	it('renders acknowledged filter with expected options', () => {
		render(AlertList);
		const ackSelect = screen.getByLabelText('Status') as HTMLSelectElement;
		const options = Array.from(ackSelect.options).map((o) => o.value);
		expect(options).toContain('all');
		expect(options).toContain('true');
		expect(options).toContain('false');
	});

	it('shows loading skeleton initially', async () => {
		const { getAlerts } = await import('$lib/api/alerts-client');
		// Never resolve to keep loading state
		(getAlerts as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

		const { container } = render(AlertList);
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('shows alert cards after loading', async () => {
		render(AlertList);
		expect(await screen.findByText('New device detected')).toBeTruthy();
		expect(await screen.findByText('Multiple failed logins')).toBeTruthy();
	});

	it('shows empty state when no alerts match', async () => {
		const { getAlerts } = await import('$lib/api/alerts-client');
		(getAlerts as ReturnType<typeof vi.fn>).mockResolvedValue(emptyAlertsResponse);

		render(AlertList);
		expect(await screen.findByText('No security alerts')).toBeTruthy();
	});

	it('shows error message when fetch fails', async () => {
		const { getAlerts } = await import('$lib/api/alerts-client');
		(getAlerts as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

		render(AlertList);
		expect(
			await screen.findByText('Failed to load security alerts. Please try again.')
		).toBeTruthy();
	});

	it('calls getAlerts on mount', async () => {
		const { getAlerts } = await import('$lib/api/alerts-client');

		render(AlertList);
		await waitFor(() => {
			expect(getAlerts).toHaveBeenCalled();
		});
	});
});
