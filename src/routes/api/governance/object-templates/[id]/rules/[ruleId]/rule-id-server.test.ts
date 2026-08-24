import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/object-templates', () => ({
	updateTemplateRule: vi.fn(),
	deleteTemplateRule: vi.fn()
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
import { updateTemplateRule } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1', ruleId: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/object-templates/t1/rules/r1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/object-templates/:id/rules/:ruleId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a rule with known fields', async () => {
		vi.mocked(updateTemplateRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ expression: 'source.dept' })) as any);
		expect(response.status).toBe(200);
		expect(updateTemplateRule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateTemplateRule).not.toHaveBeenCalled();
	});

	it('does not update when expression is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ expression: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateTemplateRule).not.toHaveBeenCalled();
	});
});
