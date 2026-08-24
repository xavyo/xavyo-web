import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	validateExpression: vi.fn()
}));

import { POST } from './+server';
import { validateExpression } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { connectorId: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/connectors/c1/correlation/rules/validate-expression',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/connectors/:connectorId/correlation/rules/validate-expression', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('validates with required fields', async () => {
		vi.mocked(validateExpression).mockResolvedValue({ valid: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ expression: 'eq(email)' })) as any);
		expect(response.status).toBe(200);
		expect(validateExpression).toHaveBeenCalled();
	});

	it('does not validate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(validateExpression).not.toHaveBeenCalled();
	});

	it('does not validate when expression is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(validateExpression).not.toHaveBeenCalled();
	});
});
