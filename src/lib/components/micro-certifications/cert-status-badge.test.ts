import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CertStatusBadge from './cert-status-badge.svelte';

describe('CertStatusBadge', () => {
	it('renders pending status', () => {
		render(CertStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByTestId('cert-status-badge').textContent).toContain('Pending');
	});

	it('renders approved status with green', () => {
		render(CertStatusBadge, { props: { status: 'approved' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.textContent).toContain('Approved');
		expect(badge.className).toContain('green');
	});

	it('renders revoked status with red', () => {
		render(CertStatusBadge, { props: { status: 'revoked' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.textContent).toContain('Revoked');
		expect(badge.className).toContain('red');
	});

	it('renders auto_revoked status with red', () => {
		render(CertStatusBadge, { props: { status: 'auto_revoked' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.textContent).toContain('Auto-Revoked');
		expect(badge.className).toContain('red');
	});

	it('renders flagged_for_review status with yellow', () => {
		render(CertStatusBadge, { props: { status: 'flagged_for_review' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.textContent).toContain('Flagged');
		expect(badge.className).toContain('yellow');
	});

	it('renders skipped status with gray', () => {
		render(CertStatusBadge, { props: { status: 'skipped' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.textContent).toContain('Skipped');
		expect(badge.className).toContain('gray');
	});

	it('renders expired status with orange', () => {
		render(CertStatusBadge, { props: { status: 'expired' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.textContent).toContain('Expired');
		expect(badge.className).toContain('orange');
	});

	it('renders small size', () => {
		render(CertStatusBadge, { props: { status: 'pending', size: 'sm' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.className).toContain('text-xs');
	});

	it('renders medium size by default', () => {
		render(CertStatusBadge, { props: { status: 'pending' } });
		const badge = screen.getByTestId('cert-status-badge');
		expect(badge.className).toContain('text-sm');
	});
});
