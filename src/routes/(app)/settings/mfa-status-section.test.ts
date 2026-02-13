import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import type { MfaStatus } from '$lib/api/types';

// Mock fetch (used by child components like TotpSetupWizard)
vi.stubGlobal('fetch', vi.fn());

// Mock the toast store
vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import MfaStatusSection from './mfa-status-section.svelte';

afterEach(() => cleanup());

const mockMfaStatus: MfaStatus = {
	totp_enabled: true,
	webauthn_enabled: false,
	recovery_codes_remaining: 8,
	available_methods: [],
	setup_at: '2024-01-01T00:00:00Z',
	last_used_at: '2024-06-01T00:00:00Z'
};

describe('MfaStatusSection - MFA disabled', () => {
	it('shows "Two-factor authentication" heading when mfaStatus is null', () => {
		render(MfaStatusSection, {
			props: { mfaStatus: null, onMfaUpdated: vi.fn() }
		});
		expect(screen.getByText('Two-factor authentication')).toBeTruthy();
	});

	it('shows "Set up MFA" button when MFA disabled', () => {
		render(MfaStatusSection, {
			props: { mfaStatus: null, onMfaUpdated: vi.fn() }
		});
		expect(screen.getByText('Set up MFA')).toBeTruthy();
	});

	it('shows "not enabled" message', () => {
		render(MfaStatusSection, {
			props: { mfaStatus: null, onMfaUpdated: vi.fn() }
		});
		expect(
			screen.getByText(
				'Two-factor authentication is not enabled. We recommend enabling it to protect your account.'
			)
		).toBeTruthy();
	});

	it('shows "Set up MFA" button when mfaStatus has totp_enabled=false', () => {
		render(MfaStatusSection, {
			props: {
				mfaStatus: { ...mockMfaStatus, totp_enabled: false },
				onMfaUpdated: vi.fn()
			}
		});
		expect(screen.getByText('Set up MFA')).toBeTruthy();
	});
});

describe('MfaStatusSection - MFA enabled', () => {
	it('shows "TOTP enabled" badge', () => {
		render(MfaStatusSection, {
			props: { mfaStatus: mockMfaStatus, onMfaUpdated: vi.fn() }
		});
		expect(screen.getByText('TOTP enabled')).toBeTruthy();
	});

	it('shows "Disable MFA" button', () => {
		render(MfaStatusSection, {
			props: { mfaStatus: mockMfaStatus, onMfaUpdated: vi.fn() }
		});
		expect(screen.getByText('Disable MFA')).toBeTruthy();
	});

	it('shows "Regenerate recovery codes" button', () => {
		render(MfaStatusSection, {
			props: { mfaStatus: mockMfaStatus, onMfaUpdated: vi.fn() }
		});
		expect(screen.getByText('Regenerate recovery codes')).toBeTruthy();
	});

	it('shows recovery codes remaining count', () => {
		render(MfaStatusSection, {
			props: { mfaStatus: mockMfaStatus, onMfaUpdated: vi.fn() }
		});
		expect(screen.getByText('Recovery codes remaining')).toBeTruthy();
		expect(screen.getByText('8')).toBeTruthy();
	});
});
