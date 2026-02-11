<script lang="ts">
	interface NavItem {
		label: string;
		href: string;
		icon: string;
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

<nav class="flex h-full w-64 flex-col border-r bg-card {className}">
	<div class="flex h-14 items-center border-b px-4">
		<span class="text-lg font-semibold">xavyo</span>
	</div>
	<div class="flex-1 space-y-1 p-2">
		{#each items as item}
			<a
				href={item.href}
				onclick={handleClick}
				class="flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors
					{isActive(item.href)
					? 'bg-accent text-accent-foreground'
					: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
			>
				<span class="text-base">{item.icon}</span>
				<span>{item.label}</span>
			</a>
		{/each}
	</div>
</nav>
