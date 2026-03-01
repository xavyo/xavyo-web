import type { Actions, PageServerLoad } from './$types';
import { redirect, fail, isRedirect } from '@sveltejs/kit';
import { getAuthorizeInfo, grantAuthorizationCode } from '$lib/api/oauth-authorize';
import { ApiError } from '$lib/api/client';
import { SYSTEM_TENANT_ID } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals, url, cookies }) => {
	// Parse OAuth query parameters
	const client_id = url.searchParams.get('client_id') ?? '';
	const redirect_uri = url.searchParams.get('redirect_uri') ?? '';
	const scope = url.searchParams.get('scope') ?? '';
	const state = url.searchParams.get('state') ?? '';
	const code_challenge = url.searchParams.get('code_challenge') ?? '';
	const code_challenge_method = url.searchParams.get('code_challenge_method') ?? '';
	const nonce = url.searchParams.get('nonce') ?? '';
	const response_type = url.searchParams.get('response_type') ?? '';

	// Validate response_type
	if (response_type !== 'code') {
		return {
			error: 'unsupported_response_type',
			errorDescription: 'Only response_type=code is supported'
		};
	}

	// Validate required params
	if (!client_id || !redirect_uri || !code_challenge || !code_challenge_method) {
		return {
			error: 'invalid_request',
			errorDescription:
				'Missing required parameters: client_id, redirect_uri, code_challenge, code_challenge_method'
		};
	}

	// If not authenticated, redirect to login with full OAuth URL as redirectTo
	if (!locals.user || !locals.accessToken) {
		const currentUrl = url.pathname + url.search;
		// Propagate tenant context from OAuth flow to login page via cookie
		const tenant = url.searchParams.get('tenant');
		if (tenant) {
			cookies.set('tenant_id', tenant, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 300 });
		}
		redirect(302, `/login?redirectTo=${encodeURIComponent(currentUrl)}`);
	}

	// OAuth flows carry tenant context explicitly — prefer it over the session tenant.
	// This handles the case where the user is already logged in under a different
	// tenant (e.g., system admin) but the OAuth client belongs to a specific tenant.
	const oauthTenant = url.searchParams.get('tenant');
	const tenantId = oauthTenant || locals.tenantId || SYSTEM_TENANT_ID;

	// Fetch client info from backend (validates client_id, redirect_uri, scopes)
	try {
		const clientInfo = await getAuthorizeInfo(
			{ client_id, redirect_uri, scope },
			locals.accessToken,
			tenantId,
			fetch
		);

		return {
			clientInfo,
			oauthParams: {
				client_id,
				redirect_uri,
				scope,
				state,
				code_challenge,
				code_challenge_method,
				nonce
			},
			userEmail: locals.user.email
		};
	} catch (e) {
		if (e instanceof ApiError) {
			return {
				error: 'invalid_request',
				errorDescription: e.message
			};
		}
		return {
			error: 'server_error',
			errorDescription: 'Failed to validate authorization request'
		};
	}
};

export const actions: Actions = {
	approve: async ({ request, locals, fetch }) => {
		if (!locals.user || !locals.accessToken) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const client_id = formData.get('client_id')?.toString() ?? '';
		const redirect_uri = formData.get('redirect_uri')?.toString() ?? '';
		const scope = formData.get('scope')?.toString() ?? '';
		const state = formData.get('state')?.toString() ?? '';
		const code_challenge = formData.get('code_challenge')?.toString() ?? '';
		const code_challenge_method = formData.get('code_challenge_method')?.toString() ?? '';
		const nonce = formData.get('nonce')?.toString() ?? '';
		const tenant = formData.get('tenant')?.toString() ?? '';

		if (!client_id || !redirect_uri || !code_challenge || !code_challenge_method) {
			return fail(400, { error: 'Missing required OAuth parameters' });
		}

		const tenantId = tenant || locals.tenantId || SYSTEM_TENANT_ID;

		try {
			const result = await grantAuthorizationCode(
				{
					client_id,
					redirect_uri,
					scope,
					state,
					code_challenge,
					code_challenge_method,
					...(nonce ? { nonce } : {})
				},
				locals.accessToken,
				tenantId,
				fetch
			);

			// Build redirect URL with authorization code.
			// result.redirect_uri is backend-validated (checked against registered URIs).
			const redirectUrl = new URL(result.redirect_uri);
			redirectUrl.searchParams.set('code', result.authorization_code);
			if (result.state) {
				redirectUrl.searchParams.set('state', result.state);
			}

			redirect(302, redirectUrl.toString());
		} catch (e) {
			if (isRedirect(e)) throw e;
			if (e instanceof ApiError) {
				return fail(e.status, { error: e.message });
			}
			return fail(500, { error: 'An unexpected error occurred' });
		}
	},

	deny: async ({ request, locals, fetch }) => {
		// Require authentication — prevents anonymous abuse of this action
		if (!locals.user || !locals.accessToken) {
			return fail(401, { error: 'Not authenticated' });
		}

		const formData = await request.formData();
		const client_id = formData.get('client_id')?.toString() ?? '';
		const redirect_uri = formData.get('redirect_uri')?.toString() ?? '';
		const scope = formData.get('scope')?.toString() ?? '';
		const state = formData.get('state')?.toString() ?? '';
		const tenant = formData.get('tenant')?.toString() ?? '';

		if (!client_id || !redirect_uri) {
			return fail(400, { error: 'Missing required parameters' });
		}

		const tenantId = tenant || locals.tenantId || SYSTEM_TENANT_ID;

		// Re-validate redirect_uri against the backend before redirecting.
		// Hidden form fields are tamper-able — we must not redirect to an
		// unvalidated URI (open redirect vulnerability).
		try {
			await getAuthorizeInfo(
				{ client_id, redirect_uri, scope },
				locals.accessToken,
				tenantId,
				fetch
			);
		} catch (e) {
			if (e instanceof ApiError) {
				return fail(e.status, { error: `Invalid request: ${e.message}` });
			}
			return fail(500, { error: 'Failed to validate redirect URI' });
		}

		// redirect_uri is now backend-validated — safe to redirect
		try {
			const redirectUrl = new URL(redirect_uri);
			redirectUrl.searchParams.set('error', 'access_denied');
			redirectUrl.searchParams.set('error_description', 'User denied the request');
			if (state) {
				redirectUrl.searchParams.set('state', state);
			}

			redirect(302, redirectUrl.toString());
		} catch (e) {
			if (isRedirect(e)) throw e;
			return fail(400, { error: 'Invalid redirect URI' });
		}
	}
};
