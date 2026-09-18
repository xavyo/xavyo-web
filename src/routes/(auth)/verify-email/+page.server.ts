import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { verifyEmail } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';
import { setCookies } from '$lib/server/auth';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return { hasToken: false, verified: false, error: 'No verification token provided.' };
	}

	return { hasToken: true, verified: false, error: null };
};

export const actions: Actions = {
	default: async ({ request, fetch, cookies }) => {
		const formData = await request.formData();
		const token = formData.get('token');

		if (!token || typeof token !== 'string') {
			return fail(400, { verified: false, error: 'Missing verification token.' });
		}

		let result;
		try {
			result = await verifyEmail(token, fetch);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status >= 400 && e.status < 600 ? e.status : 400, {
					verified: false,
					error: e.message
				});
			}
			return fail(500, { verified: false, error: 'An unexpected error occurred.' });
		}

		// A fresh verification returns a session: sign the user in automatically and
		// take them straight into the app (the app layout routes system-tenant users
		// to onboarding) instead of bouncing them back to the login screen.
		// redirect() throws, so it must live outside the try/catch above.
		if (result.access_token && result.refresh_token) {
			setCookies(cookies, {
				access_token: result.access_token,
				refresh_token: result.refresh_token,
				token_type: result.token_type ?? 'Bearer',
				expires_in: result.expires_in ?? 3600
			});
			redirect(303, '/dashboard');
		}

		return {
			verified: true,
			alreadyVerified: result.already_verified,
			message: result.message,
			error: null
		};
	}
};
