import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import RecoveryCodesDialog from './recovery-codes-dialog.svelte';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.runAllTimers();
	cleanup();
	vi.useRealTimers();
});

const mockCodes = [
	'ABCD-1234-EFGH',
	'IJKL-5678-MNOP',
	'QRST-9012-UVWX',
	'YZAB-3456-CDEF',
	'GHIJ-7890-KLMN',
	'OPQR-1234-STUV',
	'WXYZ-5678-ABCD',
	'EFGH-9012-IJKL'
];

describe('RecoveryCodesDialog', () => {
	it('renders recovery codes when open', () => {
		render(RecoveryCodesDialog, {
			props: { open: true, recoveryCodes: mockCodes, onClose: vi.fn() }
		});
		expect(screen.getByText('Recovery codes')).toBeTruthy();
		// Check that at least one code is rendered
		expect(screen.getByText('ABCD-1234-EFGH')).toBeTruthy();
		expect(screen.getByText('WXYZ-5678-ABCD')).toBeTruthy();
	});

	it('shows "Copy all" button', () => {
		render(RecoveryCodesDialog, {
			props: { open: true, recoveryCodes: mockCodes, onClose: vi.fn() }
		});
		expect(screen.getByText('Copy all')).toBeTruthy();
	});

	it('shows "Download" button', () => {
		render(RecoveryCodesDialog, {
			props: { open: true, recoveryCodes: mockCodes, onClose: vi.fn() }
		});
		expect(screen.getByText('Download')).toBeTruthy();
	});

	it('shows acknowledgment checkbox', () => {
		render(RecoveryCodesDialog, {
			props: { open: true, recoveryCodes: mockCodes, onClose: vi.fn() }
		});
		expect(screen.getByText('I have saved my recovery codes')).toBeTruthy();
		const checkbox = screen.getByRole('checkbox');
		expect(checkbox).toBeTruthy();
		expect((checkbox as HTMLInputElement).checked).toBe(false);
	});

	it('"Done" button disabled until acknowledged', () => {
		render(RecoveryCodesDialog, {
			props: { open: true, recoveryCodes: mockCodes, onClose: vi.fn() }
		});
		const doneButton = screen.getByText('Done');
		expect(doneButton).toBeTruthy();
		// The button should be disabled since checkbox is not checked
		expect((doneButton as HTMLButtonElement).disabled).toBe(true);
	});
});
