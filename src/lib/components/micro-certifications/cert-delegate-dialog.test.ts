import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import CertDelegateDialog from './cert-delegate-dialog.svelte';

describe('CertDelegateDialog', () => {
	const defaultProps = {
		open: true,
		certificationId: '00000000-0000-0000-0000-000000000001',
		onDelegate: vi.fn().mockResolvedValue(undefined)
	};

	it('renders the dialog when open', () => {
		render(CertDelegateDialog, { props: defaultProps });
		expect(screen.getByText('Delegate Certification')).toBeTruthy();
	});

	it('shows delegate to input field', () => {
		render(CertDelegateDialog, { props: defaultProps });
		expect(screen.getByPlaceholderText('Enter reviewer UUID')).toBeTruthy();
	});

	it('shows comment field', () => {
		render(CertDelegateDialog, { props: defaultProps });
		expect(screen.getByPlaceholderText('Reason for delegation...')).toBeTruthy();
	});

	it('shows delegate button', () => {
		render(CertDelegateDialog, { props: defaultProps });
		expect(screen.getByText('Delegate')).toBeTruthy();
	});

	it('shows cancel button', () => {
		render(CertDelegateDialog, { props: defaultProps });
		expect(screen.getByText('Cancel')).toBeTruthy();
	});

	it('shows certification ID in description', () => {
		render(CertDelegateDialog, { props: defaultProps });
		expect(screen.getByText(/00000000/)).toBeTruthy();
	});
});
