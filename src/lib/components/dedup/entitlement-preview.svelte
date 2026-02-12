<script lang="ts">
	import type { EntitlementsPreview, EntitlementStrategy } from '$lib/api/types';

	interface Props {
		preview: EntitlementsPreview;
		strategy: EntitlementStrategy;
	}

	let { preview, strategy }: Props = $props();

	const sections = $derived([
		{ label: 'Source Only', items: preview.source_only, color: 'border-blue-200 dark:border-blue-800' },
		{ label: 'Target Only', items: preview.target_only, color: 'border-purple-200 dark:border-purple-800' },
		{ label: 'Common', items: preview.common, color: 'border-green-200 dark:border-green-800' },
		{ label: 'Merged Result', items: preview.merged, color: 'border-foreground/20' }
	]);
</script>

<div class="space-y-4" data-testid="entitlement-preview">
	<div class="flex items-center gap-2 text-sm text-muted-foreground">
		<span>Strategy:</span>
		<span class="rounded bg-muted px-2 py-0.5 font-medium text-foreground">{strategy}</span>
	</div>

	{#each sections as section}
		<div class="rounded-lg border p-3 {section.color}">
			<h4 class="mb-2 text-sm font-medium text-foreground">
				{section.label}
				<span class="text-muted-foreground">({section.items.length})</span>
			</h4>
			{#if section.items.length === 0}
				<p class="text-xs text-muted-foreground">None</p>
			{:else}
				<div class="space-y-1">
					{#each section.items as item}
						<div class="flex items-center justify-between text-sm">
							<span class="text-foreground">{item.name}</span>
							{#if item.application}
								<span class="text-xs text-muted-foreground">{item.application}</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>
