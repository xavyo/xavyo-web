import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { verifyMagicLink } from '$lib/api/auth';
import { setCookies, decodeAccessToken } from '$lib/server/auth';
import { dev } from '$app/environment';
import { ApiError } from '$lib/api/client';

export const load: PageServerLoad = async ({ url, cookies, fetch }) => {
	const token = url.searchParams.get('token');
	if (!token) {
		return { error: 'No verification token provided' };
	}

	const tenantId = cookies.get('tenant_id');

	try {
		const result = await verifyMagicLink(token, tenantId, fetch);

		// Check if MFA is required (partial_token in response)
		if ('mfa_required' in result && (result as Record<string, unknown>).mfa_required) {
			const partial = result as unknown as { partial_token: string };
			redirect(302, `/mfa?partial_token=${encodeURIComponent(partial.partial_token)}`);
		}

		// Success — set cookies and redirect
		setCookies(cookies, result);

		const claims = decodeAccessToken(result.access_token);
		if (claims?.tid) {
			cookies.set('tenant_id', claims.tid, {
				httpOnly: true,
				secure: !dev,
				sameSite: 'lax',
				path: '/',
				maxAge: 60 * 60 * 24 * 30
			});
		}
	} catch (e) {
		if (e instanceof ApiError) {
			return { error: e.message };
		}
		return { error: 'Verification failed. The link may have expired.' };
	}

	redirect(302, '/dashboard');
};
