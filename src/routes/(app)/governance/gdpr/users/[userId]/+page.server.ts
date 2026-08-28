import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { getUserDataProtection } from '$lib/api/gdpr';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ params, locals, fetch }) => {
	try {
		const summary = await getUserDataProtection(params.userId, locals.accessToken!, locals.tenantId!, fetch);
		return { summary, userId: params.userId };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load user data protection');
	}
};
