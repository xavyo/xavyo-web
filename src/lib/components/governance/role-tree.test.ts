import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RoleTree from './role-tree.svelte';
import type { RoleTreeNode } from '$lib/api/types';

const mockRoots: RoleTreeNode[] = [
	{
		id: 'root-1',
		name: 'Platform',
		depth: 0,
		is_abstract: false,
		direct_entitlement_count: 2,
		effective_entitlement_count: 5,
		assigned_user_count: 8,
		children: []
	},
	{
		id: 'root-2',
		name: 'Security',
		depth: 0,
		is_abstract: true,
		direct_entitlement_count: 4,
		effective_entitlement_count: 9,
		assigned_user_count: 15,
		children: []
	}
];

describe('RoleTree', () => {
	it('shows empty state when no roots', () => {
		render(RoleTree, { props: { roots: [] } });
		expect(screen.getByText('No roles found')).toBeTruthy();
		expect(
			screen.getByText('Create your first governance role to see the hierarchy.')
		).toBeTruthy();
	});

	it('shows expand/collapse buttons when roots exist', () => {
		render(RoleTree, { props: { roots: mockRoots } });
		expect(screen.getByText('Expand All')).toBeTruthy();
		expect(screen.getByText('Collapse All')).toBeTruthy();
	});

	it('does not show expand/collapse buttons when roots is empty', () => {
		render(RoleTree, { props: { roots: [] } });
		expect(screen.queryByText('Expand All')).toBeNull();
		expect(screen.queryByText('Collapse All')).toBeNull();
	});

	it('renders root node names', () => {
		render(RoleTree, { props: { roots: mockRoots } });
		expect(screen.getByText('Platform')).toBeTruthy();
		expect(screen.getByText('Security')).toBeTruthy();
	});

	it('renders root node links', () => {
		render(RoleTree, { props: { roots: mockRoots } });
		const platformLink = screen.getByRole('link', { name: 'Platform' });
		expect(platformLink.getAttribute('href')).toBe('/governance/roles/root-1');
		const securityLink = screen.getByRole('link', { name: 'Security' });
		expect(securityLink.getAttribute('href')).toBe('/governance/roles/root-2');
	});
});
