import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { apiClient } from '$lib/api/client';

interface ContinueSsoResponse {
	acs_url: string;
	saml_response: string;
	relay_state: string | null;
}

export const load: PageServerLoad = async ({ url, locals, fetch }) => {
	const sessionId = url.searchParams.get('session_id');

	if (!sessionId) {
		return { error: 'Missing session_id parameter' };
	}

	// If not authenticated, redirect to login with returnTo so user comes back here after login
	if (!locals.user || !locals.accessToken) {
		const returnTo = `/saml/callback?session_id=${encodeURIComponent(sessionId)}`;
		redirect(302, `/login?redirectTo=${encodeURIComponent(returnTo)}`);
	}

	try {
		const response = await apiClient<ContinueSsoResponse>('/saml/continue', {
			method: 'POST',
			body: { session_id: sessionId },
			token: locals.accessToken,
			tenantId: locals.tenantId,
			fetch
		});

		return {
			acs_url: response.acs_url,
			saml_response: response.saml_response,
			relay_state: response.relay_state
		};
	} catch (e) {
		const message = e instanceof Error ? e.message : 'Failed to complete SAML SSO';
		return { error: message };
	}
};
