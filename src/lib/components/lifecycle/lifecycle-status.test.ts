import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LifecycleStatus from './lifecycle-status.svelte';

describe('LifecycleStatus', () => {
	it('renders no assignment message when status is null', () => {
		render(LifecycleStatus, { props: { status: null } });
		expect(screen.getByText('No lifecycle configuration assigned to this user.')).toBeDefined();
	});

	it('renders no assignment message when config_id is null', () => {
		render(LifecycleStatus, {
			props: {
				status: {
					user_id: 'u1',
					config_id: null,
					config_name: null,
					state_id: null,
					state_name: null,
					is_initial: false,
					is_terminal: false,
					entered_at: null,
					entitlement_action: null
				}
			}
		});
		expect(screen.getByText('No lifecycle configuration assigned to this user.')).toBeDefined();
	});

	it('renders config name when assigned', () => {
		render(LifecycleStatus, {
			props: {
				status: {
					user_id: 'u1',
					config_id: 'cfg-1',
					config_name: 'Employee Lifecycle',
					state_id: 's1',
					state_name: 'Active',
					is_initial: false,
					is_terminal: false,
					entered_at: '2024-06-01T00:00:00Z',
					entitlement_action: 'grant'
				}
			}
		});
		expect(screen.getByText('Employee Lifecycle')).toBeDefined();
		expect(screen.getByText('Active')).toBeDefined();
	});

	it('renders Lifecycle Status heading', () => {
		render(LifecycleStatus, { props: { status: null } });
		expect(screen.getByText('Lifecycle Status')).toBeDefined();
	});

	it('renders initial state badge', () => {
		render(LifecycleStatus, {
			props: {
				status: {
					user_id: 'u1',
					config_id: 'cfg-1',
					config_name: 'Lifecycle',
					state_id: 's1',
					state_name: 'Onboarding',
					is_initial: true,
					is_terminal: false,
					entered_at: null,
					entitlement_action: null
				}
			}
		});
		expect(screen.getByText('Initial')).toBeDefined();
	});

	it('renders terminal state badge', () => {
		render(LifecycleStatus, {
			props: {
				status: {
					user_id: 'u1',
					config_id: 'cfg-1',
					config_name: 'Lifecycle',
					state_id: 's1',
					state_name: 'Terminated',
					is_initial: false,
					is_terminal: true,
					entered_at: null,
					entitlement_action: null
				}
			}
		});
		expect(screen.getByText('Terminal')).toBeDefined();
	});

	it('renders entitlement action when present', () => {
		render(LifecycleStatus, {
			props: {
				status: {
					user_id: 'u1',
					config_id: 'cfg-1',
					config_name: 'Lifecycle',
					state_id: 's1',
					state_name: 'Active',
					is_initial: false,
					is_terminal: false,
					entered_at: null,
					entitlement_action: 'grant'
				}
			}
		});
		expect(screen.getByText('grant')).toBeDefined();
	});
});
