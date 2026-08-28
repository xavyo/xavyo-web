import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/licenses', () => ({
	getLicenseAssignment: vi.fn(),
	deallocateLicenseAssignment: vi.fn()
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

import { DELETE } from './+server';
import { deallocateLicenseAssignment } from '$lib/api/licenses';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('DELETE /api/governance/licenses/assignments/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deallocateLicenseAssignment).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'a1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deallocateLicenseAssignment).toHaveBeenCalledWith(
			'a1',
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
