import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

// Mock fetch — the component calls /api/mfa/totp/setup on mount
vi.stubGlobal(
	'fetch',
	vi.fn().mockResolvedValue({
		ok: false,
		status: 500,
		json: () => Promise.resolve({ message: 'Server error' })
	})
);

// Mock the toast store
vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import TotpSetupWizard from './totp-setup-wizard.svelte';

afterEach(() => cleanup());

describe('TotpSetupWizard', () => {
	it('renders with loading state initially (shows spinner before API resolves)', () => {
		// Use a never-resolving fetch to keep it in loading state
		vi.mocked(global.fetch).mockReturnValueOnce(new Promise(() => {}));
		const { container } = render(TotpSetupWizard, {
			props: { onComplete: vi.fn(), onCancel: vi.fn() }
		});
		// Loading spinner has animate-spin class
		const spinner = container.querySelector('.animate-spin');
		expect(spinner).toBeTruthy();
		// The heading should still be visible
		expect(screen.getByText('Set up authenticator app')).toBeTruthy();
	});

	it('has onComplete and onCancel callbacks as props', () => {
		const onComplete = vi.fn();
		const onCancel = vi.fn();
		// This should render without error, accepting the callbacks
		vi.mocked(global.fetch).mockReturnValueOnce(new Promise(() => {}));
		render(TotpSetupWizard, {
			props: { onComplete, onCancel }
		});
		expect(screen.getByText('Set up authenticator app')).toBeTruthy();
	});
});
