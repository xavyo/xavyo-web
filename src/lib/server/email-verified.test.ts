import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/me', () => ({
	getProfile: vi.fn()
}));

import { getProfile } from '$lib/api/me';
import { currentUserEmailVerified } from './email-verified';

describe('currentUserEmailVerified', () => {
	const fetchFn = vi.fn() as unknown as typeof fetch;

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns verified from GET /me/profile', async () => {
		vi.mocked(getProfile).mockResolvedValue({
			id: 'u1',
			email: 'admin@acme.com',
			display_name: null,
			first_name: null,
			last_name: null,
			avatar_url: null,
			email_verified: true,
			created_at: '2026-01-01T00:00:00Z'
		});

		const result = await currentUserEmailVerified(
			{ accessToken: 'tok', tenantId: 'tid', user: { email: 'stale@acme.com' } },
			fetchFn
		);

		expect(result).toEqual({ emailVerified: true, email: 'admin@acme.com' });
		expect(getProfile).toHaveBeenCalledWith('tok', 'tid', fetchFn);
	});

	it('returns unverified when profile says so', async () => {
		vi.mocked(getProfile).mockResolvedValue({
			id: 'u1',
			email: 'admin@acme.com',
			display_name: null,
			first_name: null,
			last_name: null,
			avatar_url: null,
			email_verified: false,
			created_at: '2026-01-01T00:00:00Z'
		});

		const result = await currentUserEmailVerified(
			{ accessToken: 'tok', tenantId: 'tid', user: { email: 'admin@acme.com' } },
			fetchFn
		);

		expect(result).toEqual({ emailVerified: false, email: 'admin@acme.com' });
	});

	it('fails closed when the profile request throws', async () => {
		vi.mocked(getProfile).mockRejectedValue(new Error('down'));

		const result = await currentUserEmailVerified(
			{ accessToken: 'tok', tenantId: 'tid', user: { email: 'admin@acme.com' } },
			fetchFn
		);

		expect(result).toEqual({ emailVerified: false, email: 'admin@acme.com' });
	});

	it('fails closed without a session token', async () => {
		const result = await currentUserEmailVerified({ user: { email: 'admin@acme.com' } }, fetchFn);
		expect(result).toEqual({ emailVerified: false, email: 'admin@acme.com' });
		expect(getProfile).not.toHaveBeenCalled();
	});
});
