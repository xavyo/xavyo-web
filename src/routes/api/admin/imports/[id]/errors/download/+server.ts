import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { downloadImportErrors } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';

export const GET: RequestHandler = async (event) => {
	if (!event.locals.accessToken || !event.locals.tenantId) {
		error(401, 'Unauthorized');
	}
	if (!hasAdminRole(event.locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	try {
		const response = await downloadImportErrors(
			event.params.id,
			event.locals.accessToken,
			event.locals.tenantId,
			event.fetch
		);
		return new Response(response.body, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="import-errors-${event.params.id}.csv"`
			}
		});
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'Download failed' }, { status: 500 });
	}
};
