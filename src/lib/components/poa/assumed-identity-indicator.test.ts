import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$lib/api/power-of-attorney-client', () => ({
	dropIdentityClient: vi.fn().mockResolvedValue({ message: 'Identity assumption dropped' })
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

import AssumedIdentityIndicator from './assumed-identity-indicator.svelte';

describe('AssumedIdentityIndicator', () => {
	it('renders indicator with donor name', () => {
		render(AssumedIdentityIndicator, {
			props: {
				donorName: 'John Doe',
				donorId: 'u1',
				poaId: 'poa-1'
			}
		});
		expect(screen.getByText('John Doe')).toBeTruthy();
		expect(screen.getByText(/Acting as/)).toBeTruthy();
	});

	it('renders indicator with donor ID when name is empty', () => {
		render(AssumedIdentityIndicator, {
			props: {
				donorName: '',
				donorId: 'u1',
				poaId: 'poa-1'
			}
		});
		expect(screen.getByText('u1')).toBeTruthy();
	});

	it('renders drop button', () => {
		render(AssumedIdentityIndicator, {
			props: {
				donorName: 'John Doe',
				donorId: 'u1',
				poaId: 'poa-1'
			}
		});
		expect(screen.getByText('Drop')).toBeTruthy();
	});

	it('has warning-colored styling', () => {
		render(AssumedIdentityIndicator, {
			props: {
				donorName: 'John Doe',
				donorId: 'u1',
				poaId: 'poa-1'
			}
		});
		expect(screen.getByTestId('assumed-identity-indicator')).toBeTruthy();
	});
});
