import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listDelegationGrants, createDelegationGrant } from '$lib/api/nhi-delegations';
import { ApiError } from '$lib/api/client';
import { listPagination } from '$lib/server/list-pagination';
import type { CreateDelegationGrantRequest } from '$lib/api/types';
import { JsonObjectError, parseBoundedInteger } from '$lib/utils/json-record';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const principal_id = url.searchParams.get('principal_id') || undefined;
		const actor_nhi_id = url.searchParams.get('actor_nhi_id') || undefined;
		const status = url.searchParams.get('status') || undefined;
		const result = await listDelegationGrants(
			{ principal_id, actor_nhi_id, status, ...listPagination(url) },
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
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
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
		if (typeof body.principal_id !== 'string' || body.principal_id.length === 0) {
			return json({ error: 'principal_id is required' }, { status: 400 });
		}
		if (body.principal_type !== 'user' && body.principal_type !== 'nhi') {
			return json({ error: 'principal_type is required' }, { status: 400 });
		}
		if (typeof body.actor_nhi_id !== 'string' || body.actor_nhi_id.length === 0) {
			return json({ error: 'actor_nhi_id is required' }, { status: 400 });
		}
		if (
			!Array.isArray(body.allowed_scopes) ||
			body.allowed_scopes.length === 0 ||
			!body.allowed_scopes.every((item) => typeof item === 'string')
		) {
			return json({ error: 'allowed_scopes is required' }, { status: 400 });
		}
		if (
			!Array.isArray(body.allowed_resource_types) ||
			body.allowed_resource_types.length === 0 ||
			!body.allowed_resource_types.every((item) => typeof item === 'string')
		) {
			return json({ error: 'allowed_resource_types is required' }, { status: 400 });
		}
		const data: CreateDelegationGrantRequest = {
			principal_id: body.principal_id,
			principal_type: body.principal_type,
			actor_nhi_id: body.actor_nhi_id,
			allowed_scopes: body.allowed_scopes,
			allowed_resource_types: body.allowed_resource_types
		};
		if (body.max_delegation_depth !== undefined) {
			try {
				data.max_delegation_depth = parseBoundedInteger(
					body.max_delegation_depth,
					0,
					100,
					'max_delegation_depth'
				);
			} catch (e) {
				if (e instanceof JsonObjectError) {
					return json({ error: e.message }, { status: 400 });
				}
				throw e;
			}
		}
		if (body.expires_at !== undefined) {
			if (typeof body.expires_at !== 'string') {
				return json({ error: 'expires_at must be a string' }, { status: 400 });
			}
			data.expires_at = body.expires_at;
		}
		const result = await createDelegationGrant(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
