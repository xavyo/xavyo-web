import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/licenses', () => ({
	getExpiringLicensePools: vi.fn()
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
import { getExpiringLicensePools } from '$lib/api/licenses';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/licenses/analytics/expiring', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN within_days', async () => {
		vi.mocked(getExpiringLicensePools).mockResolvedValue({ items: [] } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/licenses/analytics/expiring?within_days=abc')
		} as any);
		expect(getExpiringLicensePools).toHaveBeenCalledWith(
			undefined,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
