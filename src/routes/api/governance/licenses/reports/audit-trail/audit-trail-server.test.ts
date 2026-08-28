import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/licenses', () => ({
	getLicenseAuditTrail: vi.fn()
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
import { getLicenseAuditTrail } from '$lib/api/licenses';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/licenses/reports/audit-trail', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(getLicenseAuditTrail).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/licenses/reports/audit-trail?limit=abc&offset=nope'
			)
		} as any);
		expect(getLicenseAuditTrail).toHaveBeenCalledWith(
			{},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
