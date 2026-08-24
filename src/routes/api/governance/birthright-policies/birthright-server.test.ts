import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/birthright', () => ({
	listBirthrightPolicies: vi.fn(),
	createBirthrightPolicy: vi.fn()
}));

import { POST } from './+server';
import { createBirthrightPolicy } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/birthright-policies', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/birthright-policies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a policy with required fields', async () => {
		vi.mocked(createBirthrightPolicy).mockResolvedValue({ id: 'b1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					priority: 1,
					conditions: [{ attribute: 'dept', operator: 'equals', value: 'eng' }],
					entitlement_ids: ['e1']
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createBirthrightPolicy).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createBirthrightPolicy).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						priority: 1,
						conditions: [{ attribute: 'dept', operator: 'equals', value: 'eng' }],
						entitlement_ids: ['e1']
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createBirthrightPolicy).not.toHaveBeenCalled();
	});
});
