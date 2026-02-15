<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '$lib/components/ui/tabs';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';
	import {
		healthCheckScimTargetClient,
		triggerScimSyncClient,
		triggerScimReconciliationClient,
		fetchScimSyncRuns,
		fetchScimProvisioningLog,
		fetchScimTargetMappings,
		replaceScimTargetMappingsClient,
		resetScimTargetMappingDefaultsClient
	} from '$lib/api/scim-targets-client';
	import type {
		ScimTargetHealthCheckResponse,
		ScimSyncRun,
		ScimProvisioningLog,
		ScimTargetMappingEntry
	} from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let isHealthChecking = $state(false);
	let healthResult = $state<ScimTargetHealthCheckResponse | null>(null);
	let isSyncing = $state(false);
	let isReconciling = $state(false);
	let showDeleteDialog = $state(false);

	// Lazy-loaded tab data
	let syncRuns = $state<ScimSyncRun[]>([]);
	let syncRunsTotal = $state(0);
	let syncRunsLoaded = $state(false);
	let syncRunsLoading = $state(false);

	let provLogs = $state<ScimProvisioningLog[]>([]);
	let provLogsTotal = $state(0);
	let provLogsLoaded = $state(false);
	let provLogsLoading = $state(false);

	let mappings = $state<ScimTargetMappingEntry[]>([]);
	let mappingsLoaded = $state(false);
	let mappingsLoading = $state(false);

	const HEALTH_OK_STATUSES = ['active', 'healthy', 'ok', 'reachable'];

	function isHealthOk(status: string): boolean {
		return HEALTH_OK_STATUSES.includes(status.toLowerCase());
	}

	async function handleHealthCheck() {
		isHealthChecking = true;
		healthResult = null;
		try {
			healthResult = await healthCheckScimTargetClient(data.target.id);
			addToast('success', `Health check: ${healthResult.status}`);
			await invalidateAll();
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Health check failed');
		} finally {
			isHealthChecking = false;
		}
	}

	async function handleSync() {
		isSyncing = true;
		try {
			const result = await triggerScimSyncClient(data.target.id);
			addToast('success', result.message ?? 'Sync triggered');
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Sync failed');
		} finally {
			isSyncing = false;
		}
	}

	async function handleReconcile() {
		isReconciling = true;
		try {
			await triggerScimReconciliationClient(data.target.id);
			addToast('success', 'Reconciliation started');
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Reconciliation failed');
		} finally {
			isReconciling = false;
		}
	}

	async function loadSyncRuns(reset = false) {
		if (syncRunsLoaded && !reset) return;
		syncRunsLoading = true;
		try {
			const result = await fetchScimSyncRuns(data.target.id, {
				limit: 20,
				offset: reset ? 0 : syncRuns.length
			});
			syncRuns = reset ? result.items : [...syncRuns, ...result.items];
			syncRunsTotal = result.total;
			syncRunsLoaded = true;
		} catch {
			// May not have any runs yet
		} finally {
			syncRunsLoading = false;
		}
	}

	async function loadProvisioningLog(reset = false) {
		if (provLogsLoaded && !reset) return;
		provLogsLoading = true;
		try {
			const result = await fetchScimProvisioningLog(data.target.id, {
				limit: 20,
				offset: reset ? 0 : provLogs.length
			});
			provLogs = reset ? result.items : [...provLogs, ...result.items];
			provLogsTotal = result.total;
			provLogsLoaded = true;
		} catch {
			// May not have any logs yet
		} finally {
			provLogsLoading = false;
		}
	}

	async function loadMappings() {
		if (mappingsLoaded) return;
		mappingsLoading = true;
		try {
			const result = await fetchScimTargetMappings(data.target.id);
			mappings = result.mappings;
			mappingsLoaded = true;
		} catch {
			// Mappings may not exist yet
		} finally {
			mappingsLoading = false;
		}
	}

	async function handleResetMappings() {
		try {
			const result = await resetScimTargetMappingDefaultsClient(data.target.id);
			mappings = result.mappings;
			addToast('success', 'Mappings reset to defaults');
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to reset mappings');
		}
	}

	function removeMappingAt(index: number) {
		mappings = mappings.filter((_, i) => i !== index);
	}

	async function handleSaveMappings() {
		try {
			const result = await replaceScimTargetMappingsClient(data.target.id, { mappings });
			mappings = result.mappings;
			addToast('success', 'Mappings saved');
		} catch (e) {
			addToast('error', e instanceof Error ? e.message : 'Failed to save mappings');
		}
	}

	function addMapping(resourceType: string) {
		mappings = [...mappings, {
			source_field: '',
			target_scim_path: '',
			mapping_type: 'direct',
			constant_value: null,
			transform: null,
			resource_type: resourceType
		}];
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'inactive':
				return '';
			case 'unreachable':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'error':
				return '';
			default:
				return '';
		}
	}

	function statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'active':
				return 'default';
			case 'inactive':
				return 'secondary';
			case 'error':
				return 'destructive';
			case 'unreachable':
				return 'secondary';
			default:
				return 'secondary';
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}

	function handleTabChange(v: string | undefined) {
		if (v === 'sync-runs') loadSyncRuns();
		if (v === 'provisioning-log') loadProvisioningLog();
		if (v === 'mappings') loadMappings();
	}

	const mappingsByType = $derived(
		mappings.reduce<Record<string, ScimTargetMappingEntry[]>>((acc, m) => {
			const key = m.resource_type || 'Other';
			if (!acc[key]) acc[key] = [];
			acc[key].push(m);
			return acc;
		}, {})
	);
</script>

<!-- Header -->
<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.target.name} description="SCIM target details" />
		<Badge
			variant={statusVariant(data.target.status)}
			class={statusBadgeClass(data.target.status)}
		>
			{data.target.status}
		</Badge>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/settings/scim-targets/{data.target.id}/edit"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Edit
		</a>
		<Button variant="outline" onclick={handleHealthCheck} disabled={isHealthChecking}>
			{isHealthChecking ? 'Checking...' : 'Health Check'}
		</Button>
		<Button variant="outline" onclick={handleSync} disabled={isSyncing}>
			{isSyncing ? 'Syncing...' : 'Sync'}
		</Button>
		<Button variant="outline" onclick={handleReconcile} disabled={isReconciling}>
			{isReconciling ? 'Reconciling...' : 'Reconcile'}
		</Button>
		<Button
			variant="destructive"
			onclick={() => { showDeleteDialog = true; }}
		>
			Delete
		</Button>
		<a
			href="/settings/scim-targets"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back
		</a>
	</div>
</div>

{#if healthResult}
	{@const ok = isHealthOk(healthResult.status)}
	<div class="mt-4 max-w-lg rounded-md border p-4 {ok ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}">
		<div class="flex items-center gap-2">
			<span class="font-medium {ok ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}">
				Health Check: {healthResult.status}
			</span>
		</div>
		{#if healthResult.error}
			<p class="mt-1 text-sm text-muted-foreground">{healthResult.error}</p>
		{/if}
		<p class="mt-1 text-xs text-muted-foreground">Checked at: {formatDate(healthResult.checked_at)}</p>
	</div>
{/if}

<!-- Tabs -->
<Tabs value="overview" class="mt-4" onValueChange={handleTabChange}>
	<TabsList>
		<TabsTrigger value="overview">Overview</TabsTrigger>
		<TabsTrigger value="configuration">Configuration</TabsTrigger>
		<TabsTrigger value="health">Health</TabsTrigger>
		<TabsTrigger value="mappings">Mappings</TabsTrigger>
		<TabsTrigger value="sync-runs">Sync Runs</TabsTrigger>
		<TabsTrigger value="provisioning-log">Provisioning Log</TabsTrigger>
	</TabsList>

	<!-- Overview Tab -->
	<TabsContent value="overview">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Target information</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-3">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Name</span>
						<span class="text-sm font-medium">{data.target.name}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Base URL</span>
						<span class="text-sm font-mono">{data.target.base_url}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Auth Method</span>
						<span class="text-sm">{data.target.auth_method === 'oauth2' ? 'OAuth 2.0' : 'Bearer Token'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Status</span>
						<Badge
							variant={statusVariant(data.target.status)}
							class={statusBadgeClass(data.target.status)}
						>
							{data.target.status}
						</Badge>
					</div>

					<Separator />

					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Deprovisioning</span>
						<span class="text-sm">{data.target.deprovisioning_strategy}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">TLS Verify</span>
						<span class="text-sm">{data.target.tls_verify ? 'Yes' : 'No'}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Rate Limit</span>
						<span class="text-sm">{data.target.rate_limit_per_minute}/min</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Timeout</span>
						<span class="text-sm">{data.target.request_timeout_secs}s</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Max Retries</span>
						<span class="text-sm">{data.target.max_retries}</span>
					</div>

					<Separator />

					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Created</span>
						<span class="text-sm">{formatDate(data.target.created_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Updated</span>
						<span class="text-sm">{formatDate(data.target.updated_at)}</span>
					</div>
				</div>
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Configuration Tab (Service Provider Config) -->
	<TabsContent value="configuration">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Service Provider Configuration</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				{#if data.target.service_provider_config}
					<pre class="max-h-96 overflow-auto rounded-md bg-muted p-4 font-mono text-xs">{JSON.stringify(data.target.service_provider_config, null, 2)}</pre>
				{:else}
					<p class="text-sm text-muted-foreground">
						No service provider configuration available. Run a health check to discover it.
					</p>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Health Tab -->
	<TabsContent value="health">
		<Card class="max-w-lg">
			<CardHeader>
				<h2 class="text-xl font-semibold">Health status</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-muted-foreground">Status</span>
						<div class="flex items-center gap-2">
							<span
								class="inline-block h-2.5 w-2.5 rounded-full {data.target.status === 'active' ? 'bg-green-500' : data.target.status === 'unreachable' ? 'bg-yellow-500' : 'bg-red-500'}"
							></span>
							<span class="text-sm font-medium">{data.target.status}</span>
						</div>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Last Health Check</span>
						<span class="text-sm">
							{data.target.last_health_check_at ? formatDate(data.target.last_health_check_at) : 'Never'}
						</span>
					</div>
					{#if data.target.last_health_check_error}
						<Separator />
						<div>
							<span class="text-sm text-muted-foreground">Last Error</span>
							<p class="mt-1 text-sm text-destructive">{data.target.last_health_check_error}</p>
						</div>
					{/if}
				</div>
				<Button variant="outline" onclick={handleHealthCheck} disabled={isHealthChecking} class="mt-4">
					{isHealthChecking ? 'Checking...' : 'Run Health Check'}
				</Button>
			</CardContent>
		</Card>
	</TabsContent>

	<!-- Mappings Tab -->
	<TabsContent value="mappings">
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold">Attribute Mappings</h2>
				<div class="flex gap-2">
					<Button variant="outline" onclick={handleResetMappings}>Reset to Defaults</Button>
					{#if mappings.length > 0}
						<Button onclick={handleSaveMappings}>Save Mappings</Button>
					{/if}
				</div>
			</div>

			{#if mappingsLoading}
				<p class="text-sm text-muted-foreground">Loading mappings...</p>
			{:else if mappings.length === 0}
				<div class="space-y-2">
					<p class="text-sm text-muted-foreground">No mappings configured. Click "Reset to Defaults" to populate, or add mappings manually.</p>
					<div class="flex gap-2">
						<Button variant="outline" size="sm" onclick={() => addMapping('User')}>Add User Mapping</Button>
						<Button variant="outline" size="sm" onclick={() => addMapping('Group')}>Add Group Mapping</Button>
					</div>
				</div>
			{:else}
				{#each Object.entries(mappingsByType) as [resourceType, typeMappings]}
					<Card>
						<CardHeader>
							<div class="flex items-center justify-between">
								<h3 class="text-lg font-medium">{resourceType} Mappings</h3>
								<Button variant="outline" size="sm" onclick={() => addMapping(resourceType)}>Add</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div class="rounded-md border">
								<table class="w-full text-sm">
									<thead>
										<tr class="border-b bg-muted/50">
											<th class="px-4 py-2 text-left font-medium text-muted-foreground">Source Field</th>
											<th class="px-4 py-2 text-left font-medium text-muted-foreground">SCIM Path</th>
											<th class="px-4 py-2 text-left font-medium text-muted-foreground">Type</th>
											<th class="px-4 py-2 text-left font-medium text-muted-foreground">Transform</th>
											<th class="px-4 py-2 text-left font-medium text-muted-foreground"></th>
										</tr>
									</thead>
									<tbody>
										{#each typeMappings as mapping}
											{@const globalIndex = mappings.indexOf(mapping)}
											<tr class="border-b">
												<td class="px-4 py-2">
													<input
														type="text"
														class="w-full rounded border border-input bg-background px-2 py-1 font-mono text-xs"
														value={mapping.source_field}
														onchange={(e) => { mappings[globalIndex].source_field = (e.target as HTMLInputElement).value; }}
													/>
												</td>
												<td class="px-4 py-2">
													<input
														type="text"
														class="w-full rounded border border-input bg-background px-2 py-1 font-mono text-xs"
														value={mapping.target_scim_path}
														onchange={(e) => { mappings[globalIndex].target_scim_path = (e.target as HTMLInputElement).value; }}
													/>
												</td>
												<td class="px-4 py-2">
													<select
														class="w-full rounded border border-input bg-background px-2 py-1 text-xs"
														value={mapping.mapping_type}
														onchange={(e) => { mappings[globalIndex].mapping_type = (e.target as HTMLSelectElement).value; }}
													>
														<option value="direct">direct</option>
														<option value="constant">constant</option>
														<option value="transform">transform</option>
													</select>
												</td>
												<td class="px-4 py-2">
													<input
														type="text"
														class="w-full rounded border border-input bg-background px-2 py-1 text-xs"
														value={mapping.transform ?? ''}
														placeholder="—"
														onchange={(e) => { mappings[globalIndex].transform = (e.target as HTMLInputElement).value || null; }}
													/>
												</td>
												<td class="px-4 py-2">
													<button
														type="button"
														class="text-xs text-destructive hover:underline"
														onclick={() => removeMappingAt(globalIndex)}
													>
														Remove
													</button>
												</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				{/each}
			{/if}
		</div>
	</TabsContent>

	<!-- Sync Runs Tab -->
	<TabsContent value="sync-runs">
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Sync Runs</h2>

			{#if syncRunsLoading && syncRuns.length === 0}
				<p class="text-sm text-muted-foreground">Loading sync runs...</p>
			{:else if syncRuns.length === 0}
				<p class="text-sm text-muted-foreground">No sync runs yet. Trigger a sync to see run history.</p>
			{:else}
				<div class="rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Processed</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Failed</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Started</th>
							</tr>
						</thead>
						<tbody>
							{#each syncRuns as run}
								<tr class="border-b transition-colors hover:bg-muted/50">
									<td class="px-4 py-3">{run.sync_type}</td>
									<td class="px-4 py-3">
										<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {run.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : run.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}">
											{run.status}
										</span>
									</td>
									<td class="px-4 py-3">{run.total_processed ?? '—'}</td>
									<td class="px-4 py-3">{run.total_created ?? '—'}</td>
									<td class="px-4 py-3">{run.total_updated ?? '—'}</td>
									<td class="px-4 py-3">{run.total_failed ?? '—'}</td>
									<td class="px-4 py-3 text-muted-foreground">{formatDate(run.started_at)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="mt-2 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Showing {syncRuns.length} of {syncRunsTotal}</p>
					{#if syncRuns.length < syncRunsTotal}
						<Button variant="outline" size="sm" disabled={syncRunsLoading} onclick={() => { syncRunsLoaded = false; loadSyncRuns(); }}>
							{syncRunsLoading ? 'Loading...' : 'Load More'}
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</TabsContent>

	<!-- Provisioning Log Tab -->
	<TabsContent value="provisioning-log">
		<div class="space-y-4">
			<h2 class="text-xl font-semibold">Provisioning Log</h2>

			{#if provLogsLoading && provLogs.length === 0}
				<p class="text-sm text-muted-foreground">Loading provisioning log...</p>
			{:else if provLogs.length === 0}
				<p class="text-sm text-muted-foreground">No provisioning log entries yet.</p>
			{:else}
				<div class="rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Operation</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Resource Type</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">HTTP Method</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Duration</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Error</th>
								<th class="px-4 py-3 text-left font-medium text-muted-foreground">Time</th>
							</tr>
						</thead>
						<tbody>
							{#each provLogs as log}
								<tr class="border-b transition-colors hover:bg-muted/50">
									<td class="px-4 py-3">{log.operation}</td>
									<td class="px-4 py-3">{log.resource_type}</td>
									<td class="px-4 py-3 font-mono text-xs">{log.http_method ?? '—'}</td>
									<td class="px-4 py-3">
										{#if log.http_status}
											<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {log.http_status >= 200 && log.http_status < 300 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}">
												{log.http_status}
											</span>
										{:else}
											—
										{/if}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{log.duration_ms != null ? `${log.duration_ms}ms` : '—'}
									</td>
									<td class="px-4 py-3 text-destructive max-w-[200px] truncate">
										{log.error ?? '—'}
									</td>
									<td class="px-4 py-3 text-muted-foreground">{formatDate(log.created_at)}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
				<div class="mt-2 flex items-center justify-between">
					<p class="text-sm text-muted-foreground">Showing {provLogs.length} of {provLogsTotal}</p>
					{#if provLogs.length < provLogsTotal}
						<Button variant="outline" size="sm" disabled={provLogsLoading} onclick={() => { provLogsLoaded = false; loadProvisioningLog(); }}>
							{provLogsLoading ? 'Loading...' : 'Load More'}
						</Button>
					{/if}
				</div>
			{/if}
		</div>
	</TabsContent>
</Tabs>

<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete SCIM Target</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{data.target.name}"? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => { showDeleteDialog = false; }}>Cancel</Button>
			<form method="POST" action="?/delete" use:formEnhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'redirect') {
						addToast('success', 'SCIM target deleted');
						await update();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to delete');
						showDeleteDialog = false;
					}
				};
			}}>
				<Button type="submit" variant="destructive">Delete</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
