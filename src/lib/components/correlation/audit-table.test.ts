import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import AuditTable from './audit-table.svelte';
import type { CorrelationAuditEvent } from '$lib/api/types';

function makeEvent(overrides: Partial<CorrelationAuditEvent> = {}): CorrelationAuditEvent {
	return {
		id: 'evt-1',
		connector_id: 'conn-1',
		account_id: 'acc-1',
		case_id: 'case-1',
		identity_id: 'id-1',
		event_type: 'auto_confirm',
		outcome: 'success',
		confidence_score: 0.92,
		candidate_count: 3,
		candidates_summary: { top: 'candidate-1' },
		rules_snapshot: { rule1: { match: 'exact' } },
		thresholds_snapshot: { auto: 0.9, manual: 0.7 },
		actor_type: 'system',
		actor_id: null,
		reason: null,
		created_at: '2025-06-01T10:00:00Z',
		...overrides
	};
}

describe('AuditTable', () => {
	afterEach(cleanup);

	it('renders the filter bar with event type and outcome selects', () => {
		render(AuditTable, { props: { events: [] } });
		expect(screen.getByLabelText('Event Type')).toBeTruthy();
		expect(screen.getByLabelText('Outcome')).toBeTruthy();
	});

	it('renders the filter bar with date inputs', () => {
		render(AuditTable, { props: { events: [] } });
		expect(screen.getByLabelText('Start Date')).toBeTruthy();
		expect(screen.getByLabelText('End Date')).toBeTruthy();
	});

	it('renders Apply and Clear filter buttons', () => {
		render(AuditTable, { props: { events: [] } });
		expect(screen.getByText('Apply')).toBeTruthy();
		expect(screen.getByText('Clear')).toBeTruthy();
	});

	it('renders empty state when no events', () => {
		render(AuditTable, { props: { events: [] } });
		expect(screen.getByText('No audit events found.')).toBeTruthy();
	});

	it('does not render table when no events', () => {
		render(AuditTable, { props: { events: [] } });
		expect(screen.queryByRole('button', { name: /evt-/ })).toBeNull();
	});

	it('renders table headers when events exist', () => {
		render(AuditTable, { props: { events: [makeEvent()] } });
		expect(screen.getByText('Date')).toBeTruthy();
		// 'Event Type' appears in both table header and filter label — use getAllByText
		expect(screen.getAllByText('Event Type').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('Account ID')).toBeTruthy();
		expect(screen.getByText('Identity ID')).toBeTruthy();
		expect(screen.getByText('Confidence')).toBeTruthy();
		expect(screen.getByText('Actor')).toBeTruthy();
		// 'Outcome' appears in both table header and filter label — use getAllByText
		expect(screen.getAllByText('Outcome').length).toBeGreaterThanOrEqual(1);
	});

	it('renders event type badge with spaces replacing underscores', () => {
		render(AuditTable, { props: { events: [makeEvent({ event_type: 'auto_confirm' })] } });
		expect(screen.getByText('auto confirm')).toBeTruthy();
	});

	it('renders manual_confirm event type', () => {
		render(AuditTable, { props: { events: [makeEvent({ event_type: 'manual_confirm' })] } });
		expect(screen.getByText('manual confirm')).toBeTruthy();
	});

	it('renders reject event type', () => {
		render(AuditTable, { props: { events: [makeEvent({ event_type: 'reject' })] } });
		expect(screen.getByText('reject')).toBeTruthy();
	});

	it('renders create_identity event type', () => {
		render(AuditTable, { props: { events: [makeEvent({ event_type: 'create_identity' })] } });
		expect(screen.getByText('create identity')).toBeTruthy();
	});

	it('renders reassign event type', () => {
		render(AuditTable, { props: { events: [makeEvent({ event_type: 'reassign' })] } });
		expect(screen.getByText('reassign')).toBeTruthy();
	});

	it('renders confidence as percentage', () => {
		render(AuditTable, { props: { events: [makeEvent({ confidence_score: 0.85 })] } });
		expect(screen.getByText('85%')).toBeTruthy();
	});

	it('renders confidence rounded to nearest integer', () => {
		render(AuditTable, { props: { events: [makeEvent({ confidence_score: 0.876 })] } });
		expect(screen.getByText('88%')).toBeTruthy();
	});

	it('renders account ID', () => {
		render(AuditTable, { props: { events: [makeEvent({ account_id: 'acc-456' })] } });
		expect(screen.getByText('acc-456')).toBeTruthy();
	});

	it('renders identity ID', () => {
		render(AuditTable, { props: { events: [makeEvent({ identity_id: 'id-789' })] } });
		expect(screen.getByText('id-789')).toBeTruthy();
	});

	it('renders system actor type', () => {
		render(AuditTable, {
			props: { events: [makeEvent({ actor_type: 'system', actor_id: null })] }
		});
		expect(screen.getByText('system')).toBeTruthy();
	});

	it('renders user actor type with ID', () => {
		render(AuditTable, {
			props: { events: [makeEvent({ actor_type: 'user', actor_id: 'usr-1' })] }
		});
		expect(screen.getByText('user: usr-1')).toBeTruthy();
	});

	it('renders outcome success badge', () => {
		render(AuditTable, { props: { events: [makeEvent({ outcome: 'success' })] } });
		expect(screen.getByText('success')).toBeTruthy();
	});

	it('renders outcome failure badge', () => {
		render(AuditTable, { props: { events: [makeEvent({ outcome: 'failure' })] } });
		expect(screen.getByText('failure')).toBeTruthy();
	});

	it('renders multiple events as rows', () => {
		const events = [
			makeEvent({ id: 'evt-1', account_id: 'acc-1' }),
			makeEvent({ id: 'evt-2', account_id: 'acc-2' }),
			makeEvent({ id: 'evt-3', account_id: 'acc-3' })
		];
		render(AuditTable, { props: { events } });
		expect(screen.getByText('acc-1')).toBeTruthy();
		expect(screen.getByText('acc-2')).toBeTruthy();
		expect(screen.getByText('acc-3')).toBeTruthy();
	});

	// --- Pagination tests ---

	it('does not show pagination when total <= page size', () => {
		render(AuditTable, { props: { events: [makeEvent()], total: 5 } });
		expect(screen.queryByText(/^Page /)).toBeNull();
	});

	it('shows pagination when total > page size (20)', () => {
		const events = Array.from({ length: 20 }, (_, i) =>
			makeEvent({ id: `evt-${i}`, account_id: `acc-${i}` })
		);
		render(AuditTable, { props: { events, total: 45 } });
		expect(screen.getByText('Page 1 of 3')).toBeTruthy();
		expect(screen.getByText('Showing 1-20 of 45')).toBeTruthy();
	});

	// --- Filter callback tests ---

	it('calls onFilterChange when Apply button is clicked', async () => {
		const onFilterChange = vi.fn();
		render(AuditTable, { props: { events: [], onFilterChange } });

		await fireEvent.click(screen.getByText('Apply'));
		expect(onFilterChange).toHaveBeenCalledWith({});
	});

	it('calls onFilterChange with empty object when Clear is clicked', async () => {
		const onFilterChange = vi.fn();
		render(AuditTable, { props: { events: [], onFilterChange } });

		await fireEvent.click(screen.getByText('Clear'));
		expect(onFilterChange).toHaveBeenCalledWith({});
	});

	it('calls onFilterChange with selected event_type', async () => {
		const onFilterChange = vi.fn();
		render(AuditTable, { props: { events: [], onFilterChange } });

		const select = screen.getByLabelText('Event Type') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'reject' } });
		await fireEvent.click(screen.getByText('Apply'));

		expect(onFilterChange).toHaveBeenCalledWith(
			expect.objectContaining({ event_type: 'reject' })
		);
	});

	it('calls onFilterChange with selected outcome', async () => {
		const onFilterChange = vi.fn();
		render(AuditTable, { props: { events: [], onFilterChange } });

		const select = screen.getByLabelText('Outcome') as HTMLSelectElement;
		await fireEvent.change(select, { target: { value: 'failure' } });
		await fireEvent.click(screen.getByText('Apply'));

		expect(onFilterChange).toHaveBeenCalledWith(
			expect.objectContaining({ outcome: 'failure' })
		);
	});

	// --- Event type filter options ---

	it('has correct event type filter options', () => {
		render(AuditTable, { props: { events: [] } });
		const select = screen.getByLabelText('Event Type') as HTMLSelectElement;
		const options = Array.from(select.querySelectorAll('option'));
		const values = options.map((o) => o.value);
		expect(values).toContain('');
		expect(values).toContain('auto_confirm');
		expect(values).toContain('manual_confirm');
		expect(values).toContain('reject');
		expect(values).toContain('create_identity');
		expect(values).toContain('reassign');
	});

	it('has correct outcome filter options', () => {
		render(AuditTable, { props: { events: [] } });
		const select = screen.getByLabelText('Outcome') as HTMLSelectElement;
		const options = Array.from(select.querySelectorAll('option'));
		const values = options.map((o) => o.value);
		expect(values).toContain('');
		expect(values).toContain('success');
		expect(values).toContain('failure');
	});
});
