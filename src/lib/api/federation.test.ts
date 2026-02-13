import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listIdentityProviders,
	createIdentityProvider,
	getIdentityProvider,
	updateIdentityProvider,
	deleteIdentityProvider,
	validateIdentityProvider,
	toggleIdentityProvider,
	listDomains,
	addDomain,
	removeDomain,
	listServiceProviders,
	createServiceProvider,
	getServiceProvider,
	updateServiceProvider,
	deleteServiceProvider,
	listCertificates,
	uploadCertificate,
	activateCertificate
} from './federation';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('federation API client', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- OIDC Identity Providers ---

	describe('listIdentityProviders', () => {
		it('calls GET /admin/federation/identity-providers with no params', async () => {
			const mockResponse = { items: [], total: 0, offset: 0, limit: 20 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listIdentityProviders({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/federation/identity-providers', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes offset and limit in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, offset: 10, limit: 5 });

			await listIdentityProviders({ offset: 10, limit: 5 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers?offset=10&limit=5',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});

		it('includes is_enabled filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, offset: 0, limit: 20 });

			await listIdentityProviders({ is_enabled: true }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers?is_enabled=true',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});

		it('includes all params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, offset: 0, limit: 10 });

			await listIdentityProviders(
				{ offset: 0, limit: 10, is_enabled: false },
				token,
				tenantId,
				mockFetch
			);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers?offset=0&limit=10&is_enabled=false',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('createIdentityProvider', () => {
		it('calls POST /admin/federation/identity-providers with body', async () => {
			const data = {
				name: 'Okta',
				provider_type: 'oidc',
				issuer_url: 'https://okta.example.com',
				client_id: 'client-123',
				client_secret: 'secret-456'
			};
			const mockResponse = { id: 'idp-1', ...data, is_enabled: false, created_at: '', updated_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createIdentityProvider(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/federation/identity-providers', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getIdentityProvider', () => {
		it('calls GET /admin/federation/identity-providers/:id', async () => {
			const mockResponse = {
				id: 'idp-1',
				name: 'Okta',
				provider_type: 'oidc',
				issuer_url: 'https://okta.example.com',
				client_id: 'client-123',
				is_enabled: true,
				created_at: '',
				updated_at: ''
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getIdentityProvider('idp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/federation/identity-providers/idp-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateIdentityProvider', () => {
		it('calls PUT /admin/federation/identity-providers/:id with body', async () => {
			const updateData = { name: 'Updated Okta', issuer_url: 'https://new-okta.example.com' };
			const mockResponse = { id: 'idp-1', ...updateData, provider_type: 'oidc', client_id: 'client-123', is_enabled: true, created_at: '', updated_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateIdentityProvider('idp-1', updateData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/federation/identity-providers/idp-1', {
				method: 'PUT',
				body: updateData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteIdentityProvider', () => {
		it('calls DELETE /admin/federation/identity-providers/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteIdentityProvider('idp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/federation/identity-providers/idp-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('validateIdentityProvider', () => {
		it('calls POST /admin/federation/identity-providers/:id/validate', async () => {
			const mockResponse = { valid: true, errors: [], warnings: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await validateIdentityProvider('idp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers/idp-1/validate',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('toggleIdentityProvider', () => {
		it('calls POST /admin/federation/identity-providers/:id/toggle with body', async () => {
			const toggleData = { is_enabled: true };
			const mockResponse = { id: 'idp-1', name: 'Okta', is_enabled: true, created_at: '', updated_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await toggleIdentityProvider('idp-1', toggleData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers/idp-1/toggle',
				{ method: 'POST', body: toggleData, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- OIDC Identity Provider Domains ---

	describe('listDomains', () => {
		it('calls GET /admin/federation/identity-providers/:idpId/domains', async () => {
			const mockResponse = { domains: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listDomains('idp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers/idp-1/domains',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('addDomain', () => {
		it('calls POST /admin/federation/identity-providers/:idpId/domains with body', async () => {
			const domainData = { domain: 'example.com', priority: 1 };
			const mockResponse = { id: 'dom-1', domain: 'example.com', priority: 1, created_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await addDomain('idp-1', domainData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers/idp-1/domains',
				{ method: 'POST', body: domainData, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('removeDomain', () => {
		it('calls DELETE /admin/federation/identity-providers/:idpId/domains/:domainId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeDomain('idp-1', 'dom-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/federation/identity-providers/idp-1/domains/dom-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- SAML Service Providers ---

	describe('listServiceProviders', () => {
		it('calls GET /admin/saml/service-providers with no params', async () => {
			const mockResponse = { items: [], total: 0, offset: 0, limit: 20 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listServiceProviders({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/service-providers', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes offset and limit in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, offset: 5, limit: 10 });

			await listServiceProviders({ offset: 5, limit: 10 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/saml/service-providers?offset=5&limit=10',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});

		it('includes enabled filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, offset: 0, limit: 20 });

			await listServiceProviders({ enabled: true }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/saml/service-providers?enabled=true',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('createServiceProvider', () => {
		it('calls POST /admin/saml/service-providers with body', async () => {
			const data = {
				name: 'My SP',
				entity_id: 'sp-entity-001',
				acs_urls: ['https://sp.example.com/acs']
			};
			const mockResponse = { id: 'sp-1', ...data, enabled: true, created_at: '', updated_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createServiceProvider(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/service-providers', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getServiceProvider', () => {
		it('calls GET /admin/saml/service-providers/:id', async () => {
			const mockResponse = { id: 'sp-1', name: 'My SP', entity_id: 'sp-entity-001', acs_urls: 'https://sp.example.com/acs', enabled: true, created_at: '', updated_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getServiceProvider('sp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/service-providers/sp-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateServiceProvider', () => {
		it('calls PUT /admin/saml/service-providers/:id with body', async () => {
			const updateData = { name: 'Updated SP', enabled: false };
			const mockResponse = { id: 'sp-1', name: 'Updated SP', entity_id: 'sp-entity-001', acs_urls: 'https://sp.example.com/acs', enabled: false, created_at: '', updated_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateServiceProvider('sp-1', updateData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/service-providers/sp-1', {
				method: 'PUT',
				body: updateData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteServiceProvider', () => {
		it('calls DELETE /admin/saml/service-providers/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteServiceProvider('sp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/service-providers/sp-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	// --- SAML Certificates ---

	describe('listCertificates', () => {
		it('calls GET /admin/saml/certificates', async () => {
			const mockResponse = { certificates: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listCertificates(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/certificates', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('uploadCertificate', () => {
		it('calls POST /admin/saml/certificates with body', async () => {
			const certData = {
				certificate: '-----BEGIN CERTIFICATE-----\nMIIB...\n-----END CERTIFICATE-----',
				private_key: '-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----',
				key_id: 'key-1'
			};
			const mockResponse = { id: 'cert-1', ...certData, is_active: false, created_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await uploadCertificate(certData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/certificates', {
				method: 'POST',
				body: certData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('activateCertificate', () => {
		it('calls POST /admin/saml/certificates/:id/activate', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await activateCertificate('cert-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/saml/certificates/cert-1/activate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});
