import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { updateTemplateMergePolicy, deleteTemplateMergePolicy } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';

export const PUT: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

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
	const data: Record<string, unknown> = {};
	if (body.strategy !== undefined) {
		if (
			body.strategy !== 'source_precedence' &&
			body.strategy !== 'timestamp_wins' &&
			body.strategy !== 'concatenate_unique' &&
			body.strategy !== 'first_wins' &&
			body.strategy !== 'manual_only'
		) {
			error(400, 'strategy is required');
		}
		data.strategy = body.strategy;
	}
	if (body.source_precedence !== undefined) {
		if (
			!Array.isArray(body.source_precedence) ||
			body.source_precedence.some((item) => typeof item !== 'string')
		) {
			error(400, 'source_precedence must be an array of strings');
		}
		data.source_precedence = body.source_precedence;
	}
	if (body.null_handling !== undefined) {
		if (body.null_handling !== 'merge' && body.null_handling !== 'preserve_empty') {
			error(400, 'null_handling is required');
		}
		data.null_handling = body.null_handling;
	}
	try {
		const result = await updateTemplateMergePolicy(
			params.id,
			params.policyId,
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Forbidden');

	try {
		await deleteTemplateMergePolicy(params.id, params.policyId, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
