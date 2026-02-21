import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { logout } from '$lib/api/auth';
import { initiateSamlSlo } from '$lib/api/federation';
import { clearAuthCookies } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const refreshToken = cookies.get('refresh_token');
	const tenantId = cookies.get('tenant_id');

	if (refreshToken) {
		try {
			await logout(refreshToken, tenantId, fetch);
		} catch {
			// Best effort — still clear cookies locally
		}
	}

	// Best-effort SAML SLO — notify all SAML SPs
	const accessToken = cookies.get('access_token');
	if (accessToken && tenantId) {
		try {
			await initiateSamlSlo(accessToken, tenantId, fetch);
		} catch {
			// Best effort — don't block logout
		}
	}

	clearAuthCookies(cookies);

	// Full logout (explicit tenant switch) also clears tenant context
	if (url.searchParams.get('full') === 'true') {
		cookies.delete('tenant_id', { path: '/' });
	}

	redirect(302, '/login');
};
