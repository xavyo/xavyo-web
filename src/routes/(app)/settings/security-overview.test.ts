import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import SecurityOverview from './security-overview.svelte';

describe('SecurityOverview', () => {
	afterEach(() => {
		cleanup();
	});

	const baseOverview = {
		mfa_enabled: true,
		mfa_methods: ['totp', 'webauthn'],
		trusted_devices_count: 3,
		active_sessions_count: 2,
		last_password_change: '2024-10-15T00:00:00Z',
		recent_security_alerts_count: 0,
		password_expires_at: null
	};

	it('shows MFA status as Enabled when mfa_enabled is true', () => {
		render(SecurityOverview, {
			props: { securityOverview: { ...baseOverview, mfa_enabled: true } }
		});
		expect(screen.getByText('Enabled')).toBeTruthy();
	});

	it('shows MFA status as Disabled when mfa_enabled is false', () => {
		render(SecurityOverview, {
			props: {
				securityOverview: {
					...baseOverview,
					mfa_enabled: false,
					mfa_methods: []
				}
			}
		});
		expect(screen.getByText('Disabled')).toBeTruthy();
	});

	it('shows trusted devices count', () => {
		render(SecurityOverview, {
			props: { securityOverview: { ...baseOverview, trusted_devices_count: 3 } }
		});
		expect(screen.getByText('Trusted Devices')).toBeTruthy();
		expect(screen.getByText('3')).toBeTruthy();
	});

	it('shows active sessions count', () => {
		render(SecurityOverview, {
			props: { securityOverview: { ...baseOverview, active_sessions_count: 2 } }
		});
		expect(screen.getByText('Active Sessions')).toBeTruthy();
		expect(screen.getByText('2')).toBeTruthy();
	});

	it('shows last password change date', () => {
		render(SecurityOverview, {
			props: { securityOverview: baseOverview }
		});
		expect(screen.getByText('Last Password Change')).toBeTruthy();
		// The date is formatted relative (e.g. "X days ago"), just check it's not "Never"
		const container = screen.getByText('Last Password Change').closest('div.rounded-lg');
		expect(container?.textContent).not.toContain('Never');
	});

	it('shows "Never" when last_password_change is null', () => {
		render(SecurityOverview, {
			props: {
				securityOverview: { ...baseOverview, last_password_change: null }
			}
		});
		expect(screen.getByText('Never')).toBeTruthy();
	});

	it('shows security alerts count with badge when > 0', () => {
		render(SecurityOverview, {
			props: {
				securityOverview: {
					...baseOverview,
					recent_security_alerts_count: 5
				}
			}
		});
		expect(screen.getByText('Security Alerts')).toBeTruthy();
		expect(screen.getByText('5 alerts')).toBeTruthy();
	});

	it('shows "None" badge when security alerts count is 0', () => {
		render(SecurityOverview, {
			props: {
				securityOverview: {
					...baseOverview,
					recent_security_alerts_count: 0
				}
			}
		});
		expect(screen.getByText('None')).toBeTruthy();
	});

	it('shows skeleton state when securityOverview is null', () => {
		const { container } = render(SecurityOverview, {
			props: { securityOverview: null }
		});
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
		// Should NOT show any data labels
		expect(screen.queryByText('MFA Status')).toBeNull();
	});
});
