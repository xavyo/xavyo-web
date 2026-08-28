import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

function src(rel: string): string {
	return readFileSync(join(dir, rel), 'utf8');
}

describe('remaining forms reject non-object JSON', () => {
	it('connector create uses parseJsonRecord', () => {
		const s = src('connectors/create/+page.server.ts');
		expect(s).toContain('parseJsonRecord(');
		expect(s).not.toContain('JSON.parse(headersRaw)');
		expect(s).not.toContain('JSON.parse(authConfigRaw)');
	});

	it('connector edit uses parseJsonRecord', () => {
		const s = src('connectors/[id]/edit/+page.server.ts');
		expect(s).toContain('parseJsonRecord(');
		expect(s).not.toContain('JSON.parse(headersRaw)');
		expect(s).not.toContain('JSON.parse(authConfigRaw)');
	});

	it('tool create uses parseJsonRecord', () => {
		const s = src('nhi/tools/create/+page.server.ts');
		expect(s).toContain('parseJsonRecord(form.data.input_schema)');
		expect(s).not.toContain('JSON.parse(form.data.input_schema)');
	});

	it('tool edit uses parseJsonRecord', () => {
		const s = src('nhi/tools/[id]/+page.server.ts');
		expect(s).toContain('parseJsonRecord(form.data.input_schema)');
		expect(s).not.toContain('JSON.parse(form.data.input_schema)');
	});

	it('a2a create uses parseJsonRecord', () => {
		const s = src('nhi/a2a/create/+page.server.ts');
		expect(s).toContain('parseJsonRecord(form.data.input)');
		expect(s).not.toContain('JSON.parse(form.data.input)');
	});

	it('report generate uses parseJsonRecord', () => {
		const s = src('governance/reports/generate/+page.server.ts');
		expect(s).toContain('parseJsonRecord(form.data.parameters)');
		expect(s).not.toContain('JSON.parse(form.data.parameters)');
	});

	it('bulk-action create uses parseJsonRecord', () => {
		const s = src('governance/operations/bulk-actions/create/+page.server.ts');
		expect(s).toContain('parseJsonRecord(form.data.action_params)');
		expect(s).not.toContain('JSON.parse(form.data.action_params)');
	});

	it('bulk-action edit uses parseJsonRecord', () => {
		const s = src('governance/operations/bulk-actions/[id]/+page.server.ts');
		expect(s).toContain('parseJsonRecord(form.data.action_params)');
		expect(s).not.toContain('JSON.parse(form.data.action_params)');
	});
});

describe('remaining forms reject non-array JSON', () => {
	it('birthright policy create uses parseJsonArray', () => {
		const s = src('governance/birthright/policies/create/+page.server.ts');
		expect(s).toContain('parseJsonArray(');
		expect(s).toContain('parseJsonStringArray(');
		expect(s).not.toContain('JSON.parse(conditionsJson');
	});

	it('birthright policy edit uses parseJsonArray', () => {
		const s = src('governance/birthright/policies/[id]/edit/+page.server.ts');
		expect(s).toContain('parseJsonArray(');
		expect(s).toContain('parseJsonStringArray(');
		expect(s).not.toContain('JSON.parse(conditionsJson');
	});

	it('dedup merge uses typed JSON parsers', () => {
		const s = src('governance/dedup/[id]/merge/+page.server.ts');
		expect(s).toContain('parseJsonRecord(');
		expect(s).toContain('parseJsonStringArray(');
		expect(s).not.toContain('JSON.parse(form.data.attribute_selections)');
		expect(s).not.toContain('JSON.parse(form.data.entitlement_selections)');
	});

	it('script template create uses parseJsonRecord', () => {
		const s = src('governance/provisioning-scripts/templates/create/+page.server.ts');
		expect(s).toContain('parseJsonRecord(');
		expect(s).not.toContain('JSON.parse(form.data.placeholder_annotations)');
	});

	it('meta-role create uses parseJsonArray for in/not_in', () => {
		const s = src('governance/meta-roles/create/+page.server.ts');
		expect(s).toContain('parseJsonArray(');
		expect(s).not.toContain('JSON.parse(criteriaValues');
	});

	it('birthright-policies create uses parseJsonArray', () => {
		const s = src('governance/birthright-policies/create/+page.server.ts');
		expect(s).toContain('parseJsonArray(');
		expect(s).not.toContain('JSON.parse(conditionsRaw)');
	});

	it('discrepancy bulk remediate uses parseJsonStringArray', () => {
		const s = src('connectors/[id]/reconciliation/discrepancies/+page.server.ts');
		expect(s).toContain('parseJsonStringArray(');
		expect(s).not.toContain('JSON.parse(raw)');
	});
});
