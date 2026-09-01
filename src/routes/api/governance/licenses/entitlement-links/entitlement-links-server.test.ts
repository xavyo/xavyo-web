import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	listLicenseEntitlementLinks: vi.fn(),
	createLicenseEntitlementLink: vi.fn()
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

import { POST } from './+server';
import { createLicenseEntitlementLink } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/entitlement-links', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/licenses/entitlement-links', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a link with required fields', async () => {
		vi.mocked(createLicenseEntitlementLink).mockResolvedValue({ id: 'l1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ license_pool_id: 'p1', entitlement_id: 'e1' })) as any
		);
		expect(response.status).toBe(201);
		expect(createLicenseEntitlementLink).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createLicenseEntitlementLink).not.toHaveBeenCalled();
	});

	it('does not create when entitlement_id is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({ license_pool_id: 'p1' })) as any);
		expect(response.status).toBe(400);
		expect(createLicenseEntitlementLink).not.toHaveBeenCalled();
	});

	it('rejects NaN priority instead of forwarding it', async () => {
		const response = await POST(
			makeEvent(
				JSON.stringify({ license_pool_id: 'p1', entitlement_id: 'e1', priority: Number.NaN })
			) as any
		);
		expect(response.status).toBe(400);
		expect(createLicenseEntitlementLink).not.toHaveBeenCalled();
	});
});
