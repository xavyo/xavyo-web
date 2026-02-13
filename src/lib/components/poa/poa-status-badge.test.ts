import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PoaStatusBadge from './poa-status-badge.svelte';

describe('PoaStatusBadge', () => {
	it('renders active status', () => {
		render(PoaStatusBadge, { props: { status: 'active' } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('renders pending status', () => {
		render(PoaStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders expired status', () => {
		render(PoaStatusBadge, { props: { status: 'expired' } });
		expect(screen.getByText('Expired')).toBeTruthy();
	});

	it('renders revoked status', () => {
		render(PoaStatusBadge, { props: { status: 'revoked' } });
		expect(screen.getByText('Revoked')).toBeTruthy();
	});
});
