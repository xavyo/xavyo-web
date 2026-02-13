import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TransitionCard from './transition-card.svelte';

describe('TransitionCard', () => {
	const baseProps = {
		name: 'Activate',
		fromStateName: 'Onboarding',
		toStateName: 'Active'
	};

	it('renders transition name', () => {
		render(TransitionCard, { props: baseProps });
		expect(screen.getByText('Activate')).toBeDefined();
	});

	it('renders from and to state names', () => {
		render(TransitionCard, { props: baseProps });
		expect(screen.getByText('Onboarding')).toBeDefined();
		expect(screen.getByText('Active')).toBeDefined();
	});

	it('shows approval badge when requiresApproval is true', () => {
		render(TransitionCard, { props: { ...baseProps, requiresApproval: true } });
		expect(screen.getByText('Approval Required')).toBeDefined();
	});

	it('does not show approval badge when requiresApproval is false', () => {
		render(TransitionCard, { props: { ...baseProps, requiresApproval: false } });
		expect(screen.queryByText('Approval Required')).toBeNull();
	});

	it('shows grace period badge when gracePeriodHours is set', () => {
		render(TransitionCard, { props: { ...baseProps, gracePeriodHours: 48 } });
		expect(screen.getByText('48h grace')).toBeDefined();
	});

	it('does not show grace period badge when gracePeriodHours is null', () => {
		render(TransitionCard, { props: { ...baseProps, gracePeriodHours: null } });
		expect(screen.queryByText(/grace/)).toBeNull();
	});

	it('renders delete button when ondelete is provided', () => {
		const ondelete = vi.fn();
		render(TransitionCard, { props: { ...baseProps, ondelete } });
		// The delete button exists (Trash2 icon button)
		const buttons = screen.getAllByRole('button');
		expect(buttons.length).toBeGreaterThan(0);
	});

	it('does not render delete button when ondelete is not provided', () => {
		render(TransitionCard, { props: baseProps });
		expect(screen.queryByRole('button')).toBeNull();
	});
});
