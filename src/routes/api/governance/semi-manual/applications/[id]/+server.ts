import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSemiManualApplication, configureSemiManual, removeSemiManualConfig } from '$lib/api/semi-manual';
import type { ConfigureSemiManualRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getSemiManualApplication(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

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
	if (typeof body.is_semi_manual !== 'boolean') {
		error(400, 'is_semi_manual is required');
	}
	if (typeof body.requires_approval_before_ticket !== 'boolean') {
		error(400, 'requires_approval_before_ticket is required');
	}
	const data: ConfigureSemiManualRequest = {
		is_semi_manual: body.is_semi_manual,
		requires_approval_before_ticket: body.requires_approval_before_ticket
	};
	if (body.ticketing_config_id !== undefined) {
		if (body.ticketing_config_id !== null && typeof body.ticketing_config_id !== 'string') {
			error(400, 'ticketing_config_id must be a string or null');
		}
		data.ticketing_config_id = body.ticketing_config_id as string | null;
	}
	if (body.sla_policy_id !== undefined) {
		if (body.sla_policy_id !== null && typeof body.sla_policy_id !== 'string') {
			error(400, 'sla_policy_id must be a string or null');
		}
		data.sla_policy_id = body.sla_policy_id as string | null;
	}
	const result = await configureSemiManual(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	await removeSemiManualConfig(params.id, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
