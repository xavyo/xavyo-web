import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

// Mock $app/stores
vi.mock('$app/stores', () => {
	const { readable } = require('svelte/store');
	return {
		page: readable({
			status: 404,
			error: { message: 'Not Found' },
			url: new URL('http://localhost/unknown')
		})
	};
});

// Mock $app/navigation
vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(() => Promise.resolve())
}));

import ErrorPage from './+error.svelte';

describe('Root Error Page', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders error message', () => {
		render(ErrorPage);
		expect(screen.getByText('Something went wrong')).toBeTruthy();
		expect(screen.getByText('Not Found')).toBeTruthy();
	});

	it('shows status code', () => {
		render(ErrorPage);
		expect(screen.getByText('Error 404')).toBeTruthy();
	});

	it('has retry button', () => {
		render(ErrorPage);
		const retryBtn = screen.getByText('Retry');
		expect(retryBtn).toBeTruthy();
		expect(retryBtn.tagName).toBe('BUTTON');
	});

	it('has go to login link', () => {
		render(ErrorPage);
		const link = screen.getByText('Go to Login');
		expect(link).toBeTruthy();
		expect(link.getAttribute('href')).toBe('/login');
	});
});
