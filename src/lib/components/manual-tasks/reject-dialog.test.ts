import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';
import RejectDialog from './reject-dialog.svelte';

describe('RejectDialog', () => {
	afterEach(() => { cleanup(); });

	it('renders dialog title when open', () => {
		render(RejectDialog, { props: { open: true, onReject: vi.fn(), onCancel: vi.fn() } });
		expect(screen.getByRole('heading', { name: 'Reject Task' })).toBeTruthy();
	});

	it('renders reason textarea', () => {
		render(RejectDialog, { props: { open: true, onReject: vi.fn(), onCancel: vi.fn() } });
		const textarea = document.querySelector('textarea');
		expect(textarea).toBeTruthy();
	});

	it('renders reject and cancel buttons', () => {
		render(RejectDialog, { props: { open: true, onReject: vi.fn(), onCancel: vi.fn() } });
		expect(screen.getByRole('button', { name: 'Reject Task' })).toBeTruthy();
		expect(screen.getByText('Cancel')).toBeTruthy();
	});

	it('reject button is disabled initially', () => {
		render(RejectDialog, { props: { open: true, onReject: vi.fn(), onCancel: vi.fn() } });
		const rejectBtn = screen.getByRole('button', { name: 'Reject Task' });
		expect((rejectBtn as HTMLButtonElement).disabled).toBe(true);
	});

	it('shows character count', () => {
		render(RejectDialog, { props: { open: true, onReject: vi.fn(), onCancel: vi.fn() } });
		expect(screen.getByText('0/1000 characters')).toBeTruthy();
	});
});
