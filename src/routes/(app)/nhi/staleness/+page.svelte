<script lang="ts">
	import type { NhiStalenessEntry } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let entries = $derived((data.entries ?? []) as NhiStalenessEntry[]);
	let total = $derived(data.total as number);
</script>

<PageHeader title="NHI Staleness Report" description="NHI entities sorted by inactivity duration">
	<a href="/nhi" class="text-sm text-muted-foreground hover:text-foreground">&larr; Back to NHI</a>
</PageHeader>

{#if entries.length === 0}
	<EmptyState title="No stale entities" description="All NHI entities have recent activity." />
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Name</th>
					<th class="px-4 py-3 text-left font-medium">Type</th>
					<th class="px-4 py-3 text-left font-medium">State</th>
					<th class="px-4 py-3 text-left font-medium">Last Activity</th>
					<th class="px-4 py-3 text-left font-medium">Days Inactive</th>
				</tr>
			</thead>
			<tbody>
				{#each entries as entry}
					<tr class="border-b">
						<td class="px-4 py-3 font-medium">{entry.name}</td>
						<td class="px-4 py-3">{entry.nhi_type}</td>
						<td class="px-4 py-3"><Badge variant="outline">{entry.state}</Badge></td>
						<td class="px-4 py-3 text-muted-foreground">{entry.last_activity_at ? new Date(entry.last_activity_at).toLocaleDateString() : 'Never'}</td>
						<td class="px-4 py-3">
							<Badge class={entry.days_inactive > 90 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : entry.days_inactive > 30 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}>
								{entry.days_inactive} days
							</Badge>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-2 text-sm text-muted-foreground">{total} stale entities</p>
{/if}
