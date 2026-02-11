import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/svelte';
import SessionsTab from './sessions-tab.svelte';

const mockSessions = {
	sessions: [
		{
			id: 'session-1',
			device_name: 'Work Laptop',
			device_type: 'desktop',
			browser: 'Chrome',
			os: 'macOS',
			ip_address: '192.168.1.1',
			last_activity_at: new Date().toISOString(),
			is_current: true,
			created_at: '2024-01-01T00:00:00Z'
		},
		{
			id: 'session-2',
			device_name: 'Home Desktop',
			device_type: 'desktop',
			browser: 'Firefox',
			os: 'Windows',
			ip_address: '10.0.0.1',
			last_activity_at: new Date().toISOString(),
			is_current: false,
			created_at: '2024-06-01T00:00:00Z'
		}
	],
	total: 2
};

describe('SessionsTab', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockSessions)
			})
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders "Active sessions" heading', () => {
		render(SessionsTab);
		expect(screen.getByText('Active sessions')).toBeTruthy();
	});

	it('shows loading state initially', () => {
		// Use a fetch that never resolves to keep loading state
		vi.stubGlobal(
			'fetch',
			vi.fn().mockReturnValue(new Promise(() => {}))
		);
		const { container } = render(SessionsTab);
		// Loading skeleton has animate-pulse divs
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('shows session list after fetch', async () => {
		render(SessionsTab);
		expect(await screen.findByText('Work Laptop')).toBeTruthy();
		expect(await screen.findByText('Home Desktop')).toBeTruthy();
	});

	it('marks current session with "This device" badge', async () => {
		render(SessionsTab);
		expect(await screen.findByText('This device')).toBeTruthy();
	});
});
