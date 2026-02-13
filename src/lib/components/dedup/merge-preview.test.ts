import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MergePreview from './merge-preview.svelte';
import type { IdentitySummary } from '$lib/api/types';

const identity: IdentitySummary = {
	id: 'user-1',
	email: 'john@example.com',
	display_name: 'John Doe',
	department: 'Engineering',
	attributes: { title: 'Senior Engineer' }
};

describe('MergePreview', () => {
	it('renders identity fields', () => {
		render(MergePreview, { props: { identity, title: 'Source Identity' } });
		expect(screen.getByText('john@example.com')).toBeTruthy();
		expect(screen.getByText('John Doe')).toBeTruthy();
		expect(screen.getByText('Engineering')).toBeTruthy();
	});

	it('shows title', () => {
		render(MergePreview, { props: { identity, title: 'Source Identity' } });
		expect(screen.getByText('Source Identity')).toBeTruthy();
	});

	it('handles null values with dash', () => {
		const nullIdentity: IdentitySummary = {
			id: 'user-2',
			email: null,
			display_name: null,
			department: null,
			attributes: {}
		};
		render(MergePreview, { props: { identity: nullIdentity, title: 'Test' } });
		const dashes = screen.getAllByText('—');
		expect(dashes.length).toBe(3);
	});

	it('renders custom attributes', () => {
		render(MergePreview, { props: { identity, title: 'Test' } });
		expect(screen.getByText('title')).toBeTruthy();
		expect(screen.getByText('Senior Engineer')).toBeTruthy();
	});
});
