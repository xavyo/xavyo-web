import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AccessRequestStatusBadge from './access-request-status-badge.svelte';
import CancelButton from './cancel-button.svelte';

// --- AccessRequestStatusBadge ---

describe('AccessRequestStatusBadge', () => {
	it('renders "Pending" for pending status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'pending' } });
		expect(screen.getByText('Pending')).toBeTruthy();
	});

	it('renders "Pending Approval" for pending_approval status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'pending_approval' } });
		expect(screen.getByText('Pending Approval')).toBeTruthy();
	});

	it('renders "Approved" for approved status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'approved' } });
		expect(screen.getByText('Approved')).toBeTruthy();
	});

	it('renders "Provisioned" for provisioned status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'provisioned' } });
		expect(screen.getByText('Provisioned')).toBeTruthy();
	});

	it('renders "Rejected" for rejected status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'rejected' } });
		expect(screen.getByText('Rejected')).toBeTruthy();
	});

	it('renders "Cancelled" for cancelled status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'cancelled' } });
		expect(screen.getByText('Cancelled')).toBeTruthy();
	});

	it('renders "Expired" for expired status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'expired' } });
		expect(screen.getByText('Expired')).toBeTruthy();
	});

	it('renders "Failed" for failed status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'failed' } });
		expect(screen.getByText('Failed')).toBeTruthy();
	});

	it('falls back to raw status for unknown values', () => {
		render(AccessRequestStatusBadge, { props: { status: 'custom_status' } });
		expect(screen.getByText('custom_status')).toBeTruthy();
	});

	it('applies yellow styling for pending', () => {
		render(AccessRequestStatusBadge, { props: { status: 'pending' } });
		const el = screen.getByText('Pending');
		expect(el.className).toContain('bg-yellow-100');
	});

	it('applies green styling for approved', () => {
		render(AccessRequestStatusBadge, { props: { status: 'approved' } });
		const el = screen.getByText('Approved');
		expect(el.className).toContain('bg-green-100');
	});

	it('applies red styling for rejected', () => {
		render(AccessRequestStatusBadge, { props: { status: 'rejected' } });
		const el = screen.getByText('Rejected');
		expect(el.className).toContain('bg-red-100');
	});

	it('applies fallback styling for unknown status', () => {
		render(AccessRequestStatusBadge, { props: { status: 'unknown' } });
		const el = screen.getByText('unknown');
		expect(el.className).toContain('bg-gray-100');
	});
});

// --- CancelButton ---

describe('CancelButton', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('renders Cancel text', () => {
		render(CancelButton, { props: { requestId: 'req-1', onCancel: vi.fn() } });
		expect(screen.getByText('Cancel')).toBeTruthy();
	});

	it('renders as a button element', () => {
		render(CancelButton, { props: { requestId: 'req-1', onCancel: vi.fn() } });
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
	});

	it('calls fetch with correct URL on click', async () => {
		const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
		vi.stubGlobal('fetch', mockFetch);

		const onCancel = vi.fn();
		render(CancelButton, { props: { requestId: 'req-42', onCancel } });

		await fireEvent.click(screen.getByRole('button'));

		expect(mockFetch).toHaveBeenCalledWith('/api/governance/access-requests/req-42/cancel', {
			method: 'POST'
		});
	});

	it('calls onCancel after successful cancellation', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) })
		);

		const onCancel = vi.fn();
		render(CancelButton, { props: { requestId: 'req-1', onCancel } });

		await fireEvent.click(screen.getByRole('button'));
		// Wait for async completion
		await vi.waitFor(() => {
			expect(onCancel).toHaveBeenCalled();
		});
	});

	it('does not call onCancel on failed cancellation', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({ ok: false, status: 400, json: () => Promise.resolve({}) })
		);

		const onCancel = vi.fn();
		render(CancelButton, { props: { requestId: 'req-1', onCancel } });

		await fireEvent.click(screen.getByRole('button'));
		// Wait a tick and verify onCancel was NOT called
		await new Promise((r) => setTimeout(r, 50));
		expect(onCancel).not.toHaveBeenCalled();
	});
});
