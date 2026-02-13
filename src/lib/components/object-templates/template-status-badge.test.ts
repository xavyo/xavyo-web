import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import TemplateStatusBadge from './template-status-badge.svelte';

describe('TemplateStatusBadge', () => {
	afterEach(cleanup);

	it('renders Draft for draft status', () => {
		render(TemplateStatusBadge, { props: { status: 'draft' } });
		expect(screen.getByText('Draft')).toBeTruthy();
	});

	it('renders Active for active status', () => {
		render(TemplateStatusBadge, { props: { status: 'active' } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('renders Disabled for disabled status', () => {
		render(TemplateStatusBadge, { props: { status: 'disabled' } });
		expect(screen.getByText('Disabled')).toBeTruthy();
	});

	it('applies blue styles for draft', () => {
		render(TemplateStatusBadge, { props: { status: 'draft' } });
		const badge = screen.getByText('Draft');
		expect(badge.className).toContain('bg-blue-100');
	});

	it('applies green styles for active', () => {
		render(TemplateStatusBadge, { props: { status: 'active' } });
		const badge = screen.getByText('Active');
		expect(badge.className).toContain('bg-green-100');
	});

	it('applies zinc styles for disabled', () => {
		render(TemplateStatusBadge, { props: { status: 'disabled' } });
		const badge = screen.getByText('Disabled');
		expect(badge.className).toContain('bg-zinc-100');
	});

	it('renders as an inline-flex span', () => {
		render(TemplateStatusBadge, { props: { status: 'active' } });
		const badge = screen.getByText('Active');
		expect(badge.tagName).toBe('SPAN');
		expect(badge.className).toContain('inline-flex');
	});

	it('applies rounded-full and text-xs classes', () => {
		render(TemplateStatusBadge, { props: { status: 'draft' } });
		const badge = screen.getByText('Draft');
		expect(badge.className).toContain('rounded-full');
		expect(badge.className).toContain('text-xs');
	});
});
