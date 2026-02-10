import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Skeleton from './skeleton.svelte';

describe('Skeleton', () => {
	it('renders a div element', () => {
		const { container } = render(Skeleton);
		const skeleton = container.querySelector('div');
		expect(skeleton).toBeTruthy();
	});

	it('has animate-pulse class', () => {
		const { container } = render(Skeleton);
		const skeleton = container.querySelector('div');
		expect(skeleton?.className).toContain('animate-pulse');
	});

	it('has muted background', () => {
		const { container } = render(Skeleton);
		const skeleton = container.querySelector('div');
		expect(skeleton?.className).toContain('bg-primary/10');
	});

	it('accepts custom class', () => {
		const { container } = render(Skeleton, { props: { class: 'h-10 w-40' } });
		const skeleton = container.querySelector('div');
		expect(skeleton?.className).toContain('h-10');
		expect(skeleton?.className).toContain('w-40');
	});
});
