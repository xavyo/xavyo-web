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

export function clearAuthCookies(cookies: Cookies): void {
	cookies.delete('access_token', { path: '/' });
	cookies.delete('refresh_token', { path: '/' });
	cookies.delete('tenant_id', { path: '/' });
}

/**
 * Check if a user has admin-level access.
 * Mirrors backend role hierarchy: super_admin implies admin.
 */
export function hasAdminRole(roles: string[] | undefined): boolean {
	if (!roles) return false;
	return roles.includes('admin') || roles.includes('super_admin');
}
