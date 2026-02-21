import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { verifyEmail } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return { hasToken: false, verified: false, error: 'No verification token provided.' };
	}

	return { hasToken: true, verified: false, error: null };
};

export const actions: Actions = {
	default: async ({ request, fetch }) => {
		const formData = await request.formData();
		const token = formData.get('token');

		if (!token || typeof token !== 'string') {
			return fail(400, { verified: false, error: 'Missing verification token.' });
		}

		try {
			const result = await verifyEmail(token, fetch);
			return {
				verified: true,
				alreadyVerified: result.already_verified,
				message: result.message,
				error: null
			};
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status >= 400 && e.status < 600 ? e.status : 400, {
					verified: false,
					error: e.message
				});
			}
			return fail(500, { verified: false, error: 'An unexpected error occurred.' });
		}
	}
};
