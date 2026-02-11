import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('federation-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- OIDC Identity Providers ---

	describe('listIdentityProviders', () => {
		it('fetches from /api/federation/identity-providers with no params', async () => {
			const data = { items: [], total: 0, offset: 0, limit: 20 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listIdentityProviders } = await import('./federation-client');

			const result = await listIdentityProviders({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/identity-providers');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { listIdentityProviders } = await import('./federation-client');

			await listIdentityProviders({ offset: 10, limit: 5, is_enabled: true }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/federation/identity-providers?');
			expect(calledUrl).toContain('offset=10');
			expect(calledUrl).toContain('limit=5');
			expect(calledUrl).toContain('is_enabled=true');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { listIdentityProviders } = await import('./federation-client');

			await expect(listIdentityProviders({}, mockFetch)).rejects.toThrow(
				'Failed to fetch identity providers: 500'
			);
		});
	});

	describe('getIdentityProvider', () => {
		it('fetches from /api/federation/identity-providers/:id', async () => {
			const data = { id: 'idp-1', name: 'Okta' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { getIdentityProvider } = await import('./federation-client');

			const result = await getIdentityProvider('idp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/identity-providers/idp-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { getIdentityProvider } = await import('./federation-client');

			await expect(getIdentityProvider('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch identity provider: 404'
			);
		});
	});

	describe('validateIdentityProvider', () => {
		it('sends POST to /api/federation/identity-providers/:id/validate', async () => {
			const data = { valid: true, errors: [], warnings: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { validateIdentityProvider } = await import('./federation-client');

			const result = await validateIdentityProvider('idp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/federation/identity-providers/idp-1/validate',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { validateIdentityProvider } = await import('./federation-client');

			await expect(validateIdentityProvider('idp-1', mockFetch)).rejects.toThrow(
				'Failed to validate identity provider: 422'
			);
		});
	});

	describe('toggleIdentityProvider', () => {
		it('sends POST to /api/federation/identity-providers/:id/toggle with body', async () => {
			const data = { id: 'idp-1', is_enabled: true };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { toggleIdentityProvider } = await import('./federation-client');

			const result = await toggleIdentityProvider('idp-1', true, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/federation/identity-providers/idp-1/toggle',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ is_enabled: true })
				}
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { toggleIdentityProvider } = await import('./federation-client');

			await expect(toggleIdentityProvider('idp-1', false, mockFetch)).rejects.toThrow(
				'Failed to toggle identity provider: 400'
			);
		});
	});

	// --- OIDC Identity Provider Domains ---

	describe('listDomains', () => {
		it('fetches from /api/federation/identity-providers/:idpId/domains', async () => {
			const data = { domains: [{ id: 'dom-1', domain: 'example.com' }], total: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listDomains } = await import('./federation-client');

			const result = await listDomains('idp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/federation/identity-providers/idp-1/domains'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { listDomains } = await import('./federation-client');

			await expect(listDomains('idp-1', mockFetch)).rejects.toThrow(
				'Failed to fetch domains: 500'
			);
		});
	});

	describe('addDomain', () => {
		it('sends POST to /api/federation/identity-providers/:idpId/domains with body', async () => {
			const data = { id: 'dom-1', domain: 'example.com', priority: 1 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { addDomain } = await import('./federation-client');

			const result = await addDomain('idp-1', 'example.com', 1, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/federation/identity-providers/idp-1/domains',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ domain: 'example.com', priority: 1 })
				}
			);
			expect(result).toEqual(data);
		});

		it('sends undefined priority when not provided', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ id: 'dom-1', domain: 'test.com' }));
			const { addDomain } = await import('./federation-client');

			await addDomain('idp-1', 'test.com', undefined, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/federation/identity-providers/idp-1/domains',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ domain: 'test.com', priority: undefined })
				}
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { addDomain } = await import('./federation-client');

			await expect(addDomain('idp-1', 'dup.com', undefined, mockFetch)).rejects.toThrow(
				'Failed to add domain: 409'
			);
		});
	});

	describe('removeDomain', () => {
		it('sends DELETE to /api/federation/identity-providers/:idpId/domains/:domainId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeDomain } = await import('./federation-client');

			await removeDomain('idp-1', 'dom-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/federation/identity-providers/idp-1/domains/dom-1',
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeDomain } = await import('./federation-client');

			await expect(removeDomain('idp-1', 'bad-id', mockFetch)).rejects.toThrow(
				'Failed to remove domain: 404'
			);
		});
	});

	// --- SAML Service Providers ---

	describe('listServiceProviders', () => {
		it('fetches from /api/federation/saml/service-providers with no params', async () => {
			const data = { items: [], total: 0, offset: 0, limit: 20 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listServiceProviders } = await import('./federation-client');

			const result = await listServiceProviders({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/saml/service-providers');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { listServiceProviders } = await import('./federation-client');

			await listServiceProviders({ offset: 0, limit: 10, enabled: true }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('/api/federation/saml/service-providers?');
			expect(calledUrl).toContain('offset=0');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('enabled=true');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { listServiceProviders } = await import('./federation-client');

			await expect(listServiceProviders({}, mockFetch)).rejects.toThrow(
				'Failed to fetch service providers: 403'
			);
		});
	});

	// --- SAML Certificates ---

	describe('listCertificates', () => {
		it('fetches from /api/federation/saml/certificates', async () => {
			const data = { certificates: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { listCertificates } = await import('./federation-client');

			const result = await listCertificates(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/federation/saml/certificates');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { listCertificates } = await import('./federation-client');

			await expect(listCertificates(mockFetch)).rejects.toThrow(
				'Failed to fetch certificates: 500'
			);
		});
	});

	describe('activateCertificate', () => {
		it('sends POST to /api/federation/saml/certificates/:id/activate', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { activateCertificate } = await import('./federation-client');

			await activateCertificate('cert-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/federation/saml/certificates/cert-1/activate',
				{ method: 'POST' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { activateCertificate } = await import('./federation-client');

			await expect(activateCertificate('bad-id', mockFetch)).rejects.toThrow(
				'Failed to activate certificate: 404'
			);
		});
	});
});
