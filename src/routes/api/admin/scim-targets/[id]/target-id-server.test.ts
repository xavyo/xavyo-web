import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/scim-targets', () => ({
	getScimTarget: vi.fn(),
	updateScimTarget: vi.fn(),
	deleteScimTarget: vi.fn()
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

import { DELETE, GET, PUT } from './+server';
import { deleteScimTarget, getScimTarget, updateScimTarget } from '$lib/api/scim-targets';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/scim-targets/s1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/admin/scim-targets/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getScimTarget).mockResolvedValue({ id: 's1', name: 'Okta' } as any);
		const response = await GET({
			params: { id: 's1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getScimTarget).toHaveBeenCalled();
	});
});

describe('PUT /api/admin/scim-targets/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a target with known fields', async () => {
		vi.mocked(updateScimTarget).mockResolvedValue({ id: 's1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n' })) as any);
		expect(response.status).toBe(200);
		expect(updateScimTarget).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		const response = await PUT(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(updateScimTarget).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ name: '' })) as any);
		expect(response.status).toBe(400);
		expect(updateScimTarget).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateScimTarget).mockResolvedValue({ id: 's1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n' })) as any);
		expect(response.status).toBe(200);
		expect(updateScimTarget).toHaveBeenCalled();
	});

	it('rejects NaN rate_limit_per_minute instead of forwarding it', async () => {
		const response = await PUT(
			makeEvent(JSON.stringify({ rate_limit_per_minute: Number.NaN })) as any
		);
		expect(response.status).toBe(400);
		expect(updateScimTarget).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/admin/scim-targets/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(deleteScimTarget).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 's1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteScimTarget).toHaveBeenCalled();
	});
});
