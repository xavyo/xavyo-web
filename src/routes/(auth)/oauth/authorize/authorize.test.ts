import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '+page.server.ts'), 'utf8');

describe('OAuth authorize tenant', () => {
	it('does not fall back to the system tenant on load, approve, or deny', () => {
		expect(src).not.toContain('SYSTEM_TENANT_ID');
		expect(src).toContain('requestTenantId(');
		expect(src).toContain('tenantIdFromQuery(');
		expect(src).toContain('Missing tenant context');
	});
});
