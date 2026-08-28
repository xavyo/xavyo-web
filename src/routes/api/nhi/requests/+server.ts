import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listNhiRequests, submitNhiRequest } from '$lib/api/nhi-requests';
import { ApiError } from '$lib/api/client';
import type { SubmitNhiRequestBody } from '$lib/api/types';

export const GET: RequestHandler = async ({ locals, url, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const status = url.searchParams.get('status') || undefined;
		const requester_id = url.searchParams.get('requester_id') || undefined;
		const pending_only = url.searchParams.get('pending_only') === 'true' || undefined;
		const limit = url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined;
		const offset = url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : undefined;
		const result = await listNhiRequests(
			{ status, requester_id, pending_only, limit, offset },
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
		if (typeof body.name !== 'string' || body.name.length === 0) {
			return json({ error: 'name is required' }, { status: 400 });
		}
		if (typeof body.purpose !== 'string' || body.purpose.length === 0) {
			return json({ error: 'purpose is required' }, { status: 400 });
		}
		const data: SubmitNhiRequestBody = { name: body.name, purpose: body.purpose };
		if (body.requested_permissions !== undefined) {
			if (
				!Array.isArray(body.requested_permissions) ||
				!body.requested_permissions.every((item) => typeof item === 'string')
			) {
				return json({ error: 'requested_permissions must be an array of strings' }, { status: 400 });
			}
			data.requested_permissions = body.requested_permissions;
		}
		if (body.requested_expiration !== undefined) {
			if (typeof body.requested_expiration !== 'string') {
				return json({ error: 'requested_expiration must be a string' }, { status: 400 });
			}
			data.requested_expiration = body.requested_expiration;
		}
		const rotation =
			body.requested_rotation_days !== undefined
				? body.requested_rotation_days
				: body.rotation_interval_days;
		if (rotation !== undefined) {
			if (typeof rotation !== 'number') {
				return json({ error: 'requested_rotation_days must be a number' }, { status: 400 });
			}
			data.requested_rotation_days = rotation;
		}
		const result = await submitNhiRequest(data, locals.accessToken, locals.tenantId, fetch);
		return json(result, { status: 201 });
	} catch (e) {
		if (e instanceof ApiError) return json({ error: e.message }, { status: e.status });
		return json({ error: 'Internal error' }, { status: 500 });
	}
};
