import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signupTenant, getTenantSettings } from './tenants';

vi.mock('./client', () => ({
	apiClient: vi.fn()
}));

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('tenants API', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls POST /tenants/signup without a JWT or system tenant header', async () => {
		const body = {
			organization_name: 'Acme Corp',
			email: 'pascal@acme.com',
			password: 'a-long-unique-pass'
		};
		const response = {
			tenant: { id: 't1', slug: 'acme-corp', name: 'Acme Corp' },
			admin: { id: 'u1', email: 'pascal@acme.com', email_verified: false },
			verification_email_sent: true
		};
		mockApiClient.mockResolvedValue(response);

		const result = await signupTenant(body, mockFetch);

		expect(mockApiClient).toHaveBeenCalledWith('/tenants/signup', {
			method: 'POST',
			body,
			fetch: mockFetch
		});
		expect(result).toEqual(response);
		expect(JSON.stringify(mockApiClient.mock.calls[0][1])).not.toContain(
			'00000000-0000-0000-0000-000000000001'
		);
	});
});


describe('getTenantSettings', () => {
	it('calls GET /tenants/:id/settings with token and tenant header', async () => {
		mockApiClient.mockResolvedValueOnce({
			tenant_id: 't1',
			settings: { plan: 'free' }
		});
		const result = await getTenantSettings('t1', 'tok', fetch);
		expect(mockApiClient).toHaveBeenCalledWith('/tenants/t1/settings', {
			method: 'GET',
			token: 'tok',
			tenantId: 't1',
			fetch
		});
		expect(result.settings.plan).toBe('free');
	});
});
