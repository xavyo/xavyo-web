import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listInvitations, createInvitation } from '$lib/api/invitations';
import { listPagination } from '$lib/server/list-pagination';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const status = url.searchParams.get('status') ?? undefined;
	const email = url.searchParams.get('email') ?? undefined;

	const result = await listInvitations(
		{ status, email, ...listPagination(url) },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

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
	if (typeof body.email !== 'string' || body.email.length === 0) {
		error(400, 'email is required');
	}
	let role: string | undefined;
	if (body.role !== undefined) {
		if (typeof body.role !== 'string') {
			error(400, 'role must be a string');
		}
		role = body.role;
	}
	const result = await createInvitation(
		{
			email: body.email,
			role
		},
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result, { status: 201 });
};
