import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { previewMerge } from '$lib/api/dedup';
import type { EntitlementStrategy, MergePreviewRequest } from '$lib/api/types';

const STRATEGIES = ['union', 'intersection', 'manual'] as const;

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
	if (!STRATEGIES.includes(body.entitlement_strategy as (typeof STRATEGIES)[number])) {
		error(400, 'entitlement_strategy is required');
	}
	const data: MergePreviewRequest = {
		source_identity_id: body.source_identity_id,
		target_identity_id: body.target_identity_id,
		entitlement_strategy: body.entitlement_strategy as EntitlementStrategy
	};
	if (body.attribute_selections !== undefined) {
		if (
			!body.attribute_selections ||
			typeof body.attribute_selections !== 'object' ||
			Array.isArray(body.attribute_selections)
		) {
			error(400, 'attribute_selections must be an object');
		}
		data.attribute_selections = body.attribute_selections as MergePreviewRequest['attribute_selections'];
	}
	const result = await previewMerge(data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};
