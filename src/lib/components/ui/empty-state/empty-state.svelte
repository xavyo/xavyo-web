<script lang="ts">
	interface Props {
		title: string;
		description?: string;
		icon?: string;
		actionLabel?: string;
		actionHref?: string;
	}

	let { title, description, icon, actionLabel, actionHref }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 text-center">
	{#if icon}
		<span class="mb-3 text-4xl">{icon}</span>
	{/if}
	<h3 class="text-lg font-medium text-foreground">{title}</h3>
	{#if description}
		<p class="mt-1 text-sm text-muted-foreground">{description}</p>
	{/if}
	{#if actionLabel && actionHref}
		<a
			href={actionHref}
			class="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
		>
			{actionLabel}
		</a>
	{/if}
</div>
