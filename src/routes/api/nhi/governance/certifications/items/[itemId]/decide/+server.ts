import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { decideNhiCertItem } from '$lib/api/nhi-governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ params, request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const { decision } = await request.json();
		if (decision !== 'certify' && decision !== 'revoke') {
			error(400, 'Invalid decision. Must be "certify" or "revoke".');
		}
		const result = await decideNhiCertItem(params.itemId, decision, locals.accessToken, locals.tenantId, fetch);
		return json(result);
	} catch (e) {
		if (e instanceof ApiError) error(e.status, e.message);
		throw e;
	}
};
