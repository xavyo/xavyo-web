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
