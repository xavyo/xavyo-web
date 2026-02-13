import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import TaskStatusBadge from './task-status-badge.svelte';

describe('TaskStatusBadge', () => {
	afterEach(() => { cleanup(); });

	it('renders pending status', () => {
		render(TaskStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders in_progress status', () => {
		render(TaskStatusBadge, { props: { status: 'in_progress' } });
		expect(screen.getByText('In Progress')).toBeTruthy();
	});

	it('renders completed status', () => {
		render(TaskStatusBadge, { props: { status: 'completed' } });
		expect(screen.getByText('Completed')).toBeTruthy();
	});

	it('renders rejected status', () => {
		render(TaskStatusBadge, { props: { status: 'rejected' } });
		expect(screen.getByText('Rejected')).toBeTruthy();
	});

	it('renders cancelled status', () => {
		render(TaskStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});

	it('applies correct class for pending', () => {
		render(TaskStatusBadge, { props: { status: 'pending' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-yellow-100');
	});

	it('applies correct class for completed', () => {
		render(TaskStatusBadge, { props: { status: 'completed' } });
		const badge = document.querySelector('span');
		expect(badge?.className).toContain('bg-green-100');
	});
});
