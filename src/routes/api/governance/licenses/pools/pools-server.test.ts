import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	listLicensePools: vi.fn(),
	createLicensePool: vi.fn()
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

import { GET, POST } from './+server';
import { createLicensePool, listLicensePools } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/licenses/pools', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listLicensePools).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/licenses/pools?limit=abc&offset=nope')
		} as any);
		expect(listLicensePools).toHaveBeenCalledWith(
			{},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/pools', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/licenses/pools', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a pool with required fields', async () => {
		vi.mocked(createLicensePool).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'Office',
					vendor: 'Microsoft',
					total_capacity: 100,
					billing_period: 'annual'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createLicensePool).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createLicensePool).not.toHaveBeenCalled();
	});

	it('does not create when billing_period is invalid', async () => {
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'Office',
					vendor: 'Microsoft',
					total_capacity: 100,
					billing_period: 'weekly'
				})
			) as any
		);
		expect(response.status).toBe(400);
		expect(createLicensePool).not.toHaveBeenCalled();
	});
});
