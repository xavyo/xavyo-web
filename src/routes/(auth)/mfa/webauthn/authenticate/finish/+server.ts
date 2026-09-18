import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { finishMfaWebauthn } from '$lib/api/auth';
import {
	setCookies,
	clearMfaPartialToken,
	MFA_PARTIAL_TOKEN_COOKIE,
	tenantIdFromJwt
} from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

// Complete a WebAuthn assertion during the login MFA challenge. Lives under /mfa
// so the path-scoped mfa_partial_token cookie is sent. On success the backend
// returns a full session; set the auth cookies and clear the partial token.
export const POST: RequestHandler = async ({ request, cookies, fetch }) => {
	const partialToken = cookies.get(MFA_PARTIAL_TOKEN_COOKIE);
	if (!partialToken) {
		error(401, 'No MFA session');
	}
	const tenantId = tenantIdFromJwt(partialToken);
	if (!tenantId) {
		error(401, 'Invalid MFA session');
	}

	let credential: unknown;
	try {
		credential = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	try {
		const tokens = await finishMfaWebauthn(partialToken, credential, tenantId, fetch);
		setCookies(cookies, tokens);
		clearMfaPartialToken(cookies);
		return json({ success: true });
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
