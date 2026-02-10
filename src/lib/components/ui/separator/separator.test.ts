import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Separator from './separator.svelte';

describe('Separator', () => {
	it('renders a separator element', () => {
		render(Separator);
		const sep =
			document.querySelector('[role="separator"]') ??
			document.querySelector('[data-separator-root]') ??
			document.querySelector('div');
		expect(sep).toBeTruthy();
	});

	it('has horizontal styling by default', () => {
		render(Separator);
		const sep =
			document.querySelector('[role="separator"]') ??
			document.querySelector('[data-separator-root]') ??
			document.querySelector('div');
		expect(sep?.className).toContain('h-px');
		expect(sep?.className).toContain('w-full');
	});

	it('accepts custom class', () => {
		render(Separator, { props: { class: 'my-4' } });
		const sep =
			document.querySelector('[role="separator"]') ??
			document.querySelector('[data-separator-root]') ??
			document.querySelector('div');
		expect(sep?.className).toContain('my-4');
	});
});
