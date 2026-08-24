import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	listWebauthnCredentials,
	updateWebauthnCredential,
	deleteWebauthnCredential
} from '$lib/api/mfa';
import { ApiError } from '$lib/api/client';
import type { UpdateCredentialRequest } from '$lib/api/types';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	try {
		const result = await listWebauthnCredentials(locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ url, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const id = url.searchParams.get('id');
	if (!id) {
		error(400, 'Missing credential id');
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
		const data: UpdateCredentialRequest = { name: body.name };
		const result = await updateWebauthnCredential(
			id,
			data,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const id = url.searchParams.get('id');
	if (!id) {
		error(400, 'Missing credential id');
	}

	try {
		await deleteWebauthnCredential(id, locals.accessToken, locals.tenantId, fetch);
		return new Response(null, { status: 204 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
