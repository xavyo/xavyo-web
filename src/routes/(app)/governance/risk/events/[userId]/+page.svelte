<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let events = $derived(data.events);

	// svelte-ignore state_referenced_locally
	let eventTypeFilter = $state(data.filters.event_type ?? '');

	function applyFilters() {
		const params = new URLSearchParams();
		if (eventTypeFilter) params.set('event_type', eventTypeFilter);
		const qs = params.toString();
		goto(`/governance/risk/events/${data.userId}${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function truncateId(id: string, length = 12): string {
		if (id.length <= length) return id;
		return id.slice(0, length) + '...';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<PageHeader
	title="Risk Events"
	description="Risk events for user {data.userId}"
>
	<a
		href="/governance/risk/scores"
		class="text-sm text-muted-foreground hover:text-foreground hover:underline"
	>
		&larr; Back to Scores
	</a>
</PageHeader>

<!-- Filters -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<input
		type="text"
		placeholder="Filter by event type"
		class="h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		value={eventTypeFilter}
		onchange={(e) => {
			eventTypeFilter = e.currentTarget.value;
			applyFilters();
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter') applyFilters();
		}}
	/>

	{#if eventTypeFilter}
		<Button
			variant="outline"
			size="sm"
			onclick={() => {
				eventTypeFilter = '';
				applyFilters();
			}}
		>
			Clear
		</Button>
	{/if}

	<span class="text-sm text-muted-foreground">
		{events.total} event{events.total !== 1 ? 's' : ''} found
	</span>
</div>

{#if events.items.length === 0}
	<EmptyState
		title="No risk events"
		description="No risk events found for this user matching the current filters."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Event Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Factor ID</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Source Ref</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created At</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Expires At</th>
				</tr>
			</thead>
			<tbody>
				{#each events.items as event}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3 font-medium text-foreground">{event.event_type}</td>
						<td class="px-4 py-3 font-mono text-xs text-foreground" title={event.factor_id ?? ''}>
							{event.factor_id ? truncateId(event.factor_id) : '-'}
						</td>
						<td class="px-4 py-3 text-foreground">{event.value}</td>
						<td class="px-4 py-3 text-muted-foreground">
							{event.source_ref ?? '-'}
						</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(event.created_at)}</td>
						<td class="px-4 py-3 text-muted-foreground">
							{event.expires_at ? formatDate(event.expires_at) : '-'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination info -->
	{#if events.total > events.limit}
		<div class="mt-4 flex items-center justify-between text-sm text-muted-foreground">
			<span>
				Showing {events.offset + 1} - {Math.min(events.offset + events.limit, events.total)} of {events.total}
			</span>
			<div class="flex gap-2">
				{#if events.offset > 0}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (eventTypeFilter) params.set('event_type', eventTypeFilter);
							params.set('offset', String(Math.max(0, events.offset - events.limit)));
							goto(`/governance/risk/events/${data.userId}?${params.toString()}`, {
								replaceState: true
							});
						}}
					>
						Previous
					</Button>
				{/if}
				{#if events.offset + events.limit < events.total}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (eventTypeFilter) params.set('event_type', eventTypeFilter);
							params.set('offset', String(events.offset + events.limit));
							goto(`/governance/risk/events/${data.userId}?${params.toString()}`, {
								replaceState: true
							});
						}}
					>
						Next
					</Button>
				{/if}
			</div>
		</div>
	{/if}
{/if}
