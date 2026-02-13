<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import TrendChart from '$lib/components/operations/trend-chart.svelte';
	import { fetchTrend } from '$lib/api/reconciliation-client';
	import type { DiscrepancyTrendResponse } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	const schedules = $derived(data.schedules);

	// Trend tab state
	let trendData = $state<DiscrepancyTrendResponse | null>(data.trend);
	let trendConnectorFilter = $state('');
	let trendFrom = $state('');
	let trendTo = $state('');
	let trendLoading = $state(false);

	// Unique connectors from schedules for the filter dropdown
	const connectorOptions = $derived(() => {
		const seen = new Map<string, string>();
		for (const s of schedules) {
			if (!seen.has(s.connector_id)) {
				seen.set(s.connector_id, s.connector_name ?? s.connector_id);
			}
		}
		return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
	});

	async function refreshTrend() {
		trendLoading = true;
		try {
			trendData = await fetchTrend({
				connector_id: trendConnectorFilter || undefined,
				from: trendFrom || undefined,
				to: trendTo || undefined
			});
		} catch {
			trendData = null;
		} finally {
			trendLoading = false;
		}
	}

	function formatDate(dateStr: string | null | undefined): string {
		if (!dateStr) return '---';
		return new Date(dateStr).toLocaleString();
	}
</script>

<PageHeader
	title="Reconciliation Overview"
	description="Global reconciliation schedules and discrepancy trends across all connectors"
/>

<Tabs value="schedules">
	<TabsList>
		<TabsTrigger value="schedules">Schedules</TabsTrigger>
		<TabsTrigger value="trend">Trend</TabsTrigger>
	</TabsList>

	<TabsContent value="schedules">
		{#if schedules.length === 0}
			<EmptyState
				title="No reconciliation schedules"
				description="No connectors have reconciliation schedules configured yet."
				icon="calendar"
			/>
		{:else}
			<div class="mt-4 rounded-md border">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b bg-muted/50">
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Connector</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Mode</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Frequency</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Enabled</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Last Run</th>
							<th class="px-4 py-3 text-left font-medium text-muted-foreground">Next Run</th>
						</tr>
					</thead>
					<tbody>
						{#each schedules as schedule}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="px-4 py-3">
									<a
										href="/connectors/{schedule.connector_id}/reconciliation/schedule"
										class="text-primary hover:underline"
									>
										{schedule.connector_name ?? schedule.connector_id}
									</a>
								</td>
								<td class="px-4 py-3">
									<span
										class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {schedule.mode === 'full'
											? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
											: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300'}"
									>
										{schedule.mode}
									</span>
								</td>
								<td class="px-4 py-3 text-muted-foreground capitalize">
									{schedule.frequency}
								</td>
								<td class="px-4 py-3">
									{#if schedule.enabled}
										<span
											class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900 dark:text-green-300"
										>
											Enabled
										</span>
									{:else}
										<span
											class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400"
										>
											Disabled
										</span>
									{/if}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{formatDate(schedule.last_run_at)}
								</td>
								<td class="px-4 py-3 text-muted-foreground">
									{formatDate(schedule.next_run_at)}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</TabsContent>

	<TabsContent value="trend">
		<div class="mt-4 space-y-4">
			<!-- Trend filters -->
			<div class="flex flex-wrap items-end gap-3">
				<div>
					<label for="trend-connector" class="block text-sm font-medium">Connector</label>
					<select
						id="trend-connector"
						bind:value={trendConnectorFilter}
						onchange={refreshTrend}
						class="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						<option value="">All connectors</option>
						{#each connectorOptions() as opt}
							<option value={opt.id}>{opt.name}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="trend-from" class="block text-sm font-medium">From</label>
					<input
						id="trend-from"
						type="date"
						bind:value={trendFrom}
						onchange={refreshTrend}
						class="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
				<div>
					<label for="trend-to" class="block text-sm font-medium">To</label>
					<input
						id="trend-to"
						type="date"
						bind:value={trendTo}
						onchange={refreshTrend}
						class="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					/>
				</div>
			</div>

			<!-- Chart -->
			{#if trendLoading}
				<div class="flex h-48 items-center justify-center">
					<p class="text-sm text-muted-foreground">Loading trend data...</p>
				</div>
			{:else if trendData && trendData.data_points.length > 0}
				<div class="rounded-lg border p-4">
					<h3 class="mb-4 text-sm font-medium text-muted-foreground">
						Discrepancy Trend
						{#if trendData.from && trendData.to}
							<span class="ml-2 font-normal">
								({new Date(trendData.from).toLocaleDateString()} &ndash; {new Date(trendData.to).toLocaleDateString()})
							</span>
						{/if}
					</h3>
					<TrendChart dataPoints={trendData.data_points} />
				</div>
			{:else}
				<EmptyState
					title="No trend data"
					description="No discrepancy trend data is available for the selected filters. Run some reconciliations to generate trend data."
					icon="chart"
				/>
			{/if}
		</div>
	</TabsContent>
</Tabs>
