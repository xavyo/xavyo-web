import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/svelte';
import Card from './card.svelte';
import CardHeader from './card-header.svelte';
import CardContent from './card-content.svelte';
import CardFooter from './card-footer.svelte';

describe('Card', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a card div', () => {
		render(Card);
		const card =
			document.querySelector('[data-testid="card"]') ??
			document.querySelector('.rounded-xl');
		expect(card).toBeTruthy();
	});

	it('has border and shadow styling', () => {
		render(Card);
		const card = document.querySelector('.rounded-xl');
		expect(card).toBeTruthy();
		expect(card?.className).toContain('rounded-xl');
		expect(card?.className).toContain('border');
	});

	it('accepts custom class', () => {
		render(Card, { props: { class: 'custom-card' } });
		const card = document.querySelector('.rounded-xl');
		expect(card?.className).toContain('custom-card');
	});
});

describe('CardHeader', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders with flex layout', () => {
		render(CardHeader);
		const header = document.querySelector('.flex');
		expect(header).toBeTruthy();
		expect(header?.className).toContain('flex');
		expect(header?.className).toContain('p-6');
	});
});

describe('CardContent', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders with padding', () => {
		render(CardContent);
		const content = document.querySelector('.p-6');
		expect(content).toBeTruthy();
		expect(content?.className).toContain('p-6');
	});
});

describe('CardFooter', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders with flex layout', () => {
		render(CardFooter);
		const footer = document.querySelector('.flex');
		expect(footer).toBeTruthy();
		expect(footer?.className).toContain('flex');
		expect(footer?.className).toContain('p-6');
	});
});
