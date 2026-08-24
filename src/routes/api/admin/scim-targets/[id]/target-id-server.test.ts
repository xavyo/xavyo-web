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

import { PUT } from './+server';
import { updateScimTarget } from '$lib/api/scim-targets';
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
});
