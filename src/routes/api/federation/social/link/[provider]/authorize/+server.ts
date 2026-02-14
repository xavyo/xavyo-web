import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ params, locals, fetch: svelteKitFetch }) => {
	if (!locals.accessToken || !locals.tenantId) {
		error(401, 'Unauthorized');
	}

	const headers = new Headers();
	headers.set('Authorization', `Bearer ${locals.accessToken}`);
	headers.set('X-Tenant-Id', locals.tenantId);

	const res = await svelteKitFetch(
		`${env.API_BASE_URL}/auth/social/link/${params.provider}/authorize`,
		{
			method: 'GET',
			headers,
			redirect: 'manual'
		}
	);

	const location = res.headers.get('Location');
	if (location) {
		redirect(302, location);
	}

	error(500, 'Failed to initiate social linking');
};
