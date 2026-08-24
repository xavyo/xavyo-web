import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProfile, updateProfile } from '$lib/api/me';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await getProfile(locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		// Profile may not exist on current tenant — JWT fallback is only for 404.
		if (e instanceof ApiError && e.status === 404 && locals.user) {
			return json({
				id: locals.user.id,
				email: locals.user.email,
				display_name: null,
				first_name: null,
				last_name: null,
				avatar_url: null,
				email_verified: false,
				created_at: new Date().toISOString()
			});
		}
		if (e instanceof ApiError) error(e.status, e.message);
		error(500, 'Failed to load profile');
	}
};

export const PUT: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const body = await request.json();
	const result = await updateProfile(body, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
