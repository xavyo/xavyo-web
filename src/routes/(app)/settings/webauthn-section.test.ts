import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import WebAuthnSection from './webauthn-section.svelte';

describe('WebAuthnSection', () => {
	afterEach(() => {
		cleanup();
		// Clean up PublicKeyCredential mock
		if ('PublicKeyCredential' in window) {
			delete (window as unknown as Record<string, unknown>).PublicKeyCredential;
		}
	});

	function mockWebAuthnSupport() {
		Object.defineProperty(window, 'PublicKeyCredential', {
			value: class {},
			configurable: true
		});
	}

	it('shows "Security keys" heading', () => {
		mockWebAuthnSupport();
		render(WebAuthnSection, {
			props: { credentials: [], onCredentialsChanged: vi.fn() }
		});
		expect(screen.getByText('Security keys')).toBeTruthy();
	});

	it('shows "Register security key" button when browser supports WebAuthn', () => {
		mockWebAuthnSupport();
		render(WebAuthnSection, {
			props: { credentials: [], onCredentialsChanged: vi.fn() }
		});
		expect(screen.getByText('Register security key')).toBeTruthy();
	});

	it('shows unsupported message when PublicKeyCredential is not available', () => {
		// Do not mock PublicKeyCredential so it stays undefined
		render(WebAuthnSection, {
			props: { credentials: [], onCredentialsChanged: vi.fn() }
		});
		expect(
			screen.getByText(/not supported by your browser/i)
		).toBeTruthy();
	});

	it('renders credentials list with credential names', () => {
		mockWebAuthnSupport();
		const credentials = [
			{ id: 'cred-1', name: 'YubiKey 5', created_at: '2024-01-15T00:00:00Z' },
			{ id: 'cred-2', name: 'Backup Key', created_at: '2024-06-01T00:00:00Z' }
		];
		render(WebAuthnSection, {
			props: { credentials, onCredentialsChanged: vi.fn() }
		});
		expect(screen.getByText('YubiKey 5')).toBeTruthy();
		expect(screen.getByText('Backup Key')).toBeTruthy();
	});

	it('shows empty state when no credentials and browser is supported', () => {
		mockWebAuthnSupport();
		render(WebAuthnSection, {
			props: { credentials: [], onCredentialsChanged: vi.fn() }
		});
		expect(screen.getByText('No security keys registered yet.')).toBeTruthy();
		expect(screen.getByText('Register your first security key')).toBeTruthy();
	});
});
