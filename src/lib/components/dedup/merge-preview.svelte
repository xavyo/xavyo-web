<script lang="ts">
	import type { IdentitySummary } from '$lib/api/types';

	interface Props {
		identity: IdentitySummary;
		title: string;
	}

	let { identity, title }: Props = $props();

	const fields = $derived([
		{ label: 'Email', value: identity.email },
		{ label: 'Display Name', value: identity.display_name },
		{ label: 'Department', value: identity.department }
	]);
</script>

<div class="rounded-lg border border-border bg-card p-4" data-testid="merge-preview">
	<h4 class="mb-3 text-sm font-semibold text-foreground">{title}</h4>
	<dl class="space-y-2">
		{#each fields as field}
			<div class="flex justify-between text-sm">
				<dt class="text-muted-foreground">{field.label}</dt>
				<dd class="font-medium text-foreground">{field.value ?? '—'}</dd>
			</div>
		{/each}
		{#if Object.keys(identity.attributes).length > 0}
			{#each Object.entries(identity.attributes) as [key, value]}
				<div class="flex justify-between text-sm">
					<dt class="text-muted-foreground">{key}</dt>
					<dd class="font-medium text-foreground">{String(value)}</dd>
				</div>
			{/each}
		{/if}
	</dl>
</div>
