<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import AlertCard from './alert-card.svelte';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { getAlerts, acknowledgeAlert } from '$lib/api/alerts-client';
	import type { SecurityAlert, SecurityAlertsResponse } from '$lib/api/types';
	import { RefreshCw } from 'lucide-svelte';

	interface Props {
		onUnacknowledgedCountChange?: (count: number) => void;
	}

	let { onUnacknowledgedCountChange }: Props = $props();

	let items: SecurityAlert[] = $state([]);
	let total = $state(0);
	let nextCursor: string | null = $state(null);
	let unacknowledgedCount = $state(0);
	let loading = $state(false);
	let loadingMore = $state(false);
	let errorMessage = $state('');

	// Filters
	let typeFilter = $state('all');
	let severityFilter = $state('all');
	let acknowledgedFilter = $state('all');

	async function loadAlerts(append = false) {
		if (append) {
			loadingMore = true;
		} else {
			loading = true;
			items = [];
			nextCursor = null;
		}
		errorMessage = '';

		try {
			const params: Record<string, string | number | boolean> = {
				limit: 20
			};
			if (append && nextCursor) params.cursor = nextCursor;
			if (typeFilter !== 'all') params.type = typeFilter;
			if (severityFilter !== 'all') params.severity = severityFilter;
			if (acknowledgedFilter === 'true') params.acknowledged = true;
			if (acknowledgedFilter === 'false') params.acknowledged = false;

			const result: SecurityAlertsResponse = await getAlerts(params);
			if (append) {
				items = [...items, ...result.items];
			} else {
				items = result.items;
			}
			total = result.total;
			nextCursor = result.next_cursor;
			unacknowledgedCount = result.unacknowledged_count;
			onUnacknowledgedCountChange?.(result.unacknowledged_count);
		} catch {
			errorMessage = 'Failed to load security alerts. Please try again.';
		} finally {
			loading = false;
			loadingMore = false;
		}
	}

	async function handleAcknowledge(id: string) {
		try {
			const updated = await acknowledgeAlert(id);
			items = items.map((a) => (a.id === id ? updated : a));
			unacknowledgedCount = Math.max(0, unacknowledgedCount - 1);
			onUnacknowledgedCountChange?.(unacknowledgedCount);
		} catch {
			errorMessage = 'Failed to acknowledge alert. Please try again.';
		}
	}

	function handleFilterChange() {
		loadAlerts();
	}

	// Load on mount
	$effect(() => {
		loadAlerts();
	});
</script>

<div class="mt-4 space-y-4">
	<!-- Filters -->
	<div class="flex flex-wrap gap-3">
		<div class="space-y-1">
			<label for="type-filter" class="text-xs font-medium text-muted-foreground">Type</label>
			<select
				id="type-filter"
				class="h-9 rounded-md border border-input bg-background px-3 text-sm"
				bind:value={typeFilter}
				onchange={handleFilterChange}
			>
				<option value="all">All types</option>
				<option value="new_device">New Device</option>
				<option value="new_location">New Location</option>
				<option value="failed_attempts">Failed Attempts</option>
				<option value="password_change">Password Change</option>
				<option value="mfa_disabled">MFA Disabled</option>
			</select>
		</div>
		<div class="space-y-1">
			<label for="severity-filter" class="text-xs font-medium text-muted-foreground"
				>Severity</label
			>
			<select
				id="severity-filter"
				class="h-9 rounded-md border border-input bg-background px-3 text-sm"
				bind:value={severityFilter}
				onchange={handleFilterChange}
			>
				<option value="all">All severities</option>
				<option value="info">Info</option>
				<option value="warning">Warning</option>
				<option value="critical">Critical</option>
			</select>
		</div>
		<div class="space-y-1">
			<label for="ack-filter" class="text-xs font-medium text-muted-foreground">Status</label>
			<select
				id="ack-filter"
				class="h-9 rounded-md border border-input bg-background px-3 text-sm"
				bind:value={acknowledgedFilter}
				onchange={handleFilterChange}
			>
				<option value="all">All</option>
				<option value="false">Unacknowledged</option>
				<option value="true">Acknowledged</option>
			</select>
		</div>
	</div>

	<!-- Error -->
	{#if errorMessage}
		<Alert variant="destructive">
			<AlertDescription class="flex items-center justify-between">
				{errorMessage}
				<Button variant="outline" size="sm" onclick={() => loadAlerts()}>
					<RefreshCw class="mr-1 h-3 w-3" />Retry
				</Button>
			</AlertDescription>
		</Alert>
	{/if}

	<!-- Loading skeleton -->
	{#if loading}
		<div class="space-y-3">
			{#each Array(3) as _}
				<div class="h-24 animate-pulse rounded-lg border bg-muted"></div>
			{/each}
		</div>
	{:else if items.length === 0}
		<EmptyState icon="🔔" title="No security alerts" description="No alerts match your current filters." />
	{:else}
		<!-- Alert list -->
		<div class="space-y-3">
			{#each items as alert (alert.id)}
				<AlertCard {alert} onacknowledge={handleAcknowledge} />
			{/each}
		</div>

		<!-- Pagination -->
		{#if nextCursor}
			<div class="flex justify-center pt-2">
				<Button variant="outline" onclick={() => loadAlerts(true)} disabled={loadingMore}>
					{loadingMore ? 'Loading...' : `Load more (${items.length} of ${total})`}
				</Button>
			</div>
		{/if}
	{/if}
</div>
