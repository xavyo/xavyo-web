import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import RoleTreeNode from './role-tree-node.svelte';
import type { RoleTreeNode as RoleTreeNodeType } from '$lib/api/types';

const mockNode: RoleTreeNodeType = {
	id: 'role-1',
	name: 'Engineering',
	depth: 0,
	is_abstract: false,
	direct_entitlement_count: 3,
	effective_entitlement_count: 7,
	assigned_user_count: 12,
	children: []
};

const mockNodeWithChildren: RoleTreeNodeType = {
	id: 'role-2',
	name: 'Platform',
	depth: 0,
	is_abstract: false,
	direct_entitlement_count: 5,
	effective_entitlement_count: 10,
	assigned_user_count: 20,
	children: [
		{
			id: 'role-3',
			name: 'Backend',
			depth: 1,
			is_abstract: false,
			direct_entitlement_count: 2,
			effective_entitlement_count: 4,
			assigned_user_count: 8,
			children: []
		}
	]
};

const mockAbstractNode: RoleTreeNodeType = {
	id: 'role-4',
	name: 'Abstract Role',
	depth: 0,
	is_abstract: true,
	direct_entitlement_count: 0,
	effective_entitlement_count: 3,
	assigned_user_count: 0,
	children: []
};

describe('RoleTreeNode', () => {
	it('renders node name as link', () => {
		render(RoleTreeNode, {
			props: { node: mockNode, expandedIds: new Set<string>(), onToggle: vi.fn() }
		});
		const link = screen.getByRole('link', { name: 'Engineering' });
		expect(link).toBeTruthy();
		expect(link.getAttribute('href')).toBe('/governance/roles/role-1');
	});

	it('shows Abstract badge when is_abstract is true', () => {
		render(RoleTreeNode, {
			props: { node: mockAbstractNode, expandedIds: new Set<string>(), onToggle: vi.fn() }
		});
		expect(screen.getByText('Abstract')).toBeTruthy();
	});

	it('does not show Abstract badge when is_abstract is false', () => {
		render(RoleTreeNode, {
			props: { node: mockNode, expandedIds: new Set<string>(), onToggle: vi.fn() }
		});
		expect(screen.queryByText('Abstract')).toBeNull();
	});

	it('shows expand button when node has children', () => {
		render(RoleTreeNode, {
			props: { node: mockNodeWithChildren, expandedIds: new Set<string>(), onToggle: vi.fn() }
		});
		const expandBtn = screen.getByRole('button', { name: 'Expand' });
		expect(expandBtn).toBeTruthy();
	});

	it('does not show expand button for leaf nodes', () => {
		render(RoleTreeNode, {
			props: { node: mockNode, expandedIds: new Set<string>(), onToggle: vi.fn() }
		});
		expect(screen.queryByRole('button', { name: 'Expand' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Collapse' })).toBeNull();
	});

	it('shows stats with direct, effective, and users counts', () => {
		render(RoleTreeNode, {
			props: { node: mockNode, expandedIds: new Set<string>(), onToggle: vi.fn() }
		});
		expect(screen.getByText('3 direct')).toBeTruthy();
		expect(screen.getByText('7 effective')).toBeTruthy();
		expect(screen.getByText('12 users')).toBeTruthy();
	});

	it('shows collapse button when node is expanded', () => {
		render(RoleTreeNode, {
			props: {
				node: mockNodeWithChildren,
				expandedIds: new Set(['role-2']),
				onToggle: vi.fn()
			}
		});
		const collapseBtn = screen.getByRole('button', { name: 'Collapse' });
		expect(collapseBtn).toBeTruthy();
	});

	it('renders children when node is expanded', () => {
		render(RoleTreeNode, {
			props: {
				node: mockNodeWithChildren,
				expandedIds: new Set(['role-2']),
				onToggle: vi.fn()
			}
		});
		expect(screen.getByText('Backend')).toBeTruthy();
	});

	it('does not render children when node is collapsed', () => {
		render(RoleTreeNode, {
			props: { node: mockNodeWithChildren, expandedIds: new Set<string>(), onToggle: vi.fn() }
		});
		expect(screen.queryByText('Backend')).toBeNull();
	});
});
