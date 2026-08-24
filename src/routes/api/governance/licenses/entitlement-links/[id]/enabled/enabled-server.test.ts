import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	toggleLicenseEntitlementLink: vi.fn()
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

import { PUT } from './+server';
import { toggleLicenseEntitlementLink } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'l1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/entitlement-links/l1/enabled', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/licenses/entitlement-links/:id/enabled', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('toggles with required fields', async () => {
		vi.mocked(toggleLicenseEntitlementLink).mockResolvedValue({ id: 'l1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ enabled: true })) as any);
		expect(response.status).toBe(200);
		expect(toggleLicenseEntitlementLink).toHaveBeenCalledWith(
			'l1',
			true,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not toggle on invalid JSON', async () => {
		const response = await PUT(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(toggleLicenseEntitlementLink).not.toHaveBeenCalled();
	});

	it('does not toggle when enabled is missing', async () => {
		const response = await PUT(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(toggleLicenseEntitlementLink).not.toHaveBeenCalled();
	});
});
