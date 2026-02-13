<script lang="ts">
	import type { ComparisonSummary, DeltaResults } from '$lib/api/types';

	let { summary, delta }: { summary: ComparisonSummary | null; delta: DeltaResults | null } = $props();
</script>

{#if summary}
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
		<div class="rounded-lg border border-border bg-card p-4">
			<p class="text-sm text-muted-foreground">Users in Both</p>
			<p class="text-2xl font-bold">{summary.users_in_both}</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-4">
			<p class="text-sm text-muted-foreground">Only in A</p>
			<p class="text-2xl font-bold">{summary.users_only_in_a}</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-4">
			<p class="text-sm text-muted-foreground">Only in B</p>
			<p class="text-2xl font-bold">{summary.users_only_in_b}</p>
		</div>
		<div class="rounded-lg border border-border bg-card p-4">
			<p class="text-sm text-muted-foreground">Different Impacts</p>
			<p class="text-2xl font-bold">{summary.different_impacts}</p>
		</div>
		<div class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
			<p class="text-sm text-green-600 dark:text-green-400">Additions</p>
			<p class="text-2xl font-bold text-green-600 dark:text-green-400">{summary.total_additions}</p>
		</div>
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
			<p class="text-sm text-red-600 dark:text-red-400">Removals</p>
			<p class="text-2xl font-bold text-red-600 dark:text-red-400">{summary.total_removals}</p>
		</div>
	</div>
{/if}

{#if delta}
	<div class="mt-6 space-y-6">
		{#if delta.added.length > 0}
			<div>
				<h3 class="mb-2 text-sm font-medium text-green-600 dark:text-green-400">Added ({delta.added.length})</h3>
				<div class="overflow-x-auto rounded-lg border border-border">
					<table class="w-full text-sm">
						<thead class="border-b border-border bg-muted/50">
							<tr>
								<th class="px-4 py-2 text-left font-medium">User ID</th>
								<th class="px-4 py-2 text-left font-medium">Impact Type</th>
								<th class="px-4 py-2 text-left font-medium">Severity</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each delta.added as entry}
								<tr class="hover:bg-muted/30">
									<td class="px-4 py-2 font-mono text-xs">{entry.user_id.slice(0, 8)}...</td>
									<td class="px-4 py-2">{entry.impact_type}</td>
									<td class="px-4 py-2">{entry.severity ?? '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		{#if delta.removed.length > 0}
			<div>
				<h3 class="mb-2 text-sm font-medium text-red-600 dark:text-red-400">Removed ({delta.removed.length})</h3>
				<div class="overflow-x-auto rounded-lg border border-border">
					<table class="w-full text-sm">
						<thead class="border-b border-border bg-muted/50">
							<tr>
								<th class="px-4 py-2 text-left font-medium">User ID</th>
								<th class="px-4 py-2 text-left font-medium">Impact Type</th>
								<th class="px-4 py-2 text-left font-medium">Severity</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each delta.removed as entry}
								<tr class="hover:bg-muted/30">
									<td class="px-4 py-2 font-mono text-xs">{entry.user_id.slice(0, 8)}...</td>
									<td class="px-4 py-2">{entry.impact_type}</td>
									<td class="px-4 py-2">{entry.severity ?? '—'}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		{#if delta.modified.length > 0}
			<div>
				<h3 class="mb-2 text-sm font-medium text-yellow-600 dark:text-yellow-400">Modified ({delta.modified.length})</h3>
				<div class="overflow-x-auto rounded-lg border border-border">
					<table class="w-full text-sm">
						<thead class="border-b border-border bg-muted/50">
							<tr>
								<th class="px-4 py-2 text-left font-medium">User ID</th>
								<th class="px-4 py-2 text-left font-medium">Impact A</th>
								<th class="px-4 py-2 text-left font-medium">Impact B</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each delta.modified as entry}
								<tr class="hover:bg-muted/30">
									<td class="px-4 py-2 font-mono text-xs">{entry.user_id.slice(0, 8)}...</td>
									<td class="px-4 py-2 text-xs">{JSON.stringify(entry.impact_a).slice(0, 80)}</td>
									<td class="px-4 py-2 text-xs">{JSON.stringify(entry.impact_b).slice(0, 80)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{/if}

		{#if delta.added.length === 0 && delta.removed.length === 0 && delta.modified.length === 0}
			<p class="text-sm text-muted-foreground">No differences found between the two simulations.</p>
		{/if}
	</div>
{:else if !summary}
	<p class="text-sm text-muted-foreground">No comparison data available.</p>
{/if}
