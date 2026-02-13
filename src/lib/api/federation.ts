import { apiClient } from './client';
import type {
	IdentityProviderListResponse,
	IdentityProvider,
	CreateIdentityProviderRequest,
	UpdateIdentityProviderRequest,
	ToggleIdentityProviderRequest,
	ValidationResult,
	DomainListResponse,
	IdentityProviderDomain,
	CreateDomainRequest,
	ServiceProviderListResponse,
	ServiceProvider,
	CreateServiceProviderRequest,
	UpdateServiceProviderRequest,
	CertificateListResponse,
	IdPCertificate,
	UploadCertificateRequest
} from './types';

// --- OIDC Identity Providers ---

export async function listIdentityProviders(
	params: { offset?: number; limit?: number; is_enabled?: boolean },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<IdentityProviderListResponse> {
	const searchParams = new URLSearchParams();
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.is_enabled !== undefined) searchParams.set('is_enabled', String(params.is_enabled));
	const query = searchParams.toString();
	return apiClient<IdentityProviderListResponse>(
		`/admin/federation/identity-providers${query ? `?${query}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createIdentityProvider(
	data: CreateIdentityProviderRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<IdentityProvider> {
	return apiClient<IdentityProvider>('/admin/federation/identity-providers', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getIdentityProvider(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<IdentityProvider> {
	return apiClient<IdentityProvider>(`/admin/federation/identity-providers/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateIdentityProvider(
	id: string,
	data: UpdateIdentityProviderRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<IdentityProvider> {
	return apiClient<IdentityProvider>(`/admin/federation/identity-providers/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteIdentityProvider(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/federation/identity-providers/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function validateIdentityProvider(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ValidationResult> {
	return apiClient<ValidationResult>(
		`/admin/federation/identity-providers/${id}/validate`,
		{
			method: 'POST',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function toggleIdentityProvider(
	id: string,
	data: ToggleIdentityProviderRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<IdentityProvider> {
	return apiClient<IdentityProvider>(
		`/admin/federation/identity-providers/${id}/toggle`,
		{
			method: 'POST',
			body: data,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- OIDC Identity Provider Domains ---

export async function listDomains(
	idpId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<DomainListResponse> {
	return apiClient<DomainListResponse>(
		`/admin/federation/identity-providers/${idpId}/domains`,
		{
			method: 'GET',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function addDomain(
	idpId: string,
	data: CreateDomainRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<IdentityProviderDomain> {
	return apiClient<IdentityProviderDomain>(
		`/admin/federation/identity-providers/${idpId}/domains`,
		{
			method: 'POST',
			body: data,
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

export async function removeDomain(
	idpId: string,
	domainId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(
		`/admin/federation/identity-providers/${idpId}/domains/${domainId}`,
		{
			method: 'DELETE',
			token,
			tenantId,
			fetch: fetchFn
		}
	);
}

// --- SAML Service Providers ---

export async function listServiceProviders(
	params: { offset?: number; limit?: number; enabled?: boolean },
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ServiceProviderListResponse> {
	const searchParams = new URLSearchParams();
	if (params.offset !== undefined) searchParams.set('offset', String(params.offset));
	if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
	if (params.enabled !== undefined) searchParams.set('enabled', String(params.enabled));
	const query = searchParams.toString();
	return apiClient<ServiceProviderListResponse>(
		`/admin/saml/service-providers${query ? `?${query}` : ''}`,
		{ method: 'GET', token, tenantId, fetch: fetchFn }
	);
}

export async function createServiceProvider(
	data: CreateServiceProviderRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ServiceProvider> {
	return apiClient<ServiceProvider>('/admin/saml/service-providers', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function getServiceProvider(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ServiceProvider> {
	return apiClient<ServiceProvider>(`/admin/saml/service-providers/${id}`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateServiceProvider(
	id: string,
	data: UpdateServiceProviderRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ServiceProvider> {
	return apiClient<ServiceProvider>(`/admin/saml/service-providers/${id}`, {
		method: 'PUT',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteServiceProvider(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/saml/service-providers/${id}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

// --- SAML Certificates ---

export async function listCertificates(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<CertificateListResponse> {
	return apiClient<CertificateListResponse>('/admin/saml/certificates', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function uploadCertificate(
	data: UploadCertificateRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<IdPCertificate> {
	return apiClient<IdPCertificate>('/admin/saml/certificates', {
		method: 'POST',
		body: data,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function activateCertificate(
	id: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/admin/saml/certificates/${id}/activate`, {
		method: 'POST',
		token,
		tenantId,
		fetch: fetchFn
	});
}
