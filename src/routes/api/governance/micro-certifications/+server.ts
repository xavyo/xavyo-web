import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { listMicroCertifications, bulkDecideMicroCertifications } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

export const GET: RequestHandler = async ({ url, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const status = url.searchParams.get('status') ?? undefined;
	const user_id = url.searchParams.get('user_id') ?? undefined;
	const reviewer_id = url.searchParams.get('reviewer_id') ?? undefined;
	const entitlement_id = url.searchParams.get('entitlement_id') ?? undefined;
	const escalated =
		url.searchParams.get('escalated') !== null
			? url.searchParams.get('escalated') === 'true'
			: undefined;
	const past_deadline =
		url.searchParams.get('past_deadline') !== null
			? url.searchParams.get('past_deadline') === 'true'
			: undefined;
	const limit = Number(url.searchParams.get('limit') ?? '20');
	const offset = Number(url.searchParams.get('offset') ?? '0');

	const result = await listMicroCertifications(
		{ status, user_id, reviewer_id, entitlement_id, escalated, past_deadline, limit, offset },
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const body = await request.json();
	const result = await bulkDecideMicroCertifications(
		body,
		locals.accessToken,
		locals.tenantId,
		fetch
	);
	return json(result);
};
