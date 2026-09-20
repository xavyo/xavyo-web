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
		// Shared issuers need ?tenant= (or X-Tenant-ID) on /oauth/authorize — surface the
		// workspace id next to issuer/discovery so free-plan OIDC smoke can copy it.
		const tenantId = locals.tenantId ?? null;
		return { clients: result.clients, total: result.total, issuerUrl, discoveryUrl, tenantId };
	} catch (e) {
		if (e instanceof ApiError) {
			error(e.status, e.message);
		}
		error(500, 'Failed to load OAuth clients');
	}
};
