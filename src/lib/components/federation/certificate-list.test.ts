import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import CertificateList from './certificate-list.svelte';
import type { IdPCertificate } from '$lib/api/types';

// Mock the activateCertificate client function
vi.mock('$lib/api/federation-client', () => ({
	activateCertificate: vi.fn().mockResolvedValue(undefined)
}));

function makeCert(overrides: Partial<IdPCertificate> = {}): IdPCertificate {
	return {
		id: 'cert-1',
		key_id: 'key-abc-123',
		subject_dn: 'CN=test.example.com',
		issuer_dn: 'CN=Test CA',
		not_before: '2024-01-01T00:00:00Z',
		not_after: '2025-12-31T23:59:59Z',
		is_active: false,
		created_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

describe('CertificateList', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('renders certificate list with key_id and validity info', () => {
		const certs = [
			makeCert({ key_id: 'signing-key-1', subject_dn: 'CN=idp.example.com' })
		];
		render(CertificateList, { props: { certificates: certs } });
		expect(screen.getByText('signing-key-1')).toBeTruthy();
		expect(screen.getByText('Subject: CN=idp.example.com')).toBeTruthy();
	});

	it('shows "Active" badge for active certificate', () => {
		const certs = [makeCert({ is_active: true, key_id: 'active-key' })];
		render(CertificateList, { props: { certificates: certs } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('shows "Activate" button for inactive certificates', () => {
		const certs = [makeCert({ is_active: false })];
		render(CertificateList, { props: { certificates: certs } });
		expect(screen.getByText('Activate')).toBeTruthy();
	});

	it('does not show Activate button for active certificate', () => {
		const certs = [makeCert({ is_active: true })];
		render(CertificateList, { props: { certificates: certs } });
		expect(screen.queryByText('Activate')).toBeNull();
	});

	it('renders empty state when no certificates', () => {
		render(CertificateList, { props: { certificates: [] } });
		expect(screen.getByText('No certificates')).toBeTruthy();
		expect(
			screen.getByText(
				'Upload an IdP signing certificate to enable SAML assertion signing'
			)
		).toBeTruthy();
	});

	it('calls onActivate callback when activate button clicked', async () => {
		const { activateCertificate } = await import('$lib/api/federation-client');
		const onActivate = vi.fn();
		const certs = [makeCert({ id: 'cert-99', is_active: false, key_id: 'key-99' })];
		render(CertificateList, { props: { certificates: certs, onActivate } });

		const activateBtn = screen.getByText('Activate');
		await fireEvent.click(activateBtn);

		// Wait for the async handler
		await vi.waitFor(() => {
			expect(activateCertificate).toHaveBeenCalledWith('cert-99');
		});
		await vi.waitFor(() => {
			expect(onActivate).toHaveBeenCalledOnce();
		});
	});

	it('shows Inactive badge for inactive certificate', () => {
		const certs = [makeCert({ is_active: false })];
		render(CertificateList, { props: { certificates: certs } });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('shows issuer_dn when present', () => {
		const certs = [makeCert({ issuer_dn: 'CN=Root CA' })];
		render(CertificateList, { props: { certificates: certs } });
		expect(screen.getByText('Issuer: CN=Root CA')).toBeTruthy();
	});

	it('renders multiple certificates', () => {
		const certs = [
			makeCert({ id: 'c1', key_id: 'key-alpha', is_active: true }),
			makeCert({ id: 'c2', key_id: 'key-beta', is_active: false })
		];
		render(CertificateList, { props: { certificates: certs } });
		expect(screen.getByText('key-alpha')).toBeTruthy();
		expect(screen.getByText('key-beta')).toBeTruthy();
	});
});
