import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listPoa, grantPoa } from '$lib/api/power-of-attorney';
import type { GrantPoaRequest, PoaScope } from '$lib/api/types';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const direction = (url.searchParams.get('direction') ?? 'outgoing') as 'incoming' | 'outgoing';
	const status = url.searchParams.get('status') ?? undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listPoa({ direction, status, limit, offset }, locals.accessToken, locals.tenantId, fetch);
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
	if (typeof body.attorney_id !== 'string' || body.attorney_id.length === 0) {
		error(400, 'attorney_id is required');
	}
	if (typeof body.starts_at !== 'string' || body.starts_at.length === 0) {
		error(400, 'starts_at is required');
	}
	if (typeof body.ends_at !== 'string' || body.ends_at.length === 0) {
		error(400, 'ends_at is required');
	}
	const data: GrantPoaRequest = {
		attorney_id: body.attorney_id,
		starts_at: body.starts_at,
		ends_at: body.ends_at
	};
	if (body.scope !== undefined) {
		if (!body.scope || typeof body.scope !== 'object' || Array.isArray(body.scope)) {
			error(400, 'scope must be an object');
		}
		const scope = body.scope as Record<string, unknown>;
		if (
			!Array.isArray(scope.application_ids) ||
			scope.application_ids.some((id) => typeof id !== 'string')
		) {
			error(400, 'application_ids is required');
		}
		if (
			!Array.isArray(scope.workflow_types) ||
			scope.workflow_types.some((t) => typeof t !== 'string')
		) {
			error(400, 'workflow_types is required');
		}
		data.scope = {
			application_ids: scope.application_ids as string[],
			workflow_types: scope.workflow_types as string[]
		} satisfies PoaScope;
	}
	if (body.reason !== undefined) {
		if (typeof body.reason !== 'string') {
			error(400, 'reason must be a string');
		}
		data.reason = body.reason;
	}
	const result = await grantPoa(data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
