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

	it('accepts custom class', () => {
		render(Badge, { props: { class: 'ml-2' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('ml-2');
	});
});
