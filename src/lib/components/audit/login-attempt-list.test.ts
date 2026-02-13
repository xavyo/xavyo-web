import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import LoginAttemptList from './login-attempt-list.svelte';
import type { CursorPaginatedResponse, LoginAttempt } from '$lib/api/types';

const mockLoginAttempts: CursorPaginatedResponse<LoginAttempt> = {
	items: [
		{
			id: 'attempt-1',
			user_id: 'user-1',
			email: 'alice@example.com',
			success: true,
			failure_reason: null,
			auth_method: 'password',
			ip_address: '192.168.1.1',
			user_agent: 'Mozilla/5.0 Chrome/120.0',
			device_fingerprint: 'fp-1',
			geo_country: 'US',
			geo_city: 'New York',
			is_new_device: false,
			is_new_location: false,
			created_at: '2025-06-01T12:00:00Z'
		},
		{
			id: 'attempt-2',
			user_id: 'user-2',
			email: 'bob@example.com',
			success: false,
			failure_reason: 'Invalid password',
			auth_method: 'password',
			ip_address: '10.0.0.1',
			user_agent: 'Mozilla/5.0 Firefox/115.0',
			device_fingerprint: 'fp-2',
			geo_country: 'UK',
			geo_city: 'London',
			is_new_device: true,
			is_new_location: true,
			created_at: '2025-06-01T11:30:00Z'
		}
	],
	total: 2,
	next_cursor: null
};

const emptyResponse: CursorPaginatedResponse<LoginAttempt> = {
	items: [],
	total: 0,
	next_cursor: null
};

describe('LoginAttemptList', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockLoginAttempts)
			})
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('shows loading skeleton initially', () => {
		// Use a fetch that never resolves to keep loading state
		vi.stubGlobal(
			'fetch',
			vi.fn().mockReturnValue(new Promise(() => {}))
		);
		const { container } = render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('shows empty state when no login attempts', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(emptyResponse)
			})
		);
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('No login activity')).toBeTruthy();
	});

	it('renders login attempt data after fetch', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('Successful login')).toBeTruthy();
		expect(await screen.findByText('Failed login')).toBeTruthy();
	});

	it('shows success indicator for successful login', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('Successful login')).toBeTruthy();
	});

	it('shows fail indicator and failure reason for failed login', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('Failed login')).toBeTruthy();
		expect(await screen.findByText('Invalid password')).toBeTruthy();
	});

	it('shows auth method badge', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		const badges = await screen.findAllByText('Password');
		expect(badges.length).toBeGreaterThan(0);
	});

	it('shows IP address', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('192.168.1.1')).toBeTruthy();
	});

	it('shows location information', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('New York, US')).toBeTruthy();
		expect(await screen.findByText('London, UK')).toBeTruthy();
	});

	it('shows new device badge', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('New device')).toBeTruthy();
	});

	it('shows new location badge', async () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(await screen.findByText('New location')).toBeTruthy();
	});

	it('renders filter controls when showFilters=true', () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts', showFilters: true }
		});
		expect(screen.getByLabelText('Status')).toBeTruthy();
		expect(screen.getByLabelText('From')).toBeTruthy();
		expect(screen.getByLabelText('To')).toBeTruthy();
	});

	it('hides filter controls when showFilters=false', () => {
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts', showFilters: false }
		});
		expect(screen.queryByLabelText('Status')).toBeNull();
	});

	it('shows error message when fetch fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				json: () => Promise.resolve({ error: 'Server error' })
			})
		);
		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		expect(
			await screen.findByText('Failed to load login history. Please try again.')
		).toBeTruthy();
	});

	it('calls fetch with the provided fetchUrl', async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockLoginAttempts)
		});
		vi.stubGlobal('fetch', fetchMock);

		render(LoginAttemptList, {
			props: { fetchUrl: '/api/audit/login-attempts' }
		});
		await screen.findByText('Successful login');
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/audit/login-attempts')
		);
	});
});
