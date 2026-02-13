import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SlaStatusBadge from './sla-status-badge.svelte';
import TicketingTypeBadge from './ticketing-type-badge.svelte';
import BulkActionStatusBadge from './bulk-action-status-badge.svelte';
import FailedOpStatusBadge from './failed-op-status-badge.svelte';
import BulkStateStatusBadge from './bulk-state-status-badge.svelte';
import ScheduledStatusBadge from './scheduled-status-badge.svelte';

describe('SlaStatusBadge', () => {
	it('renders active status', () => {
		render(SlaStatusBadge, { props: { status: 'active' } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('renders inactive status', () => {
		render(SlaStatusBadge, { props: { status: 'inactive' } });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('handles unknown status by displaying raw value', () => {
		render(SlaStatusBadge, { props: { status: 'unknown_val' } });
		expect(screen.getByText('unknown_val')).toBeTruthy();
	});
});

describe('TicketingTypeBadge', () => {
	it('renders service_now type', () => {
		render(TicketingTypeBadge, { props: { systemType: 'service_now' } });
		expect(screen.getByText('ServiceNow')).toBeTruthy();
	});

	it('renders jira type', () => {
		render(TicketingTypeBadge, { props: { systemType: 'jira' } });
		expect(screen.getByText('Jira')).toBeTruthy();
	});

	it('renders custom_webhook type', () => {
		render(TicketingTypeBadge, { props: { systemType: 'custom_webhook' } });
		expect(screen.getByText('Custom Webhook')).toBeTruthy();
	});

	it('handles unknown systemType by displaying raw value', () => {
		render(TicketingTypeBadge, { props: { systemType: 'unknown_system' } });
		expect(screen.getByText('unknown_system')).toBeTruthy();
	});
});

describe('BulkActionStatusBadge', () => {
	it('renders pending status', () => {
		render(BulkActionStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders previewing status', () => {
		render(BulkActionStatusBadge, { props: { status: 'previewing' } });
		expect(screen.getByText('Previewing')).toBeTruthy();
	});

	it('renders approved status', () => {
		render(BulkActionStatusBadge, { props: { status: 'approved' } });
		expect(screen.getByText('Approved')).toBeTruthy();
	});

	it('renders executing status', () => {
		render(BulkActionStatusBadge, { props: { status: 'executing' } });
		expect(screen.getByText('Executing')).toBeTruthy();
	});

	it('renders completed status', () => {
		render(BulkActionStatusBadge, { props: { status: 'completed' } });
		expect(screen.getByText('Completed')).toBeTruthy();
	});

	it('renders failed status', () => {
		render(BulkActionStatusBadge, { props: { status: 'failed' } });
		expect(screen.getByText('Failed')).toBeTruthy();
	});

	it('renders cancelled status', () => {
		render(BulkActionStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});
});

describe('FailedOpStatusBadge', () => {
	it('renders pending_retry status', () => {
		render(FailedOpStatusBadge, { props: { status: 'pending_retry' } });
		expect(screen.getByText('Pending Retry')).toBeTruthy();
	});

	it('renders retrying status', () => {
		render(FailedOpStatusBadge, { props: { status: 'retrying' } });
		expect(screen.getByText('Retrying')).toBeTruthy();
	});

	it('renders dismissed status', () => {
		render(FailedOpStatusBadge, { props: { status: 'dismissed' } });
		expect(screen.getByText('Dismissed')).toBeTruthy();
	});

	it('renders resolved status', () => {
		render(FailedOpStatusBadge, { props: { status: 'resolved' } });
		expect(screen.getByText('Resolved')).toBeTruthy();
	});
});

describe('BulkStateStatusBadge', () => {
	it('renders queued status', () => {
		render(BulkStateStatusBadge, { props: { status: 'queued' } });
		expect(screen.getByText('Queued')).toBeTruthy();
	});

	it('renders processing status', () => {
		render(BulkStateStatusBadge, { props: { status: 'processing' } });
		expect(screen.getByText('Processing')).toBeTruthy();
	});

	it('renders completed status', () => {
		render(BulkStateStatusBadge, { props: { status: 'completed' } });
		expect(screen.getByText('Completed')).toBeTruthy();
	});

	it('renders failed status', () => {
		render(BulkStateStatusBadge, { props: { status: 'failed' } });
		expect(screen.getByText('Failed')).toBeTruthy();
	});

	it('renders cancelled status', () => {
		render(BulkStateStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});
});

describe('ScheduledStatusBadge', () => {
	it('renders pending status', () => {
		render(ScheduledStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders executed status', () => {
		render(ScheduledStatusBadge, { props: { status: 'executed' } });
		expect(screen.getByText('Executed')).toBeTruthy();
	});

	it('renders cancelled status', () => {
		render(ScheduledStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});

	it('renders failed status', () => {
		render(ScheduledStatusBadge, { props: { status: 'failed' } });
		expect(screen.getByText('Failed')).toBeTruthy();
	});

	it('handles unknown status by displaying raw value', () => {
		render(ScheduledStatusBadge, { props: { status: 'some_other' } });
		expect(screen.getByText('some_other')).toBeTruthy();
	});
});
