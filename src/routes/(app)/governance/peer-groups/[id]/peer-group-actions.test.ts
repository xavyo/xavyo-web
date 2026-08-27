import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '+page.server.ts'), 'utf8');
const production = src.split('export const actions')[1] ?? src;

describe('peer group actions', () => {
	it('does not report HTTP success when delete or refresh fail', () => {
		expect(production).toContain('return fail(');
		expect(production).not.toContain("return { error: e.message }");
		expect(production).not.toContain("return { error: 'An unexpected error occurred' }");
	});
});
