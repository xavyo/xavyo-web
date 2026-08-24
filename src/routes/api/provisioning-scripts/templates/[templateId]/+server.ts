import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	getScriptTemplate,
	updateScriptTemplate,
	deleteScriptTemplate
} from '$lib/api/provisioning-scripts';
import type { UpdateScriptTemplateRequest } from '$lib/api/types';

const CATEGORIES = [
	'attribute_mapping',
	'value_generation',
	'conditional_logic',
	'data_formatting',
	'custom'
] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const result = await getScriptTemplate(
		params.templateId,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
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
	const data: UpdateScriptTemplateRequest = {};
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
	if (body.category !== undefined) {
		if (!CATEGORIES.includes(body.category as (typeof CATEGORIES)[number])) {
			error(400, 'category is required');
		}
		data.category = body.category as string;
	}
	if (body.template_body !== undefined) {
		if (typeof body.template_body !== 'string' || body.template_body.length === 0) {
			error(400, 'template_body must be a non-empty string');
		}
		data.template_body = body.template_body;
	}
	if (body.placeholder_annotations !== undefined) {
		data.placeholder_annotations = body.placeholder_annotations;
	}
	const result = await updateScriptTemplate(
		params.templateId,
		data,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const DELETE: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	await deleteScriptTemplate(params.templateId, locals.accessToken, locals.tenantId, fetch);
	return new Response(null, { status: 204 });
};
