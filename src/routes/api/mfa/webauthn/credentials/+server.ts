import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	listWebauthnCredentials,
	updateWebauthnCredential,
	deleteWebauthnCredential
} from '$lib/api/mfa';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const result = await listWebauthnCredentials(locals.accessToken, locals.tenantId, fetch);

	return json(result);
};

export const PATCH: RequestHandler = async ({ url, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const id = url.searchParams.get('id');
	if (!id) {
		error(400, 'Missing credential id');
	}

	const body = await request.json();
	const result = await updateWebauthnCredential(
		id,
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const DELETE: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const id = url.searchParams.get('id');
	if (!id) {
		error(400, 'Missing credential id');
	}

	await deleteWebauthnCredential(id, locals.accessToken, locals.tenantId, fetch);

	return new Response(null, { status: 204 });
};
