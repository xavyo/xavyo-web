import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/scim', () => ({
	listScimTokens: vi.fn(),
	createScimToken: vi.fn()
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
import { createScimToken, listScimTokens } from '$lib/api/scim';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/scim/tokens', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/admin/scim/tokens', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listScimTokens).mockResolvedValue([] as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(listScimTokens).toHaveBeenCalled();
	});
});

describe('POST /api/admin/scim/tokens', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a token with required fields', async () => {
		vi.mocked(createScimToken).mockResolvedValue({ id: 'tok-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Okta' })) as any);
		expect(response.status).toBe(201);
		expect(createScimToken).toHaveBeenCalledWith('Okta', TOKEN, TENANT, expect.any(Function));
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createScimToken).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(createScimToken).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createScimToken).mockResolvedValue({ id: 'tok-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Okta' })) as any);
		expect(response.status).toBe(201);
		expect(createScimToken).toHaveBeenCalled();
	});
});
