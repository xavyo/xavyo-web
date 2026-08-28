import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateTemplateRule, deleteTemplateRule } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';

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
	const data: Record<string, unknown> = {};
	if (body.expression !== undefined) {
		if (typeof body.expression !== 'string' || body.expression.length === 0) {
			error(400, 'expression must be a non-empty string');
		}
		data.expression = body.expression;
	}
	if (body.strength !== undefined) {
		if (body.strength !== 'strong' && body.strength !== 'normal' && body.strength !== 'weak') {
			error(400, 'strength is required');
		}
		data.strength = body.strength;
	}
	if (body.authoritative !== undefined) {
		if (typeof body.authoritative !== 'boolean') {
			error(400, 'authoritative must be a boolean');
		}
		data.authoritative = body.authoritative;
	}
	if (body.priority !== undefined) {
		if (typeof body.priority !== 'number') {
			error(400, 'priority must be a number');
		}
		data.priority = body.priority;
	}
	if (body.condition !== undefined) {
		if (typeof body.condition !== 'string') {
			error(400, 'condition must be a string');
		}
		data.condition = body.condition;
	}
	if (body.error_message !== undefined) {
		if (typeof body.error_message !== 'string') {
			error(400, 'error_message must be a string');
		}
		data.error_message = body.error_message;
	}
	if (body.exclusive !== undefined) {
		if (typeof body.exclusive !== 'boolean') {
			error(400, 'exclusive must be a boolean');
		}
		data.exclusive = body.exclusive;
	}
	try {
		const result = await updateTemplateRule(
			params.id,
			params.ruleId,
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

	try {
		await deleteTemplateRule(params.id, params.ruleId, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
