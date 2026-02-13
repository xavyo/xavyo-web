import { apiClient } from './client';
import type { BrandingConfig } from './types';

export async function getBranding(
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BrandingConfig> {
	return apiClient<BrandingConfig>('/admin/branding', {
		method: 'GET',
		token,
		tenantId,
		fetch: fetchFn
	});
}

export async function updateBranding(
	body: Partial<BrandingConfig>,
	token: string,
	tenantId: string,
	fetchFn?: typeof globalThis.fetch
): Promise<BrandingConfig> {
	return apiClient<BrandingConfig>('/admin/branding', {
		method: 'PUT',
		body,
		token,
		tenantId,
		fetch: fetchFn
	});
}
