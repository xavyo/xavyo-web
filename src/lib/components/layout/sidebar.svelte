<script lang="ts">
	import type { Component, SvelteComponent } from 'svelte';

	type IconType = Component<any> | (new (...args: any[]) => SvelteComponent);

	export interface NavItem {
		label: string;
		href: string;
		icon: IconType;
		badge?: number;
	}

	interface Props {
		items: NavItem[];
		currentPath: string;
		onNavigate?: () => void;
		class?: string;
	}

	let { items, currentPath, onNavigate, class: className = '' }: Props = $props();

	function isActive(href: string): boolean {
		return currentPath === href || currentPath.startsWith(href + '/');
	}

	function handleClick() {
		onNavigate?.();
	}
</script>

<nav class="flex h-full w-64 flex-col border-r bg-card text-card-foreground {className}">
	<div class="flex h-14 items-center border-b px-4">
		<span class="text-lg font-bold tracking-tight text-foreground">xavyo</span>
	</div>
	<div class="flex-1 space-y-1 p-2">
		{#each items as item}
			{@const Icon = item.icon}
			<a
				href={item.href}
				onclick={handleClick}
				class="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150
					{isActive(item.href)
					? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
					: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
			>
				<Icon class="h-5 w-5 shrink-0" />
				<span class="truncate">{item.label}</span>
				{#if item.badge && item.badge > 0}
					<span class="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
						{item.badge}
					</span>
				{/if}
			</a>
		{/each}
	</div>
</nav>
