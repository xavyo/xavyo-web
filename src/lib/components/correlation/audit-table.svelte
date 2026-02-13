<script lang="ts">
	import type { CorrelationAuditEvent } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		events: CorrelationAuditEvent[];
		total?: number;
		onFilterChange?: (filters: Record<string, string>) => void;
		onPageChange?: (offset: number) => void;
	}

	let { events, total = 0, onFilterChange, onPageChange }: Props = $props();

	// Filter state
	let filterEventType = $state('');
	let filterOutcome = $state('');
	let filterStartDate = $state('');
	let filterEndDate = $state('');

	// Detail dialog
	let showDetailDialog = $state(false);
	let selectedEvent = $state<CorrelationAuditEvent | null>(null);

	// Pagination
	let currentOffset = $state(0);
	let pageSize = 20;
	let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
	let currentPage = $derived(Math.floor(currentOffset / pageSize) + 1);

	function eventTypeClass(eventType: string): string {
		switch (eventType) {
			case 'auto_confirm':
				return 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'manual_confirm':
				return 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'reject':
				return 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			case 'create_identity':
				return 'border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
			case 'reassign':
				return 'border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
			default:
				return '';
		}
	}

	function outcomeClass(outcome: string): string {
		switch (outcome) {
			case 'success':
				return 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
			case 'failure':
				return 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			default:
				return '';
		}
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr);
		if (isNaN(d.getTime())) return dateStr;
		return d.toLocaleString();
	}

	function formatEventType(eventType: string): string {
		return eventType.replace(/_/g, ' ');
	}

	function applyFilters() {
		const filters: Record<string, string> = {};
		if (filterEventType) filters.event_type = filterEventType;
		if (filterOutcome) filters.outcome = filterOutcome;
		if (filterStartDate) filters.start_date = filterStartDate;
		if (filterEndDate) filters.end_date = filterEndDate;
		currentOffset = 0;
		onFilterChange?.(filters);
	}

	function clearFilters() {
		filterEventType = '';
		filterOutcome = '';
		filterStartDate = '';
		filterEndDate = '';
		currentOffset = 0;
		onFilterChange?.({});
	}

	function goToPage(page: number) {
		const newOffset = (page - 1) * pageSize;
		currentOffset = newOffset;
		onPageChange?.(newOffset);
	}

	function openDetail(event: CorrelationAuditEvent) {
		selectedEvent = event;
		showDetailDialog = true;
	}
</script>

<div class="space-y-4">
	<!-- Filter bar -->
	<div class="flex flex-wrap items-end gap-3">
		<div>
			<label for="filter-event-type" class="mb-1 block text-xs font-medium text-muted-foreground">
				Event Type
			</label>
			<select
				id="filter-event-type"
				bind:value={filterEventType}
				class="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
			>
				<option value="">All</option>
				<option value="auto_confirm">Auto Confirm</option>
				<option value="manual_confirm">Manual Confirm</option>
				<option value="reject">Reject</option>
				<option value="create_identity">Create Identity</option>
				<option value="reassign">Reassign</option>
			</select>
		</div>

		<div>
			<label for="filter-outcome" class="mb-1 block text-xs font-medium text-muted-foreground">
				Outcome
			</label>
			<select
				id="filter-outcome"
				bind:value={filterOutcome}
				class="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
			>
				<option value="">All</option>
				<option value="success">Success</option>
				<option value="failure">Failure</option>
			</select>
		</div>

		<div>
			<label for="filter-start-date" class="mb-1 block text-xs font-medium text-muted-foreground">
				Start Date
			</label>
			<input
				id="filter-start-date"
				type="date"
				bind:value={filterStartDate}
				class="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
			/>
		</div>

		<div>
			<label for="filter-end-date" class="mb-1 block text-xs font-medium text-muted-foreground">
				End Date
			</label>
			<input
				id="filter-end-date"
				type="date"
				bind:value={filterEndDate}
				class="rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
			/>
		</div>

		<Button size="sm" onclick={applyFilters}>Apply</Button>
		<Button size="sm" variant="outline" onclick={clearFilters}>Clear</Button>
	</div>

	<!-- Table -->
	{#if events.length === 0}
		<p class="py-8 text-center text-sm text-muted-foreground">No audit events found.</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full text-sm">
				<thead>
					<tr class="border-b border-border text-left">
						<th class="px-3 py-2 font-medium text-muted-foreground">Date</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Event Type</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Account ID</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Identity ID</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Confidence</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Actor</th>
						<th class="px-3 py-2 font-medium text-muted-foreground">Outcome</th>
					</tr>
				</thead>
				<tbody>
					{#each events as event}
						<tr
							class="cursor-pointer border-b border-border hover:bg-accent/50"
							onclick={() => openDetail(event)}
							onkeydown={(e) => {
								if (e.key === 'Enter') openDetail(event);
							}}
							tabindex="0"
							role="button"
						>
							<td class="px-3 py-2 text-muted-foreground">{formatDate(event.created_at)}</td>
							<td class="px-3 py-2">
								<Badge class={eventTypeClass(event.event_type)}>
									{formatEventType(event.event_type)}
								</Badge>
							</td>
							<td class="max-w-[120px] truncate px-3 py-2 text-foreground" title={event.account_id}>
								{event.account_id}
							</td>
							<td class="max-w-[120px] truncate px-3 py-2 text-foreground" title={event.identity_id}>
								{event.identity_id}
							</td>
							<td class="px-3 py-2 text-foreground">
								{Math.round(event.confidence_score * 100)}%
							</td>
							<td class="px-3 py-2 text-muted-foreground">
								{event.actor_type}{event.actor_id ? `: ${event.actor_id}` : ''}
							</td>
							<td class="px-3 py-2">
								<Badge class={outcomeClass(event.outcome)}>{event.outcome}</Badge>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if total > pageSize}
			<div class="flex items-center justify-between border-t border-border pt-4">
				<p class="text-sm text-muted-foreground">
					Showing {currentOffset + 1}-{Math.min(currentOffset + pageSize, total)} of {total}
				</p>
				<div class="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						disabled={currentPage <= 1}
						onclick={() => goToPage(currentPage - 1)}
					>
						<ChevronLeft class="h-4 w-4" />
					</Button>
					<span class="px-3 text-sm text-foreground">
						Page {currentPage} of {totalPages}
					</span>
					<Button
						variant="outline"
						size="icon"
						disabled={currentPage >= totalPages}
						onclick={() => goToPage(currentPage + 1)}
					>
						<ChevronRight class="h-4 w-4" />
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</div>

<!-- Event Detail Dialog -->
<Dialog.Root bind:open={showDetailDialog}>
	<DialogContent class="max-w-2xl">
		<DialogHeader>
			<DialogTitle>Audit Event Detail</DialogTitle>
		</DialogHeader>
		{#if selectedEvent}
			<div class="max-h-[60vh] space-y-4 overflow-y-auto py-4">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<p class="text-xs font-medium text-muted-foreground">Event Type</p>
						<Badge class={eventTypeClass(selectedEvent.event_type)}>
							{formatEventType(selectedEvent.event_type)}
						</Badge>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Outcome</p>
						<Badge class={outcomeClass(selectedEvent.outcome)}>
							{selectedEvent.outcome}
						</Badge>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Date</p>
						<p class="text-sm text-foreground">{formatDate(selectedEvent.created_at)}</p>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Confidence</p>
						<p class="text-sm text-foreground">
							{Math.round(selectedEvent.confidence_score * 100)}%
						</p>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Account ID</p>
						<p class="break-all text-sm text-foreground">{selectedEvent.account_id}</p>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Identity ID</p>
						<p class="break-all text-sm text-foreground">{selectedEvent.identity_id}</p>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Case ID</p>
						<p class="break-all text-sm text-foreground">{selectedEvent.case_id}</p>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Connector ID</p>
						<p class="break-all text-sm text-foreground">{selectedEvent.connector_id}</p>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Actor</p>
						<p class="text-sm text-foreground">
							{selectedEvent.actor_type}{selectedEvent.actor_id
								? `: ${selectedEvent.actor_id}`
								: ''}
						</p>
					</div>
					<div>
						<p class="text-xs font-medium text-muted-foreground">Candidate Count</p>
						<p class="text-sm text-foreground">{selectedEvent.candidate_count}</p>
					</div>
				</div>

				{#if selectedEvent.reason}
					<div>
						<p class="text-xs font-medium text-muted-foreground">Reason</p>
						<p class="text-sm text-foreground">{selectedEvent.reason}</p>
					</div>
				{/if}

				<div>
					<p class="mb-1 text-xs font-medium text-muted-foreground">Rules Snapshot</p>
					<pre
						class="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">{JSON.stringify(selectedEvent.rules_snapshot, null, 2)}</pre>
				</div>

				<div>
					<p class="mb-1 text-xs font-medium text-muted-foreground">Thresholds Snapshot</p>
					<pre
						class="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">{JSON.stringify(selectedEvent.thresholds_snapshot, null, 2)}</pre>
				</div>

				<div>
					<p class="mb-1 text-xs font-medium text-muted-foreground">Candidates Summary</p>
					<pre
						class="max-h-48 overflow-auto rounded-md bg-muted p-3 text-xs text-foreground">{JSON.stringify(selectedEvent.candidates_summary, null, 2)}</pre>
				</div>
			</div>
		{/if}
		<DialogFooter>
			<Button variant="outline" onclick={() => (showDetailDialog = false)}>Close</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
