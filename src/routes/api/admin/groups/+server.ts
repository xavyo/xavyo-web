import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listGroups, createGroup } from '$lib/api/groups';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const group_type = url.searchParams.get('group_type') ?? undefined;
	const { limit, offset } = listPagination(url);

	const result = await listGroups(
		{ group_type, limit: limit ?? 20, offset: offset ?? 0 },
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
	const displayName =
		typeof body.display_name === 'string' && body.display_name.length > 0
			? body.display_name
			: typeof body.name === 'string' && body.name.length > 0
				? body.name
				: undefined;
	if (!displayName) {
		error(400, 'display_name is required');
	}
	const result = await createGroup(
		{
			display_name: displayName,
			description: typeof body.description === 'string' ? body.description : undefined,
			group_type: typeof body.group_type === 'string' ? body.group_type : undefined,
			parent_id: typeof body.parent_id === 'string' ? body.parent_id : undefined
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
