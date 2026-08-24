import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	listIdentityCorrelationRules: vi.fn(),
	createIdentityCorrelationRule: vi.fn()
}));

import { POST } from './+server';
import { createIdentityCorrelationRule } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/correlation/identity-rules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/correlation/identity-rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a rule with required fields', async () => {
		vi.mocked(createIdentityCorrelationRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'email',
					attribute: 'email',
					match_type: 'exact',
					threshold: 1,
					weight: 1,
					priority: 1
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createIdentityCorrelationRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createIdentityCorrelationRule).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						attribute: 'email',
						match_type: 'exact',
						threshold: 1,
						weight: 1,
						priority: 1
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createIdentityCorrelationRule).not.toHaveBeenCalled();
	});
});
