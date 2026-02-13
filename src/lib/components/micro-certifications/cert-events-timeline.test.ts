import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CertEventsTimeline from './cert-events-timeline.svelte';
import type { CertificationEvent } from '$lib/api/types';

const mockEvents: CertificationEvent[] = [
	{
		id: 'evt-1',
		certification_id: 'cert-1',
		event_type: 'created',
		actor_id: null,
		details: null,
		created_at: '2026-02-13T10:00:00Z'
	},
	{
		id: 'evt-2',
		certification_id: 'cert-1',
		event_type: 'approved',
		actor_id: '00000000-0000-0000-0000-000000000001',
		details: { decision: 'approve', comment: 'Approved' },
		created_at: '2026-02-13T11:00:00Z'
	},
	{
		id: 'evt-3',
		certification_id: 'cert-1',
		event_type: 'delegated',
		actor_id: '00000000-0000-0000-0000-000000000002',
		details: { comment: 'Need manager review' },
		created_at: '2026-02-13T10:30:00Z'
	}
];

describe('CertEventsTimeline', () => {
	it('renders timeline with events', () => {
		render(CertEventsTimeline, { props: { events: mockEvents } });
		expect(screen.getByTestId('events-timeline')).toBeTruthy();
		expect(screen.getAllByTestId('timeline-event')).toHaveLength(3);
	});

	it('shows empty state when no events', () => {
		render(CertEventsTimeline, { props: { events: [] } });
		expect(screen.getByText('No events recorded.')).toBeTruthy();
	});

	it('shows event type labels', () => {
		render(CertEventsTimeline, { props: { events: mockEvents } });
		expect(screen.getByText('Created')).toBeTruthy();
		expect(screen.getByText('Approved')).toBeTruthy();
		expect(screen.getByText('Delegated')).toBeTruthy();
	});

	it('shows actor ID when present', () => {
		render(CertEventsTimeline, { props: { events: mockEvents } });
		expect(screen.getAllByText(/By:/).length).toBeGreaterThan(0);
	});

	it('shows event details when present', () => {
		render(CertEventsTimeline, { props: { events: mockEvents } });
		expect(screen.getByText(/Decision: approve/)).toBeTruthy();
	});

	it('sorts events by date descending (newest first)', () => {
		render(CertEventsTimeline, { props: { events: mockEvents } });
		const eventElements = screen.getAllByTestId('timeline-event');
		// Newest event (11:00) should be first
		expect(eventElements[0].textContent).toContain('Approved');
	});
});
