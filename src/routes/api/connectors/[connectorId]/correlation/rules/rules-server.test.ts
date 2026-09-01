import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	listCorrelationRules: vi.fn(),
	createCorrelationRule: vi.fn()
}));

import { POST } from './+server';
import { createCorrelationRule } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { connectorId: 'conn-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/conn-1/correlation/rules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/connectors/:connectorId/correlation/rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a rule with required fields', async () => {
		vi.mocked(createCorrelationRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					source_attribute: 'email',
					target_attribute: 'mail',
					match_type: 'exact',
					threshold: 1,
					weight: 1,
					tier: 1,
					is_definitive: true,
					normalize: true,
					priority: 1
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createCorrelationRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createCorrelationRule).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ match_type: 'exact' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createCorrelationRule).not.toHaveBeenCalled();
	});

	it('rejects NaN threshold instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'n',
						source_attribute: 'email',
						target_attribute: 'mail',
						match_type: 'exact',
						threshold: Number.NaN,
						weight: 1,
						tier: 1,
						is_definitive: true,
						normalize: true,
						priority: 1
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createCorrelationRule).not.toHaveBeenCalled();
	});
});
