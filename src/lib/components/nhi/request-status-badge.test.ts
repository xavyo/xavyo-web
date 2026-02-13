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

	it('applies yellow variant classes for pending', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'pending' } });
		const badge = container.querySelector('[class*="yellow"]');
		expect(badge).toBeTruthy();
	});

	it('applies green variant classes for approved', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'approved' } });
		const badge = container.querySelector('[class*="green"]');
		expect(badge).toBeTruthy();
	});

	it('applies red variant classes for rejected', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'rejected' } });
		const badge = container.querySelector('[class*="red"]');
		expect(badge).toBeTruthy();
	});

	it('applies gray variant classes for cancelled', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'cancelled' } });
		const badge = container.querySelector('[class*="gray"]');
		expect(badge).toBeTruthy();
	});

	it('falls back to pending variant for unknown status', () => {
		const { container } = render(RequestStatusBadge, { props: { status: 'xyz' } });
		const badge = container.querySelector('[class*="yellow"]');
		expect(badge).toBeTruthy();
	});
});
