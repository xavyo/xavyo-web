<script lang="ts">
	import type { Component, SvelteComponent } from 'svelte';
	import { ChevronDown, ChevronRight } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	type IconType = Component<any> | (new (...args: any[]) => SvelteComponent);

	export interface NavItem {
		label: string;
		href: string;
		icon: IconType;
		badge?: number;
	}

	export interface NavSection {
		label: string;
		collapsible: boolean;
		items: NavItem[];
	}

	interface Props {
		sections: NavSection[];
		currentPath: string;
		onNavigate?: () => void;
		class?: string;
	}

	const STORAGE_KEY = 'xavyo-sidebar-collapsed';

	let { sections, currentPath, onNavigate, class: className = '' }: Props = $props();

	let collapsed: Record<string, boolean> = $state({});

	function loadCollapsedState(): Record<string, boolean> {
		if (!browser) return {};
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			return stored ? JSON.parse(stored) : {};
		} catch {
			return {};
		}
	}

	function saveCollapsedState() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
		} catch {
			// localStorage may be full or blocked
		}
	}

	function toggleSection(label: string) {
		collapsed[label] = !collapsed[label];
		saveCollapsedState();
	}

	function isActive(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}

	function handleClick() {
		onNavigate?.();
	}

	function sectionContainsActive(section: NavSection): boolean {
		return section.items.some((item) => isActive(item.href));
	}

	// Auto-expand section containing active route
	function autoExpandActive() {
		for (const section of sections) {
			if (section.collapsible && sectionContainsActive(section)) {
				collapsed[section.label] = false;
			}
		}
		saveCollapsedState();
	}

	onMount(() => {
		collapsed = loadCollapsedState();
		autoExpandActive();
	});

	// Re-expand on navigation
	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		currentPath;
		autoExpandActive();
	});
</script>

<nav class="flex h-full w-64 flex-col border-r bg-card text-card-foreground {className}">
	<div class="flex h-14 items-center border-b px-4">
		<span class="text-lg font-bold tracking-tight text-foreground">xavyo</span>
	</div>
	<div class="flex-1 overflow-y-auto p-2">
		{#each sections as section}
			{#if section.collapsible}
				<!-- Section header -->
				<button
					type="button"
					class="mt-3 flex w-full items-center gap-1 px-3 py-1.5 first:mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
					onclick={() => toggleSection(section.label)}
					aria-expanded={!collapsed[section.label]}
				>
					{#if collapsed[section.label]}
						<ChevronRight class="h-3.5 w-3.5 shrink-0" />
					{:else}
						<ChevronDown class="h-3.5 w-3.5 shrink-0" />
					{/if}
					<span>{section.label}</span>
				</button>
				{#if !collapsed[section.label]}
					<div class="space-y-0.5">
						{#each section.items as item}
							{@const Icon = item.icon}
							<a
								href={item.href}
								onclick={handleClick}
								class="flex min-h-[36px] items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150
									{isActive(item.href)
									? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
									: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
							>
								<Icon class="h-4 w-4 shrink-0" />
								<span class="truncate">{item.label}</span>
								{#if item.badge && item.badge > 0}
									<span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
										{item.badge}
									</span>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			{:else}
				<!-- Standalone items (Dashboard, Settings) -->
				{#each section.items as item}
					{@const Icon = item.icon}
					<a
						href={item.href}
						onclick={handleClick}
						class="flex min-h-[36px] items-center gap-3 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-150
							{isActive(item.href)
							? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
					>
						<Icon class="h-4 w-4 shrink-0" />
						<span class="truncate">{item.label}</span>
						{#if item.badge && item.badge > 0}
							<span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
								{item.badge}
							</span>
						{/if}
					</a>
				{/each}
			{/if}
		{/each}
	</div>
</nav>
