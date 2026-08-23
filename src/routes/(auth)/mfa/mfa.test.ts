import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '+page.server.ts'), 'utf8');

describe('MFA page tenant', () => {
	it('does not fall back to the system tenant for TOTP or recovery verify', () => {
		expect(src).not.toContain('SYSTEM_TENANT_ID');
		expect(src).toContain('tenantIdFromJwt(');
		const totp = src.includes('verifyMfaTotp');
		const recovery = src.includes('verifyMfaRecovery');
		expect(totp && recovery).toBe(true);
		expect(src).toContain("cookies.get('tenant_id') || tenantIdFromJwt(partialToken)");
	});
});
