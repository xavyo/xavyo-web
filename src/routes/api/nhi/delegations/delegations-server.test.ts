import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-delegations', () => ({
	listDelegationGrants: vi.fn(),
	createDelegationGrant: vi.fn()
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
import { createDelegationGrant } from '$lib/api/nhi-delegations';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/delegations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/delegations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a grant with required fields', async () => {
		vi.mocked(createDelegationGrant).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					principal_id: 'u1',
					principal_type: 'user',
					actor_nhi_id: 'n1',
					allowed_scopes: ['read'],
					allowed_resource_types: ['tool']
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createDelegationGrant).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createDelegationGrant).not.toHaveBeenCalled();
	});

	it('does not create when principal_id is missing', async () => {
		const response = await POST(
			makeEvent(
				JSON.stringify({
					principal_type: 'user',
					actor_nhi_id: 'n1',
					allowed_scopes: ['read'],
					allowed_resource_types: ['tool']
				})
			) as any
		);
		expect(response.status).toBe(400);
		expect(createDelegationGrant).not.toHaveBeenCalled();
	});
});
