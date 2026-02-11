import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { updateSocialProvider, deleteSocialProvider } from '$lib/api/social';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const body = await request.json();
	const result = await updateSocialProvider(
		params.provider,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	await deleteSocialProvider(params.provider, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
