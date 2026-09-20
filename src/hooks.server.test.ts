import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'hooks.server.ts'), 'utf8');

describe('session tenant', () => {
	it('does not use the tenant_id cookie when a JWT is present', () => {
		expect(src).toContain('tenantIdFromJwt(accessToken)');
		expect(src).toContain('tenantIdFromJwt(tokens.access_token)');
		expect(src).not.toContain('claims.tid ?? tenantId');
		expect(src).not.toContain("claims.tid ?? event.cookies.get('tenant_id')");
	});

	it('sends leftover /onboarding URLs to /signup', () => {
		expect(src).toContain("pathname === '/onboarding'");
		expect(src).toContain("redirect(302, '/signup')");
	});

	it('aliases SES-default email link paths onto real auth routes', () => {
		expect(src).toContain("'/auth/verify-email': '/verify-email'");
		expect(src).toContain("'/auth/reset-password': '/reset-password'");
		expect(src).toContain('EMAIL_LINK_ALIASES');
		expect(src).toContain('`${emailAlias}${event.url.search}`');
		// OAuth social/federation callback must stay at /auth/callback.
		expect(src).not.toContain("'/auth/callback'");
	});

	it('copies advertised JWT name onto locals.user', () => {
		expect(src).toContain('sessionUserFromClaims(claims)');
		expect(src).not.toContain('email: claims.email ?? \'\'');
	});
});
