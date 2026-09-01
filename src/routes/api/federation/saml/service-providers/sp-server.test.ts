import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	listServiceProviders: vi.fn(),
	createServiceProvider: vi.fn()
}));

import { GET, POST } from './+server';
import { createServiceProvider, listServiceProviders } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/saml/service-providers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/federation/saml/service-providers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listServiceProviders).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/federation/saml/service-providers')
		} as any);
		expect(response.status).toBe(200);
		expect(listServiceProviders).toHaveBeenCalled();
	});
});

describe('POST /api/federation/saml/service-providers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a service provider with required fields', async () => {
		vi.mocked(createServiceProvider).mockResolvedValue({ id: 'sp1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'app',
					entity_id: 'https://ex',
					acs_urls: ['https://ex/acs']
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createServiceProvider).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createServiceProvider).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ entity_id: 'https://ex', acs_urls: ['https://ex/acs'] })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createServiceProvider).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createServiceProvider).mockResolvedValue({ id: 'sp1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'app',
					entity_id: 'https://ex',
					acs_urls: ['https://ex/acs']
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createServiceProvider).toHaveBeenCalled();
	});

	it('rejects NaN assertion_validity_seconds instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'app',
						entity_id: 'https://ex',
						acs_urls: ['https://ex/acs'],
						assertion_validity_seconds: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createServiceProvider).not.toHaveBeenCalled();
	});
});
