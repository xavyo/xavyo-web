import type {
	SecretMetadata,
	StoreSecretRequest,
	RotateSecretRequest,
	NhiSecretLease,
	CreateLeaseRequest,
	RenewLeaseRequest
} from './types';

function handleAuthError(res: Response): never {
	if (res.status === 401) {
		window.location.href = '/login';
	}
	throw new Error('Unexpected auth error');
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
	try {
		const body = await res.json();
		if (body.message) return body.message;
	} catch {
		// ignore parse error
	}
	return `${fallback}: ${res.status}`;
}

export async function storeSecretClient(
	nhiId: string,
	body: StoreSecretRequest,
	fetchFn: typeof fetch = fetch
): Promise<SecretMetadata> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/secrets`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to store secret'));
	}
	return res.json();
}

export async function listSecretsClient(
	nhiId: string,
	fetchFn: typeof fetch = fetch
): Promise<SecretMetadata[]> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/secrets`);
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to list secrets'));
	}
	return res.json();
}

export async function deleteSecretClient(
	nhiId: string,
	secretId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/secrets/${secretId}`, {
		method: 'DELETE'
	});
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to delete secret'));
	}
}

export async function rotateSecretClient(
	nhiId: string,
	secretId: string,
	body: RotateSecretRequest,
	fetchFn: typeof fetch = fetch
): Promise<SecretMetadata> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/secrets/${secretId}/rotate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to rotate secret'));
	}
	return res.json();
}

export async function createLeaseClient(
	nhiId: string,
	body: CreateLeaseRequest,
	fetchFn: typeof fetch = fetch
): Promise<NhiSecretLease> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/leases`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to create lease'));
	}
	return res.json();
}

export async function listLeasesClient(
	nhiId: string,
	fetchFn: typeof fetch = fetch
): Promise<NhiSecretLease[]> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/leases`);
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to list leases'));
	}
	return res.json();
}

export async function renewLeaseClient(
	nhiId: string,
	leaseId: string,
	body: RenewLeaseRequest,
	fetchFn: typeof fetch = fetch
): Promise<NhiSecretLease> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/leases/${leaseId}/renew`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to renew lease'));
	}
	return res.json();
}

export async function revokeLeaseClient(
	nhiId: string,
	leaseId: string,
	fetchFn: typeof fetch = fetch
): Promise<void> {
	const res = await fetchFn(`/api/nhi/vault/${nhiId}/leases/${leaseId}`, {
		method: 'DELETE'
	});
	if (!res.ok) {
		if (res.status === 401) handleAuthError(res);
		throw new Error(await parseErrorMessage(res, 'Failed to revoke lease'));
	}
}
