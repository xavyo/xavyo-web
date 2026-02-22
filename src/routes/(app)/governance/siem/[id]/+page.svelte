<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { TestConnectivityResponse, SiemExportEvent } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const dest = $derived(data.destination);
	const health = $derived(data.health);
	const deadLetter = $derived(data.deadLetter);

	let showDeleteDialog = $state(false);
	let testing = $state(false);
	let testResult = $state<TestConnectivityResponse | null>(null);
	let redelivering = $state(false);

	const tabs = [
		{ id: 'details', label: 'Details' },
		{ id: 'health', label: 'Health' },
		{ id: 'dead-letter', label: 'Dead Letter' }
	] as const;

	type TabId = (typeof tabs)[number]['id'];
	let activeTab: TabId = $state('details');

	// --- Display helpers ---

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

	const circuitStateBadgeClass: Record<string, string> = {
		closed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
		half_open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
	};

	const circuitStateLabels: Record<string, string> = {
		closed: 'Closed',
		open: 'Open',
		half_open: 'Half Open'
	};

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

	// --- Action handlers ---

	async function handleTest() {
		testing = true;
		testResult = null;
		try {
			const formData = new FormData();
			const res = await fetch(`?/test`, { method: 'POST', body: formData });
			const result = await res.json();
			if (result.type === 'success' && result.data?.testResult) {
				testResult = result.data.testResult as TestConnectivityResponse;
				if (testResult.success) {
					addToast('success', `Connection successful (${testResult.latency_ms}ms)`);
				} else {
					addToast('error', `Connection failed: ${testResult.error}`);
				}
			} else {
				addToast('error', (result.data?.error as string) ?? 'Test failed');
			}
		} catch {
			addToast('error', 'Failed to test connection');
		} finally {
			testing = false;
		}
	}

	async function handleRedeliverAll() {
		redelivering = true;
		try {
			const res = await fetch(`/api/governance/siem/destinations/${dest.id}/dead-letter/redeliver`, {
				method: 'POST'
			});
			if (res.ok) {
				const result = await res.json();
				addToast('success', `Requeued ${result.events_requeued} event(s) for redelivery`);
				await invalidateAll();
			} else {
				addToast('error', 'Failed to redeliver dead letter events');
			}
		} catch {
			addToast('error', 'Failed to redeliver dead letter events');
		} finally {
			redelivering = false;
		}
	}
</script>

<!-- Header -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={dest.name} description="SIEM destination details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {circuitStateBadgeClass[dest.circuit_state] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}"
		>
			{circuitStateLabels[dest.circuit_state] ?? dest.circuit_state}
		</span>
		{#if dest.enabled}
			<span
				class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
			>
				Enabled
			</span>
		{:else}
			<span
				class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-200"
			>
				Disabled
			</span>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/governance/siem/{dest.id}/edit"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Edit
		</a>
		<Button variant="outline" disabled={testing} onclick={handleTest}>
			{testing ? 'Testing...' : 'Test Connection'}
		</Button>
		{#if dest.enabled}
			<form
				method="POST"
				action="?/disable"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Destination disabled');
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to disable');
						}
					};
				}}
			>
				<Button type="submit" variant="outline">Disable</Button>
			</form>
		{:else}
			<form
				method="POST"
				action="?/enable"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Destination enabled');
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to enable');
						}
					};
				}}
			>
				<Button type="submit" variant="outline">Enable</Button>
			</form>
		{/if}
		<Button
			variant="destructive"
			onclick={() => {
				showDeleteDialog = true;
			}}
		>
			Delete
		</Button>
		<a
			href="/governance/siem"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to SIEM
		</a>
	</div>
</div>

<!-- Test Result Banner -->
{#if testResult}
	<div
		class="mt-4 rounded-md border p-4 {testResult.success
			? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
			: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}"
	>
		<p class="text-sm font-medium {testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}">
			{#if testResult.success}
				Connection test passed{testResult.latency_ms != null ? ` (${testResult.latency_ms}ms latency)` : ''}
			{:else}
				Connection test failed: {testResult.error ?? 'Unknown error'}
			{/if}
		</p>
	</div>
{/if}

<!-- Tabs -->
<div class="mt-6 -mb-px flex gap-4 border-b border-border" role="tablist" aria-label="Destination detail tabs">
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
			{#if tab.id === 'dead-letter' && deadLetter.total > 0}
				<span class="ml-1.5 inline-flex items-center rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
					{deadLetter.total}
				</span>
			{/if}
		</button>
	{/each}
</div>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	<!-- ===== DETAILS TAB ===== -->
	{#if activeTab === 'details'}
		<Card class="max-w-2xl">
			<CardHeader>
				<h2 class="text-xl font-semibold">Configuration</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-3">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Name</span>
						<span class="text-sm font-medium">{dest.name}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Destination Type</span>
						<span class="text-sm font-medium">{typeLabels[dest.destination_type] ?? dest.destination_type}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Endpoint</span>
						<span class="text-sm font-mono">{dest.endpoint_host}{dest.endpoint_port ? `:${dest.endpoint_port}` : ''}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Export Format</span>
						<span class="text-sm font-medium">{formatLabels[dest.export_format] ?? dest.export_format}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Auth Config</span>
						<span class="text-sm font-medium">{dest.has_auth_config ? 'Configured' : 'Not configured'}</span>
					</div>

					<Separator />

					<div class="space-y-2">
						<span class="text-sm text-muted-foreground">Event Filter Categories</span>
						<div class="flex flex-wrap gap-1.5">
							{#if dest.event_type_filter.length > 0}
								{#each dest.event_type_filter as cat}
									<Badge variant="secondary">{cat}</Badge>
								{/each}
							{:else}
								<span class="text-sm text-muted-foreground">All events (no filter)</span>
							{/if}
						</div>
					</div>

					<Separator />

					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Rate Limit</span>
						<span class="text-sm font-medium">{dest.rate_limit_per_second.toLocaleString()} events/sec</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Queue Buffer Size</span>
						<span class="text-sm font-medium">{dest.queue_buffer_size.toLocaleString()}</span>
					</div>

					<Separator />

					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Circuit Breaker Threshold</span>
						<span class="text-sm font-medium">{dest.circuit_breaker_threshold} failures</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Circuit Breaker Cooldown</span>
						<span class="text-sm font-medium">{dest.circuit_breaker_cooldown_secs}s</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Circuit State</span>
						<span
							class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {circuitStateBadgeClass[dest.circuit_state] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}"
						>
							{circuitStateLabels[dest.circuit_state] ?? dest.circuit_state}
						</span>
					</div>
					{#if dest.circuit_last_failure_at}
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Last Circuit Failure</span>
							<span class="text-sm">{formatDateTime(dest.circuit_last_failure_at)}</span>
						</div>
					{/if}

					<!-- Splunk-specific fields -->
					{#if dest.destination_type === 'splunk_hec'}
						<Separator />
						<h3 class="text-sm font-semibold">Splunk Configuration</h3>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Source</span>
							<span class="text-sm font-medium">{dest.splunk_source ?? '\u2014'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Source Type</span>
							<span class="text-sm font-medium">{dest.splunk_sourcetype ?? '\u2014'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Index</span>
							<span class="text-sm font-medium">{dest.splunk_index ?? '\u2014'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">ACK Enabled</span>
							<span class="text-sm font-medium">{dest.splunk_ack_enabled ? 'Yes' : 'No'}</span>
						</div>
					{/if}

					<!-- Syslog-specific fields -->
					{#if dest.destination_type === 'syslog_tcp_tls' || dest.destination_type === 'syslog_udp'}
						<Separator />
						<h3 class="text-sm font-semibold">Syslog Configuration</h3>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Facility</span>
							<span class="text-sm font-medium">{dest.syslog_facility}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">TLS Certificate Verification</span>
							<span class="text-sm font-medium">{dest.tls_verify_cert ? 'Enabled' : 'Disabled'}</span>
						</div>
					{/if}

					<Separator />

					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Created</span>
						<span class="text-sm">{formatDateTime(dest.created_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Updated</span>
						<span class="text-sm">{formatDateTime(dest.updated_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Created By</span>
						<span class="text-sm font-mono text-muted-foreground">{dest.created_by}</span>
					</div>
				</div>
			</CardContent>
		</Card>

	<!-- ===== HEALTH TAB ===== -->
	{:else if activeTab === 'health'}
		{#if health}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Total Sent</p>
						<p class="mt-1 text-2xl font-bold">{health.total_events_sent.toLocaleString()}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Delivered</p>
						<p class="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
							{health.total_events_delivered.toLocaleString()}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Failed</p>
						<p class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
							{health.total_events_failed.toLocaleString()}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Dropped</p>
						<p class="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
							{health.total_events_dropped.toLocaleString()}
						</p>
					</CardContent>
				</Card>
			</div>

			<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Success Rate</p>
						<p class="mt-1 text-2xl font-bold">
							{Number(health.success_rate_percent).toFixed(1)}%
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Avg Latency</p>
						<p class="mt-1 text-2xl font-bold">
							{health.avg_latency_ms != null ? `${Number(health.avg_latency_ms).toFixed(0)}ms` : '\u2014'}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Dead Letter Count</p>
						<p class="mt-1 text-2xl font-bold {health.dead_letter_count > 0 ? 'text-red-600 dark:text-red-400' : ''}">
							{health.dead_letter_count.toLocaleString()}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent class="pt-6">
						<p class="text-sm text-muted-foreground">Circuit State</p>
						<p class="mt-1">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium {circuitStateBadgeClass[health.circuit_state] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}"
							>
								{circuitStateLabels[health.circuit_state] ?? health.circuit_state}
							</span>
						</p>
					</CardContent>
				</Card>
			</div>

			<Card class="mt-4 max-w-2xl">
				<CardHeader>
					<h2 class="text-lg font-semibold">Timing</h2>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Last Success</span>
						<span class="text-sm">{formatDateTime(health.last_success_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Last Failure</span>
						<span class="text-sm">{formatDateTime(health.last_failure_at)}</span>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card>
				<CardContent class="py-12 text-center">
					<p class="text-muted-foreground">No health data available yet.</p>
					<p class="mt-1 text-sm text-muted-foreground">
						Health metrics will appear after the destination starts processing events.
					</p>
				</CardContent>
			</Card>
		{/if}

	<!-- ===== DEAD LETTER TAB ===== -->
	{:else if activeTab === 'dead-letter'}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<p class="text-sm text-muted-foreground">
					{deadLetter.total} dead letter event{deadLetter.total !== 1 ? 's' : ''}
				</p>
				{#if deadLetter.total > 0}
					<Button
						variant="outline"
						disabled={redelivering}
						onclick={handleRedeliverAll}
					>
						{redelivering ? 'Redelivering...' : 'Redeliver All'}
					</Button>
				{/if}
			</div>

			{#if deadLetter.items.length === 0}
				<Card>
					<CardContent class="py-12 text-center">
						<p class="text-muted-foreground">No dead letter events.</p>
						<p class="mt-1 text-sm text-muted-foreground">
							Events that fail delivery after all retries will appear here.
						</p>
					</CardContent>
				</Card>
			{:else}
				<div class="overflow-x-auto rounded-md border border-border">
					<table class="w-full text-sm">
						<thead class="border-b bg-muted/50">
							<tr>
								<th class="px-4 py-3 text-left font-medium">Event Type</th>
								<th class="px-4 py-3 text-left font-medium">Event Timestamp</th>
								<th class="px-4 py-3 text-right font-medium">Retries</th>
								<th class="px-4 py-3 text-left font-medium">Error</th>
								<th class="px-4 py-3 text-left font-medium">Last Attempt</th>
							</tr>
						</thead>
						<tbody>
							{#each deadLetter.items as event}
								<tr class="border-b last:border-0 hover:bg-muted/30">
									<td class="px-4 py-3 font-medium">{event.source_event_type}</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatDateTime(event.event_timestamp)}
									</td>
									<td class="px-4 py-3 text-right">{event.retry_count}</td>
									<td class="max-w-[300px] truncate px-4 py-3 text-sm text-muted-foreground" title={event.error_detail ?? ''}>
										{event.error_detail ?? '\u2014'}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{formatDateTime(event.last_attempt_at)}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete SIEM Destination</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{dest.name}"? This action cannot be undone. All
				delivery history and dead letter events will also be removed.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button
				variant="outline"
				onclick={() => {
					showDeleteDialog = false;
				}}>Cancel</Button
			>
			<form
				method="POST"
				action="?/delete"
				use:formEnhance={() => {
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							addToast('success', 'SIEM destination deleted');
							await update();
						} else if (result.type === 'failure') {
							addToast('error', (result.data?.error as string) || 'Failed to delete');
							showDeleteDialog = false;
						}
					};
				}}
			>
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
