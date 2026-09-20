import type { PageServerLoad } from './$types';
import { listOAuthClients } from '$lib/api/oauth-clients';
import { ApiError } from '$lib/api/client';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals, fetch }) => {
	try {
		const result = await listOAuthClients(locals.accessToken!, locals.tenantId!, fetch);
		const apiBase = (env.API_BASE_URL ?? '').replace(/\/$/, '');
		const issuerUrl = apiBase || null;
		const discoveryUrl = apiBase ? `${apiBase}/.well-known/openid-configuration` : null;
		return { clients: result.clients, total: result.total, issuerUrl, discoveryUrl };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load OAuth clients');
	}
};
