import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CertDecisionDialog from './cert-decision-dialog.svelte';

describe('CertDecisionDialog', () => {
	const defaultProps = {
		open: true,
		certificationId: '00000000-0000-0000-0000-000000000001',
		onDecide: vi.fn().mockResolvedValue(undefined)
	};

	it('renders the dialog when open', () => {
		render(CertDecisionDialog, { props: defaultProps });
		expect(screen.getByText('Certification Decision')).toBeTruthy();
	});

	it('shows approve, revoke, and reduce radio options', () => {
		render(CertDecisionDialog, { props: defaultProps });
		const radios = screen.getAllByRole('radio');
		expect(radios).toHaveLength(3);
		expect(screen.getAllByText('Approve').length).toBeGreaterThanOrEqual(1);
		expect(screen.getByText('Revoke')).toBeTruthy();
		expect(screen.getByText('Flag for Review')).toBeTruthy();
	});

	it('shows certification ID in description', () => {
		render(CertDecisionDialog, { props: defaultProps });
		expect(screen.getByText(/00000000/)).toBeTruthy();
	});

	it('shows comment field', () => {
		render(CertDecisionDialog, { props: defaultProps });
		expect(screen.getByPlaceholderText('Enter your comment...')).toBeTruthy();
	});

	it('shows submit button', () => {
		render(CertDecisionDialog, { props: defaultProps });
		expect(screen.getByRole('button', { name: 'Approve' })).toBeTruthy();
	});

	it('shows cancel button', () => {
		render(CertDecisionDialog, { props: defaultProps });
		expect(screen.getByText('Cancel')).toBeTruthy();
	});
});
