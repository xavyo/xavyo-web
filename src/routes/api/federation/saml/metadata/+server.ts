import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { hasAdminRole } from '$lib/server/auth';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals, fetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	if (!hasAdminRole(locals.user?.roles)) {
		error(403, 'Forbidden');
	}

	const baseUrl = env.API_BASE_URL;
	const tenantId = locals.tenantId;

	const res = await fetch(`${baseUrl}/saml/metadata?tenant=${tenantId}`, {
		headers: { 'X-Tenant-Id': tenantId }
	});

	if (!res.ok) {
		error(res.status, 'Failed to fetch IdP metadata from backend');
	}

	const xml = await res.text();

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'no-cache'
		}
	});
};
