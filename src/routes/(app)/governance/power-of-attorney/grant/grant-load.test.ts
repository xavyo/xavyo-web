import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '+page.server.ts'), 'utf8');

describe('POA grant load', () => {
	it('does not render an empty user picker when the users API fails', () => {
		expect(src).toContain("error(502, 'Failed to load users')");
		expect(src).not.toContain('Users list may fail');
		expect(src).toContain('if (e instanceof ApiError) error(e.status, e.message)');
	});
});
