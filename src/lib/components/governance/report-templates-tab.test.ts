import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ReportTemplatesTab from './report-templates-tab.svelte';
import type { ReportTemplate } from '$lib/api/types';

function makeTemplate(overrides: Partial<ReportTemplate> = {}): ReportTemplate {
	return {
		id: 'tpl-1',
		tenant_id: 'tid',
		name: 'Access Review Template',
		description: 'Quarterly access review report',
		template_type: 'access_review',
		compliance_standard: 'sox',
		definition: {
			data_sources: ['users'],
			filters: [],
			columns: [{ field: 'name', label: 'Name', sortable: true }],
			grouping: [],
			default_sort: null
		},
		is_system: true,
		cloned_from: null,
		status: 'active',
		created_by: 'user-1',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		...overrides
	};
}

describe('ReportTemplatesTab', () => {
	// --- Loading state ---

	it('renders loading skeletons when loading=true', () => {
		const { container } = render(ReportTemplatesTab, {
			props: { templates: [], loading: true }
		});
		const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});

	it('does not render table when loading', () => {
		render(ReportTemplatesTab, { props: { templates: [], loading: true } });
		expect(screen.queryByRole('table')).toBeNull();
	});

	// --- Empty state ---

	it('renders empty state when templates is empty array', () => {
		render(ReportTemplatesTab, { props: { templates: [], loading: false } });
		expect(screen.getByText('No report templates available.')).toBeTruthy();
	});

	it('shows "0 templates" count when empty', () => {
		render(ReportTemplatesTab, { props: { templates: [], loading: false } });
		expect(screen.getByText('0 templates')).toBeTruthy();
	});

	// --- Template list rendering ---

	it('renders template names as links', () => {
		const templates = [makeTemplate()];
		render(ReportTemplatesTab, { props: { templates } });
		const link = screen.getByRole('link', { name: 'Access Review Template' });
		expect(link).toBeTruthy();
		expect(link.getAttribute('href')).toBe('/governance/reports/templates/tpl-1');
	});

	it('renders template description below name', () => {
		const templates = [makeTemplate()];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('Quarterly access review report')).toBeTruthy();
	});

	it('does not render description element when description is null', () => {
		const templates = [makeTemplate({ description: null })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.queryByText('Quarterly access review report')).toBeNull();
	});

	it('renders multiple templates', () => {
		const templates = [
			makeTemplate({ id: 'tpl-1', name: 'Template A' }),
			makeTemplate({ id: 'tpl-2', name: 'Template B' }),
			makeTemplate({ id: 'tpl-3', name: 'Template C' })
		];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('Template A')).toBeTruthy();
		expect(screen.getByText('Template B')).toBeTruthy();
		expect(screen.getByText('Template C')).toBeTruthy();
	});

	it('shows correct template count', () => {
		const templates = [
			makeTemplate({ id: 'tpl-1', name: 'A' }),
			makeTemplate({ id: 'tpl-2', name: 'B' })
		];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('2 templates')).toBeTruthy();
	});

	it('shows singular "template" for single template', () => {
		const templates = [makeTemplate()];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('1 template')).toBeTruthy();
	});

	// --- System/Custom badges ---

	it('shows System badge for system templates', () => {
		const templates = [makeTemplate({ is_system: true })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('System')).toBeTruthy();
	});

	it('shows Custom badge for non-system templates', () => {
		const templates = [makeTemplate({ is_system: false })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('Custom')).toBeTruthy();
	});

	// --- Compliance standard badges ---

	it('shows SOX compliance badge in uppercase', () => {
		const templates = [makeTemplate({ compliance_standard: 'sox' })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('SOX')).toBeTruthy();
	});

	it('shows GDPR compliance badge', () => {
		const templates = [makeTemplate({ compliance_standard: 'gdpr' })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('GDPR')).toBeTruthy();
	});

	it('shows HIPAA compliance badge', () => {
		const templates = [makeTemplate({ compliance_standard: 'hipaa' })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('HIPAA')).toBeTruthy();
	});

	it('shows CUSTOM compliance badge', () => {
		const templates = [makeTemplate({ compliance_standard: 'custom' })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('CUSTOM')).toBeTruthy();
	});

	it('shows dash when no compliance standard', () => {
		const templates = [makeTemplate({ compliance_standard: null })];
		render(ReportTemplatesTab, { props: { templates } });
		const dashes = screen.getAllByText('\u2014');
		expect(dashes.length).toBeGreaterThan(0);
	});

	// --- Template type display ---

	it('renders template type with title case formatting', () => {
		const templates = [makeTemplate({ template_type: 'access_review' })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('Access Review')).toBeTruthy();
	});

	it('renders sod_violations as Sod Violations', () => {
		const templates = [makeTemplate({ template_type: 'sod_violations' })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('Sod Violations')).toBeTruthy();
	});

	it('renders audit_trail as Audit Trail', () => {
		const templates = [makeTemplate({ template_type: 'audit_trail' })];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('Audit Trail')).toBeTruthy();
	});

	// --- Action links ---

	it('renders Generate link for each template', () => {
		const templates = [makeTemplate({ id: 'tpl-42' })];
		render(ReportTemplatesTab, { props: { templates } });
		const link = screen.getByRole('link', { name: 'Generate' });
		expect(link.getAttribute('href')).toBe('/governance/reports/generate?template_id=tpl-42');
	});

	it('renders Create Template link', () => {
		render(ReportTemplatesTab, { props: { templates: [], loading: false } });
		const link = screen.getByRole('link', { name: 'Create Template' });
		expect(link.getAttribute('href')).toBe('/governance/reports/templates/create');
	});

	// --- Table headers ---

	it('renders table headers', () => {
		const templates = [makeTemplate()];
		render(ReportTemplatesTab, { props: { templates } });
		expect(screen.getByText('Name')).toBeTruthy();
		expect(screen.getByText('Type')).toBeTruthy();
		expect(screen.getByText('Standard')).toBeTruthy();
		expect(screen.getByText('Source')).toBeTruthy();
		expect(screen.getByText('Actions')).toBeTruthy();
	});
});
