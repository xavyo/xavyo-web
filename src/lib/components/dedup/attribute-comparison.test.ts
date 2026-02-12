import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AttributeComparison from './attribute-comparison.svelte';
import type { AttributeComparison as AttrComp, IdentitySummary } from '$lib/api/types';

const identityA: IdentitySummary = {
	id: 'a1',
	email: 'john@example.com',
	display_name: 'John Doe',
	department: 'Engineering',
	attributes: {}
};

const identityB: IdentitySummary = {
	id: 'b1',
	email: 'j.doe@example.com',
	display_name: 'J. Doe',
	department: 'Engineering',
	attributes: {}
};

const comparisons: AttrComp[] = [
	{ attribute: 'email', value_a: 'john@example.com', value_b: 'j.doe@example.com', is_different: true },
	{ attribute: 'department', value_a: 'Engineering', value_b: 'Engineering', is_different: false }
];

describe('AttributeComparison', () => {
	it('renders all attributes', () => {
		render(AttributeComparison, { props: { comparisons, identityA, identityB } });
		expect(screen.getByText('email')).toBeTruthy();
		expect(screen.getByText('department')).toBeTruthy();
	});

	it('shows identity headers', () => {
		render(AttributeComparison, { props: { comparisons, identityA, identityB } });
		expect(screen.getByText('John Doe')).toBeTruthy();
		expect(screen.getByText('J. Doe')).toBeTruthy();
	});

	it('highlights differing values', () => {
		render(AttributeComparison, { props: { comparisons, identityA, identityB } });
		expect(screen.getByText('Different')).toBeTruthy();
		// "Match" appears in both the header column and the data row
		expect(screen.getAllByText('Match').length).toBeGreaterThanOrEqual(1);
	});

	it('handles null values with dash', () => {
		const nullComps: AttrComp[] = [
			{ attribute: 'phone', value_a: null, value_b: '555-1234', is_different: true }
		];
		render(AttributeComparison, { props: { comparisons: nullComps, identityA, identityB } });
		expect(screen.getByText('—')).toBeTruthy();
	});
});
