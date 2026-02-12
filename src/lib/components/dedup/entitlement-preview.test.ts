import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import EntitlementPreview from './entitlement-preview.svelte';
import type { EntitlementsPreview } from '$lib/api/types';

const preview: EntitlementsPreview = {
	source_only: [{ id: 'e1', name: 'Admin Access', application: 'App A' }],
	target_only: [{ id: 'e2', name: 'Read Only', application: 'App B' }],
	common: [{ id: 'e3', name: 'Basic Access', application: 'App A' }],
	merged: [
		{ id: 'e1', name: 'Admin Access', application: 'App A' },
		{ id: 'e2', name: 'Read Only', application: 'App B' },
		{ id: 'e3', name: 'Basic Access', application: 'App A' }
	]
};

describe('EntitlementPreview', () => {
	it('renders all 4 categories', () => {
		render(EntitlementPreview, { props: { preview, strategy: 'union' } });
		expect(screen.getByText(/Source Only/)).toBeTruthy();
		expect(screen.getByText(/Target Only/)).toBeTruthy();
		expect(screen.getByText(/Common/)).toBeTruthy();
		expect(screen.getByText(/Merged Result/)).toBeTruthy();
	});

	it('shows application names', () => {
		render(EntitlementPreview, { props: { preview, strategy: 'union' } });
		expect(screen.getAllByText('App A').length).toBeGreaterThan(0);
		expect(screen.getAllByText('App B').length).toBeGreaterThan(0);
	});

	it('shows strategy', () => {
		render(EntitlementPreview, { props: { preview, strategy: 'union' } });
		expect(screen.getByText('union')).toBeTruthy();
	});

	it('handles empty arrays', () => {
		const emptyPreview: EntitlementsPreview = {
			source_only: [],
			target_only: [],
			common: [],
			merged: []
		};
		render(EntitlementPreview, { props: { preview: emptyPreview, strategy: 'intersection' } });
		expect(screen.getAllByText('None').length).toBe(4);
	});
});
