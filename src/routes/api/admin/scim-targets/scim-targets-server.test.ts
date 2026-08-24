import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/scim-targets', () => ({
	listScimTargets: vi.fn(),
	createScimTarget: vi.fn()
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
import { createScimTarget } from '$lib/api/scim-targets';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/scim-targets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/admin/scim-targets', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a target with required fields', async () => {
		vi.mocked(createScimTarget).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					base_url: 'https://ex',
					auth_method: 'bearer',
					credentials: { token: 't' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createScimTarget).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createScimTarget).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ base_url: 'https://ex', auth_method: 'bearer', credentials: {} })) as any
		);
		expect(response.status).toBe(400);
		expect(createScimTarget).not.toHaveBeenCalled();
	});
});
