import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ScopeBadge from './scope-badge.svelte';

describe('ScopeBadge', () => {
	afterEach(cleanup);

	it('renders Global scope without value', () => {
		render(ScopeBadge, { props: { scopeType: 'global' } });
		expect(screen.getByText('Global')).toBeTruthy();
	});

	it('renders Organization scope with value', () => {
		render(ScopeBadge, { props: { scopeType: 'organization', scopeValue: 'Engineering' } });
		expect(screen.getByText('Organization')).toBeTruthy();
		expect(screen.getByText(': Engineering')).toBeTruthy();
	});

	it('renders Category scope with value', () => {
		render(ScopeBadge, { props: { scopeType: 'category', scopeValue: 'internal' } });
		expect(screen.getByText('Category')).toBeTruthy();
		expect(screen.getByText(': internal')).toBeTruthy();
	});

	it('renders Condition scope with value', () => {
		render(ScopeBadge, { props: { scopeType: 'condition', scopeValue: "type == 'admin'" } });
		expect(screen.getByText('Condition')).toBeTruthy();
		expect(screen.getByText(": type == 'admin'")).toBeTruthy();
	});

	it('does not show value for global scope type even if provided', () => {
		render(ScopeBadge, { props: { scopeType: 'global', scopeValue: 'ignored' } });
		expect(screen.getByText('Global')).toBeTruthy();
		expect(screen.queryByText(': ignored')).toBeNull();
	});

	it('does not show value when scopeValue is null', () => {
		render(ScopeBadge, { props: { scopeType: 'organization', scopeValue: null } });
		expect(screen.getByText('Organization')).toBeTruthy();
	});

	it('does not show value when scopeValue is not provided', () => {
		render(ScopeBadge, { props: { scopeType: 'category' } });
		expect(screen.getByText('Category')).toBeTruthy();
	});

	it('applies zinc styles for global', () => {
		render(ScopeBadge, { props: { scopeType: 'global' } });
		const badge = screen.getByText('Global').parentElement;
		expect(badge?.className).toContain('bg-zinc-100');
	});

	it('applies indigo styles for organization', () => {
		render(ScopeBadge, { props: { scopeType: 'organization', scopeValue: 'Eng' } });
		const badge = screen.getByText('Organization').parentElement;
		expect(badge?.className).toContain('bg-indigo-100');
	});

	it('applies emerald styles for category', () => {
		render(ScopeBadge, { props: { scopeType: 'category', scopeValue: 'test' } });
		const badge = screen.getByText('Category').parentElement;
		expect(badge?.className).toContain('bg-emerald-100');
	});

	it('applies orange styles for condition', () => {
		render(ScopeBadge, { props: { scopeType: 'condition', scopeValue: 'expr' } });
		const badge = screen.getByText('Condition').parentElement;
		expect(badge?.className).toContain('bg-orange-100');
	});
});
