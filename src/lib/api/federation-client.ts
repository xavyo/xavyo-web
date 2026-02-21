import type {
	IdentityProviderListResponse,
	IdentityProvider,
	ValidationResult,
	DomainListResponse,
	IdentityProviderDomain,
	ServiceProviderListResponse,
	ServiceProvider,
	CertificateListResponse,
	IdPCertificate,
	IdPInfo,
	GenerateCertificateRequest,
	ImportSpMetadataRequest,
	SloResult
} from './types';

// --- Helper ---

function buildSearchParams(params: Record<string, string | number | boolean | undefined>): string {
	const searchParams = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined) {
			searchParams.set(key, String(value));
		}
	}
	const qs = searchParams.toString();
	return qs ? `?${qs}` : '';
}

// --- OIDC Identity Providers ---

export async function listIdentityProviders(
	params: { offset?: number; limit?: number; is_enabled?: boolean } = {},
	fetchFn: typeof fetch = fetch
): Promise<IdentityProviderListResponse> {
	const qs = buildSearchParams({
		offset: params.offset,
		limit: params.limit,
		is_enabled: params.is_enabled
	});
	const res = await fetchFn(`/api/federation/identity-providers${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch identity providers: ${res.status}`);
	return res.json();
}

export async function getIdentityProvider(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<IdentityProvider> {
	const res = await fetchFn(`/api/federation/identity-providers/${id}`);
	if (!res.ok) throw new Error(`Failed to fetch identity provider: ${res.status}`);
	return res.json();
}

export async function validateIdentityProvider(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<ValidationResult> {
	const res = await fetchFn(`/api/federation/identity-providers/${id}/validate`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to validate identity provider: ${res.status}`);
	return res.json();
}

export async function toggleIdentityProvider(
	id: string,
	isEnabled: boolean,
	fetchFn: typeof fetch = fetch
): Promise<IdentityProvider> {
	const res = await fetchFn(`/api/federation/identity-providers/${id}/toggle`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ is_enabled: isEnabled })
	});
	if (!res.ok) throw new Error(`Failed to toggle identity provider: ${res.status}`);
	return res.json();
}

// --- OIDC Identity Provider Domains ---

export async function listDomains(
	idpId: string,
	fetchFn: typeof fetch = fetch
): Promise<DomainListResponse> {
	const res = await fetchFn(`/api/federation/identity-providers/${idpId}/domains`);
	if (!res.ok) throw new Error(`Failed to fetch domains: ${res.status}`);
	return res.json();
}

export async function addDomain(
	idpId: string,
	domain: string,
	priority: number | undefined,
	fetchFn: typeof fetch = fetch
): Promise<IdentityProviderDomain> {
	const res = await fetchFn(`/api/federation/identity-providers/${idpId}/domains`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ domain, priority })
	});
	if (!res.ok) throw new Error(`Failed to add domain: ${res.status}`);
	return res.json();
}

export async function removeDomain(
	idpId: string,
	domainId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/federation/identity-providers/${idpId}/domains/${domainId}`, {
		method: 'DELETE'
	});
	if (!res.ok) throw new Error(`Failed to remove domain: ${res.status}`);
}

// --- SAML Service Providers ---

export async function listServiceProviders(
	params: { offset?: number; limit?: number; enabled?: boolean } = {},
	fetchFn: typeof fetch = fetch
): Promise<ServiceProviderListResponse> {
	const qs = buildSearchParams({
		offset: params.offset,
		limit: params.limit,
		enabled: params.enabled
	});
	const res = await fetchFn(`/api/federation/saml/service-providers${qs}`);
	if (!res.ok) throw new Error(`Failed to fetch service providers: ${res.status}`);
	return res.json();
}

// --- SAML Certificates ---

export async function listCertificates(
	fetchFn: typeof fetch = fetch
): Promise<CertificateListResponse> {
	const res = await fetchFn('/api/federation/saml/certificates');
	if (!res.ok) throw new Error(`Failed to fetch certificates: ${res.status}`);
	return res.json();
}

export async function activateCertificate(
	id: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/federation/saml/certificates/${id}/activate`, {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to activate certificate: ${res.status}`);
}

export async function generateCertificate(
	params: GenerateCertificateRequest,
	fetchFn: typeof fetch = fetch
): Promise<IdPCertificate> {
	const res = await fetchFn('/api/federation/saml/certificates/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || `Failed to generate certificate: ${res.status}`);
	}
	return res.json();
}

// --- IdP Info ---

export async function getIdPInfo(
	fetchFn: typeof fetch = fetch
): Promise<IdPInfo> {
	const res = await fetchFn('/api/federation/saml/idp-info');
	if (!res.ok) throw new Error(`Failed to fetch IdP info: ${res.status}`);
	return res.json();
}

export async function getIdPMetadataXml(
	fetchFn: typeof fetch = fetch
): Promise<string> {
	const res = await fetchFn('/api/federation/saml/metadata');
	if (!res.ok) throw new Error(`Failed to fetch IdP metadata: ${res.status}`);
	return res.text();
}

// --- SP Metadata Import ---

export async function importSpFromMetadata(
	params: ImportSpMetadataRequest,
	fetchFn: typeof fetch = fetch
): Promise<ServiceProvider> {
	const res = await fetchFn('/api/federation/saml/service-providers/from-metadata', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(params)
	});
	if (!res.ok) {
		const err = await res.json().catch(() => null);
		throw new Error(err?.message || `Failed to import SP from metadata: ${res.status}`);
	}
	return res.json();
}

// --- SAML SLO ---

export async function initiateSamlSloClient(
	fetchFn: typeof fetch = fetch
): Promise<SloResult> {
	const res = await fetchFn('/api/federation/saml/slo/initiate', {
		method: 'POST'
	});
	if (!res.ok) throw new Error(`Failed to initiate SLO: ${res.status}`);
	return res.json();
}
