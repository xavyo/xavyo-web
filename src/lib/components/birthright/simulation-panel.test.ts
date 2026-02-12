import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import SimulationPanel from './simulation-panel.svelte';
import type { SimulatePolicyResponse, SimulateAllPoliciesResponse } from '$lib/api/types';

vi.mock('$lib/api/birthright-client', () => ({
	simulatePolicyClient: vi.fn(),
	simulateAllPoliciesClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { simulatePolicyClient, simulateAllPoliciesClient } from '$lib/api/birthright-client';
import { addToast } from '$lib/stores/toast.svelte';

const mockSimulateSingle = simulatePolicyClient as ReturnType<typeof vi.fn>;
const mockSimulateAll = simulateAllPoliciesClient as ReturnType<typeof vi.fn>;
const mockAddToast = addToast as ReturnType<typeof vi.fn>;

describe('SimulationPanel', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('renders the "Simulate Policy" heading in single mode', () => {
		render(SimulationPanel, { props: { policyId: 'pol-1', mode: 'single' } });
		expect(screen.getByText('Simulate Policy')).toBeTruthy();
	});

	it('renders the "Simulate All Policies" heading in all mode', () => {
		render(SimulationPanel, { props: { mode: 'all' } });
		expect(screen.getByText('Simulate All Policies')).toBeTruthy();
	});

	it('renders the attributes textarea', () => {
		render(SimulationPanel, { props: { policyId: 'pol-1' } });
		expect(screen.getByLabelText('User Attributes (JSON)')).toBeTruthy();
	});

	it('renders the Simulate button', () => {
		render(SimulationPanel, { props: { policyId: 'pol-1' } });
		expect(screen.getByText('Simulate')).toBeTruthy();
	});

	it('shows error when Simulate clicked with empty JSON', async () => {
		render(SimulationPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Simulate'));
		expect(screen.getByText('Please enter JSON attributes')).toBeTruthy();
	});

	it('shows error for invalid JSON', async () => {
		render(SimulationPanel, { props: { policyId: 'pol-1' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: 'not json' } });
		await fireEvent.click(screen.getByText('Simulate'));
		expect(screen.getByText('Invalid JSON format')).toBeTruthy();
	});

	it('shows error for JSON array instead of object', async () => {
		render(SimulationPanel, { props: { policyId: 'pol-1' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '[1, 2]' } });
		await fireEvent.click(screen.getByText('Simulate'));
		expect(screen.getByText('Must be a valid JSON object')).toBeTruthy();
	});

	it('calls simulatePolicyClient in single mode with valid JSON', async () => {
		const mockResult: SimulatePolicyResponse = {
			matches: true,
			condition_results: [{ attribute: 'department', operator: 'equals', expected: 'Engineering', actual: 'Engineering', matched: true }]
		};
		mockSimulateSingle.mockResolvedValue(mockResult);

		render(SimulationPanel, { props: { policyId: 'pol-1', mode: 'single' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '{"department": "Engineering"}' } });
		await fireEvent.click(screen.getByText('Simulate'));

		await waitFor(() => {
			expect(mockSimulateSingle).toHaveBeenCalledWith('pol-1', {
				attributes: { department: 'Engineering' }
			});
		});
	});

	it('displays "Match" badge when single simulation matches', async () => {
		mockSimulateSingle.mockResolvedValue({
			matches: true,
			condition_results: [{ attribute: 'department', operator: 'equals', expected: 'Eng', actual: 'Eng', matched: true }]
		});

		render(SimulationPanel, { props: { policyId: 'pol-1', mode: 'single' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '{"x": 1}' } });
		await fireEvent.click(screen.getByText('Simulate'));

		await waitFor(() => {
			expect(screen.getByText('Match')).toBeTruthy();
			expect(screen.getByText('Condition Results')).toBeTruthy();
		});
	});

	it('displays "No Match" badge when single simulation does not match', async () => {
		mockSimulateSingle.mockResolvedValue({
			matches: false,
			condition_results: [{ attribute: 'department', operator: 'equals', expected: 'Eng', actual: 'Sales', matched: false }]
		});

		render(SimulationPanel, { props: { policyId: 'pol-1', mode: 'single' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '{"x": 1}' } });
		await fireEvent.click(screen.getByText('Simulate'));

		await waitFor(() => {
			expect(screen.getByText('No Match')).toBeTruthy();
		});
	});

	it('calls simulateAllPoliciesClient in all mode', async () => {
		const mockResult: SimulateAllPoliciesResponse = {
			attributes: { location: 'US' },
			matching_policies: [],
			total_entitlements: []
		};
		mockSimulateAll.mockResolvedValue(mockResult);

		render(SimulationPanel, { props: { mode: 'all' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '{"location": "US"}' } });
		await fireEvent.click(screen.getByText('Simulate'));

		await waitFor(() => {
			expect(mockSimulateAll).toHaveBeenCalledWith({
				attributes: { location: 'US' }
			});
		});
	});

	it('displays matching policies count in all mode', async () => {
		mockSimulateAll.mockResolvedValue({
			attributes: { x: 1 },
			matching_policies: [
				{ policy_id: 'p1', policy_name: 'Policy A', priority: 1, entitlements: ['e1'] },
				{ policy_id: 'p2', policy_name: 'Policy B', priority: 2, entitlements: ['e2', 'e3'] }
			],
			total_entitlements: ['e1', 'e2', 'e3']
		});

		render(SimulationPanel, { props: { mode: 'all' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '{"x": 1}' } });
		await fireEvent.click(screen.getByText('Simulate'));

		await waitFor(() => {
			expect(screen.getByText('2 matching policies')).toBeTruthy();
			expect(screen.getByText('Policy A')).toBeTruthy();
			expect(screen.getByText('Policy B')).toBeTruthy();
			expect(screen.getByText('Total unique entitlements: 3')).toBeTruthy();
		});
	});

	it('shows toast on API error', async () => {
		mockSimulateSingle.mockRejectedValue(new Error('Server error'));

		render(SimulationPanel, { props: { policyId: 'pol-1', mode: 'single' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '{"x": 1}' } });
		await fireEvent.click(screen.getByText('Simulate'));

		await waitFor(() => {
			expect(mockAddToast).toHaveBeenCalledWith('error', 'Server error');
		});
	});

	it('shows "No policies match" message when all mode returns no matches', async () => {
		mockSimulateAll.mockResolvedValue({
			attributes: { x: 1 },
			matching_policies: [],
			total_entitlements: []
		});

		render(SimulationPanel, { props: { mode: 'all' } });
		const textarea = screen.getByLabelText('User Attributes (JSON)');
		await fireEvent.input(textarea, { target: { value: '{"x": 1}' } });
		await fireEvent.click(screen.getByText('Simulate'));

		await waitFor(() => {
			expect(screen.getByText('No policies match the given attributes.')).toBeTruthy();
		});
	});
});
