import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Badge from './badge.svelte';

describe('Badge', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a badge span', () => {
		render(Badge);
		const badge = document.querySelector('span');
		expect(badge).toBeTruthy();
	});

	it('has default variant styling', () => {
		render(Badge);
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-primary');
	});

	it('renders with secondary variant', () => {
		render(Badge, { props: { variant: 'secondary' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-secondary');
	});

	it('renders with destructive variant', () => {
		render(Badge, { props: { variant: 'destructive' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-destructive');
	});

	it('renders with outline variant', () => {
		render(Badge, { props: { variant: 'outline' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('border');
	});

	it('renders semantic status variants', () => {
		render(Badge, { props: { variant: 'success' } });
		expect(document.querySelector('span')?.className).toContain('bg-success/15');
		cleanup();
		render(Badge, { props: { variant: 'warning' } });
		expect(document.querySelector('span')?.className).toContain('bg-warning/20');
		cleanup();
		render(Badge, { props: { variant: 'info' } });
		expect(document.querySelector('span')?.className).toContain('bg-info/15');
	});

	it('accepts custom class', () => {
		render(Badge, { props: { class: 'ml-2' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('ml-2');
	});
});
