import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import AlertCard from './alert-card.svelte';
import type { SecurityAlert } from '$lib/api/types';

function makeAlert(overrides: Partial<SecurityAlert> = {}): SecurityAlert {
	return {
		id: 'alert-1',
		user_id: 'user-1',
		alert_type: 'new_device',
		severity: 'warning',
		title: 'New device detected',
		message: 'A login from an unrecognized device was detected.',
		metadata: {},
		acknowledged_at: null,
		created_at: '2025-06-01T12:00:00Z',
		...overrides
	};
}

describe('AlertCard', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders title and message', () => {
		render(AlertCard, { props: { alert: makeAlert() } });
		expect(screen.getByText('New device detected')).toBeTruthy();
		expect(screen.getByText('A login from an unrecognized device was detected.')).toBeTruthy();
	});

	it('renders severity badge', () => {
		render(AlertCard, { props: { alert: makeAlert({ severity: 'critical' }) } });
		expect(screen.getByText('critical')).toBeTruthy();
	});

	it('renders type badge with human-readable label', () => {
		render(AlertCard, { props: { alert: makeAlert({ alert_type: 'new_device' }) } });
		expect(screen.getByText('New Device')).toBeTruthy();
	});

	it('shows Acknowledge button when not acknowledged', () => {
		render(AlertCard, { props: { alert: makeAlert({ acknowledged_at: null }) } });
		expect(screen.getByText('Acknowledge')).toBeTruthy();
	});

	it('hides Acknowledge button when acknowledged', () => {
		render(AlertCard, {
			props: { alert: makeAlert({ acknowledged_at: '2025-06-01T13:00:00Z' }) }
		});
		expect(screen.queryByText('Acknowledge')).toBeNull();
	});

	it('shows "Acknowledged" text when acknowledged_at is set', () => {
		render(AlertCard, {
			props: { alert: makeAlert({ acknowledged_at: '2025-06-01T13:00:00Z' }) }
		});
		expect(screen.getByText(/Acknowledged/)).toBeTruthy();
	});

	it('calls onacknowledge with alert id on click', async () => {
		const onacknowledge = vi.fn();
		render(AlertCard, {
			props: { alert: makeAlert({ id: 'alert-42' }), onacknowledge }
		});
		const btn = screen.getByText('Acknowledge');
		await fireEvent.click(btn);
		expect(onacknowledge).toHaveBeenCalledOnce();
		expect(onacknowledge).toHaveBeenCalledWith('alert-42');
	});

	it('does not error when onacknowledge is not provided', async () => {
		render(AlertCard, { props: { alert: makeAlert() } });
		const btn = screen.getByText('Acknowledge');
		await fireEvent.click(btn);
		// Should not throw
	});

	it('renders info severity with blue styling', () => {
		const { container } = render(AlertCard, {
			props: { alert: makeAlert({ severity: 'info' }) }
		});
		const severityIcon = container.querySelector('.bg-blue-100');
		expect(severityIcon).toBeTruthy();
	});

	it('renders warning severity with amber styling', () => {
		const { container } = render(AlertCard, {
			props: { alert: makeAlert({ severity: 'warning' }) }
		});
		const severityIcon = container.querySelector('.bg-amber-100');
		expect(severityIcon).toBeTruthy();
	});

	it('renders critical severity with red styling', () => {
		const { container } = render(AlertCard, {
			props: { alert: makeAlert({ severity: 'critical' }) }
		});
		const severityIcon = container.querySelector('.bg-red-100');
		expect(severityIcon).toBeTruthy();
	});

	it('reduces opacity when acknowledged', () => {
		const { container } = render(AlertCard, {
			props: { alert: makeAlert({ acknowledged_at: '2025-06-01T13:00:00Z' }) }
		});
		const card = container.querySelector('.opacity-75');
		expect(card).toBeTruthy();
	});

	it('renders all alert_type labels correctly', () => {
		const types: Array<{ type: SecurityAlert['alert_type']; label: string }> = [
			{ type: 'new_device', label: 'New Device' },
			{ type: 'new_location', label: 'New Location' },
			{ type: 'failed_attempts', label: 'Failed Attempts' },
			{ type: 'password_change', label: 'Password Change' },
			{ type: 'mfa_disabled', label: 'MFA Disabled' }
		];
		for (const { type, label } of types) {
			const { unmount } = render(AlertCard, {
				props: { alert: makeAlert({ alert_type: type }) }
			});
			expect(screen.getByText(label)).toBeTruthy();
			unmount();
		}
	});
});
