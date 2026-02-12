import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPeerGroups, createPeerGroup } from '$lib/api/peer-groups';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const group_type = url.searchParams.get('group_type') ?? undefined;
	const attribute_key = url.searchParams.get('attribute_key') ?? undefined;
	const min_user_count = url.searchParams.get('min_user_count') ? Number(url.searchParams.get('min_user_count')) : undefined;
	const limit = Number(url.searchParams.get('limit') ?? '50');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const result = await listPeerGroups({ group_type, attribute_key, min_user_count, limit, offset }, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const body = await request.json();
	const result = await createPeerGroup(body, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
