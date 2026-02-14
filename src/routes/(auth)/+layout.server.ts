import type { LayoutServerLoad } from './$types';
import { getPublicBranding } from '$lib/api/branding';

export const load: LayoutServerLoad = async ({ url, fetch }) => {
	const tenantSlug = url.searchParams.get('tenant') || 'system';

	try {
		const branding = await getPublicBranding(tenantSlug, fetch);
		return { branding, tenantSlug };
	} catch {
		return { branding: null, tenantSlug };
	}
};
