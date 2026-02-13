import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import SimulationStatusBadge from './simulation-status-badge.svelte';

describe('SimulationStatusBadge', () => {
	afterEach(cleanup);

	it('renders Draft for draft status', () => {
		render(SimulationStatusBadge, { props: { status: 'draft' } });
		expect(screen.getByText('Draft')).toBeTruthy();
	});

	it('renders Executed for executed status', () => {
		render(SimulationStatusBadge, { props: { status: 'executed' } });
		expect(screen.getByText('Executed')).toBeTruthy();
	});

	it('renders Applied for applied status', () => {
		render(SimulationStatusBadge, { props: { status: 'applied' } });
		expect(screen.getByText('Applied')).toBeTruthy();
	});

	it('renders Cancelled for cancelled status', () => {
		render(SimulationStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});
});
