import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import SimulationResults from './simulation-results.svelte';
import type { SimulatePolicyResponse, SimulateAllPoliciesResponse } from '$lib/api/types';

describe('SimulationResults', () => {
	afterEach(cleanup);

	it('renders data-testid attribute', () => {
		render(SimulationResults, { props: {} });
		expect(screen.getByTestId('simulation-results')).toBeTruthy();
	});

	it('shows "Match" when singleResult matches', () => {
		const singleResult: SimulatePolicyResponse = {
			matches: true,
			condition_results: []
		};
		render(SimulationResults, { props: { singleResult } });
		expect(screen.getByText('Match')).toBeTruthy();
	});

	it('shows "No Match" when singleResult does not match', () => {
		const singleResult: SimulatePolicyResponse = {
			matches: false,
			condition_results: []
		};
		render(SimulationResults, { props: { singleResult } });
		expect(screen.getByText('No Match')).toBeTruthy();
	});

	it('renders condition results table with attributes', () => {
		const singleResult: SimulatePolicyResponse = {
			matches: true,
			condition_results: [
				{ attribute: 'department', operator: 'Equals', expected: 'Engineering', actual: 'Engineering', matched: true },
				{ attribute: 'location', operator: 'In', expected: ['US', 'UK'], actual: 'FR', matched: false }
			]
		};
		render(SimulationResults, { props: { singleResult } });
		expect(screen.getByText('department')).toBeTruthy();
		expect(screen.getByText('location')).toBeTruthy();
		expect(screen.getByText('Attribute')).toBeTruthy();
		expect(screen.getByText('Operator')).toBeTruthy();
	});

	it('renders matching policies count for allResult', () => {
		const allResult: SimulateAllPoliciesResponse = {
			attributes: { department: 'Engineering' },
			matching_policies: [
				{ policy_id: 'p-1', policy_name: 'Engineering Base', priority: 10, entitlements: ['e-1', 'e-2'] }
			],
			total_entitlements: ['e-1', 'e-2']
		};
		render(SimulationResults, { props: { allResult } });
		expect(screen.getByText('1 Matching Policy')).toBeTruthy();
		expect(screen.getByText('Engineering Base')).toBeTruthy();
		expect(screen.getByText(/2 entitlement/)).toBeTruthy();
	});

	it('shows no match message for allResult with empty policies', () => {
		const allResult: SimulateAllPoliciesResponse = {
			attributes: { department: 'Unknown' },
			matching_policies: [],
			total_entitlements: []
		};
		render(SimulationResults, { props: { allResult } });
		expect(screen.getByText('0 Matching Policies')).toBeTruthy();
		expect(screen.getByText('No policies matched the given attributes.')).toBeTruthy();
	});

	it('shows total unique entitlements count', () => {
		const allResult: SimulateAllPoliciesResponse = {
			attributes: {},
			matching_policies: [
				{ policy_id: 'p-1', policy_name: 'Policy A', priority: 10, entitlements: ['e-1'] },
				{ policy_id: 'p-2', policy_name: 'Policy B', priority: 20, entitlements: ['e-2', 'e-3'] }
			],
			total_entitlements: ['e-1', 'e-2', 'e-3']
		};
		render(SimulationResults, { props: { allResult } });
		expect(screen.getByText('Total unique entitlements: 3')).toBeTruthy();
	});
});
