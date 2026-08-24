import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	manualTriggerCertification: vi.fn()
}));

import { POST } from './+server';
import { manualTriggerCertification } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/trigger', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/micro-certifications/trigger', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('triggers with required fields', async () => {
		vi.mocked(manualTriggerCertification).mockResolvedValue({ id: 'mc-1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({ user_id: 'u1', entitlement_id: 'e1', reason: 'review' })
			) as any
		);
		expect(response.status).toBe(201);
		expect(manualTriggerCertification).toHaveBeenCalled();
	});

	it('does not trigger on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(manualTriggerCertification).not.toHaveBeenCalled();
	});

	it('does not trigger when user_id is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ entitlement_id: 'e1', reason: 'review' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(manualTriggerCertification).not.toHaveBeenCalled();
	});
});
