import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	listSodRules: vi.fn(),
	createSodRule: vi.fn()
}));

import { GET, POST } from './+server';
import { createSodRule, listSodRules } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/sod-rules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/sod-rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listSodRules).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/sod-rules?page=2&page_size=10')
		} as any);
		expect(listSodRules).toHaveBeenCalledWith(
			{
				status: undefined,
				severity: undefined,
				entitlement_id: undefined,
				limit: 10,
				offset: 10
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/sod-rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a rule with required fields', async () => {
		vi.mocked(createSodRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					first_entitlement_id: 'e1',
					second_entitlement_id: 'e2',
					severity: 'high'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSodRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createSodRule).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ severity: 'high' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createSodRule).not.toHaveBeenCalled();
	});
});
