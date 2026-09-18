import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { SYSTEM_TENANT_ID, requestTenantId } from '$lib/server/auth';

/**
 * Unauthenticated BFF for Home Realm Discovery on the login page.
 * Given an email, asks the backend whether the email's domain is federated
 * (enterprise SSO) or should use standard/password login.
 */
export const POST: RequestHandler = async ({ request, url, cookies, fetch: svelteKitFetch }) => {
	const body = await request.json().catch(() => null);
	const email = body && typeof body.email === 'string' ? body.email : '';
	if (!email) {
		error(400, 'email is required');
	}

	const tenantId = requestTenantId(url, cookies) || SYSTEM_TENANT_ID;

	const res = await svelteKitFetch(`${env.API_BASE_URL}/auth/federation/discover`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Tenant-Id': tenantId
		},
		body: JSON.stringify({ email })
	});

	if (!res.ok) {
		// Fail soft: treat discovery problems as "not federated" so password login still works.
		return json({ authentication_method: 'standard' });
	}

	const data = (await res.json().catch(() => ({}))) as { authentication_method?: string };
	return json({ authentication_method: data.authentication_method ?? 'standard' });
};
