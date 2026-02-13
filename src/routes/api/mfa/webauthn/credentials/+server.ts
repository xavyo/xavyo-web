import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	listWebauthnCredentials,
	updateWebauthnCredential,
	deleteWebauthnCredential
} from '$lib/api/mfa';
import { ApiError } from '$lib/api/client';

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
		const body = await request.json();
		const result = await updateWebauthnCredential(
			id,
			body,
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
