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

<div
	class="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center"
>
	{#if icon}
		<span class="mb-3 text-3xl opacity-80" aria-hidden="true">{icon}</span>
	{:else}
		<span
			class="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
			aria-hidden="true"
		>
			—
		</span>
	{/if}
	<h3 class="text-base font-semibold tracking-tight text-foreground">{title}</h3>
	{#if description}
		<p class="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
	{/if}
	{#if actionLabel && actionHref}
		<a
			href={actionHref}
			class="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			{actionLabel}
		</a>
	{/if}
</div>
