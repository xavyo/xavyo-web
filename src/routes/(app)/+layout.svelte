<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { LayoutDashboard, Users, Drama, Bot } from 'lucide-svelte';
	import Sidebar from '$lib/components/layout/sidebar.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import ToastContainer from '$lib/components/layout/toast-container.svelte';
	import { initThemeListener } from '$lib/stores/theme.svelte';
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children: Snippet;
	}

	let { data, children }: Props = $props();

	let sidebarOpen = $state(false);

	const navItems = [
		{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
		{ label: 'Users', href: '/users', icon: Users },
		{ label: 'Personas', href: '/personas', icon: Drama },
		{ label: 'NHI', href: '/nhi', icon: Bot }
	];

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}

	onMount(() => {
		const cleanup = initThemeListener();
		return cleanup;
	});
</script>

<div class="flex h-screen overflow-hidden bg-background">
	<!-- Desktop sidebar -->
	<div class="hidden md:block">
		<Sidebar items={navItems} currentPath={$page.url.pathname} />
	</div>

	<!-- Mobile sidebar overlay -->
	{#if sidebarOpen}
		<div class="fixed inset-0 z-40 md:hidden">
			<button
				class="absolute inset-0 bg-black/50 transition-opacity duration-200"
				onclick={closeSidebar}
				aria-label="Close sidebar"
			></button>
			<div class="relative z-50 h-full w-64 animate-in slide-in-from-left duration-200">
				<Sidebar items={navItems} currentPath={$page.url.pathname} onNavigate={closeSidebar} />
			</div>
		</div>
	{/if}

	<!-- Main content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<Header email={data.user?.email ?? ''} onToggleSidebar={toggleSidebar} />
		<main class="flex-1 overflow-y-auto p-4 sm:p-6">
			{@render children()}
		</main>
	</div>

	<ToastContainer />
</div>
