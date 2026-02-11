<script lang="ts">
	interface Props {
		title: string;
		description?: string;
	}

	let { title, description }: Props = $props();
</script>

<div class="mb-6">
	<h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
	{#if description}
		<p class="mt-1 text-sm text-muted-foreground">{description}</p>
	{/if}
</div>
