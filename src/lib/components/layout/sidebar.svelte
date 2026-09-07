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

	const allHrefs = $derived(sections.flatMap((s) => s.items.map((i) => i.href)));

	function isActive(href: string): boolean {
		if (currentPath === href) return true;
		if (!currentPath.startsWith(href + '/')) return false;
		return !allHrefs.some(
			(other) =>
				other !== href &&
				other.length > href.length &&
				(currentPath === other || currentPath.startsWith(other + '/'))
		);
	}

	function handleClick() {
		onNavigate?.();
	}

	function sectionContainsActive(section: NavSection): boolean {
		return section.items.some((item) => isActive(item.href));
	}

	/** Collapse dense sections by default; keep small groups and the active path open. */
	function initCollapsedDefaults() {
		const next = loadCollapsedState();
		for (const section of sections) {
			if (!section.collapsible) continue;
			if (next[section.label] === undefined) {
				next[section.label] = section.items.length > 4 && !sectionContainsActive(section);
			}
			if (sectionContainsActive(section)) {
				next[section.label] = false;
			}
		}
		collapsed = next;
		saveCollapsedState();
	}

	function autoExpandActive() {
		for (const section of sections) {
			if (section.collapsible && sectionContainsActive(section)) {
				collapsed[section.label] = false;
			}
		}
		saveCollapsedState();
	}

	onMount(() => {
		initCollapsedDefaults();
	});

	$effect(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		currentPath;
		autoExpandActive();
	});

	function itemClasses(href: string): string {
		const active = isActive(href);
		return [
			'group relative flex min-h-[36px] items-center gap-3 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
			active
				? 'bg-primary/20 text-sidebar-accent-foreground shadow-[inset_3px_0_0_0_var(--color-sidebar-ring)]'
				: 'text-sidebar-muted hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'
		].join(' ');
	}
</script>

<nav
	class="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground [animation:rail-in_0.3s_ease-out] {className}"
	aria-label="Primary"
>
	<div class="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
		<span
			class="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[11px] font-bold tracking-tight text-primary-foreground"
			aria-hidden="true"
		>
			xy
		</span>
		<span class="text-[15px] font-semibold tracking-tight text-sidebar-foreground">xavyo</span>
	</div>
	<div class="flex-1 overflow-y-auto p-2 pb-4">
		{#each sections as section (section.label)}
			{#if section.collapsible}
				<button
					type="button"
					class="mt-3 flex w-full items-center gap-1 px-3 py-1.5 first:mt-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted/80 transition-colors hover:text-sidebar-muted"
					onclick={() => toggleSection(section.label)}
					aria-expanded={!collapsed[section.label]}
				>
					{#if collapsed[section.label]}
						<ChevronRight class="h-3.5 w-3.5 shrink-0" />
					{:else}
						<ChevronDown class="h-3.5 w-3.5 shrink-0" />
					{/if}
					<span class="truncate">{section.label}</span>
					<span class="ml-auto tabular-nums text-[10px] opacity-70">{section.items.length}</span>
				</button>
				{#if !collapsed[section.label]}
					<div class="space-y-0.5">
						{#each section.items as item (item.href)}
							{@const Icon = item.icon}
							<a href={item.href} onclick={handleClick} class={itemClasses(item.href)}>
								<Icon class="h-4 w-4 shrink-0 opacity-90" />
								<span class="truncate">{item.label}</span>
								{#if item.badge && item.badge > 0}
									<span
										class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground"
									>
										{item.badge}
									</span>
								{/if}
							</a>
						{/each}
					</div>
				{/if}
			{:else}
				{#each section.items as item (item.href)}
					{@const Icon = item.icon}
					<a href={item.href} onclick={handleClick} class={itemClasses(item.href)}>
						<Icon class="h-4 w-4 shrink-0 opacity-90" />
						<span class="truncate">{item.label}</span>
						{#if item.badge && item.badge > 0}
							<span
								class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground"
							>
								{item.badge}
							</span>
						{/if}
					</a>
				{/each}
			{/if}
		{/each}
	</div>
</nav>
