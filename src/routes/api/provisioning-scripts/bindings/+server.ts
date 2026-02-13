import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listHookBindings, createHookBinding } from '$lib/api/provisioning-scripts';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const connector_id = url.searchParams.get('connector_id') ?? undefined;
	const script_id = url.searchParams.get('script_id') ?? undefined;
	const hook_phase = url.searchParams.get('hook_phase') ?? undefined;
	const operation_type = url.searchParams.get('operation_type') ?? undefined;
	const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined;
	const page_size = url.searchParams.get('page_size')
		? parseInt(url.searchParams.get('page_size')!)
		: undefined;

	const result = await listHookBindings(
		{ connector_id, script_id, hook_phase, operation_type, page, page_size },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');

	const body = await request.json();
	const result = await createHookBinding(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
