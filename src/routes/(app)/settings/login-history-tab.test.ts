import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import LoginHistoryTab from './login-history-tab.svelte';

const mockLoginHistory = {
	items: [
		{
			id: 'attempt-1',
			user_id: 'user-1',
			email: 'user@example.com',
			success: true,
			auth_method: 'password',
			ip_address: '192.168.1.1',
			user_agent: 'Chrome/120.0',
			geo_city: 'Paris',
			geo_country: 'France',
			is_new_device: false,
			is_new_location: false,
			failure_reason: null,
			created_at: '2024-06-01T10:00:00Z'
		},
		{
			id: 'attempt-2',
			user_id: 'user-1',
			email: 'user@example.com',
			success: false,
			auth_method: 'password',
			ip_address: '10.0.0.1',
			user_agent: 'Firefox/115.0',
			geo_city: 'London',
			geo_country: 'UK',
			is_new_device: true,
			is_new_location: true,
			failure_reason: 'Invalid password',
			created_at: '2024-06-02T14:00:00Z'
		}
	],
	total: 2,
	next_cursor: null
};

describe('LoginHistoryTab', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockLoginHistory)
			})
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders LoginAttemptList with fetchUrl="/api/audit/login-history"', () => {
		render(LoginHistoryTab);
		// The component fetches from /api/audit/login-history on mount
		expect(globalThis.fetch).toHaveBeenCalled();
		const fetchUrl = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
		expect(fetchUrl).toContain('/api/audit/login-history');
	});

	it('shows loading skeleton initially', () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockReturnValue(new Promise(() => {}))
		);
		const { container } = render(LoginHistoryTab);
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('shows login attempt entries after fetch', async () => {
		render(LoginHistoryTab);
		expect(await screen.findByText('Successful login')).toBeTruthy();
		expect(await screen.findByText('Failed login')).toBeTruthy();
	});

	it('shows filter controls', () => {
		render(LoginHistoryTab);
		// LoginAttemptList renders with showFilters=true by default
		expect(screen.getByLabelText('Status')).toBeTruthy();
	});

	it('shows error message when fetch fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				json: () => Promise.resolve({})
			})
		);
		render(LoginHistoryTab);
		expect(await screen.findByText('Failed to load login history. Please try again.')).toBeTruthy();
	});
});
