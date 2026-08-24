import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	getCorrelationRule: vi.fn(),
	updateCorrelationRule: vi.fn(),
	deleteCorrelationRule: vi.fn()
}));

import { PATCH } from './+server';
import { updateCorrelationRule } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { connectorId: 'conn-1', id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/conn-1/correlation/rules/r1', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PATCH /api/connectors/:connectorId/correlation/rules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a rule with known fields', async () => {
		vi.mocked(updateCorrelationRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ name: 'n', is_active: false })) as any);
		expect(response.status).toBe(200);
		expect(updateCorrelationRule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PATCH(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateCorrelationRule).not.toHaveBeenCalled();
	});

	it('does not update when match_type is invalid', async () => {
		await expect(PATCH(makeEvent(JSON.stringify({ match_type: 'regex' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateCorrelationRule).not.toHaveBeenCalled();
	});
});
