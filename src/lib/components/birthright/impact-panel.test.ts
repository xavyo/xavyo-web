import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/svelte';
import ImpactPanel from './impact-panel.svelte';

vi.mock('$lib/api/birthright-client', () => ({
	analyzeImpactClient: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { analyzeImpactClient } from '$lib/api/birthright-client';
import { addToast } from '$lib/stores/toast.svelte';

const mockAnalyzeImpact = analyzeImpactClient as ReturnType<typeof vi.fn>;
const mockAddToast = addToast as ReturnType<typeof vi.fn>;

function makeImpactResult(overrides: Record<string, unknown> = {}) {
	return {
		policy_id: 'pol-1',
		policy_name: 'Test Policy',
		summary: {
			total_users_affected: 0,
			users_gaining_access: 0,
			users_losing_access: 0,
			users_unchanged: 0,
			total_entitlements_granted: 0
		},
		by_department: [],
		by_location: [],
		entitlement_impacts: [],
		affected_users: [],
		is_truncated: false,
		...overrides
	};
}

describe('ImpactPanel', () => {
	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('renders the "Impact Analysis" heading', () => {
		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		expect(screen.getByText('Impact Analysis')).toBeTruthy();
	});

	it('renders the "Analyze Impact" button', () => {
		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		expect(screen.getByText('Analyze Impact')).toBeTruthy();
	});

	it('calls analyzeImpactClient when button is clicked', async () => {
		mockAnalyzeImpact.mockResolvedValue(makeImpactResult());

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(mockAnalyzeImpact).toHaveBeenCalledWith('pol-1');
		});
	});

	it('shows "No users would be affected" when total_users_affected is 0', async () => {
		mockAnalyzeImpact.mockResolvedValue(makeImpactResult());

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(screen.getByText('No users would be affected by this policy.')).toBeTruthy();
		});
	});

	it('displays summary cards with total affected, gaining, and losing counts', async () => {
		mockAnalyzeImpact.mockResolvedValue(makeImpactResult({
			summary: {
				total_users_affected: 150,
				users_gaining_access: 100,
				users_losing_access: 50,
				users_unchanged: 0,
				total_entitlements_granted: 200
			}
		}));

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(screen.getByText('150')).toBeTruthy();
			expect(screen.getByText('Total Affected')).toBeTruthy();
			expect(screen.getByText('100')).toBeTruthy();
			expect(screen.getByText('Gaining Access')).toBeTruthy();
			expect(screen.getByText('50')).toBeTruthy();
			expect(screen.getByText('Losing Access')).toBeTruthy();
		});
	});

	it('renders department breakdown table', async () => {
		mockAnalyzeImpact.mockResolvedValue(makeImpactResult({
			summary: { total_users_affected: 30, users_gaining_access: 20, users_losing_access: 10, users_unchanged: 0, total_entitlements_granted: 30 },
			by_department: [
				{ department: 'Engineering', user_count: 20, percentage: 66.7 },
				{ department: 'Sales', user_count: 10, percentage: 33.3 }
			]
		}));

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(screen.getByText('By Department')).toBeTruthy();
			expect(screen.getByText('Engineering')).toBeTruthy();
			expect(screen.getByText('Sales')).toBeTruthy();
		});
	});

	it('renders location breakdown table', async () => {
		mockAnalyzeImpact.mockResolvedValue(makeImpactResult({
			summary: { total_users_affected: 25, users_gaining_access: 15, users_losing_access: 10, users_unchanged: 0, total_entitlements_granted: 25 },
			by_location: [
				{ location: 'US', user_count: 15, percentage: 60.0 },
				{ location: 'UK', user_count: 10, percentage: 40.0 }
			]
		}));

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(screen.getByText('By Location')).toBeTruthy();
			expect(screen.getByText('US')).toBeTruthy();
			expect(screen.getByText('UK')).toBeTruthy();
		});
	});

	it('shows toast on API error', async () => {
		mockAnalyzeImpact.mockRejectedValue(new Error('Analysis failed'));

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(mockAddToast).toHaveBeenCalledWith('error', 'Analysis failed');
		});
	});

	it('does not show department table when by_department is empty', async () => {
		mockAnalyzeImpact.mockResolvedValue(makeImpactResult({
			summary: { total_users_affected: 5, users_gaining_access: 5, users_losing_access: 0, users_unchanged: 0, total_entitlements_granted: 5 },
			by_location: [{ location: 'US', user_count: 5, percentage: 100.0 }]
		}));

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(screen.queryByText('By Department')).toBeNull();
			expect(screen.getByText('By Location')).toBeTruthy();
		});
	});

	it('does not show location table when by_location is empty', async () => {
		mockAnalyzeImpact.mockResolvedValue(makeImpactResult({
			summary: { total_users_affected: 5, users_gaining_access: 5, users_losing_access: 0, users_unchanged: 0, total_entitlements_granted: 5 },
			by_department: [{ department: 'HR', user_count: 5, percentage: 100.0 }]
		}));

		render(ImpactPanel, { props: { policyId: 'pol-1' } });
		await fireEvent.click(screen.getByText('Analyze Impact'));

		await waitFor(() => {
			expect(screen.getByText('By Department')).toBeTruthy();
			expect(screen.queryByText('By Location')).toBeNull();
		});
	});
});
