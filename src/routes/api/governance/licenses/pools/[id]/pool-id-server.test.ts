import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	getLicensePool: vi.fn(),
	updateLicensePool: vi.fn(),
	deleteLicensePool: vi.fn()
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

import { PUT, DELETE } from './+server';
import { updateLicensePool, deleteLicensePool } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/pools/p1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/licenses/pools/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a pool with known fields', async () => {
		vi.mocked(updateLicensePool).mockResolvedValue({ id: 'p1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Office 365' })) as any);
		expect(response.status).toBe(200);
		expect(updateLicensePool).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		const response = await PUT(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(updateLicensePool).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ name: '' })) as any);
		expect(response.status).toBe(400);
		expect(updateLicensePool).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateLicensePool).mockResolvedValue({ id: 'p1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Office 365' })) as any);
		expect(response.status).toBe(200);
		expect(updateLicensePool).toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/licenses/pools/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteLicensePool).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'p1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteLicensePool).toHaveBeenCalledWith('p1', TOKEN, TENANT, expect.any(Function));
	});
});
