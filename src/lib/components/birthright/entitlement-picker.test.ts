import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import EntitlementPicker from './entitlement-picker.svelte';

const sampleEntitlements = [
	{ id: 'ent-1', name: 'Admin Access' },
	{ id: 'ent-2', name: 'Read Only' },
	{ id: 'ent-3', name: 'Developer Tools' },
	{ id: 'ent-4', name: 'Analytics Dashboard' }
];

describe('EntitlementPicker', () => {
	afterEach(cleanup);

	it('renders the "Entitlements" heading', () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: [], onchange: vi.fn() }
		});
		expect(screen.getByText('Entitlements')).toBeTruthy();
	});

	it('displays the selected count', () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: ['ent-1', 'ent-3'], onchange: vi.fn() }
		});
		expect(screen.getByText('2 selected')).toBeTruthy();
	});

	it('renders all entitlement names', () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: [], onchange: vi.fn() }
		});
		expect(screen.getByText('Admin Access')).toBeTruthy();
		expect(screen.getByText('Read Only')).toBeTruthy();
		expect(screen.getByText('Developer Tools')).toBeTruthy();
		expect(screen.getByText('Analytics Dashboard')).toBeTruthy();
	});

	it('renders checkboxes for each entitlement', () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: [], onchange: vi.fn() }
		});
		const checkboxes = screen.getAllByRole('checkbox');
		expect(checkboxes).toHaveLength(4);
	});

	it('checks the checkbox for selected entitlements', () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: ['ent-2'], onchange: vi.fn() }
		});
		const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
		const readOnlyCheckbox = checkboxes[1]; // ent-2 is second
		expect(readOnlyCheckbox.checked).toBe(true);
	});

	it('calls onchange with id added when unchecked entitlement is clicked', async () => {
		const onchange = vi.fn();
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: ['ent-1'], onchange }
		});
		const checkboxes = screen.getAllByRole('checkbox');
		// Click the second checkbox (ent-2, currently unchecked)
		await fireEvent.click(checkboxes[1]);
		expect(onchange).toHaveBeenCalledWith(['ent-1', 'ent-2']);
	});

	it('calls onchange with id removed when checked entitlement is clicked', async () => {
		const onchange = vi.fn();
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: ['ent-1', 'ent-2'], onchange }
		});
		const checkboxes = screen.getAllByRole('checkbox');
		// Click the first checkbox (ent-1, currently checked)
		await fireEvent.click(checkboxes[0]);
		expect(onchange).toHaveBeenCalledWith(['ent-2']);
	});

	it('filters entitlements by search term', async () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: [], onchange: vi.fn() }
		});
		const searchInput = screen.getByPlaceholderText('Search entitlements...');
		await fireEvent.input(searchInput, { target: { value: 'admin' } });

		expect(screen.getByText('Admin Access')).toBeTruthy();
		expect(screen.queryByText('Read Only')).toBeNull();
		expect(screen.queryByText('Developer Tools')).toBeNull();
	});

	it('shows "No entitlements match your search" when search yields no results', async () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: [], onchange: vi.fn() }
		});
		const searchInput = screen.getByPlaceholderText('Search entitlements...');
		await fireEvent.input(searchInput, { target: { value: 'nonexistent' } });

		expect(screen.getByText('No entitlements match your search')).toBeTruthy();
	});

	it('shows "No entitlements available" when entitlements list is empty', () => {
		render(EntitlementPicker, {
			props: { entitlements: [], selectedIds: [], onchange: vi.fn() }
		});
		expect(screen.getByText('No entitlements available')).toBeTruthy();
	});

	it('displays "0 selected" when no entitlements are selected', () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: [], onchange: vi.fn() }
		});
		expect(screen.getByText('0 selected')).toBeTruthy();
	});

	it('search is case-insensitive', async () => {
		render(EntitlementPicker, {
			props: { entitlements: sampleEntitlements, selectedIds: [], onchange: vi.fn() }
		});
		const searchInput = screen.getByPlaceholderText('Search entitlements...');
		await fireEvent.input(searchInput, { target: { value: 'DEVELOPER' } });

		expect(screen.getByText('Developer Tools')).toBeTruthy();
		expect(screen.queryByText('Admin Access')).toBeNull();
	});
});
