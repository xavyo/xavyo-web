<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import JsonDisplay from '$lib/components/nhi/json-display.svelte';
	import ActionLog from '$lib/components/birthright/action-log.svelte';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	let { data }: { data: PageData } = $props();

	let event = $derived(data.event);
	let actions = $derived(data.actions);
	let snapshot = $derived(data.snapshot);

	let actionError: string | null = $state(null);
	let processSummary: { provisioned: number; revoked: number; skipped: number; scheduled: number } | null = $state(null);

	function eventTypeBadgeClass(type: string): string {
		switch (type) {
			case 'joiner':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
			case 'mover':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
			case 'leaver':
				return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
		}
	}

	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr || isNaN(new Date(dateStr).getTime())) return '-';
		return new Date(dateStr).toLocaleString();
	}

	let isProcessed = $derived(!!event.processed_at);
</script>

<PageHeader title="Lifecycle Event Detail" description="View event information and processing results">
	{#snippet children()}
		<a
			href="/governance/birthright"
			class="text-sm font-medium text-primary hover:underline"
		>
			Back to Birthright Access
		</a>
	{/snippet}
</PageHeader>

{#if actionError}
	<Alert variant="destructive" class="mb-4">
		<AlertDescription>{actionError}</AlertDescription>
	</Alert>
{/if}

<!-- Event Info Card -->
<Card class="mb-6">
	<CardHeader>
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Event Information</h2>
			{#if !isProcessed}
				<form
					method="POST"
					action="?/process"
					use:enhance={() => {
						return async ({ result }) => {
							if (result.type === 'failure' && result.data) {
								actionError = (result.data as { error?: string }).error ?? 'Failed to process event';
							} else if (result.type === 'success' && result.data) {
								const d = result.data as { summary?: typeof processSummary };
								processSummary = d.summary ?? null;
							}
						};
					}}
				>
					<Button type="submit" variant="default">Process Event</Button>
				</form>
			{/if}
		</div>
	</CardHeader>
	<CardContent>
		<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
			<div>
				<p class="text-sm font-medium text-muted-foreground">Event Type</p>
				<span
					class="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {eventTypeBadgeClass(event.event_type)}"
				>
					{event.event_type}
				</span>
			</div>
			<div>
				<p class="text-sm font-medium text-muted-foreground">User ID</p>
				<p class="mt-1 font-mono text-sm">{event.user_id}</p>
			</div>
			<div>
				<p class="text-sm font-medium text-muted-foreground">Source</p>
				<p class="mt-1 text-sm">{event.source}</p>
			</div>
			<div>
				<p class="text-sm font-medium text-muted-foreground">Created</p>
				<p class="mt-1 text-sm">{formatDate(event.created_at)}</p>
			</div>
			<div>
				<p class="text-sm font-medium text-muted-foreground">Processed</p>
				<p class="mt-1 text-sm">{formatDate(event.processed_at)}</p>
			</div>
			<div>
				<p class="text-sm font-medium text-muted-foreground">Status</p>
				{#if isProcessed}
					<span class="mt-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
						processed
					</span>
				{:else}
					<span class="mt-1 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
						pending
					</span>
				{/if}
			</div>
		</div>
	</CardContent>
</Card>

<!-- Summary Card (from process action response) -->
{#if processSummary}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-xl font-semibold">Processing Summary</h2>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div class="rounded-lg border border-border p-4 text-center">
					<p class="text-2xl font-bold text-green-600 dark:text-green-400">{processSummary.provisioned}</p>
					<p class="text-sm text-muted-foreground">Provisioned</p>
				</div>
				<div class="rounded-lg border border-border p-4 text-center">
					<p class="text-2xl font-bold text-red-600 dark:text-red-400">{processSummary.revoked}</p>
					<p class="text-sm text-muted-foreground">Revoked</p>
				</div>
				<div class="rounded-lg border border-border p-4 text-center">
					<p class="text-2xl font-bold text-gray-600 dark:text-gray-400">{processSummary.skipped}</p>
					<p class="text-sm text-muted-foreground">Skipped</p>
				</div>
				<div class="rounded-lg border border-border p-4 text-center">
					<p class="text-2xl font-bold text-amber-600 dark:text-amber-400">{processSummary.scheduled}</p>
					<p class="text-sm text-muted-foreground">Scheduled</p>
				</div>
			</div>
		</CardContent>
	</Card>
{/if}

<!-- Attributes Section -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-xl font-semibold">Attributes</h2>
	</CardHeader>
	<CardContent>
		<div class="grid gap-6 md:grid-cols-2">
			<div>
				<JsonDisplay
					data={event.attributes_before}
					label="Attributes Before"
					collapsible={true}
					maxHeight="20rem"
				/>
			</div>
			<div>
				<JsonDisplay
					data={event.attributes_after}
					label="Attributes After"
					collapsible={true}
					maxHeight="20rem"
				/>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Action Log -->
<Card class="mb-6">
	<CardHeader>
		<h2 class="text-xl font-semibold">Action Log</h2>
	</CardHeader>
	<CardContent>
		<ActionLog {actions} />
	</CardContent>
</Card>

<!-- Snapshot Section -->
{#if snapshot}
	<Card class="mb-6">
		<CardHeader>
			<h2 class="text-xl font-semibold">Access Snapshot</h2>
		</CardHeader>
		<CardContent>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
				<div>
					<p class="text-sm font-medium text-muted-foreground">Snapshot Type</p>
					<p class="mt-1 text-sm">{snapshot.snapshot_type}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Captured At</p>
					<p class="mt-1 text-sm">{formatDate(snapshot.created_at)}</p>
				</div>
				<div>
					<p class="text-sm font-medium text-muted-foreground">Assignments</p>
					<p class="mt-1 text-sm">{snapshot.assignment_count} entitlement(s)</p>
				</div>
			</div>
		</CardContent>
	</Card>
{/if}
