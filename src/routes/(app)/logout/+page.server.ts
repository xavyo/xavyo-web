import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { logout } from '$lib/api/auth';
import { initiateSamlSlo } from '$lib/api/federation';
import { clearAuthCookies } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url }) => {
	return { full: url.searchParams.get('full') === 'true' };
};

export const actions: Actions = {
	default: async ({ cookies, fetch, request }) => {
		const form = await request.formData();
		const full = form.get('full') === 'true';

		const refreshToken = cookies.get('refresh_token');
		const tenantId = cookies.get('tenant_id');

		if (refreshToken) {
			try {
				await logout(refreshToken, tenantId, fetch);
			} catch {
				// Best effort — still clear cookies locally
			}
		}

		const accessToken = cookies.get('access_token');
		if (accessToken && tenantId) {
			try {
				await initiateSamlSlo(accessToken, tenantId, fetch);
			} catch {
				// Best effort — don't block logout
			}
		}

		clearAuthCookies(cookies);

		if (full) {
			cookies.delete('tenant_id', { path: '/' });
		}

		redirect(302, '/login');
	}
};
