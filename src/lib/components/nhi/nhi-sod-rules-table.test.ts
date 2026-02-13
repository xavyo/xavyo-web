import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import NhiSodRulesTable from './nhi-sod-rules-table.svelte';
import type { NhiSodRule } from '$lib/api/types';

function makeRules(): NhiSodRule[] {
	return [
		{
			id: 'rule-1',
			tenant_id: 't-1',
			tool_id_a: 'tool-aaa-111',
			tool_id_b: 'tool-bbb-222',
			enforcement: 'prevent',
			description: 'Cannot use both payment tools',
			created_at: '2026-01-15T00:00:00Z',
			created_by: 'admin'
		},
		{
			id: 'rule-2',
			tenant_id: 't-1',
			tool_id_a: 'tool-ccc-333',
			tool_id_b: 'tool-ddd-444',
			enforcement: 'warn',
			description: null,
			created_at: '2026-02-01T00:00:00Z',
			created_by: null
		}
	];
}

const noop = async () => {};

describe('NhiSodRulesTable', () => {
	afterEach(cleanup);

	it('renders rule count', () => {
		render(NhiSodRulesTable, { props: { rules: makeRules(), onDelete: noop } });
		expect(screen.getByText('2 SoD rules')).toBeTruthy();
	});

	it('renders tool IDs', () => {
		render(NhiSodRulesTable, { props: { rules: makeRules(), onDelete: noop } });
		expect(screen.getByText('tool-aaa-111')).toBeTruthy();
		expect(screen.getByText('tool-bbb-222')).toBeTruthy();
		expect(screen.getByText('tool-ccc-333')).toBeTruthy();
		expect(screen.getByText('tool-ddd-444')).toBeTruthy();
	});

	it('renders enforcement badges', () => {
		render(NhiSodRulesTable, { props: { rules: makeRules(), onDelete: noop } });
		expect(screen.getByText('prevent')).toBeTruthy();
		expect(screen.getByText('warn')).toBeTruthy();
	});

	it('renders descriptions or em-dash for null', () => {
		render(NhiSodRulesTable, { props: { rules: makeRules(), onDelete: noop } });
		expect(screen.getByText('Cannot use both payment tools')).toBeTruthy();
		// null description renders as '—'
		const cells = document.querySelectorAll('td');
		const dashCells = Array.from(cells).filter((c) => c.textContent?.trim() === '\u2014');
		expect(dashCells.length).toBeGreaterThanOrEqual(1);
	});

	it('renders delete buttons for each rule', () => {
		render(NhiSodRulesTable, { props: { rules: makeRules(), onDelete: noop } });
		const deleteButtons = screen.getAllByText('Delete');
		expect(deleteButtons).toHaveLength(2);
	});

	it('renders Create Rule link', () => {
		render(NhiSodRulesTable, { props: { rules: makeRules(), onDelete: noop } });
		expect(screen.getByText('Create Rule')).toBeTruthy();
		const link = document.querySelector('a[href="/nhi/governance/sod/create"]');
		expect(link).toBeTruthy();
	});

	it('shows empty state when no rules', () => {
		render(NhiSodRulesTable, { props: { rules: [], onDelete: noop } });
		expect(screen.getByText('No NHI SoD rules configured.')).toBeTruthy();
		expect(screen.getByText('0 SoD rules')).toBeTruthy();
	});

	it('still shows Create Rule link when empty', () => {
		render(NhiSodRulesTable, { props: { rules: [], onDelete: noop } });
		const link = document.querySelector('a[href="/nhi/governance/sod/create"]');
		expect(link).toBeTruthy();
	});

	it('renders tool names from nameMap instead of raw IDs', () => {
		const nameMap = {
			'tool-aaa-111': 'Payment Processor',
			'tool-bbb-222': 'Invoice Generator',
			'tool-ccc-333': 'Data Exporter',
			'tool-ddd-444': 'Audit Logger'
		};
		render(NhiSodRulesTable, { props: { rules: makeRules(), nameMap, onDelete: noop } });
		expect(screen.getByText('Payment Processor')).toBeTruthy();
		expect(screen.getByText('Invoice Generator')).toBeTruthy();
		expect(screen.getByText('Data Exporter')).toBeTruthy();
		expect(screen.getByText('Audit Logger')).toBeTruthy();
	});

	it('falls back to raw ID when nameMap entry is missing', () => {
		const nameMap = { 'tool-aaa-111': 'Payment Processor' };
		render(NhiSodRulesTable, { props: { rules: makeRules(), nameMap, onDelete: noop } });
		expect(screen.getByText('Payment Processor')).toBeTruthy();
		expect(screen.getByText('tool-bbb-222')).toBeTruthy();
	});
});
