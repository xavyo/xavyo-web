import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProfile, updateProfile } from '$lib/api/me';
import { ApiError } from '$lib/api/client';
import type { UpdateProfileRequest } from '$lib/api/types';

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
				display_name: locals.user.display_name,
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

	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		error(400, 'Invalid JSON body');
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		error(400, 'Invalid JSON body');
	}
	const body = parsed as Record<string, unknown>;
	const data: UpdateProfileRequest = {};
	if (body.display_name !== undefined) {
		if (typeof body.display_name !== 'string') {
			error(400, 'display_name must be a string');
		}
		data.display_name = body.display_name;
	}
	if (body.first_name !== undefined) {
		if (typeof body.first_name !== 'string') {
			error(400, 'first_name must be a string');
		}
		data.first_name = body.first_name;
	}
	if (body.last_name !== undefined) {
		if (typeof body.last_name !== 'string') {
			error(400, 'last_name must be a string');
		}
		data.last_name = body.last_name;
	}
	if (body.avatar_url !== undefined) {
		if (typeof body.avatar_url !== 'string') {
			error(400, 'avatar_url must be a string');
		}
		data.avatar_url = body.avatar_url;
	}
	const result = await updateProfile(data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
