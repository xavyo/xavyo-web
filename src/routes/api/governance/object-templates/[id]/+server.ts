import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getObjectTemplate, updateObjectTemplate, deleteObjectTemplate } from '$lib/api/object-templates';
import { ApiError } from '$lib/api/client';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		const result = await getObjectTemplate(params.id, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
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
	const data: Record<string, unknown> = {};
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
	if (body.priority !== undefined) {
		try {
			data.priority = parseBoundedInteger(body.priority, 1, 1000, 'priority');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	if (body.parent_template_id !== undefined) {
		if (body.parent_template_id !== null && typeof body.parent_template_id !== 'string') {
			error(400, 'parent_template_id must be a string or null');
		}
		data.parent_template_id = body.parent_template_id;
	}
	try {
		const result = await updateObjectTemplate(params.id, data, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	try {
		await deleteObjectTemplate(params.id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
