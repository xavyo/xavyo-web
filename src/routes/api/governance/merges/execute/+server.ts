import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeMerge } from '$lib/api/dedup';
import type { MergeExecuteRequest } from '$lib/api/types';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.source_identity_id !== 'string' || body.source_identity_id.length === 0) {
		error(400, 'source_identity_id is required');
	}
	if (typeof body.target_identity_id !== 'string' || body.target_identity_id.length === 0) {
		error(400, 'target_identity_id is required');
	}
	if (
		body.entitlement_strategy !== 'union' &&
		body.entitlement_strategy !== 'intersection' &&
		body.entitlement_strategy !== 'manual'
	) {
		error(400, 'entitlement_strategy is required');
	}
	const result = await executeMerge(
		{
			source_identity_id: body.source_identity_id,
			target_identity_id: body.target_identity_id,
			entitlement_strategy: body.entitlement_strategy,
			attribute_selections:
				body.attribute_selections && typeof body.attribute_selections === 'object'
					? (body.attribute_selections as MergeExecuteRequest['attribute_selections'])
					: undefined,
			entitlement_selections: Array.isArray(body.entitlement_selections)
				? (body.entitlement_selections as string[])
				: undefined,
			sod_override_reason:
				typeof body.sod_override_reason === 'string' ? body.sod_override_reason : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
