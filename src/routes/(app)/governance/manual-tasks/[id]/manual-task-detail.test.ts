import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn()
}));

vi.mock('$app/forms', () => ({
	enhance: () => () => {}
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import Page from './+page.svelte';

describe('Manual Task Detail Page', () => {
	afterEach(() => { cleanup(); });

	const mockTask = {
		id: 'task-1',
		assignment_id: 'assign-1',
		application_id: 'app-1',
		application_name: 'Test Application',
		user_id: 'user-1',
		user_name: 'Jane Smith',
		entitlement_id: 'ent-1',
		entitlement_name: 'Read Access',
		operation_type: 'grant' as const,
		status: 'pending' as const,
		assignee_id: null,
		assignee_name: null,
		sla_deadline: '2025-12-31T00:00:00Z',
		sla_warning_sent: false,
		sla_breached: false,
		retry_count: 0,
		next_retry_at: null,
		notes: null,
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-02T00:00:00Z',
		completed_at: null
	};

	it('renders task information', () => {
		render(Page, { props: { data: { task: mockTask } } as any });
		expect(screen.getByText('Task Information')).toBeTruthy();
		expect(screen.getByText('Test Application')).toBeTruthy();
		expect(screen.getByText('Jane Smith')).toBeTruthy();
	});

	it('renders actions section', () => {
		render(Page, { props: { data: { task: mockTask } } as any });
		expect(screen.getByText('Actions')).toBeTruthy();
	});

	it('shows claim button for pending unassigned task', () => {
		render(Page, { props: { data: { task: mockTask } } as any });
		expect(screen.getByText('Claim Task')).toBeTruthy();
	});

	it('shows back to list link', () => {
		render(Page, { props: { data: { task: mockTask } } as any });
		expect(screen.getByText('Back to List')).toBeTruthy();
	});

	it('shows no actions for completed task', () => {
		const completed = { ...mockTask, status: 'completed' as const };
		render(Page, { props: { data: { task: completed } } as any });
		expect(screen.getByText('No actions available for this task.')).toBeTruthy();
	});
});
