import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPeerGroups, createPeerGroup } from '$lib/api/peer-groups';
import type { CreatePeerGroupRequest, PeerGroupType } from '$lib/api/types';
import { finiteNumber, listPagination } from '$lib/server/list-pagination';

const GROUP_TYPES = ['department', 'role', 'location', 'custom'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const group_type = url.searchParams.get('group_type') ?? undefined;
	const attribute_key = url.searchParams.get('attribute_key') ?? undefined;
	const min_user_count = finiteNumber(url.searchParams.get('min_user_count'));
	const result = await listPeerGroups(
		{ group_type, attribute_key, min_user_count, ...listPagination(url) },
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
	if (!GROUP_TYPES.includes(body.group_type as (typeof GROUP_TYPES)[number])) {
		error(400, 'group_type is required');
	}
	if (typeof body.attribute_key !== 'string' || body.attribute_key.length === 0) {
		error(400, 'attribute_key is required');
	}
	if (typeof body.attribute_value !== 'string' || body.attribute_value.length === 0) {
		error(400, 'attribute_value is required');
	}
	const data: CreatePeerGroupRequest = {
		name: body.name,
		group_type: body.group_type as PeerGroupType,
		attribute_key: body.attribute_key,
		attribute_value: body.attribute_value
	};
	const result = await createPeerGroup(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
