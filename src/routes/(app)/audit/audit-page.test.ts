import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import AuditPage from './+page.svelte';

const mockStats = {
	total_attempts: 150,
	successful_attempts: 120,
	failed_attempts: 30,
	success_rate: 80.0,
	failure_reasons: [
		{ reason: 'Invalid password', count: 20 },
		{ reason: 'Account locked', count: 10 }
	],
	hourly_distribution: [],
	unique_users: 45,
	new_device_logins: 8,
	new_location_logins: 3
};

const mockLoginAttempts = {
	items: [
		{
			id: 'attempt-1',
			user_id: 'user-1',
			email: 'admin@example.com',
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
		}
	],
	total: 1,
	next_cursor: null
};

describe('Audit Page', () => {
	beforeEach(() => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation((url: string) => {
				if (url.includes('/api/audit/admin/stats')) {
					return Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockStats)
					});
				}
				// Login attempts list
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockLoginAttempts)
				});
			})
		);
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders PageHeader with "Audit Dashboard" title', () => {
		render(AuditPage);
		expect(screen.getByText('Audit Dashboard')).toBeTruthy();
	});

	it('renders description text', () => {
		render(AuditPage);
		expect(screen.getByText('Tenant-wide login activity and security statistics')).toBeTruthy();
	});

	it('shows stats panel area after data loads', async () => {
		render(AuditPage);
		// StatsPanel shows stat cards once stats load
		expect(await screen.findByText('Total Attempts')).toBeTruthy();
		expect(await screen.findByText('150')).toBeTruthy();
		// "Successful" appears in both StatsPanel and filter <select>
		const successfulElements = await screen.findAllByText('Successful');
		expect(successfulElements.length).toBeGreaterThanOrEqual(1);
		expect(await screen.findByText('120')).toBeTruthy();
		// "Failed" also appears in both StatsPanel and filter <select>
		const failedElements = await screen.findAllByText('Failed');
		expect(failedElements.length).toBeGreaterThanOrEqual(1);
		expect(await screen.findByText('30')).toBeTruthy();
	});

	it('shows login attempts section heading', () => {
		render(AuditPage);
		expect(screen.getByText('Login Attempts')).toBeTruthy();
	});

	it('shows login attempt entries after fetch', async () => {
		render(AuditPage);
		expect(await screen.findByText('Successful login')).toBeTruthy();
	});

	it('shows loading skeleton initially', () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockReturnValue(new Promise(() => {}))
		);
		const { container } = render(AuditPage);
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('shows stats error when stats fetch fails', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation((url: string) => {
				if (url.includes('/api/audit/admin/stats')) {
					return Promise.resolve({
						ok: false,
						json: () => Promise.resolve({ error: 'Forbidden' })
					});
				}
				return Promise.resolve({
					ok: true,
					json: () => Promise.resolve(mockLoginAttempts)
				});
			})
		);
		render(AuditPage);
		expect(
			await screen.findByText('Failed to load statistics. Please try again.')
		).toBeTruthy();
	});

	it('shows admin filters (email, method) for login attempts', () => {
		render(AuditPage);
		// The audit page passes showAdminFilters=true to LoginAttemptList
		expect(screen.getByLabelText('Email')).toBeTruthy();
		expect(screen.getByLabelText('Method')).toBeTruthy();
	});
});
