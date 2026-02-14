import { env } from '$env/dynamic/private';
import { apiClient, ApiError } from './client';
import type { BrandingConfig, PublicBranding } from './types';

export async function getPublicBranding(
	tenantSlug: string,
	fetchFn?: typeof globalThis.fetch
): Promise<PublicBranding> {
	const res = await (fetchFn ?? fetch)(
		`${env.API_BASE_URL}/public/branding/${encodeURIComponent(tenantSlug)}`
	);
	if (!res.ok) throw new ApiError('Branding not found', res.status);
	return res.json();
}

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
