import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ActionTypeBadge from './action-type-badge.svelte';

describe('ActionTypeBadge', () => {
	afterEach(cleanup);

	it('renders Default label', () => {
		render(ActionTypeBadge, { props: { ruleType: 'default' } });
		expect(screen.getByText('Default')).toBeTruthy();
	});

	it('renders Computed label', () => {
		render(ActionTypeBadge, { props: { ruleType: 'computed' } });
		expect(screen.getByText('Computed')).toBeTruthy();
	});

	it('renders Validation label', () => {
		render(ActionTypeBadge, { props: { ruleType: 'validation' } });
		expect(screen.getByText('Validation')).toBeTruthy();
	});

	it('renders Normalization label', () => {
		render(ActionTypeBadge, { props: { ruleType: 'normalization' } });
		expect(screen.getByText('Normalization')).toBeTruthy();
	});

	it('applies blue styles for default', () => {
		render(ActionTypeBadge, { props: { ruleType: 'default' } });
		expect(screen.getByText('Default').className).toContain('bg-blue-100');
	});

	it('applies purple styles for computed', () => {
		render(ActionTypeBadge, { props: { ruleType: 'computed' } });
		expect(screen.getByText('Computed').className).toContain('bg-purple-100');
	});

	it('applies amber styles for validation', () => {
		render(ActionTypeBadge, { props: { ruleType: 'validation' } });
		expect(screen.getByText('Validation').className).toContain('bg-amber-100');
	});

	it('applies teal styles for normalization', () => {
		render(ActionTypeBadge, { props: { ruleType: 'normalization' } });
		expect(screen.getByText('Normalization').className).toContain('bg-teal-100');
	});

	it('renders as an inline-flex span', () => {
		render(ActionTypeBadge, { props: { ruleType: 'default' } });
		const badge = screen.getByText('Default');
		expect(badge.tagName).toBe('SPAN');
		expect(badge.className).toContain('inline-flex');
	});

	it('applies rounded-full and font-medium classes', () => {
		render(ActionTypeBadge, { props: { ruleType: 'computed' } });
		const badge = screen.getByText('Computed');
		expect(badge.className).toContain('rounded-full');
		expect(badge.className).toContain('font-medium');
	});
});
