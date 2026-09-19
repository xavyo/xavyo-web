import { getProfile } from '$lib/api/me';

export type SessionLocals = {
	accessToken?: string | null;
	tenantId?: string | null;
	user?: { email?: string } | null;
};

/**
 * Source of truth is GET /me/profile (`email_verified`). JWT has no such claim.
 * Fail closed: missing session or a profile error is treated as unverified so
 * the invite form is not shown when the API would 403.
 */
export async function currentUserEmailVerified(
	locals: SessionLocals,
	fetchFn: typeof fetch
): Promise<{ emailVerified: boolean; email: string }> {
	const fallbackEmail = locals.user?.email ?? '';
	if (!locals.accessToken || !locals.tenantId) {
		return { emailVerified: false, email: fallbackEmail };
	}

	try {
		const profile = await getProfile(locals.accessToken, locals.tenantId, fetchFn);
		return {
			emailVerified: profile.email_verified === true,
			email: profile.email || fallbackEmail
		};
	} catch {
		return { emailVerified: false, email: fallbackEmail };
	}
}
