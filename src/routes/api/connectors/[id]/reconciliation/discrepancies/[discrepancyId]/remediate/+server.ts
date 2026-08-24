import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { remediateDiscrepancy } from '$lib/api/reconciliation';
import type {
	RemediateDiscrepancyRequest,
	RemediationAction,
	RemediationDirection
} from '$lib/api/types';

const ACTIONS = ['create', 'update', 'delete', 'link', 'unlink', 'inactivate_identity'] as const;
const DIRECTIONS = ['xavyo_to_target', 'target_to_xavyo'] as const;

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (!ACTIONS.includes(body.action as (typeof ACTIONS)[number])) {
		error(400, 'action is required');
	}
	if (!DIRECTIONS.includes(body.direction as (typeof DIRECTIONS)[number])) {
		error(400, 'direction is required');
	}
	if (typeof body.dry_run !== 'boolean') {
		error(400, 'dry_run is required');
	}
	const data: RemediateDiscrepancyRequest = {
		action: body.action as RemediationAction,
		direction: body.direction as RemediationDirection,
		dry_run: body.dry_run
	};
	if (body.identity_id !== undefined) {
		if (typeof body.identity_id !== 'string') {
			error(400, 'identity_id must be a string');
		}
		data.identity_id = body.identity_id;
	}
	const result = await remediateDiscrepancy(
		params.id,
		params.discrepancyId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
