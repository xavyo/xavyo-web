import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	listTriggerRules: vi.fn(),
	createTriggerRule: vi.fn()
}));

import { POST } from './+server';
import { createTriggerRule } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/triggers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/micro-certifications/triggers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a trigger with required fields', async () => {
		vi.mocked(createTriggerRule).mockResolvedValue({ id: 'tr1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'high risk',
					trigger_type: 'high_risk_assignment',
					scope_type: 'tenant',
					reviewer_type: 'user_manager'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createTriggerRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createTriggerRule).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						trigger_type: 'high_risk_assignment',
						scope_type: 'tenant',
						reviewer_type: 'user_manager'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTriggerRule).not.toHaveBeenCalled();
	});
});
