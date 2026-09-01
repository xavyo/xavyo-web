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
		'governance/outliers/results/+server.ts',
		'governance/simulations/policy/[id]/results/+server.ts',
		'admin/webhooks/subscriptions/+server.ts',
		'governance/duplicates/+server.ts',
		'nhi/a2a/tasks/+server.ts',
		'governance/object-templates/+server.ts',
		'admin/webhooks/dlq/+server.ts',
		'governance/risk/alerts/+server.ts',
		'governance/sod-exemptions/+server.ts',
		'governance/entitlements/+server.ts',
		'governance/applications/+server.ts',
		'governance/peer-groups/+server.ts',
		'governance/power-of-attorney/+server.ts',
		'governance/manual-tasks/+server.ts',
		'governance/approval-groups/+server.ts',
		'connectors/+server.ts',
		'risk/scores/+server.ts',
		'nhi/governance/orphans/+server.ts',
		'risk/factors/+server.ts',
		'risk/alerts/+server.ts',
		'governance/detection-rules/+server.ts',
		'governance/lifecycle/configs/+server.ts',
		'governance/merges/+server.ts',
		'governance/sod-violations/+server.ts',
		'governance/escalation-policies/+server.ts',
		'admin/scim-targets/+server.ts',
		'governance/outliers/alerts/+server.ts',
		'governance/outliers/dispositions/+server.ts',
		'governance/lifecycle-events/+server.ts',
		'governance/power-of-attorney/[id]/audit/+server.ts',
		'nhi/usage/[id]/+server.ts',
		'governance/birthright-policies/+server.ts',
		'nhi/permissions/agents/[agentId]/tools/+server.ts',
		'governance/micro-certifications/triggers/+server.ts',
		'governance/meta-roles/+server.ts',
		'risk/thresholds/+server.ts',
		'governance/correlation/identity-rules/+server.ts',
		'governance/correlation/cases/+server.ts',
		'governance/correlation/audit/+server.ts',
		'admin/authorization/policies/+server.ts',
		'admin/authorization/mappings/+server.ts',
		'operations/+server.ts',
		'governance/reports/+server.ts',
		'governance/simulations/comparisons/+server.ts',
		'governance/reports/templates/+server.ts',
		'governance/reports/schedules/+server.ts',
		'governance/simulations/batch/+server.ts',
		'governance/simulations/batch/[id]/results/+server.ts',
		'governance/role-mining/jobs/+server.ts',
		'governance/role-mining/jobs/[jobId]/candidates/+server.ts',
		'governance/role-mining/jobs/[jobId]/patterns/+server.ts',
		'governance/role-mining/jobs/[jobId]/excessive-privileges/+server.ts',
		'governance/role-mining/jobs/[jobId]/consolidation-suggestions/+server.ts',
		'governance/role-mining/simulations/+server.ts',
		'governance/role-mining/metrics/+server.ts',
		'governance/meta-roles/events/+server.ts',
		'governance/meta-roles/conflicts/+server.ts',
		'governance/meta-roles/[id]/inheritances/+server.ts',
		'connectors/[id]/reconciliation/runs/+server.ts',
		'connectors/[id]/reconciliation/actions/+server.ts',
		'connectors/[id]/reconciliation/discrepancies/+server.ts',
		'connectors/[connectorId]/correlation/rules/+server.ts',
		'governance/semi-manual/applications/+server.ts',
		'risk/events/user/[userId]/+server.ts',
		'nhi/governance/sod/rules/+server.ts',
		'provisioning-scripts/audit-events/+server.ts',
		'governance/licenses/assignments/+server.ts',
		'governance/licenses/pools/+server.ts',
		'governance/licenses/entitlement-links/+server.ts',
		'governance/licenses/reclamation-rules/+server.ts',
		'governance/licenses/incompatibilities/+server.ts',
		'governance/siem/destinations/+server.ts',
		'governance/siem/exports/+server.ts',
		'governance/siem/destinations/[id]/health/history/+server.ts',
		'governance/siem/destinations/[id]/dead-letter/+server.ts',
		'governance/licenses/reports/audit-trail/+server.ts',
		'governance/persona-audit/+server.ts',
		'governance/parameters/audit/+server.ts',
		'governance/delegations/audit/+server.ts',
		'governance/role-mining/jobs/[jobId]/candidates/+server.ts',
		'governance/role-mining/jobs/[jobId]/excessive-privileges/+server.ts',
		'governance/role-mining/jobs/[jobId]/consolidation-suggestions/+server.ts',
		'governance/role-mining/simulations/+server.ts',
		'governance/role-mining/metrics/+server.ts'
	];

	it.each(files)('%s uses listPagination instead of Number()', (rel) => {
		const s = src(rel);
		expect(s).toContain('listPagination(');
		expect(s).not.toContain("Number(url.searchParams.get('limit')");
		expect(s).not.toContain("Number(url.searchParams.get('offset')");
	});

	const pageFiles = [
		'provisioning-scripts/+server.ts',
		'provisioning-scripts/templates/+server.ts',
		'provisioning-scripts/bindings/+server.ts',
		'provisioning-scripts/execution-logs/+server.ts',
		'governance/my-certifications/+server.ts'
	];

	it.each(pageFiles)('%s uses pagePagination instead of Number()/parseInt()', (rel) => {
		const s = src(rel);
		expect(s).toContain('pagePagination(');
		expect(s).not.toContain("Number(url.searchParams.get('page')");
		expect(s).not.toContain("parseInt(url.searchParams.get('page')");
	});
});
