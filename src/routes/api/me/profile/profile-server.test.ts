import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/me', () => ({
	getProfile: vi.fn(),
	updateProfile: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { GET } from './+server';
import { getProfile } from '$lib/api/me';
import { ApiError } from '$lib/api/client';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(overrides: Record<string, unknown> = {}) {
	return {
		locals: {
			accessToken: TOKEN,
			tenantId: TENANT,
			user: { id: 'user-1', email: 'user@example.com', roles: ['user'] }
		},
		fetch: vi.fn(),
		...overrides
	};
}

describe('GET /api/me/profile', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns the profile when the API succeeds', async () => {
		const profile = { id: 'user-1', email: 'user@example.com', display_name: 'Ada' };
		vi.mocked(getProfile).mockResolvedValue(profile as any);

		const response = await GET(makeEvent() as any);
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual(profile);
	});

	it('returns a JWT fallback on 404', async () => {
		vi.mocked(getProfile).mockRejectedValue(new ApiError('Not found', 404));

		const response = await GET(makeEvent() as any);
		expect(response.status).toBe(200);
		const body = await response.json();
		expect(body.id).toBe('user-1');
		expect(body.email).toBe('user@example.com');
		expect(body.display_name).toBeNull();
	});

	it('fails closed on 500', async () => {
		vi.mocked(getProfile).mockRejectedValue(new ApiError('boom', 500));

		await expect(GET(makeEvent() as any)).rejects.toMatchObject({ status: 500 });
	});
});
