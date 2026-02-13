import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { replayDlqEntry } from '$lib/api/webhooks';

export const POST: RequestHandler = async ({ params, locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	await replayDlqEntry(params.entryId, locals.accessToken, locals.tenantId, fetch);

	return json({ success: true });
};
