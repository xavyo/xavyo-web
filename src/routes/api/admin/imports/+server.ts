import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { listImportJobs, uploadImport } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');
	const status = url.searchParams.get('status') ?? undefined;

	const result = await listImportJobs(
		{ status, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};

export const POST: RequestHandler = async (event) => {
	if (!event.locals.accessToken || !event.locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(event.locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const formData = await event.request.formData();
		const file = formData.get('file') as File;
		if (!file || !(file instanceof File)) {
			return json({ error: 'No file provided' }, { status: 400 });
		}
		const sendInvitations = formData.get('send_invitations') === 'true';
		const result = await uploadImport(
			file,
			sendInvitations,
			event.locals.accessToken,
			event.locals.tenantId,
			event.fetch
		);
		return json(result, { status: 202 });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Upload failed' }, { status: 500 });
	}
};
