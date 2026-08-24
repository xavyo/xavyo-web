import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	listLicenseIncompatibilities: vi.fn(),
	createLicenseIncompatibility: vi.fn()
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
import { createLicenseIncompatibility } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/incompatibilities', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/licenses/incompatibilities', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates an incompatibility with required fields', async () => {
		vi.mocked(createLicenseIncompatibility).mockResolvedValue({ id: 'i1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({ pool_a_id: 'p1', pool_b_id: 'p2', reason: 'overlapping SKUs' })
			) as any
		);
		expect(response.status).toBe(201);
		expect(createLicenseIncompatibility).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createLicenseIncompatibility).not.toHaveBeenCalled();
	});

	it('does not create when reason is missing', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ pool_a_id: 'p1', pool_b_id: 'p2' })) as any
		);
		expect(response.status).toBe(400);
		expect(createLicenseIncompatibility).not.toHaveBeenCalled();
	});
});
