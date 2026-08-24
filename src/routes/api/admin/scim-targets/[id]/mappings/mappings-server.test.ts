import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/scim-targets', () => ({
	listScimTargetMappings: vi.fn(),
	replaceScimTargetMappings: vi.fn()
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
import { replaceScimTargetMappings } from '$lib/api/scim-targets';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/scim-targets/s1/mappings', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/admin/scim-targets/:id/mappings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('replaces mappings with required fields', async () => {
		vi.mocked(replaceScimTargetMappings).mockResolvedValue({ mappings: [], total_count: 0 } as any);
		const response = await PUT(
			makeEvent(
				JSON.stringify({
					mappings: [
						{
							source_field: 'email',
							target_scim_path: 'userName',
							mapping_type: 'direct',
							resource_type: 'User'
						}
					]
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(replaceScimTargetMappings).toHaveBeenCalled();
	});

	it('does not replace on invalid JSON', async () => {
		const response = await PUT(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(replaceScimTargetMappings).not.toHaveBeenCalled();
	});

	it('does not replace when mappings is missing', async () => {
		const response = await PUT(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(replaceScimTargetMappings).not.toHaveBeenCalled();
	});
});
