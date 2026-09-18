import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { startMfaWebauthn } from '$lib/api/auth';
import { MFA_PARTIAL_TOKEN_COOKIE, tenantIdFromJwt } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

// Start a WebAuthn assertion during the login MFA challenge. Lives under /mfa so
// the path-scoped mfa_partial_token cookie is sent with the request.
export const POST: RequestHandler = async ({ cookies, fetch }) => {
	const partialToken = cookies.get(MFA_PARTIAL_TOKEN_COOKIE);
	if (!partialToken) {
		error(401, 'No MFA session');
	}
	const tenantId = tenantIdFromJwt(partialToken);
	if (!tenantId) {
		error(401, 'Invalid MFA session');
	}

	try {
		const options = await startMfaWebauthn(partialToken, tenantId, fetch);
		return json(options);
	} catch (e) {
		if (e instanceof ApiError) {
			return json({ error: e.message }, { status: e.status });
		}
		return json({ error: 'An unexpected error occurred' }, { status: 500 });
	}
};
