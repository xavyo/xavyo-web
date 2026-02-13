import { apiClient } from './client';
import type { ProvisionTenantResponse } from './types';

const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export async function provisionTenant(
	organizationName: string,
	accessToken: string,
	fetchFn?: typeof globalThis.fetch
): Promise<ProvisionTenantResponse> {
	return apiClient<ProvisionTenantResponse>('/tenants/provision', {
		method: 'POST',
		body: { organization_name: organizationName },
		token: accessToken,
		tenantId: SYSTEM_TENANT_ID,
		fetch: fetchFn
	});
}
