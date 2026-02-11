import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { logout } from '$lib/api/auth';
import { clearAuthCookies } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const refreshToken = cookies.get('refresh_token');

	if (refreshToken) {
		try {
			await logout(refreshToken, fetch);
		} catch {
			// Best effort — still clear cookies locally
		}
	}

	clearAuthCookies(cookies);
	redirect(302, '/login');
};
