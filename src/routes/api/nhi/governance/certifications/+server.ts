import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhiCertCampaigns, createNhiCertCampaign } from '$lib/api/nhi-governance';
import type { CreateNhiCertCampaignRequest } from '$lib/api/types';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';

const CERT_SCOPES = ['all', 'by_type', 'specific'] as const;

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const status = url.searchParams.get('status') ?? undefined;
		const result = await listNhiCertCampaigns(
			{ status, ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
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
	const data: CreateNhiCertCampaignRequest = { name: body.name };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			error(400, 'description must be a string');
		}
		data.description = body.description;
	}
	if (body.scope !== undefined) {
		if (!CERT_SCOPES.includes(body.scope as (typeof CERT_SCOPES)[number])) {
			error(400, 'scope is required');
		}
		data.scope = body.scope as string;
	}
	if (body.nhi_type_filter !== undefined) {
		if (typeof body.nhi_type_filter !== 'string') {
			error(400, 'nhi_type_filter must be a string');
		}
		data.nhi_type_filter = body.nhi_type_filter;
	}
	if (body.due_date !== undefined) {
		if (typeof body.due_date !== 'string') {
			error(400, 'due_date must be a string');
		}
		data.due_date = body.due_date;
	}
	if (body.specific_nhi_ids !== undefined) {
		if (
			!Array.isArray(body.specific_nhi_ids) ||
			body.specific_nhi_ids.some((id) => typeof id !== 'string')
		) {
			error(400, 'specific_nhi_ids must be an array of strings');
		}
		data.specific_nhi_ids = body.specific_nhi_ids as string[];
	}
	try {
		const result = await createNhiCertCampaign(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
