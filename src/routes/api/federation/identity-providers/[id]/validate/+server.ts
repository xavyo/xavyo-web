import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { validateIdentityProvider } from '$lib/api/federation';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const result = await validateIdentityProvider(
		params.id,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
