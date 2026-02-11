<script lang="ts">
	interface Props {
		email: string;
		onToggleSidebar?: () => void;
	}

	let { email, onToggleSidebar }: Props = $props();
</script>

<header class="flex h-14 items-center justify-between border-b bg-card px-4">
	<div class="flex items-center gap-3">
		{#if onToggleSidebar}
			<button
				onclick={onToggleSidebar}
				class="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
				aria-label="Toggle sidebar"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				</svg>
			</button>
		{/if}
	</div>
	<div class="flex items-center gap-4">
		<span class="text-sm text-muted-foreground">{email}</span>
		<a
			href="/logout"
			class="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Log out
		</a>
	</div>
</header>
