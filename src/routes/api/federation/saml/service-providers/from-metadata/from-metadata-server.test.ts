import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
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
		request: new Request('http://localhost/api/federation/saml/service-providers/from-metadata', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/federation/saml/service-providers/from-metadata', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a service provider from metadata XML', async () => {
		vi.mocked(createServiceProvider).mockResolvedValue({ id: 'sp1' } as any);
		const xml =
			'<EntityDescriptor entityID="https://ex"><SPSSODescriptor><AssertionConsumerService Location="https://ex/acs"/></SPSSODescriptor></EntityDescriptor>';
		const response = await POST(makeEvent(JSON.stringify({ metadata_xml: xml })) as any);
		expect(response.status).toBe(201);
		expect(createServiceProvider).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createServiceProvider).not.toHaveBeenCalled();
	});

	it('does not create when metadata is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(createServiceProvider).not.toHaveBeenCalled();
	});
});
