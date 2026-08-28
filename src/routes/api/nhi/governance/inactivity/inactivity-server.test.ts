import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-governance', () => ({
	getStalenessReport: vi.fn()
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
import { getStalenessReport } from '$lib/api/nhi-governance';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/governance/inactivity', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin self-service user', async () => {
		vi.mocked(getStalenessReport).mockResolvedValue({ items: [] } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/governance/inactivity')
		} as any);
		expect(response.status).toBe(200);
		expect(getStalenessReport).toHaveBeenCalled();
	});

	it('does not forward NaN min_inactive_days', async () => {
		vi.mocked(getStalenessReport).mockResolvedValue({ items: [] } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/governance/inactivity?min_inactive_days=abc')
		} as any);
		expect(getStalenessReport).toHaveBeenCalledWith(
			TOKEN,
			TENANT,
			expect.any(Function),
			undefined
		);
	});
});
