import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDomains, addDomain } from '$lib/api/federation';
import type { CreateDomainRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listDomains(params.id, locals.accessToken, locals.tenantId, fetch);
	return json(result);
};

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
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
	if (typeof body.domain !== 'string' || body.domain.length === 0) {
		error(400, 'domain is required');
	}
	const data: CreateDomainRequest = { domain: body.domain };
	if (body.priority !== undefined) {
		try {
			data.priority = parseBoundedInteger(body.priority, 0, 1_000_000, 'priority');
		} catch (e) {
			if (e instanceof JsonObjectError) error(400, e.message);
			throw e;
		}
	}
	const result = await addDomain(params.id, data, locals.accessToken, locals.tenantId, fetch);
	return json(result, { status: 201 });
};
