import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Input from './input.svelte';

describe('Input', () => {
	it('renders an input element', () => {
		render(Input);
		expect(screen.getByRole('textbox')).toBeTruthy();
	});

	it('accepts type prop', () => {
		render(Input, { props: { type: 'email' } });
		const input = document.querySelector('input');
		expect(input?.type).toBe('email');
	});

	it('accepts placeholder prop', () => {
		render(Input, { props: { placeholder: 'Enter email' } });
		expect(screen.getByPlaceholderText('Enter email')).toBeTruthy();
	});

	it('accepts disabled prop', () => {
		render(Input, { props: { disabled: true } });
		const input = document.querySelector('input');
		expect(input?.disabled).toBe(true);
	});

	it('accepts custom class', () => {
		render(Input, { props: { class: 'custom-class' } });
		const input = document.querySelector('input');
		expect(input?.className).toContain('custom-class');
	});

	it('has default styling classes', () => {
		render(Input);
		const input = document.querySelector('input');
		expect(input?.className).toContain('border');
		expect(input?.className).toContain('rounded-md');
	});
});
