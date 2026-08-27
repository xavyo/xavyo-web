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
