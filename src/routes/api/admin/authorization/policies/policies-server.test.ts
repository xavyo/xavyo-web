import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/authorization', () => ({
	listPolicies: vi.fn(),
	createPolicy: vi.fn()
}));

import { GET, POST } from './+server';
import { createPolicy, listPolicies } from '$lib/api/authorization';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/admin/authorization/policies', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/admin/authorization/policies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listPolicies).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/admin/authorization/policies?limit=abc&offset=nope')
		} as any);
		expect(listPolicies).toHaveBeenCalledWith(
			{ limit: undefined, offset: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/admin/authorization/policies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a policy with name and effect', async () => {
		vi.mocked(createPolicy).mockResolvedValue({ id: 'p1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'n', effect: 'allow' })) as any);
		expect(response.status).toBe(201);
		expect(createPolicy).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createPolicy).not.toHaveBeenCalled();
	});

	it('does not create when effect is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ name: 'n' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createPolicy).not.toHaveBeenCalled();
	});

	it('rejects NaN priority instead of forwarding it', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'n', effect: 'allow', priority: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createPolicy).not.toHaveBeenCalled();
	});
});
