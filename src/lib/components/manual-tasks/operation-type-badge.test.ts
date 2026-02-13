import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import OperationTypeBadge from './operation-type-badge.svelte';

describe('OperationTypeBadge', () => {
	afterEach(() => { cleanup(); });

	it('renders grant label', () => {
		render(OperationTypeBadge, { props: { operationType: 'grant' } });
		expect(screen.getByText('Grant')).toBeTruthy();
	});

	it('renders revoke label', () => {
		render(OperationTypeBadge, { props: { operationType: 'revoke' } });
		expect(screen.getByText('Revoke')).toBeTruthy();
	});

	it('renders modify label', () => {
		render(OperationTypeBadge, { props: { operationType: 'modify' } });
		expect(screen.getByText('Modify')).toBeTruthy();
	});

	it('applies emerald class for grant', () => {
		render(OperationTypeBadge, { props: { operationType: 'grant' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-emerald-100');
		expect(badge?.className).toContain('text-emerald-800');
	});

	it('applies rose class for revoke', () => {
		render(OperationTypeBadge, { props: { operationType: 'revoke' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-rose-100');
		expect(badge?.className).toContain('text-rose-800');
	});

	it('applies purple class for modify', () => {
		render(OperationTypeBadge, { props: { operationType: 'modify' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-purple-100');
		expect(badge?.className).toContain('text-purple-800');
	});

	it('renders as a span element with badge styling', () => {
		render(OperationTypeBadge, { props: { operationType: 'grant' } });
		const badge = document.querySelector('span');
		expect(badge).toBeTruthy();
		expect(badge?.className).toContain('rounded-full');
		expect(badge?.className).toContain('text-xs');
		expect(badge?.className).toContain('font-medium');
	});
});
