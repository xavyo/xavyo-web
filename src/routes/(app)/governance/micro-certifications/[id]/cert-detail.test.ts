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
	decideMicroCertificationClient: vi.fn().mockResolvedValue({}),
	delegateMicroCertificationClient: vi.fn().mockResolvedValue({}),
	skipMicroCertificationClient: vi.fn().mockResolvedValue({})
}));

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

const mockEvents: { items: Array<{ id: string; certification_id: string; event_type: string; actor_id: string | null; details: Record<string, unknown> | null; created_at: string }>; total: number } = {
	items: [
		{
			id: 'evt-1',
			certification_id: mockCert.id,
			event_type: 'created',
			actor_id: null,
			details: null,
			created_at: '2026-02-13T10:00:00Z'
		}
	],
	total: 1
};

describe('Certification Detail Page', () => {
	it('renders certification detail heading', () => {
		render(Page, {
			props: {
				data: { certification: mockCert, events: mockEvents } as any
			}
		});
		expect(screen.getByText('Certification Detail')).toBeTruthy();
	});

	it('shows back link', () => {
		render(Page, {
			props: {
				data: { certification: mockCert, events: mockEvents } as any
			}
		});
		expect(screen.getByText(/Back to Micro Certifications/)).toBeTruthy();
	});

	it('shows status badge', () => {
		render(Page, {
			props: {
				data: { certification: mockCert, events: mockEvents } as any
			}
		});
		expect(screen.getByTestId('cert-status-badge')).toBeTruthy();
	});

	it('shows action buttons for pending certification', () => {
		render(Page, {
			props: {
				data: { certification: mockCert, events: mockEvents } as any
			}
		});
		expect(screen.getByText('Make Decision')).toBeTruthy();
		expect(screen.getByText('Delegate')).toBeTruthy();
		expect(screen.getByText('Skip')).toBeTruthy();
	});

	it('hides action buttons for decided certification', () => {
		render(Page, {
			props: {
				data: {
					certification: { ...mockCert, status: 'approved' as const },
					events: mockEvents
				} as any
			}
		});
		expect(screen.queryByText('Make Decision')).toBeNull();
	});

	it('shows events timeline', () => {
		render(Page, {
			props: {
				data: { certification: mockCert, events: mockEvents } as any
			}
		});
		expect(screen.getByTestId('events-timeline')).toBeTruthy();
	});

	it('shows certification info fields', () => {
		render(Page, {
			props: {
				data: { certification: mockCert, events: mockEvents } as any
			}
		});
		expect(screen.getByText('User')).toBeTruthy();
		expect(screen.getByText('Entitlement')).toBeTruthy();
		expect(screen.getByText('Reviewer')).toBeTruthy();
	});

	it('shows escalated flag when escalated', () => {
		render(Page, {
			props: {
				data: {
					certification: { ...mockCert, escalated: true },
					events: mockEvents
				} as any
			}
		});
		expect(screen.getByText('Escalated')).toBeTruthy();
	});

	it('shows overdue flag when past deadline', () => {
		render(Page, {
			props: {
				data: {
					certification: { ...mockCert, past_deadline: true },
					events: mockEvents
				} as any
			}
		});
		expect(screen.getByText('Overdue')).toBeTruthy();
	});
});
