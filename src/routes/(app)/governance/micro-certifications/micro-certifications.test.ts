import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

vi.mock('$lib/api/micro-certifications-client', () => ({
	fetchMicroCertifications: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
	fetchMyPendingCertifications: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
	fetchMicroCertificationStats: vi.fn().mockResolvedValue({ total: 0, pending: 0, approved: 0, revoked: 0, auto_revoked: 0, flagged_for_review: 0, expired: 0, skipped: 0, escalated: 0, past_deadline: 0, by_trigger_type: null }),
	fetchTriggerRules: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
	bulkDecideMicroCertificationsClient: vi.fn().mockResolvedValue({ success_count: 0, failure_count: 0, succeeded: [], failures: [] })
}));

// Dynamic import to avoid hoisting issues
const { default: Page } = await import('./+page.svelte');

const mockCert = {
	id: '00000000-0000-0000-0000-000000000001',
	tenant_id: 't1',
	user_id: '00000000-0000-0000-0000-000000000010',
	assignment_id: null,
	entitlement_id: '00000000-0000-0000-0000-000000000020',
	trigger_rule_id: null,
	reviewer_id: '00000000-0000-0000-0000-000000000030',
	status: 'pending' as const,
	decision: null,
	comment: null,
	decided_at: null,
	delegated_to: null,
	escalated: false,
	past_deadline: false,
	from_date: null,
	to_date: '2026-03-01T00:00:00Z',
	created_at: '2026-02-13T10:00:00Z'
};

const mockRule = {
	id: '00000000-0000-0000-0000-000000000002',
	tenant_id: 't1',
	name: 'High Risk Assignment Review',
	trigger_type: 'high_risk_assignment' as const,
	scope_type: 'tenant' as const,
	scope_id: null,
	reviewer_type: 'user_manager' as const,
	specific_reviewer_id: null,
	fallback_reviewer_id: null,
	timeout_secs: 86400,
	reminder_threshold_percent: 75,
	auto_revoke: true,
	revoke_triggering_assignment: false,
	is_active: true,
	is_default: false,
	priority: null,
	metadata: null,
	created_at: '2026-02-13T10:00:00Z'
};

describe('Micro Certifications Hub', () => {
	it('renders page title', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [], total: 0, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: true
				} as any
			}
		});
		expect(screen.getByText('Micro Certifications')).toBeTruthy();
	});

	it('shows My Pending tab by default', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [], total: 0, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByTestId('my-pending-tab')).toBeTruthy();
	});

	it('shows empty state when no pending certifications', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [], total: 0, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('No pending certifications')).toBeTruthy();
	});

	it('shows pending certifications in table', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [mockCert], total: 1, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('Review')).toBeTruthy();
	});

	it('shows admin tabs for admin users', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [], total: 0, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: true
				} as any
			}
		});
		expect(screen.getByTestId('tab-all')).toBeTruthy();
		expect(screen.getByTestId('tab-triggers')).toBeTruthy();
		expect(screen.getByTestId('tab-statistics')).toBeTruthy();
	});

	it('hides admin tabs for non-admin users', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [], total: 0, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.queryByTestId('tab-all')).toBeNull();
		expect(screen.queryByTestId('tab-triggers')).toBeNull();
	});

	it('shows create trigger rule button for admin', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [], total: 0, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: true
				} as any
			}
		});
		expect(screen.getByText('Create Trigger Rule')).toBeTruthy();
	});

	it('shows pending count badge', () => {
		render(Page, {
			props: {
				data: {
					myPending: { items: [mockCert], total: 1, limit: 20, offset: 0 },
					allCertifications: { items: [], total: 0, limit: 20, offset: 0 },
					stats: null,
					triggerRules: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('1')).toBeTruthy();
	});
});
