import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RequestStatusBadge from './request-status-badge.svelte';

describe('RequestStatusBadge', () => {
	afterEach(cleanup);

	it('renders Pending for pending status', () => {
		render(RequestStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders Approved for approved status', () => {
		render(RequestStatusBadge, { props: { status: 'approved' } });
		expect(screen.getByText('Approved')).toBeTruthy();
	});

	it('renders Rejected for rejected status', () => {
		render(RequestStatusBadge, { props: { status: 'rejected' } });
		expect(screen.getByText('Rejected')).toBeTruthy();
	});

	it('renders Cancelled for cancelled status', () => {
		render(RequestStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});

	it('renders raw status string for unknown status', () => {
		render(RequestStatusBadge, { props: { status: 'some_unknown' } });
		expect(screen.getByText('some_unknown')).toBeTruthy();
	});

	it('applies warning variant classes for pending', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'pending' } });
		expect(container.innerHTML).toContain('bg-warning/15');
	});

	it('applies success variant classes for approved', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'approved' } });
		expect(container.innerHTML).toContain('bg-success/15');
	});

	it('applies destructive variant classes for rejected', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'rejected' } });
		expect(container.innerHTML).toContain('bg-destructive/15');
	});

	it('applies muted variant classes for cancelled', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'cancelled' } });
		expect(container.innerHTML).toContain('bg-muted');
	});

	it('falls back to pending variant for unknown status', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'xyz' } });
		expect(container.innerHTML).toContain('bg-warning/15');
	});
});
