import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { removeCriterion } from '$lib/api/meta-roles';

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await removeCriterion(
		params.id,
		params.criteriaId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return new Response(null, { status: 204 });
};
