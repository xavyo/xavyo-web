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

	it('copies advertised JWT name onto locals.user', () => {
		expect(src).toContain('sessionUserFromClaims(claims)');
		expect(src).not.toContain('email: claims.email ?? \'\'');
	});
});
