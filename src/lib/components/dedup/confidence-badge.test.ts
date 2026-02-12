import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ConfidenceBadge from './confidence-badge.svelte';

describe('ConfidenceBadge', () => {
	it('renders the score', () => {
		render(ConfidenceBadge, { props: { score: 85.5 } });
		expect(screen.getByTestId('confidence-badge').textContent).toContain('85.5%');
	});

	it('applies green class for high scores (>= 80)', () => {
		render(ConfidenceBadge, { props: { score: 92 } });
		const badge = screen.getByTestId('confidence-badge');
		expect(badge.className).toContain('green');
	});

	it('applies yellow class for medium scores (50-79)', () => {
		render(ConfidenceBadge, { props: { score: 65 } });
		const badge = screen.getByTestId('confidence-badge');
		expect(badge.className).toContain('yellow');
	});

	it('applies gray class for low scores (< 50)', () => {
		render(ConfidenceBadge, { props: { score: 30 } });
		const badge = screen.getByTestId('confidence-badge');
		expect(badge.className).toContain('gray');
	});

	it('renders small size', () => {
		render(ConfidenceBadge, { props: { score: 70, size: 'sm' } });
		const badge = screen.getByTestId('confidence-badge');
		expect(badge.className).toContain('text-xs');
	});
});
