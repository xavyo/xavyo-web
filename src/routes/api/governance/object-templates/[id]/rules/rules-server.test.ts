import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/object-templates', () => ({
	listTemplateRules: vi.fn(),
	createTemplateRule: vi.fn()
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
import { createTemplateRule } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/object-templates/t1/rules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/object-templates/:id/rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a rule with required fields', async () => {
		vi.mocked(createTemplateRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					rule_type: 'default',
					target_attribute: 'department',
					expression: "'Engineering'"
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createTemplateRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createTemplateRule).not.toHaveBeenCalled();
	});

	it('does not create when expression is missing', async () => {
		await expect(
			POST(
				makeEvent(JSON.stringify({ rule_type: 'default', target_attribute: 'department' })) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTemplateRule).not.toHaveBeenCalled();
	});
});
