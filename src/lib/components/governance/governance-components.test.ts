import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RiskLevelBadge from '../../../routes/(app)/governance/risk-level-badge.svelte';
import ClassificationBadge from '../../../routes/(app)/governance/classification-badge.svelte';
import StatusBadge from '../../../routes/(app)/governance/status-badge.svelte';
import EntitlementNameLink from '../../../routes/(app)/governance/entitlement-name-link.svelte';
import SodViolationList from './sod-violation-list.svelte';
import type { SodViolationResponse } from '$lib/api/types';

// --- RiskLevelBadge ---

describe('RiskLevelBadge', () => {
	it('renders "Low" for low risk level', () => {
		render(RiskLevelBadge, { props: { level: 'low' } });
		expect(screen.getByText('Low')).toBeTruthy();
	});

	it('renders "Medium" for medium risk level', () => {
		render(RiskLevelBadge, { props: { level: 'medium' } });
		expect(screen.getByText('Medium')).toBeTruthy();
	});

	it('renders "High" for high risk level', () => {
		render(RiskLevelBadge, { props: { level: 'high' } });
		expect(screen.getByText('High')).toBeTruthy();
	});

	it('renders "Critical" for critical risk level', () => {
		render(RiskLevelBadge, { props: { level: 'critical' } });
		expect(screen.getByText('Critical')).toBeTruthy();
	});

	it('applies green styling for low', () => {
		render(RiskLevelBadge, { props: { level: 'low' } });
		const el = screen.getByText('Low');
		expect(el.className).toContain('bg-green-100');
	});

	it('applies red styling for critical', () => {
		render(RiskLevelBadge, { props: { level: 'critical' } });
		const el = screen.getByText('Critical');
		expect(el.className).toContain('bg-red-100');
	});
});

// --- ClassificationBadge ---

describe('ClassificationBadge', () => {
	it('renders "None" for none classification', () => {
		render(ClassificationBadge, { props: { classification: 'none' } });
		expect(screen.getByText('None')).toBeTruthy();
	});

	it('renders "Personal" for personal classification', () => {
		render(ClassificationBadge, { props: { classification: 'personal' } });
		expect(screen.getByText('Personal')).toBeTruthy();
	});

	it('renders "Sensitive" for sensitive classification', () => {
		render(ClassificationBadge, { props: { classification: 'sensitive' } });
		expect(screen.getByText('Sensitive')).toBeTruthy();
	});

	it('renders "Special Category" for special_category classification', () => {
		render(ClassificationBadge, { props: { classification: 'special_category' } });
		expect(screen.getByText('Special Category')).toBeTruthy();
	});

	it('applies gray styling for none', () => {
		render(ClassificationBadge, { props: { classification: 'none' } });
		const el = screen.getByText('None');
		expect(el.className).toContain('bg-gray-100');
	});

	it('applies red styling for special_category', () => {
		render(ClassificationBadge, { props: { classification: 'special_category' } });
		const el = screen.getByText('Special Category');
		expect(el.className).toContain('bg-red-100');
	});
});

// --- StatusBadge ---

describe('StatusBadge', () => {
	it('renders "Active" for active status', () => {
		render(StatusBadge, { props: { status: 'active' } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('renders "Inactive" for inactive status', () => {
		render(StatusBadge, { props: { status: 'inactive' } });
		expect(screen.getByText('Inactive')).toBeTruthy();
	});

	it('renders "Suspended" for suspended status', () => {
		render(StatusBadge, { props: { status: 'suspended' } });
		expect(screen.getByText('Suspended')).toBeTruthy();
	});

	it('falls back to raw status for unknown values', () => {
		render(StatusBadge, { props: { status: 'custom_status' } });
		expect(screen.getByText('custom_status')).toBeTruthy();
	});

	it('applies green styling for active', () => {
		render(StatusBadge, { props: { status: 'active' } });
		const el = screen.getByText('Active');
		expect(el.className).toContain('bg-green-100');
	});

	it('applies fallback styling for unknown status', () => {
		render(StatusBadge, { props: { status: 'unknown' } });
		const el = screen.getByText('unknown');
		expect(el.className).toContain('bg-gray-100');
	});
});

// --- EntitlementNameLink ---

describe('EntitlementNameLink', () => {
	it('renders the entitlement name as text', () => {
		render(EntitlementNameLink, { props: { name: 'Test Entitlement', id: 'ent-1' } });
		expect(screen.getByText('Test Entitlement')).toBeTruthy();
	});

	it('renders link to the entitlement detail page', () => {
		render(EntitlementNameLink, { props: { name: 'My Ent', id: 'ent-42' } });
		const link = screen.getByRole('link', { name: 'My Ent' });
		expect(link.getAttribute('href')).toBe('/governance/entitlements/ent-42');
	});
});

// --- SodViolationList ---

describe('SodViolationList', () => {
	const violations: SodViolationResponse[] = [
		{
			rule_id: 'rule-1',
			rule_name: 'Finance SoD',
			severity: 'high',
			user_id: 'user-1',
			first_entitlement_id: 'ent-1',
			second_entitlement_id: 'ent-2',
			user_already_has: 'ent-1'
		},
		{
			rule_id: 'rule-2',
			rule_name: 'Admin SoD',
			severity: 'critical',
			user_id: 'user-2',
			first_entitlement_id: 'ent-3',
			second_entitlement_id: 'ent-4',
			user_already_has: 'ent-3'
		}
	];

	it('renders violations in a table', () => {
		render(SodViolationList, { props: { violations, isLoading: false } });
		expect(screen.getByText('Finance SoD')).toBeTruthy();
		expect(screen.getByText('Admin SoD')).toBeTruthy();
	});

	it('renders severity badges', () => {
		render(SodViolationList, { props: { violations, isLoading: false } });
		expect(screen.getByText('High')).toBeTruthy();
		expect(screen.getByText('Critical')).toBeTruthy();
	});

	it('renders user IDs', () => {
		render(SodViolationList, { props: { violations, isLoading: false } });
		expect(screen.getByText('user-1')).toBeTruthy();
		expect(screen.getByText('user-2')).toBeTruthy();
	});

	it('renders entitlement IDs', () => {
		render(SodViolationList, { props: { violations, isLoading: false } });
		expect(screen.getByText('ent-1')).toBeTruthy();
		expect(screen.getByText('ent-2')).toBeTruthy();
		expect(screen.getByText('ent-3')).toBeTruthy();
		expect(screen.getByText('ent-4')).toBeTruthy();
	});

	it('renders table headers', () => {
		render(SodViolationList, { props: { violations, isLoading: false } });
		expect(screen.getByText('Rule Name')).toBeTruthy();
		expect(screen.getByText('Severity')).toBeTruthy();
		expect(screen.getByText('User ID')).toBeTruthy();
		expect(screen.getByText('First Entitlement')).toBeTruthy();
		expect(screen.getByText('Second Entitlement')).toBeTruthy();
	});

	it('shows empty state when no violations', () => {
		render(SodViolationList, { props: { violations: [], isLoading: false } });
		expect(screen.getByText('No SoD violations')).toBeTruthy();
	});

	it('shows loading skeletons', () => {
		const { container } = render(SodViolationList, { props: { violations: [], isLoading: true } });
		const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
		expect(skeletons.length).toBeGreaterThan(0);
	});
});
