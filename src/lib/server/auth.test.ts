import { describe, it, expect, vi, beforeEach } from 'vitest';
import { decodeAccessToken, isTokenExpired, setCookies, clearAuthCookies } from './auth';

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
	it('deletes auth tokens but preserves tenant_id', () => {
		const deleteCookie = vi.fn();
		const cookies = { delete: deleteCookie } as unknown as Parameters<typeof clearAuthCookies>[0];

		clearAuthCookies(cookies);

		expect(deleteCookie).toHaveBeenCalledWith('access_token', { path: '/' });
		expect(deleteCookie).toHaveBeenCalledWith('refresh_token', { path: '/' });
		expect(deleteCookie).not.toHaveBeenCalledWith('tenant_id', { path: '/' });
		expect(deleteCookie).toHaveBeenCalledTimes(2);
	});
});
