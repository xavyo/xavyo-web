import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StateBadge from './state-badge.svelte';

describe('StateBadge', () => {
	it('renders Initial badge when isInitial is true', () => {
		render(StateBadge, { props: { isInitial: true } });
		expect(screen.getByText('Initial')).toBeDefined();
	});

	it('renders Terminal badge when isTerminal is true', () => {
		render(StateBadge, { props: { isTerminal: true } });
		expect(screen.getByText('Terminal')).toBeDefined();
	});

	it('renders Intermediate badge when neither is true', () => {
		render(StateBadge, { props: {} });
		expect(screen.getByText('Intermediate')).toBeDefined();
	});

	it('renders Initial when both isInitial and isTerminal are true', () => {
		render(StateBadge, { props: { isInitial: true, isTerminal: true } });
		expect(screen.getByText('Initial')).toBeDefined();
	});

	it('renders Intermediate badge by default', () => {
		render(StateBadge, { props: { isInitial: false, isTerminal: false } });
		expect(screen.getByText('Intermediate')).toBeDefined();
	});
});
