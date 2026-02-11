import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeInheritanceBlock } from '$lib/api/governance-roles';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeInheritanceBlock(
		params.id,
		params.bid,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return new Response(null, { status: 204 });
};
