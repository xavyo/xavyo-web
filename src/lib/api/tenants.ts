import { apiClient } from './client';
import type { SignupTenantRequest, SignupTenantResponse } from './types';

export async function signupTenant(
	data: SignupTenantRequest,
	fetchFn?: typeof globalThis.fetch
): Promise<SignupTenantResponse> {
	return apiClient<SignupTenantResponse>('/tenants/signup', {
		method: 'POST',
		body: data,
		fetch: fetchFn
	});
}

/** GET /tenants/:id/settings — includes `settings.plan` and quota limits. */
export interface TenantSettingsResponse {
	tenant_id: string;
	settings: {
		plan?: string;
		limits?: Record<string, number | null>;
		[key: string]: unknown;
	};
}

export async function getTenantSettings(
	tenantId: string,
	token: string,
	fetchFn?: typeof globalThis.fetch
): Promise<TenantSettingsResponse> {
	return apiClient<TenantSettingsResponse>(`/tenants/${tenantId}/settings`, {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}
