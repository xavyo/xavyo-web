import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Alert from './alert.svelte';
import AlertDescription from './alert-description.svelte';

describe('Alert', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders an alert div with role', () => {
		render(Alert);
		const alert = document.querySelector('[role="alert"]');
		expect(alert).toBeTruthy();
	});

	it('has default variant styling', () => {
		render(Alert);
		const alert = document.querySelector('[role="alert"]');
		expect(alert?.className).toContain('bg-background');
	});

	it('renders with destructive variant', () => {
		render(Alert, { props: { variant: 'destructive' } });
		const alert = document.querySelector('[role="alert"]');
		expect(alert?.className).toContain('border-destructive');
	});

	it('accepts custom class', () => {
		render(Alert, { props: { class: 'my-alert' } });
		const alert = document.querySelector('[role="alert"]');
		expect(alert?.className).toContain('my-alert');
	});
});

describe('AlertDescription', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a paragraph element', () => {
		render(AlertDescription);
		const desc = document.querySelector('.text-sm');
		expect(desc).toBeTruthy();
		expect(desc?.className).toContain('text-sm');
	});
});
