import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

describe('federation mapping JSON must be objects', () => {
	it('OIDC create uses parseJsonStringRecord', () => {
		const src = readFileSync(join(dir, 'oidc/create/+page.server.ts'), 'utf8');
		expect(src).toContain('parseJsonStringRecord(');
		expect(src).not.toContain('JSON.parse(form.data.claim_mapping)');
	});

	it('OIDC edit uses parseJsonStringRecord', () => {
		const src = readFileSync(join(dir, 'oidc/[id]/+page.server.ts'), 'utf8');
		expect(src).toContain('parseJsonStringRecord(');
		expect(src).not.toContain('JSON.parse(form.data.claim_mapping)');
	});

	it('SAML create uses parseJsonRecord', () => {
		const src = readFileSync(join(dir, 'saml/create/+page.server.ts'), 'utf8');
		expect(src).toContain('parseJsonRecord(');
		expect(src).not.toContain('JSON.parse(form.data.attribute_mapping)');
	});

	it('SAML edit uses parseJsonRecord', () => {
		const src = readFileSync(join(dir, 'saml/[id]/+page.server.ts'), 'utf8');
		expect(src).toContain('parseJsonRecord(');
		expect(src).not.toContain('JSON.parse(form.data.attribute_mapping)');
	});
});
