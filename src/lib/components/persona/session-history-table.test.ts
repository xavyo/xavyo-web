import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import SessionHistoryTable from './session-history-table.svelte';
import type { ContextSessionSummary } from '$lib/api/types';

function makeSession(overrides: Partial<ContextSessionSummary> = {}): ContextSessionSummary {
	return {
		id: 'sess-1',
		switched_at: '2026-02-10T14:00:00Z',
		from_context: 'Physical Identity',
		to_context: 'Admin Persona',
		reason: 'Admin task',
		...overrides
	};
}

describe('SessionHistoryTable', () => {
	afterEach(cleanup);

	it('renders empty state when no sessions', () => {
		render(SessionHistoryTable, { props: { sessions: [] } });
		expect(screen.getByText('No session history')).toBeTruthy();
		expect(screen.getByText('No context switches have been performed yet.')).toBeTruthy();
	});

	it('renders table headers when sessions exist', () => {
		render(SessionHistoryTable, { props: { sessions: [makeSession()], total: 1 } });
		expect(screen.getByText('Time')).toBeTruthy();
		expect(screen.getByText('From')).toBeTruthy();
		expect(screen.getByText('To')).toBeTruthy();
		expect(screen.getByText('Reason')).toBeTruthy();
	});

	it('renders session from context', () => {
		render(SessionHistoryTable, { props: { sessions: [makeSession()], total: 1 } });
		expect(screen.getByText('Physical Identity')).toBeTruthy();
	});

	it('renders session to context', () => {
		render(SessionHistoryTable, { props: { sessions: [makeSession()], total: 1 } });
		expect(screen.getByText('Admin Persona')).toBeTruthy();
	});

	it('renders session reason', () => {
		render(SessionHistoryTable, { props: { sessions: [makeSession()], total: 1 } });
		expect(screen.getByText('Admin task')).toBeTruthy();
	});

	it('renders dash for null reason', () => {
		render(SessionHistoryTable, {
			props: { sessions: [makeSession({ reason: null })], total: 1 }
		});
		expect(screen.getByText('\u2014')).toBeTruthy();
	});

	it('renders total sessions count', () => {
		render(SessionHistoryTable, { props: { sessions: [makeSession()], total: 10 } });
		expect(screen.getByText('10 total sessions')).toBeTruthy();
	});

	it('renders multiple sessions', () => {
		const sessions = [
			makeSession({ id: 's1', from_context: 'Physical', to_context: 'Persona A' }),
			makeSession({ id: 's2', from_context: 'Persona A', to_context: 'Physical' }),
			makeSession({ id: 's3', from_context: 'Physical', to_context: 'Persona B' })
		];
		render(SessionHistoryTable, { props: { sessions, total: 3 } });
		// "Persona A" appears in both from_context and to_context across rows
		expect(screen.getAllByText('Persona A').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('Persona B')).toBeTruthy();
		expect(screen.getByText('3 total sessions')).toBeTruthy();
	});

	it('defaults total to 0', () => {
		render(SessionHistoryTable, { props: { sessions: [makeSession()] } });
		expect(screen.getByText('0 total sessions')).toBeTruthy();
	});
});
