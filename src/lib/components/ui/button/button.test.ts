import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import Button from './button.svelte';

describe('Button', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a button element', () => {
		render(Button, { props: {} });
		expect(screen.getByRole('button')).toBeTruthy();
	});

	it('renders with default variant classes', () => {
		render(Button, { props: {} });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('bg-primary');
	});

	it('renders with destructive variant', () => {
		render(Button, { props: { variant: 'destructive' } });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('bg-destructive');
	});

	it('renders with outline variant', () => {
		render(Button, { props: { variant: 'outline' } });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('border');
	});

	it('renders with ghost variant', () => {
		render(Button, { props: { variant: 'ghost' } });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('hover:bg-accent');
	});

	it('renders with sm size', () => {
		render(Button, { props: { size: 'sm' } });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('h-8');
	});

	it('renders with lg size', () => {
		render(Button, { props: { size: 'lg' } });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('h-10');
	});

	it('renders with icon size', () => {
		render(Button, { props: { size: 'icon' } });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('h-9');
		expect(btn.className).toContain('w-9');
	});

	it('accepts custom class', () => {
		render(Button, { props: { class: 'custom-class' } });
		const btn = screen.getByRole('button');
		expect(btn.className).toContain('custom-class');
	});

	it('passes disabled attribute', () => {
		render(Button, { props: { disabled: true } });
		const btn = screen.getByRole('button');
		expect(btn.hasAttribute('disabled')).toBe(true);
	});
});
