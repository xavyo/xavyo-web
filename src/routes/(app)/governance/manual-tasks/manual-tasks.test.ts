import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import Page from './+page.svelte';

describe('Manual Tasks Hub Page', () => {
	afterEach(() => { cleanup(); });

	const mockData = {
		dashboard: {
			pending_count: 5,
			in_progress_count: 3,
			sla_at_risk_count: 2,
			sla_breached_count: 1,
			completed_today: 10,
			average_completion_time_seconds: 3600
		},
		tasks: {
			items: [
				{
					id: 'task-1',
					assignment_id: 'assign-1',
					application_id: 'app-1',
					application_name: 'Test App',
					user_id: 'user-1',
					user_name: 'John Doe',
					entitlement_id: 'ent-1',
					entitlement_name: 'Admin Access',
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
					updated_at: '2025-01-01T00:00:00Z',
					completed_at: null
				}
			],
			total: 1,
			limit: 20,
			offset: 0
		},
		filters: { status: undefined, application_id: undefined, user_id: undefined, sla_breached: undefined, assignee_id: undefined }
	};

	it('renders page title', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Manual Tasks')).toBeTruthy();
	});

	it('renders dashboard metric cards', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getAllByText('Pending').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('5')).toBeTruthy();
		expect(screen.getAllByText('In Progress').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('SLA At Risk')).toBeTruthy();
		expect(screen.getByText('SLA Breached')).toBeTruthy();
		expect(screen.getByText('Completed Today')).toBeTruthy();
	});

	it('renders task list', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Test App')).toBeTruthy();
		expect(screen.getByText('John Doe')).toBeTruthy();
		expect(screen.getByText('Admin Access')).toBeTruthy();
	});

	it('renders status filter', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('All Statuses')).toBeTruthy();
	});

	it('renders empty state when no tasks', () => {
		const emptyData = { ...mockData, tasks: { items: [], total: 0, limit: 20, offset: 0 } };
		render(Page, { props: { data: emptyData } as any });
		expect(screen.getByText('No manual tasks')).toBeTruthy();
	});
});
