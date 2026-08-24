import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScriptTemplates, createScriptTemplate } from '$lib/api/provisioning-scripts';
import type { CreateScriptTemplateRequest } from '$lib/api/types';

const CATEGORIES = [
	'attribute_mapping',
	'value_generation',
	'conditional_logic',
	'data_formatting',
	'custom'
] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const category = url.searchParams.get('category') ?? undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined;
	const page_size = url.searchParams.get('page_size')
		? parseInt(url.searchParams.get('page_size')!)
		: undefined;

	const result = await listScriptTemplates(
		{ category, search, page, page_size },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	if (!CATEGORIES.includes(body.category as (typeof CATEGORIES)[number])) {
		error(400, 'category is required');
	}
	if (typeof body.template_body !== 'string' || body.template_body.length === 0) {
		error(400, 'template_body is required');
	}
	const data: CreateScriptTemplateRequest = {
		name: body.name,
		category: body.category as string,
		template_body: body.template_body
	};
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.placeholder_annotations !== undefined) {
		data.placeholder_annotations = body.placeholder_annotations;
	}
	const result = await createScriptTemplate(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
