import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

// Mock $app/stores
vi.mock('$app/stores', () => {
	const { readable } = require('svelte/store');
	return {
		page: readable({
			status: 500,
			error: { message: 'Internal Server Error' },
			url: new URL('http://localhost/users')
		})
	};
});

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

import ErrorPage from './+error.svelte';

describe('App Error Page', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders error message', () => {
		render(ErrorPage);
		expect(screen.getByText('Something went wrong')).toBeTruthy();
		expect(screen.getByText('Internal Server Error')).toBeTruthy();
	});

	it('shows status code', () => {
		render(ErrorPage);
		expect(screen.getByText('Error 500')).toBeTruthy();
	});

	it('has retry button', () => {
		render(ErrorPage);
		expect(screen.getByText('Retry')).toBeTruthy();
	});

	it('has go to dashboard link', () => {
		render(ErrorPage);
		expect(screen.getByText('Go to Dashboard')).toBeTruthy();
	});
});
