import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	listServiceProviders: vi.fn(),
	createServiceProvider: vi.fn()
}));

import { POST } from './+server';
import { createServiceProvider } from '$lib/api/federation';
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
});
