import { apiClient } from './client';
import type { ProvisionTenantResponse } from './types';

export async function provisionTenant(
	organizationName: string,
	accessToken: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisionTenantResponse> {
	return apiClient<ProvisionTenantResponse>('/tenants/provision', {
		method: 'POST',
		body: { organization_name: organizationName },
		token: accessToken,
		fetch: fetchFn
	});
}
