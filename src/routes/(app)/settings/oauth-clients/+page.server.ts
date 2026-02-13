import type { PageServerLoad } from './$types';
import { listOAuthClients } from '$lib/api/oauth-clients';
import { ApiError } from '$lib/api/client';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	try {
		const result = await listOAuthClients(locals.accessToken!, locals.tenantId!, fetch);
		return { clients: result.clients, total: result.total };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load OAuth clients');
	}
};
