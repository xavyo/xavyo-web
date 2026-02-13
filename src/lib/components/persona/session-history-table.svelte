<script lang="ts">
	import type { ContextSessionSummary } from '$lib/api/types';
	import { EmptyState } from '$lib/components/ui/empty-state';

	let { sessions, total = 0 }: { sessions: ContextSessionSummary[]; total?: number } = $props();
</script>

{#if sessions.length === 0}
	<EmptyState title="No session history" description="No context switches have been performed yet." />
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Time</th>
					<th class="px-4 py-3 text-left font-medium">From</th>
					<th class="px-4 py-3 text-left font-medium">To</th>
					<th class="px-4 py-3 text-left font-medium">Reason</th>
				</tr>
			</thead>
			<tbody>
				{#each sessions as session}
					<tr class="border-b">
						<td class="px-4 py-3">{new Date(session.switched_at).toLocaleString()}</td>
						<td class="px-4 py-3 font-medium">{session.from_context}</td>
						<td class="px-4 py-3 font-medium">{session.to_context}</td>
						<td class="px-4 py-3 text-muted-foreground">{session.reason ?? '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="mt-2 text-sm text-muted-foreground">{total} total sessions</p>
{/if}
