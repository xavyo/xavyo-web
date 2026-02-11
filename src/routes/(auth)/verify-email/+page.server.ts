import type { PageServerLoad } from './$types';
import { verifyEmail } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, fetch }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return {
			message: null,
			alreadyVerified: false,
			error: 'No verification token provided.'
		};
	}

	try {
		const result = await verifyEmail(token, fetch);
		return {
			message: result.message,
			alreadyVerified: result.already_verified,
			error: null
		};
	} catch (e) {
		if (e instanceof ApiError) {
			return {
				message: null,
				alreadyVerified: false,
				error: e.message
			};
		}
		return {
			message: null,
			alreadyVerified: false,
			error: 'An unexpected error occurred.'
		};
	}
};
