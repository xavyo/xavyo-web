import { dev } from '$app/environment';
import { decodeJwt } from 'jose';
import type { JwtClaims, TokenResponse } from '$lib/api/types';
import type { Cookies } from '@sveltejs/kit';

export const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export function decodeAccessToken(token: string): JwtClaims | null {
	if (!token) return null;
	try {
		const claims = decodeJwt<JwtClaims>(token);
		return claims as JwtClaims;
	} catch {
		return null;
	}
}

export function isTokenExpired(token: string): boolean {
	const claims = decodeAccessToken(token);
	if (!claims) return true;
	const now = Math.floor(Date.now() / 1000);
	return claims.exp <= now;
}

/** True when `token` decodes as a JWT (header.payload.signature). */
export function isDecodableJwt(token: string): boolean {
	return decodeAccessToken(token) !== null;
}

export type AccessTokenCookieOptions = {
	maxAge: number;
	sameSite?: 'lax' | 'strict' | 'none';
	secure?: boolean;
};

/**
 * Replace the session `access_token` cookie only when `token` is a JWT.
 * Placeholder strings (`persona_token_*`, `assumed_token_*`) must not evict a real session.
 */
export function replaceAccessTokenIfJwt(
	cookies: Cookies,
	token: string | undefined | null,
	options: AccessTokenCookieOptions
): boolean {
	if (!token || !isDecodableJwt(token)) {
		return false;
	}
	const secure = options.secure ?? !dev;
	cookies.set('access_token', token, {
		httpOnly: true,
		secure,
		sameSite: options.sameSite ?? 'lax',
		path: '/',
		maxAge: options.maxAge
	});
	return true;
}

export function setCookies(cookies: Cookies, tokens: TokenResponse): void {
	const secure = !dev;

	cookies.set('access_token', tokens.access_token, {
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: '/',
		maxAge: tokens.expires_in
	});

	cookies.set('refresh_token', tokens.refresh_token, {
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 30 // 30 days
	});

	// Set tenant_id from JWT claims
	const claims = decodeAccessToken(tokens.access_token);
	if (claims?.tid) {
		cookies.set('tenant_id', claims.tid, {
			httpOnly: true,
			secure,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
	}
}

export const MFA_PARTIAL_TOKEN_COOKIE = 'mfa_partial_token';

export function setMfaPartialToken(cookies: Cookies, token: string): void {
	const secure = !dev;
	cookies.set(MFA_PARTIAL_TOKEN_COOKIE, token, {
		httpOnly: true,
		secure,
		sameSite: 'lax',
		path: '/mfa',
		maxAge: 60 * 5
	});
}

export function clearMfaPartialToken(cookies: Cookies): void {
	cookies.delete(MFA_PARTIAL_TOKEN_COOKIE, { path: '/mfa' });
}

export function clearAuthCookies(cookies: Cookies): void {
	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });
	cookies.delete('original_access_token', { path: '/' });
	clearMfaPartialToken(cookies);
	// tenant_id is intentionally preserved so users return to their
	// tenant on next login instead of being redirected to onboarding
}

/** Strip bearer tokens so BFF JSON never exposes them to the browser. */
export function omitTokenFields<T extends Record<string, unknown>>(
	payload: T
): Omit<T, 'access_token' | 'refresh_token'> {
	const { access_token: _access, refresh_token: _refresh, ...rest } = payload;
	return rest as Omit<T, 'access_token' | 'refresh_token'>;
}

/**
 * Check if a user has admin-level access.
 * Mirrors backend role hierarchy: super_admin implies admin.
 */
export function hasAdminRole(roles: string[] | undefined): boolean {
	if (!roles) return false;
	return roles.includes('admin') || roles.includes('super_admin');
}
