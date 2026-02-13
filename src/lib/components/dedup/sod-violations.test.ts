import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import SodViolations from './sod-violations.svelte';
import type { MergeSodCheckResponse } from '$lib/api/types';

describe('SodViolations', () => {
	it('shows no violations message when empty', () => {
		const sodCheck: MergeSodCheckResponse = {
			has_violations: false,
			can_override: true,
			violations: []
		};
		render(SodViolations, { props: { sodCheck } });
		expect(screen.getByText(/No SoD violations detected/)).toBeTruthy();
	});

	it('renders violations list', () => {
		const sodCheck: MergeSodCheckResponse = {
			has_violations: true,
			can_override: true,
			violations: [
				{
					rule_id: 'r1',
					rule_name: 'Admin-Approver Separation',
					severity: 'high',
					entitlement_being_added: 'e1',
					conflicting_entitlement_id: 'e2',
					has_exemption: false
				}
			]
		};
		render(SodViolations, { props: { sodCheck } });
		expect(screen.getByText('Admin-Approver Separation')).toBeTruthy();
		expect(screen.getByText('high')).toBeTruthy();
	});

	it('shows override-able indicator', () => {
		const sodCheck: MergeSodCheckResponse = {
			has_violations: true,
			can_override: true,
			violations: [
				{
					rule_id: 'r1',
					rule_name: 'Test Rule',
					severity: 'medium',
					entitlement_being_added: 'e1',
					conflicting_entitlement_id: 'e2',
					has_exemption: false
				}
			]
		};
		render(SodViolations, { props: { sodCheck } });
		expect(screen.getByText(/can be overridden/)).toBeTruthy();
	});

	it('shows exemption indicator', () => {
		const sodCheck: MergeSodCheckResponse = {
			has_violations: true,
			can_override: false,
			violations: [
				{
					rule_id: 'r1',
					rule_name: 'Test Rule',
					severity: 'low',
					entitlement_being_added: 'e1',
					conflicting_entitlement_id: 'e2',
					has_exemption: true
				}
			]
		};
		render(SodViolations, { props: { sodCheck } });
		expect(screen.getByText(/Has existing exemption/)).toBeTruthy();
	});
});
