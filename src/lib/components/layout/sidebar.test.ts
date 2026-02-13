import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import { LayoutDashboard, Users, Settings } from 'lucide-svelte';
import Sidebar from './sidebar.svelte';
import type { NavSection } from './sidebar.svelte';

const testSections: NavSection[] = [
	{
		label: 'Dashboard',
		collapsible: false,
		items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }]
	},
	{
		label: 'Identity',
		collapsible: true,
		items: [{ label: 'Users', href: '/users', icon: Users }]
	}
];

describe('Sidebar', () => {
	afterEach(() => {
		cleanup();
		localStorage.clear();
	});

	it('renders nav items', () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.getByText('Users')).toBeTruthy();
	});

	it('renders brand name', () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		expect(screen.getByText('xavyo')).toBeTruthy();
	});

	it('highlights active item', () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		const dashboardLink = screen.getByText('Dashboard').closest('a');
		expect(dashboardLink?.className).toContain('bg-primary');
	});

	it('does not highlight inactive item', () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		const usersLink = screen.getByText('Users').closest('a');
		expect(usersLink?.className).toContain('text-muted-foreground');
	});

	it('calls onNavigate when a nav item is clicked', async () => {
		const onNavigate = vi.fn();
		render(Sidebar, {
			props: { sections: testSections, currentPath: '/dashboard', onNavigate }
		});
		const usersLink = screen.getByText('Users').closest('a');
		await fireEvent.click(usersLink!);
		expect(onNavigate).toHaveBeenCalledOnce();
	});

	it('does not error when onNavigate is not provided', async () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		const usersLink = screen.getByText('Users').closest('a');
		await fireEvent.click(usersLink!);
	});

	it('renders SVG icons instead of emoji', () => {
		const { container } = render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		const svgs = container.querySelectorAll('svg');
		expect(svgs.length).toBeGreaterThanOrEqual(2);
	});

	it('renders Settings navigation link', () => {
		const sectionsWithSettings: NavSection[] = [
			...testSections,
			{
				label: 'Settings',
				collapsible: false,
				items: [{ label: 'Settings', href: '/settings', icon: Settings }]
			}
		];
		render(Sidebar, { props: { sections: sectionsWithSettings, currentPath: '/dashboard' } });
		const settingsLink = screen.getByText('Settings').closest('a');
		expect(settingsLink).toBeTruthy();
		expect(settingsLink?.getAttribute('href')).toBe('/settings');
	});

	it('renders section headers for collapsible sections', () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		const identityHeader = screen.getByRole('button', { name: /identity/i });
		expect(identityHeader).toBeTruthy();
	});

	it('collapses section when header is clicked', async () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		const identityHeader = screen.getByRole('button', { name: /identity/i });

		// Users visible initially
		expect(screen.getByText('Users')).toBeTruthy();

		// Click to collapse
		await fireEvent.click(identityHeader);

		// Users should be hidden
		expect(screen.queryByText('Users')).toBeNull();
	});

	it('persists collapsed state to localStorage', async () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		const identityHeader = screen.getByRole('button', { name: /identity/i });

		await fireEvent.click(identityHeader);

		const stored = localStorage.getItem('xavyo-sidebar-collapsed');
		expect(stored).toBeTruthy();
		const parsed = JSON.parse(stored!);
		expect(parsed['Identity']).toBe(true);
	});

	it('auto-expands section containing active route', () => {
		// Pre-collapse the Identity section
		localStorage.setItem('xavyo-sidebar-collapsed', JSON.stringify({ Identity: true }));

		render(Sidebar, { props: { sections: testSections, currentPath: '/users' } });

		// Should be auto-expanded because /users is active
		expect(screen.getByText('Users')).toBeTruthy();
	});

	it('does not render collapse button for standalone sections', () => {
		render(Sidebar, { props: { sections: testSections, currentPath: '/dashboard' } });
		// Dashboard section is not collapsible, so no button for it
		const buttons = screen.getAllByRole('button');
		const dashboardButton = buttons.find((b) => b.textContent?.includes('Dashboard'));
		expect(dashboardButton).toBeUndefined();
	});
});
