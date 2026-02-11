import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import Sidebar from './sidebar.svelte';

const testItems = [
	{ label: 'Dashboard', href: '/dashboard', icon: '📊' },
	{ label: 'Users', href: '/users', icon: '👥' }
];

describe('Sidebar', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders nav items', () => {
		render(Sidebar, { props: { items: testItems, currentPath: '/dashboard' } });
		expect(screen.getByText('Dashboard')).toBeTruthy();
		expect(screen.getByText('Users')).toBeTruthy();
	});

	it('renders brand name', () => {
		render(Sidebar, { props: { items: testItems, currentPath: '/dashboard' } });
		expect(screen.getByText('xavyo')).toBeTruthy();
	});

	it('highlights active item', () => {
		render(Sidebar, { props: { items: testItems, currentPath: '/dashboard' } });
		const dashboardLink = screen.getByText('Dashboard').closest('a');
		expect(dashboardLink?.className).toContain('bg-accent');
	});

	it('does not highlight inactive item', () => {
		render(Sidebar, { props: { items: testItems, currentPath: '/dashboard' } });
		const usersLink = screen.getByText('Users').closest('a');
		expect(usersLink?.className).toContain('text-muted-foreground');
	});

	it('calls onNavigate when a nav item is clicked', async () => {
		const onNavigate = vi.fn();
		render(Sidebar, {
			props: { items: testItems, currentPath: '/dashboard', onNavigate }
		});
		const usersLink = screen.getByText('Users').closest('a');
		await fireEvent.click(usersLink!);
		expect(onNavigate).toHaveBeenCalledOnce();
	});

	it('does not error when onNavigate is not provided', async () => {
		render(Sidebar, { props: { items: testItems, currentPath: '/dashboard' } });
		const usersLink = screen.getByText('Users').closest('a');
		// Should not throw
		await fireEvent.click(usersLink!);
	});
});
