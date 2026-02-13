import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CircuitStateBadge from './circuit-state-badge.svelte';

describe('CircuitStateBadge', () => {
	it('renders "Closed" with green styling for closed state', () => {
		const { container } = render(CircuitStateBadge, { props: { state: 'closed' } });
		expect(screen.getByText('Closed')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('green');
	});

	it('renders "Open" with red styling for open state', () => {
		const { container } = render(CircuitStateBadge, { props: { state: 'open' } });
		expect(screen.getByText('Open')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('red');
	});

	it('renders "Half Open" with yellow styling for half_open state', () => {
		const { container } = render(CircuitStateBadge, { props: { state: 'half_open' } });
		expect(screen.getByText('Half Open')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('yellow');
	});

	it('handles unknown state gracefully', () => {
		const { container } = render(CircuitStateBadge, {
			props: { state: 'unknown_state' as any }
		});
		expect(screen.getByText('unknown_state')).toBeTruthy();
		const badge = container.querySelector('span')!;
		expect(badge.className).toContain('gray');
	});
});
