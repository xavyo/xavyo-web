import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ActionLog from './action-log.svelte';
import type { LifecycleAction } from '$lib/api/types';

function makeAction(overrides: Partial<LifecycleAction> = {}): LifecycleAction {
	return {
		id: 'act-1',
		event_id: 'evt-1',
		action_type: 'provision',
		assignment_id: null,
		policy_id: 'pol-abc12345-6789',
		entitlement_id: 'ent-abc12345-6789',
		scheduled_at: null,
		executed_at: '2025-06-01T10:00:00Z',
		cancelled_at: null,
		error_message: null,
		created_at: '2025-06-01T09:00:00Z',
		...overrides
	};
}

describe('ActionLog', () => {
	afterEach(cleanup);

	it('renders the "Action Log" heading', () => {
		render(ActionLog, { props: { actions: [] } });
		expect(screen.getByText('Action Log')).toBeTruthy();
	});

	it('shows empty state when no actions', () => {
		render(ActionLog, { props: { actions: [] } });
		expect(screen.getByText('No actions recorded.')).toBeTruthy();
	});

	it('renders table headers when actions exist', () => {
		render(ActionLog, { props: { actions: [makeAction()] } });
		expect(screen.getByText('Type')).toBeTruthy();
		expect(screen.getByText('Entitlement')).toBeTruthy();
		expect(screen.getByText('Policy')).toBeTruthy();
		expect(screen.getByText('Scheduled')).toBeTruthy();
		expect(screen.getByText('Executed')).toBeTruthy();
		expect(screen.getByText('Error')).toBeTruthy();
	});

	it('renders action type badge with formatted text', () => {
		render(ActionLog, { props: { actions: [makeAction({ action_type: 'schedule_revoke' })] } });
		expect(screen.getByText('schedule revoke')).toBeTruthy();
	});

	it('renders provision badge', () => {
		render(ActionLog, { props: { actions: [makeAction({ action_type: 'provision' })] } });
		expect(screen.getByText('provision')).toBeTruthy();
	});

	it('renders revoke badge', () => {
		render(ActionLog, { props: { actions: [makeAction({ action_type: 'revoke' })] } });
		expect(screen.getByText('revoke')).toBeTruthy();
	});

	it('truncates entitlement_id to first 8 chars with ellipsis', () => {
		render(ActionLog, {
			props: { actions: [makeAction({ entitlement_id: 'ent-abc12345-6789' })] }
		});
		expect(screen.getByText('ent-abc1...')).toBeTruthy();
	});

	it('truncates policy_id to first 8 chars with ellipsis', () => {
		render(ActionLog, {
			props: { actions: [makeAction({ policy_id: 'pol-xyz98765-4321' })] }
		});
		expect(screen.getByText('pol-xyz9...')).toBeTruthy();
	});

	it('shows dash for null policy_id', () => {
		render(ActionLog, {
			props: { actions: [makeAction({ policy_id: null })] }
		});
		// The dash for policy_id column
		const cells = screen.getAllByText('-');
		expect(cells.length).toBeGreaterThanOrEqual(1);
	});

	it('shows dash for null scheduled_at', () => {
		render(ActionLog, {
			props: { actions: [makeAction({ scheduled_at: null })] }
		});
		const dashes = screen.getAllByText('-');
		expect(dashes.length).toBeGreaterThanOrEqual(1);
	});

	it('displays formatted date for executed_at', () => {
		render(ActionLog, {
			props: { actions: [makeAction({ executed_at: '2025-06-15T14:30:00Z' })] }
		});
		// Check that some date representation is rendered (locale-dependent)
		const dateStr = new Date('2025-06-15T14:30:00Z').toLocaleString();
		expect(screen.getByText(dateStr)).toBeTruthy();
	});

	it('displays error message when present', () => {
		render(ActionLog, {
			props: { actions: [makeAction({ error_message: 'Provisioning failed: timeout' })] }
		});
		expect(screen.getByText('Provisioning failed: timeout')).toBeTruthy();
	});

	it('renders multiple action rows', () => {
		const actions = [
			makeAction({ id: 'a1', action_type: 'provision' }),
			makeAction({ id: 'a2', action_type: 'revoke' }),
			makeAction({ id: 'a3', action_type: 'skip' })
		];
		render(ActionLog, { props: { actions } });
		expect(screen.getByText('provision')).toBeTruthy();
		expect(screen.getByText('revoke')).toBeTruthy();
		expect(screen.getByText('skip')).toBeTruthy();
	});

	it('does not render table when actions is empty', () => {
		const { container } = render(ActionLog, { props: { actions: [] } });
		expect(container.querySelector('table')).toBeNull();
	});
});
