import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSodRule, updateSodRule, deleteSodRule } from '$lib/api/governance';
import type { UpdateSodRuleRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await getSodRule(params.id, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	const data: UpdateSodRuleRequest = {};
	if (body.name !== undefined) {
		if (typeof body.name !== 'string' || body.name.length === 0) {
			error(400, 'name must be a non-empty string');
		}
		data.name = body.name;
	}
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.first_entitlement_id !== undefined) {
		if (typeof body.first_entitlement_id !== 'string' || body.first_entitlement_id.length === 0) {
			error(400, 'first_entitlement_id must be a non-empty string');
		}
		data.first_entitlement_id = body.first_entitlement_id;
	}
	if (body.second_entitlement_id !== undefined) {
		if (typeof body.second_entitlement_id !== 'string' || body.second_entitlement_id.length === 0) {
			error(400, 'second_entitlement_id must be a non-empty string');
		}
		data.second_entitlement_id = body.second_entitlement_id;
	}
	if (body.severity !== undefined) {
		if (
			body.severity !== 'low' &&
			body.severity !== 'medium' &&
			body.severity !== 'high' &&
			body.severity !== 'critical'
		) {
			error(400, 'severity must be low, medium, high, or critical');
		}
		data.severity = body.severity;
	}
	if (body.business_rationale !== undefined) {
		if (typeof body.business_rationale !== 'string') {
			error(400, 'business_rationale must be a string');
		}
		data.business_rationale = body.business_rationale;
	}
	const result = await updateSodRule(params.id, data, locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await deleteSodRule(params.id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
