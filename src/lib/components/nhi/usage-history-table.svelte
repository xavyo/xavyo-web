<script lang="ts">
	import type { NhiUsageRecord } from '$lib/api/types';
	import { EmptyState } from '$lib/components/ui/empty-state';

	let { records, total = 0 }: { records: NhiUsageRecord[]; total?: number } = $props();
</script>

{#if records.length === 0}
	<EmptyState title="No usage records" description="No usage activity has been recorded for this entity." />
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Activity</th>
					<th class="px-4 py-3 text-left font-medium">Details</th>
					<th class="px-4 py-3 text-left font-medium">Source IP</th>
					<th class="px-4 py-3 text-left font-medium">Time</th>
				</tr>
			</thead>
			<tbody>
				{#each records as record}
					<tr class="border-b">
						<td class="px-4 py-3 font-medium">{record.activity_type}</td>
						<td class="px-4 py-3 text-muted-foreground">{record.details ?? '—'}</td>
						<td class="px-4 py-3 font-mono text-xs">{record.source_ip ?? '—'}</td>
						<td class="px-4 py-3 text-muted-foreground">{new Date(record.performed_at).toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-2 text-sm text-muted-foreground">{total} total records</p>
{/if}
