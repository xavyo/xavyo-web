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
		'operations/conflicts/+server.ts',
		'federation/identity-providers/+server.ts',
		'federation/saml/service-providers/+server.ts',
		'alerts/+server.ts',
		'audit/login-history/+server.ts',
		'governance/roles/+server.ts',
		'governance/sod-rules/+server.ts',
		'operations/dlq/+server.ts',
		'governance/risk/scores/+server.ts',
		'archetypes/+server.ts',
		'governance/catalog/items/+server.ts',
		'governance/catalog/categories/+server.ts',
		'governance/certification-campaigns/+server.ts',
		'governance/my-approvals/+server.ts',
		'nhi/delegations/+server.ts',
		'nhi/certification/campaigns/+server.ts',
		'governance/micro-certifications/+server.ts',
		'governance/outliers/analyses/+server.ts',
		'governance/outliers/results/+server.ts'
	];

	it.each(files)('%s uses listPagination instead of Number()', (rel) => {
		const s = src(rel);
		expect(s).toContain('listPagination(');
		expect(s).not.toContain("Number(url.searchParams.get('limit')");
		expect(s).not.toContain("Number(url.searchParams.get('offset')");
	});
});
