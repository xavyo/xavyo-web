import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import ConfirmDialog from './confirm-dialog.svelte';

describe('ConfirmDialog', () => {
	afterEach(() => { cleanup(); });

	it('renders dialog title when open', () => {
		render(ConfirmDialog, { props: { open: true, onConfirm: vi.fn(), onCancel: vi.fn() } });
		expect(screen.getByText('Confirm Task Completion')).toBeTruthy();
	});

	it('renders notes textarea', () => {
		render(ConfirmDialog, { props: { open: true, onConfirm: vi.fn(), onCancel: vi.fn() } });
		const textarea = document.querySelector('textarea');
		expect(textarea).toBeTruthy();
	});

	it('renders confirm and cancel buttons', () => {
		render(ConfirmDialog, { props: { open: true, onConfirm: vi.fn(), onCancel: vi.fn() } });
		expect(screen.getByText('Confirm Completion')).toBeTruthy();
		expect(screen.getByText('Cancel')).toBeTruthy();
	});

	it('shows character count', () => {
		render(ConfirmDialog, { props: { open: true, onConfirm: vi.fn(), onCancel: vi.fn() } });
		expect(screen.getByText('0/2000 characters')).toBeTruthy();
	});
});
