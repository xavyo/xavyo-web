import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhiCertCampaignsV2, createNhiCertCampaignV2 } from '$lib/api/nhi-cert-campaigns';
import type { CreateNhiCertCampaignRequest } from '$lib/api/types';
import { listPagination } from '$lib/server/list-pagination';
import { ApiError } from '$lib/api/client';

const CERT_SCOPES = ['all', 'by_type', 'specific'] as const;

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	try {
		const status = url.searchParams.get('status') || undefined;
		const result = await listNhiCertCampaignsV2(
			{ status, ...listPagination(url) },
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ locals, request, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) return json({ error: 'Unauthorized' }, { status: 401 });
	let parsed: unknown;
	try {
		parsed = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}
	const body = parsed as Record<string, unknown>;
	if (typeof body.name !== 'string' || body.name.length === 0) {
		return json({ error: 'name is required' }, { status: 400 });
	}
	const data: CreateNhiCertCampaignRequest = { name: body.name };
	if (body.description !== undefined) {
		if (typeof body.description !== 'string') {
			return json({ error: 'description must be a string' }, { status: 400 });
		}
		data.description = body.description;
	}
	if (body.scope !== undefined) {
		if (!CERT_SCOPES.includes(body.scope as (typeof CERT_SCOPES)[number])) {
			return json({ error: 'scope is required' }, { status: 400 });
		}
		data.scope = body.scope as string;
	}
	if (body.nhi_type_filter !== undefined) {
		if (typeof body.nhi_type_filter !== 'string') {
			return json({ error: 'nhi_type_filter must be a string' }, { status: 400 });
		}
		data.nhi_type_filter = body.nhi_type_filter;
	}
	if (body.due_date !== undefined) {
		if (typeof body.due_date !== 'string') {
			return json({ error: 'due_date must be a string' }, { status: 400 });
		}
		data.due_date = body.due_date;
	}
	if (body.specific_nhi_ids !== undefined) {
		if (
			!Array.isArray(body.specific_nhi_ids) ||
			body.specific_nhi_ids.some((id) => typeof id !== 'string')
		) {
			return json({ error: 'specific_nhi_ids must be an array of strings' }, { status: 400 });
		}
		data.specific_nhi_ids = body.specific_nhi_ids as string[];
	}
	try {
		const result = await createNhiCertCampaignV2(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
