import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchAdminLoginAttempts } from '$lib/api/audit';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	// Admin-only endpoint
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const cursor = url.searchParams.get('cursor') ?? undefined;
	const limit = url.searchParams.get('limit')
		? Number(url.searchParams.get('limit'))
		: undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const email = url.searchParams.get('email') ?? undefined;
	const start_date = url.searchParams.get('start_date') ?? undefined;
	const end_date = url.searchParams.get('end_date') ?? undefined;
	const successParam = url.searchParams.get('success');
	const success =
		successParam === 'true' ? true : successParam === 'false' ? false : undefined;
	const auth_method = url.searchParams.get('auth_method') ?? undefined;

	const result = await fetchAdminLoginAttempts(
		{ cursor, limit, user_id, email, start_date, end_date, success, auth_method },
		locals.accessToken,
		locals.tenantId,
		fetch
	);

	return json(result);
};
