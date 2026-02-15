import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import DelegationStatusBadge from './delegation-status-badge.svelte';

describe('DelegationStatusBadge', () => {
	it('renders active status with correct text', () => {
		render(DelegationStatusBadge, { props: { status: 'active' } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('renders expired status with correct text', () => {
		render(DelegationStatusBadge, { props: { status: 'expired' } });
		expect(screen.getByText('Expired')).toBeTruthy();
	});

	it('renders revoked status with correct text', () => {
		render(DelegationStatusBadge, { props: { status: 'revoked' } });
		expect(screen.getByText('Revoked')).toBeTruthy();
	});

	it('renders unknown status as-is', () => {
		render(DelegationStatusBadge, { props: { status: 'unknown' } });
		expect(screen.getByText('unknown')).toBeTruthy();
	});
});
