import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/scim', () => ({
	listScimMappings: vi.fn(),
	updateScimMappings: vi.fn()
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

import { GET, PUT } from './+server';
import { listScimMappings, updateScimMappings } from '$lib/api/scim';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/scim/mappings', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/admin/scim/mappings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listScimMappings).mockResolvedValue([] as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(listScimMappings).toHaveBeenCalled();
	});
});

describe('PUT /api/admin/scim/mappings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates mappings with required fields', async () => {
		vi.mocked(updateScimMappings).mockResolvedValue([] as any);
		const response = await PUT(
			makeEvent(
				JSON.stringify({
					mappings: [
						{ scim_path: 'userName', xavyo_field: 'email', transform: null, required: true }
					]
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(updateScimMappings).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		const response = await PUT(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(updateScimMappings).not.toHaveBeenCalled();
	});

	it('does not update when mappings is missing', async () => {
		const response = await PUT(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(updateScimMappings).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateScimMappings).mockResolvedValue([] as any);
		const response = await PUT(
			makeEvent(
				JSON.stringify({
					mappings: [
						{ scim_path: 'userName', xavyo_field: 'email', transform: null, required: true }
					]
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(updateScimMappings).toHaveBeenCalled();
	});
});
