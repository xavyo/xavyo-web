<script lang="ts">
	import type { SiemDestination, SiemBatchExport } from '$lib/api/types';
	import {
		fetchSiemDestinations,
		fetchSiemExports
	} from '$lib/api/siem-client';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Card, CardContent } from '$lib/components/ui/card';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tabs = [
		{ id: 'destinations', label: 'Destinations' },
		{ id: 'batch-exports', label: 'Batch Exports' }
	] as const;

	type TabId = (typeof tabs)[number]['id'];

	let activeTab: TabId = $state('destinations');

	// --- Destinations tab state ---
	// svelte-ignore state_referenced_locally
	let destinations: SiemDestination[] = $state(data.destinations.items);
	// svelte-ignore state_referenced_locally
	let destinationsTotal = $state(data.destinations.total);
	let destinationsOffset = $state(0);
	let destinationsLoading = $state(false);
	const destinationsLimit = 20;

	// --- Batch Exports tab state ---
	// svelte-ignore state_referenced_locally
	let exports: SiemBatchExport[] = $state(data.exports.items);
	// svelte-ignore state_referenced_locally
	let exportsTotal = $state(data.exports.total);
	let exportsOffset = $state(0);
	let exportsLoading = $state(false);
	let exportsLoaded = $state(false);
	const exportsLimit = 20;

	// Lazy-load exports on tab switch
	$effect(() => {
		if (activeTab === 'batch-exports' && !exportsLoaded && !exportsLoading) {
			loadExports();
		}
	});

	// --- Destinations helpers ---
	async function loadDestinations() {
		destinationsLoading = true;
		try {
			const result = await fetchSiemDestinations({
				limit: destinationsLimit,
				offset: destinationsOffset
			});
			destinations = result.items;
			destinationsTotal = result.total;
		} catch {
			addToast('error', 'Failed to load SIEM destinations');
		} finally {
			destinationsLoading = false;
		}
	}

	function handleDestinationsPrev() {
		if (destinationsOffset <= 0) return;
		destinationsOffset = Math.max(0, destinationsOffset - destinationsLimit);
		loadDestinations();
	}

	function handleDestinationsNext() {
		if (destinationsOffset + destinationsLimit >= destinationsTotal) return;
		destinationsOffset += destinationsLimit;
		loadDestinations();
	}

	// --- Exports helpers ---
	async function loadExports() {
		exportsLoading = true;
		try {
			const result = await fetchSiemExports({
				limit: exportsLimit,
				offset: exportsOffset
			});
			exports = result.items;
			exportsTotal = result.total;
			exportsLoaded = true;
		} catch {
			addToast('error', 'Failed to load batch exports');
		} finally {
			exportsLoading = false;
		}
	}

	function handleExportsPrev() {
		if (exportsOffset <= 0) return;
		exportsOffset = Math.max(0, exportsOffset - exportsLimit);
		loadExports();
	}

	function handleExportsNext() {
		if (exportsOffset + exportsLimit >= exportsTotal) return;
		exportsOffset += exportsLimit;
		loadExports();
	}

	// --- Display helpers ---
	function formatDate(dateStr: string | null): string {
		if (!dateStr || isNaN(new Date(dateStr).getTime())) return '\u2014';
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatDateTime(dateStr: string | null): string {
		if (!dateStr || isNaN(new Date(dateStr).getTime())) return '\u2014';
		return new Date(dateStr).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const typeLabels: Record<string, string> = {
		syslog_tcp_tls: 'Syslog TLS',
		syslog_udp: 'Syslog UDP',
		webhook: 'Webhook',
		splunk_hec: 'Splunk HEC'
	};

	const formatLabels: Record<string, string> = {
		cef: 'CEF',
		syslog_rfc5424: 'Syslog RFC5424',
		json: 'JSON',
		csv: 'CSV'
	};

	const circuitStateColors: Record<string, string> = {
		closed: 'text-green-600 dark:text-green-400',
		open: 'text-red-600 dark:text-red-400',
		half_open: 'text-yellow-600 dark:text-yellow-400'
	};

	const circuitStateLabels: Record<string, string> = {
		closed: 'Closed',
		open: 'Open',
		half_open: 'Half Open'
	};

	const exportStatusBadgeClass: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
		completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		expired: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
	};
</script>

<PageHeader
	title="SIEM Export"
	description="Configure SIEM destinations for real-time event streaming and manage batch exports."
/>

<div class="-mb-px flex gap-4 border-b border-border" role="tablist" aria-label="SIEM Export tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			id="tab-{tab.id}"
			class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</div>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	<!-- ===== DESTINATIONS TAB ===== -->
	{#if activeTab === 'destinations'}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					{destinationsTotal} destination{destinationsTotal !== 1 ? 's' : ''}
				</p>
				<a
					href="/governance/siem/create"
					class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
				>
					Add Destination
				</a>
			</div>

			{#if destinationsLoading}
				<div class="animate-pulse space-y-3">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-48 rounded bg-muted"></div>
				</div>
			{:else if destinations.length === 0}
				<Card>
					<CardContent class="py-12 text-center">
						<p class="text-muted-foreground">No SIEM destinations configured yet.</p>
						<a
							href="/governance/siem/create"
							class="mt-2 inline-block text-sm text-primary hover:underline"
						>
							Create your first destination
						</a>
					</CardContent>
				</Card>
			{:else}
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-4 py-3 text-left font-medium">Name</th>
								<th class="px-4 py-3 text-left font-medium">Type</th>
								<th class="px-4 py-3 text-left font-medium">Host</th>
								<th class="px-4 py-3 text-left font-medium">Format</th>
								<th class="px-4 py-3 text-left font-medium">Status</th>
								<th class="px-4 py-3 text-left font-medium">Circuit State</th>
								<th class="px-4 py-3 text-left font-medium">Created</th>
							</tr>
						</thead>
						<tbody>
							{#each destinations as dest}
								<tr class="border-b last:border-0 hover:bg-muted/30">
									<td class="px-4 py-3">
										<a
											href="/governance/siem/{dest.id}"
											class="font-medium text-primary hover:underline"
										>
											{dest.name}
										</a>
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{typeLabels[dest.destination_type] ?? dest.destination_type}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{dest.endpoint_host}{dest.endpoint_port ? `:${dest.endpoint_port}` : ''}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatLabels[dest.export_format] ?? dest.export_format}
									</td>
									<td class="px-4 py-3">
										{#if dest.enabled}
											<span
												class="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
											>
												Enabled
											</span>
										{:else}
											<span
												class="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
											>
												Disabled
											</span>
										{/if}
									</td>
									<td class="px-4 py-3">
										<span class={circuitStateColors[dest.circuit_state] ?? 'text-muted-foreground'}>
											{circuitStateLabels[dest.circuit_state] ?? dest.circuit_state}
										</span>
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatDate(dest.created_at)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if destinationsTotal > destinationsLimit}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">
							Showing {destinationsOffset + 1} to {Math.min(destinationsOffset + destinationsLimit, destinationsTotal)} of {destinationsTotal}
						</span>
						<div class="flex gap-2">
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={destinationsOffset <= 0}
								onclick={handleDestinationsPrev}
							>
								Previous
							</button>
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={destinationsOffset + destinationsLimit >= destinationsTotal}
								onclick={handleDestinationsNext}
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>

	<!-- ===== BATCH EXPORTS TAB ===== -->
	{:else if activeTab === 'batch-exports'}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					{exportsTotal} export{exportsTotal !== 1 ? 's' : ''}
				</p>
			</div>

			{#if exportsLoading}
				<div class="animate-pulse space-y-3">
					<div class="h-8 rounded bg-muted"></div>
					<div class="h-48 rounded bg-muted"></div>
				</div>
			{:else if exports.length === 0}
				<Card>
					<CardContent class="py-12 text-center">
						<p class="text-muted-foreground">No batch exports yet.</p>
					</CardContent>
				</Card>
			{:else}
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-4 py-3 text-left font-medium">ID</th>
								<th class="px-4 py-3 text-left font-medium">Date Range</th>
								<th class="px-4 py-3 text-left font-medium">Format</th>
								<th class="px-4 py-3 text-left font-medium">Status</th>
								<th class="px-4 py-3 text-right font-medium">Events</th>
								<th class="px-4 py-3 text-left font-medium">Created</th>
							</tr>
						</thead>
						<tbody>
							{#each exports as exp}
								<tr class="border-b last:border-0 hover:bg-muted/30">
									<td class="px-4 py-3 font-mono text-xs text-muted-foreground">
										{exp.id.slice(0, 8)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatDate(exp.date_range_start)} - {formatDate(exp.date_range_end)}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatLabels[exp.output_format] ?? exp.output_format}
									</td>
									<td class="px-4 py-3">
										<span
											class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {exportStatusBadgeClass[exp.status] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}"
										>
											{exp.status}
										</span>
									</td>
									<td class="px-4 py-3 text-right">
										{exp.total_events != null ? exp.total_events.toLocaleString() : '\u2014'}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatDateTime(exp.created_at)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				{#if exportsTotal > exportsLimit}
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">
							Showing {exportsOffset + 1} to {Math.min(exportsOffset + exportsLimit, exportsTotal)} of {exportsTotal}
						</span>
						<div class="flex gap-2">
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={exportsOffset <= 0}
								onclick={handleExportsPrev}
							>
								Previous
							</button>
							<button
								class="rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-muted disabled:opacity-50"
								disabled={exportsOffset + exportsLimit >= exportsTotal}
								onclick={handleExportsNext}
							>
								Next
							</button>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>
