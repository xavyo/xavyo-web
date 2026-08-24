import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listProvisioningScripts, createProvisioningScript } from '$lib/api/provisioning-scripts';
import type { CreateProvisioningScriptRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const search = url.searchParams.get('search') ?? undefined;
	const page = url.searchParams.get('page') ? Number(url.searchParams.get('page')) : undefined;
	const page_size = url.searchParams.get('page_size')
		? Number(url.searchParams.get('page_size'))
		: undefined;

	const result = await listProvisioningScripts(
		{ status, search, page, page_size },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

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
	if (typeof body.name !== 'string' || body.name.length === 0) {
		error(400, 'name is required');
	}
	const data: CreateProvisioningScriptRequest = { name: body.name };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	const result = await createProvisioningScript(data, locals.accessToken, locals.tenantId, fetch);

	return json(result, { status: 201 });
};
