import { apiClient } from './client';
import type {
	SecretMetadata,
	StoreSecretRequest,
	RotateSecretRequest,
	NhiSecretLease,
	CreateLeaseRequest,
	RenewLeaseRequest
} from './types';

export async function storeSecret(
	nhiId: string,
	body: StoreSecretRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SecretMetadata> {
	return apiClient<SecretMetadata>(`/nhi/${nhiId}/vault/secrets`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listSecrets(
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SecretMetadata[]> {
	return apiClient<SecretMetadata[]>(`/nhi/${nhiId}/vault/secrets`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function deleteSecret(
	nhiId: string,
	secretId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${nhiId}/vault/secrets/${secretId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function rotateSecret(
	nhiId: string,
	secretId: string,
	body: RotateSecretRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<SecretMetadata> {
	return apiClient<SecretMetadata>(`/nhi/${nhiId}/vault/secrets/${secretId}/rotate`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function createLease(
	nhiId: string,
	body: CreateLeaseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSecretLease> {
	return apiClient<NhiSecretLease>(`/nhi/${nhiId}/vault/leases`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function listLeases(
	nhiId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSecretLease[]> {
	return apiClient<NhiSecretLease[]>(`/nhi/${nhiId}/vault/leases`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function renewLease(
	nhiId: string,
	leaseId: string,
	body: RenewLeaseRequest,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<NhiSecretLease> {
	return apiClient<NhiSecretLease>(`/nhi/${nhiId}/vault/leases/${leaseId}/renew`, {
		method: 'POST',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function revokeLease(
	nhiId: string,
	leaseId: string,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<void> {
	await apiClient(`/nhi/${nhiId}/vault/leases/${leaseId}`, {
		method: 'DELETE',
		token,
		tenantId,
		fetch: fetchFn
	});
}
