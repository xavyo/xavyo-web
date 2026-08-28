import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	listDomains: vi.fn(),
	addDomain: vi.fn()
}));

import { GET, POST } from './+server';
import { addDomain, listDomains } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'idp-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/identity-providers/idp-1/domains', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/federation/identity-providers/:id/domains', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listDomains).mockResolvedValue({ items: [] } as any);
		const response = await GET({
			params: { id: 'idp-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(listDomains).toHaveBeenCalledWith('idp-1', TOKEN, TENANT, expect.any(Function));
	});
});

describe('POST /api/federation/identity-providers/:id/domains', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('adds a domain with required fields', async () => {
		vi.mocked(addDomain).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ domain: 'ex.com', priority: 1 })) as any);
		expect(response.status).toBe(201);
		expect(addDomain).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addDomain).not.toHaveBeenCalled();
	});

	it('does not add when domain is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ priority: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(addDomain).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(addDomain).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ domain: 'ex.com', priority: 1 })) as any);
		expect(response.status).toBe(201);
		expect(addDomain).toHaveBeenCalled();
	});
});
