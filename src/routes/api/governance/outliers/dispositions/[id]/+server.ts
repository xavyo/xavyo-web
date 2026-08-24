import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDisposition, updateDisposition } from '$lib/api/outliers';
import type { CreateDispositionRequest, OutlierDispositionStatus } from '$lib/api/types';

const STATUSES = [
	'new',
	'legitimate',
	'requires_remediation',
	'under_investigation',
	'remediated'
] as const;

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	const result = await getDisposition(params.id, locals.accessToken, locals.tenantId, fetch);
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
	if (!STATUSES.includes(body.status as (typeof STATUSES)[number])) {
		error(400, 'status is required');
	}
	const data: CreateDispositionRequest = {
		status: body.status as OutlierDispositionStatus
	};
	if (body.justification !== undefined) {
		if (typeof body.justification !== 'string') {
			error(400, 'justification must be a string');
		}
		data.justification = body.justification;
	}
	if (body.expires_at !== undefined) {
		if (typeof body.expires_at !== 'string') {
			error(400, 'expires_at must be a string');
		}
		data.expires_at = body.expires_at;
	}
	const result = await updateDisposition(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};
