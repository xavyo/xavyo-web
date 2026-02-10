import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Label from './label.svelte';

describe('Label', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a label element', () => {
		render(Label);
		const label = document.querySelector('label');
		expect(label).toBeTruthy();
	});

	it('accepts for prop', () => {
		render(Label, { props: { for: 'email-input' } });
		const label = document.querySelector('label');
		expect(label?.htmlFor).toBe('email-input');
	});

	it('accepts custom class', () => {
		render(Label, { props: { class: 'custom' } });
		const label = document.querySelector('label');
		expect(label?.className).toContain('custom');
	});

	it('has default styling', () => {
		render(Label);
		const label = document.querySelector('label');
		expect(label?.className).toContain('text-sm');
		expect(label?.className).toContain('font-medium');
	});
});
