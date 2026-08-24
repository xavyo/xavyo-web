import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	listEscalationPolicies: vi.fn(),
	createEscalationPolicy: vi.fn()
}));

import { POST } from './+server';
import { createEscalationPolicy } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/escalation-policies', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/escalation-policies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a policy with required fields', async () => {
		vi.mocked(createEscalationPolicy).mockResolvedValue({ id: 'e1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					default_timeout_secs: 3600,
					final_fallback: 'escalate_admin'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createEscalationPolicy).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createEscalationPolicy).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ default_timeout_secs: 1, final_fallback: 'auto_approve' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createEscalationPolicy).not.toHaveBeenCalled();
	});
});
