import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getPublicBranding } from '$lib/api/branding';
import { ApiError } from '$lib/api/client';

export const load: LayoutServerLoad = async ({ url, fetch }) => {
	const tenantSlug = url.searchParams.get('tenant') || 'system';

	try {
		const branding = await getPublicBranding(tenantSlug, fetch);
		return { branding, tenantSlug };
	} catch (e) {
		if (e instanceof ApiError && e.status === 404) {
			return { branding: null, tenantSlug };
		}
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load branding');
	}
};
