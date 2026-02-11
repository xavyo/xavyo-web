import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeRoleEntitlement } from '$lib/api/governance-roles';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeRoleEntitlement(
		params.id,
		params.eid,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return new Response(null, { status: 204 });
};
