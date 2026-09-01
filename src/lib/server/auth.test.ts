import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	decodeAccessToken,
	isTokenExpired,
	isDecodableJwt,
	replaceAccessTokenIfJwt,
	setCookies,
	setMfaPartialToken,
	tenantIdFromJwt,
	tenantIdFromQuery,
	requestTenantId,
	stampTenantCookieFromQuery,
	clearAuthCookies,
	omitTokenFields,
	SYSTEM_TENANT_ID,
	sessionUserFromClaims
} from './auth';

describe('decodeAccessToken', () => {
	it('extracts user info from a valid JWT', () => {
		// Create a valid JWT payload: { sub: "user-123", email: "test@example.com", roles: ["admin"], tid: "tenant-1", exp: 9999999999, iat: 1000000000, iss: "xavyo", aud: ["xavyo-web"], jti: "jti-1" }
		const payload = {
			sub: 'user-123',
			email: 'test@example.com',
			roles: ['admin'],
			tid: 'tenant-1',
			exp: 9999999999,
			iat: 1000000000,
			iss: 'xavyo',
			aud: ['xavyo-web'],
			jti: 'jti-1'
		};
		const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
		const fakeJwt = `eyJhbGciOiJSUzI1NiJ9.${encodedPayload}.fakesignature`;

		const claims = decodeAccessToken(fakeJwt);

		expect(claims).toBeDefined();
		expect(claims!.sub).toBe('user-123');
		expect(claims!.email).toBe('test@example.com');
		expect(claims!.roles).toEqual(['admin']);
		expect(claims!.tid).toBe('tenant-1');
	});

	it('returns null for invalid token', () => {
		const claims = decodeAccessToken('not-a-jwt');
		expect(claims).toBeNull();
	});

	it('returns null for empty string', () => {
		const claims = decodeAccessToken('');
		expect(claims).toBeNull();
	});
});

describe('sessionUserFromClaims', () => {
	it('copies advertised JWT name onto display_name', () => {
		const user = sessionUserFromClaims({
			sub: 'user-1',
			iss: 'xavyo',
			aud: ['xavyo'],
			exp: 9999999999,
			iat: 1,
			jti: 'j',
			roles: ['user'],
			email: 'ada@example.com',
			name: 'Ada Lovelace'
		});
		expect(user).toEqual({
			id: 'user-1',
			email: 'ada@example.com',
			roles: ['user'],
			display_name: 'Ada Lovelace'
		});
	});

	it('uses null display_name when name is absent or blank', () => {
		expect(
			sessionUserFromClaims({
				sub: 'user-1',
				iss: 'xavyo',
				aud: ['xavyo'],
				exp: 1,
				iat: 1,
				jti: 'j',
				roles: []
			}).display_name
		).toBeNull();
		expect(
			sessionUserFromClaims({
				sub: 'user-1',
				iss: 'xavyo',
				aud: ['xavyo'],
				exp: 1,
				iat: 1,
				jti: 'j',
				roles: [],
				name: '   '
			}).display_name
		).toBeNull();
	});
});

describe('isTokenExpired', () => {
	it('returns true for expired token', () => {
		const payload = { sub: 'user-1', exp: 1000000000, iat: 999999999, iss: 'x', aud: [], jti: 'j', roles: [] };
		const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
		const expiredJwt = `eyJhbGciOiJSUzI1NiJ9.${encodedPayload}.sig`;

		expect(isTokenExpired(expiredJwt)).toBe(true);
	});

	it('returns false for non-expired token', () => {
		const payload = { sub: 'user-1', exp: 9999999999, iat: 1000000000, iss: 'x', aud: [], jti: 'j', roles: [] };
		const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
		const validJwt = `eyJhbGciOiJSUzI1NiJ9.${encodedPayload}.sig`;

		expect(isTokenExpired(validJwt)).toBe(false);
	});

	it('returns true for invalid token', () => {
		expect(isTokenExpired('bad-token')).toBe(true);
	});
});

describe('isDecodableJwt', () => {
	it('accepts a three-part JWT', () => {
		const payload = btoa(JSON.stringify({ sub: 'user-1', exp: 9999999999 })).replace(/=/g, '');
		expect(isDecodableJwt(`eyJhbGciOiJSUzI1NiJ9.${payload}.sig`)).toBe(true);
	});

	it('rejects placeholder identity-switch tokens', () => {
		expect(isDecodableJwt('persona_token_abc')).toBe(false);
		expect(isDecodableJwt('physical_token_abc')).toBe(false);
		expect(isDecodableJwt('assumed_token_abc')).toBe(false);
		expect(isDecodableJwt('original_token_abc')).toBe(false);
		expect(isDecodableJwt('not-a-jwt')).toBe(false);
		expect(isDecodableJwt('')).toBe(false);
	});
});

describe('replaceAccessTokenIfJwt', () => {
	it('sets the access_token cookie for a JWT', () => {
		const setCookie = vi.fn();
		const cookies = { set: setCookie } as unknown as Parameters<typeof replaceAccessTokenIfJwt>[0];
		const payload = btoa(JSON.stringify({ sub: 'user-1', exp: 9999999999 })).replace(/=/g, '');
		const jwt = `eyJhbGciOiJSUzI1NiJ9.${payload}.sig`;

		expect(replaceAccessTokenIfJwt(cookies, jwt, { maxAge: 3600, sameSite: 'strict', secure: true })).toBe(true);
		expect(setCookie).toHaveBeenCalledWith(
			'access_token',
			jwt,
			expect.objectContaining({ httpOnly: true, path: '/', maxAge: 3600, sameSite: 'strict' })
		);
	});

	it('does not evict the session cookie for a placeholder token', () => {
		const setCookie = vi.fn();
		const cookies = { set: setCookie } as unknown as Parameters<typeof replaceAccessTokenIfJwt>[0];

		expect(replaceAccessTokenIfJwt(cookies, 'persona_token_deadbeef', { maxAge: 3600 })).toBe(false);
		expect(replaceAccessTokenIfJwt(cookies, 'assumed_token_deadbeef', { maxAge: 3600 })).toBe(false);
		expect(replaceAccessTokenIfJwt(cookies, undefined, { maxAge: 3600 })).toBe(false);
		expect(setCookie).not.toHaveBeenCalled();
	});
});

describe('setCookies', () => {
	it('sets access_token and refresh_token as HttpOnly cookies', () => {
		const setCookie = vi.fn();
		const cookies = { set: setCookie } as unknown as Parameters<typeof setCookies>[0];

		setCookies(cookies, {
			access_token: 'at-123',
			refresh_token: 'rt-456',
			token_type: 'Bearer',
			expires_in: 3600
		});

		expect(setCookie).toHaveBeenCalledWith('access_token', 'at-123', expect.objectContaining({
			httpOnly: true,
			sameSite: 'lax',
			path: '/'
		}));

		expect(setCookie).toHaveBeenCalledWith('refresh_token', 'rt-456', expect.objectContaining({
			httpOnly: true,
			sameSite: 'lax',
			path: '/'
		}));
	});
});

describe('clearAuthCookies', () => {
	it('deletes auth tokens including original_access_token but preserves tenant_id', () => {
		const deleteCookie = vi.fn();
		const cookies = { delete: deleteCookie } as unknown as Parameters<typeof clearAuthCookies>[0];

		clearAuthCookies(cookies);

		expect(deleteCookie).toHaveBeenCalledWith('access_token', { path: '/' });
		expect(deleteCookie).toHaveBeenCalledWith('refresh_token', { path: '/' });
		expect(deleteCookie).toHaveBeenCalledWith('original_access_token', { path: '/' });
		expect(deleteCookie).toHaveBeenCalledWith('mfa_partial_token', { path: '/mfa' });
		expect(deleteCookie).not.toHaveBeenCalledWith('tenant_id', { path: '/' });
	});
});

function fakeJwtWithTid(tid: string): string {
	const payload = {
		sub: 'user-1',
		tid,
		purpose: 'mfa_verification',
		exp: 9999999999,
		iat: 1000000000,
		iss: 'xavyo',
		aud: ['xavyo-web'],
		jti: 'jti-mfa',
		roles: []
	};
	const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
	return `eyJhbGciOiJSUzI1NiJ9.${encodedPayload}.sig`;
}

describe('tenantIdFromJwt', () => {
	it('returns tid from a JWT', () => {
		expect(tenantIdFromJwt(fakeJwtWithTid('tenant-real'))).toBe('tenant-real');
	});

	it('returns undefined for missing or invalid tokens', () => {
		expect(tenantIdFromJwt(undefined)).toBeUndefined();
		expect(tenantIdFromJwt('')).toBeUndefined();
		expect(tenantIdFromJwt('not-a-jwt')).toBeUndefined();
	});
});

describe('tenantIdFromQuery', () => {
	it('accepts a UUID tenant id', () => {
		expect(tenantIdFromQuery('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')).toBe(
			'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
		);
	});

	it('rejects branding slugs and empty values', () => {
		expect(tenantIdFromQuery('system')).toBeUndefined();
		expect(tenantIdFromQuery('acme')).toBeUndefined();
		expect(tenantIdFromQuery('')).toBeUndefined();
		expect(tenantIdFromQuery(null)).toBeUndefined();
	});
});

describe('requestTenantId', () => {
	it('prefers a UUID query tenant over the cookie', () => {
		const url = new URL('http://localhost/login?tenant=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
		expect(requestTenantId(url, { get: () => SYSTEM_TENANT_ID })).toBe(
			'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
		);
	});

	it('falls back to the cookie when the query is a slug', () => {
		const url = new URL('http://localhost/login?tenant=system');
		expect(requestTenantId(url, { get: () => 'cookie-tenant' })).toBe('cookie-tenant');
	});
});

describe('stampTenantCookieFromQuery', () => {
	it('stamps a UUID query tenant onto the cookie', () => {
		const setCookie = vi.fn();
		const cookies = { set: setCookie } as unknown as Parameters<typeof stampTenantCookieFromQuery>[0];
		const url = new URL('http://localhost/login?tenant=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');

		expect(stampTenantCookieFromQuery(cookies, url)).toBe(
			'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
		);
		expect(setCookie).toHaveBeenCalledWith(
			'tenant_id',
			'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
			expect.objectContaining({ path: '/' })
		);
	});

	it('does not stamp branding slugs', () => {
		const setCookie = vi.fn();
		const cookies = { set: setCookie } as unknown as Parameters<typeof stampTenantCookieFromQuery>[0];
		expect(stampTenantCookieFromQuery(cookies, new URL('http://localhost/login?tenant=system'))).toBeUndefined();
		expect(setCookie).not.toHaveBeenCalled();
	});
});

describe('setMfaPartialToken', () => {
	it('stamps tenant_id from the partial JWT tid', () => {
		const setCookie = vi.fn();
		const cookies = { set: setCookie } as unknown as Parameters<typeof setMfaPartialToken>[0];
		const token = fakeJwtWithTid('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');

		setMfaPartialToken(cookies, token);

		expect(setCookie).toHaveBeenCalledWith(
			'mfa_partial_token',
			token,
			expect.objectContaining({ path: '/mfa' })
		);
		expect(setCookie).toHaveBeenCalledWith(
			'tenant_id',
			'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
			expect.objectContaining({ path: '/' })
		);
		expect(setCookie.mock.calls.map((c) => c[1])).not.toContain(SYSTEM_TENANT_ID);
	});
});

describe('omitTokenFields', () => {
	it('strips access_token and refresh_token from a session payload', () => {
		const publicPayload = omitTokenFields({
			session_id: 's-1',
			access_token: 'secret-at',
			refresh_token: 'secret-rt',
			active_persona_id: 'p-1'
		});
		expect(publicPayload).toEqual({ session_id: 's-1', active_persona_id: 'p-1' });
		expect(publicPayload).not.toHaveProperty('access_token');
		expect(publicPayload).not.toHaveProperty('refresh_token');
	});
});
