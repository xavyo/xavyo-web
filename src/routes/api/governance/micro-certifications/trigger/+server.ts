import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { manualTriggerCertification } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) error(401, 'Unauthorized');
	if (!hasAdminRole(locals.user?.roles)) error(403, 'Admin access required');

	const body = await request.json();
	try {
		const result = await manualTriggerCertification(
			body,
			locals.accessToken,
			locals.tenantId,
			fetch
		);
		return json(result, { status: 201 });
	} catch (e: any) {
		const msg = e?.message || e?.body?.message || String(e);
		const status = e?.status || 500;
		return json({ error: msg, detail: e?.body }, { status });
	}
};
