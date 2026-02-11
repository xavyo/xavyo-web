import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import EmailChangeDialog from './email-change-dialog.svelte';

describe('EmailChangeDialog', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders initiate phase with email and password fields when open', () => {
		render(EmailChangeDialog, {
			props: {
				open: true,
				onOpenChange: vi.fn(),
				onEmailChanged: vi.fn()
			}
		});
		expect(screen.getByLabelText('New email address')).toBeTruthy();
		expect(screen.getByLabelText('Current password')).toBeTruthy();
	});

	it('shows "Send verification" button', () => {
		render(EmailChangeDialog, {
			props: {
				open: true,
				onOpenChange: vi.fn(),
				onEmailChanged: vi.fn()
			}
		});
		expect(screen.getByText('Send verification')).toBeTruthy();
	});

	it('shows "Change email address" title', () => {
		render(EmailChangeDialog, {
			props: {
				open: true,
				onOpenChange: vi.fn(),
				onEmailChanged: vi.fn()
			}
		});
		expect(screen.getByText('Change email address')).toBeTruthy();
	});
});
