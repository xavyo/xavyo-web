import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import ValidationResults from './validation-results.svelte';
import type { CartValidationResponse } from '$lib/api/types';

function makeValidation(overrides: Partial<CartValidationResponse> = {}): CartValidationResponse {
	return {
		valid: true,
		issues: [],
		sod_violations: [],
		...overrides
	};
}

describe('ValidationResults', () => {
	afterEach(cleanup);

	it('renders data-testid attribute', () => {
		render(ValidationResults, { props: { validation: makeValidation() } });
		expect(screen.getByTestId('validation-results')).toBeTruthy();
	});

	it('shows success message when cart is valid with no violations', () => {
		render(ValidationResults, {
			props: { validation: makeValidation({ valid: true, issues: [], sod_violations: [] }) }
		});
		expect(screen.getByText(/Cart is valid/)).toBeTruthy();
	});

	it('shows issues when present', () => {
		render(ValidationResults, {
			props: {
				validation: makeValidation({
					valid: false,
					issues: [
						{ cart_item_id: 'item-1', code: 'DUPLICATE', message: 'Item already in cart' },
						{ cart_item_id: null, code: 'EMPTY', message: 'Cart is empty' }
					]
				})
			}
		});
		expect(screen.getByText('Issues (2)')).toBeTruthy();
		expect(screen.getByText('Item already in cart (DUPLICATE)')).toBeTruthy();
		expect(screen.getByText('Cart is empty (EMPTY)')).toBeTruthy();
	});

	it('shows SoD violations when present', () => {
		render(ValidationResults, {
			props: {
				validation: makeValidation({
					sod_violations: [
						{
							rule_id: 'sod-1',
							rule_name: 'Finance-IT Separation',
							conflicting_item_ids: ['item-1', 'item-2'],
							description: 'Cannot have both Finance and IT admin'
						}
					]
				})
			}
		});
		expect(screen.getByText('SoD Warnings (1)')).toBeTruthy();
		expect(screen.getByText('Finance-IT Separation')).toBeTruthy();
		expect(screen.getByText(/Cannot have both Finance and IT admin/)).toBeTruthy();
		expect(screen.getByText('SoD warnings do not block submission.')).toBeTruthy();
	});

	it('does not show success message when there are issues', () => {
		render(ValidationResults, {
			props: {
				validation: makeValidation({
					valid: false,
					issues: [{ cart_item_id: null, code: 'ERR', message: 'Error' }]
				})
			}
		});
		expect(screen.queryByText(/Cart is valid/)).toBeFalsy();
	});
});
