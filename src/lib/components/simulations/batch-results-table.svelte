<script lang="ts">
	import type { BatchSimulationResult } from '$lib/api/types';

	let { results, total = 0, onFilterChange }: {
		results: BatchSimulationResult[];
		total?: number;
		onFilterChange?: (hasWarnings: boolean | null) => void;
	} = $props();

	let filterWarnings = $state<string>('');

	function handleFilterChange(e: Event) {
		const select = e.target as HTMLSelectElement;
		filterWarnings = select.value;
		onFilterChange?.(select.value === 'true' ? true : select.value === 'false' ? false : null);
	}
</script>

<div class="space-y-4">
	<div class="flex items-center justify-between">
		<p class="text-sm text-muted-foreground">{total} result{total !== 1 ? 's' : ''}</p>
		<select
			class="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
			onchange={handleFilterChange}
			value={filterWarnings}
		>
			<option value="">All Results</option>
			<option value="true">Has Warnings</option>
			<option value="false">No Warnings</option>
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
						<th class="px-4 py-3 text-left font-medium">Access Gained</th>
						<th class="px-4 py-3 text-left font-medium">Access Lost</th>
						<th class="px-4 py-3 text-left font-medium">Warnings</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each results as result}
						<tr class="hover:bg-muted/30">
							<td class="px-4 py-3 font-mono text-xs">{result.user_id.slice(0, 8)}...</td>
							<td class="px-4 py-3">
								{#if result.access_gained.length > 0}
									<div class="space-y-1">
										{#each result.access_gained as item}
											<span class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900 dark:text-green-200">
												{item.name}
											</span>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								{#if result.access_lost.length > 0}
									<div class="space-y-1">
										{#each result.access_lost as item}
											<span class="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900 dark:text-red-200">
												{item.name}
											</span>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								{#if result.warnings.length > 0}
									<div class="space-y-1">
										{#each result.warnings as warning}
											<p class="text-xs text-yellow-600 dark:text-yellow-400">{warning}</p>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
