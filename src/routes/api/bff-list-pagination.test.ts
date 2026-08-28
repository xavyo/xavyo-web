import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

function src(rel: string): string {
	return readFileSync(join(dir, rel), 'utf8');
}

describe('BFF list endpoints honor finite pagination', () => {
	const files = [
		'users/+server.ts',
		'invitations/+server.ts',
		'governance/access-requests/+server.ts',
		'governance/approval-workflows/+server.ts',
		'governance/simulations/policy/+server.ts',
		'operations/conflicts/+server.ts'
	];

	it.each(files)('%s uses listPagination instead of Number()', (rel) => {
		const s = src(rel);
		expect(s).toContain('listPagination(');
		expect(s).not.toContain("Number(url.searchParams.get('limit')");
		expect(s).not.toContain("Number(url.searchParams.get('offset')");
	});
});
