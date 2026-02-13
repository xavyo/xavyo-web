import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import ActivityTimeline from './activity-timeline.svelte';
import type { CursorPaginatedResponse, LoginAttempt } from '$lib/api/types';

const mockLoginAttempts: CursorPaginatedResponse<LoginAttempt> = {
	items: [
		{
			id: 'attempt-1',
			user_id: 'user-abc',
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
		}
	],
	total: 1,
	next_cursor: null
};

describe('ActivityTimeline', () => {
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

	it('renders with userId prop', () => {
		const { container } = render(ActivityTimeline, {
			props: { userId: 'user-abc' }
		});
		// The component renders a LoginAttemptList wrapper, so it should produce a DOM node
		expect(container.innerHTML).toBeTruthy();
	});

	it('passes userId as extraParams to inner LoginAttemptList', () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockLoginAttempts)
		});
		vi.stubGlobal('fetch', fetchMock);

		render(ActivityTimeline, {
			props: { userId: 'user-abc' }
		});

		// The component passes user_id in extraParams, which gets appended to the fetch URL
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('user_id=user-abc')
		);
	});

	it('uses fetchUrl /api/audit/admin/login-attempts', () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockLoginAttempts)
		});
		vi.stubGlobal('fetch', fetchMock);

		render(ActivityTimeline, {
			props: { userId: 'user-abc' }
		});

		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('/api/audit/admin/login-attempts')
		);
	});

	it('does not show filters (showFilters=false)', () => {
		const { container } = render(ActivityTimeline, {
			props: { userId: 'user-abc' }
		});
		// Should not have date inputs (filters are hidden)
		const dateInputs = container.querySelectorAll('input[type="date"]');
		expect(dateInputs.length).toBe(0);
	});

	it('accepts maxItems prop', () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(mockLoginAttempts)
		});
		vi.stubGlobal('fetch', fetchMock);

		render(ActivityTimeline, {
			props: { userId: 'user-abc', maxItems: 5 }
		});

		// The limit param should be 5 (from maxItems)
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining('limit=5')
		);
	});
});
