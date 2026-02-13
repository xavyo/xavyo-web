import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listScriptTemplates, createScriptTemplate } from '$lib/api/provisioning-scripts';

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

	const body = await request.json();
	const result = await createScriptTemplate(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
