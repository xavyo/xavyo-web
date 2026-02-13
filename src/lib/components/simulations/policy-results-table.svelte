<script lang="ts">
	import type { PolicySimulationResult } from '$lib/api/types';
	import SimulationStatusBadge from './simulation-status-badge.svelte';

	let { results, total = 0, onFilterChange }: {
		results: PolicySimulationResult[];
		total?: number;
		onFilterChange?: (impactType: string | null) => void;
	} = $props();

	let filterImpactType = $state<string | null>(null);

	function handleFilterChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		filterImpactType = select.value || null;
		onFilterChange?.(filterImpactType);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">{total} result{total !== 1 ? 's' : ''}</p>
		<select
			class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
			onchange={handleFilterChange}
			value={filterImpactType ?? ''}
		>
			<option value="">All Impact Types</option>
			<option value="violation">Violation</option>
			<option value="entitlement_gain">Entitlement Gain</option>
			<option value="entitlement_loss">Entitlement Loss</option>
			<option value="no_change">No Change</option>
			<option value="warning">Warning</option>
		</select>
	</div>

	{#if results.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No results found</p>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-border">
			<table class="w-full text-sm">
				<thead class="border-b border-border bg-muted/50">
					<tr>
						<th class="px-4 py-3 text-left font-medium">User ID</th>
						<th class="px-4 py-3 text-left font-medium">Impact Type</th>
						<th class="px-4 py-3 text-left font-medium">Severity</th>
						<th class="px-4 py-3 text-left font-medium">Details</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each results as result}
						<tr class="hover:bg-muted/30">
							<td class="px-4 py-3 font-mono text-xs">{result.user_id.slice(0, 8)}...</td>
							<td class="px-4 py-3"><SimulationStatusBadge value={result.impact_type} type="impact" /></td>
							<td class="px-4 py-3"><SimulationStatusBadge value={result.severity} type="severity" /></td>
							<td class="px-4 py-3 text-xs text-muted-foreground">{JSON.stringify(result.details).slice(0, 100)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
