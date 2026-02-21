<script lang="ts">
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { addToast } from '$lib/stores/toast.svelte';
	import { fetchDiscoveredTools, importSelectedTools, fetchSyncCheck } from '$lib/api/nhi-discovery-client';
	import { bulkGrantToolPermissionsClient } from '$lib/api/nhi-permissions-client';
	import type { DiscoveredTool, GatewayError, ImportResult, SyncCheckResult, NhiListResponse, BulkGrantResponse } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedGateway: string = $state('');
	let tools: DiscoveredTool[] = $state([]);
	let selectedTools: Set<string> = $state(new Set());
	let isDiscovering: boolean = $state(false);
	let isImporting: boolean = $state(false);
	let importResults: ImportResult[] = $state([]);
	let showResults: boolean = $state(false);
	let hasDiscovered: boolean = $state(false);
	let discoveryErrors: GatewayError[] = $state([]);
	let showConfirmDialog: boolean = $state(false);
	let isSyncChecking: boolean = $state(false);
	let syncResult: SyncCheckResult | null = $state(null);
	let showSyncResults: boolean = $state(false);
	let grantAgentId: string = $state('');
	let agents: { id: string; name: string }[] = $state([]);
	let agentsLoading: boolean = $state(false);
	let isGranting: boolean = $state(false);
	let grantResults: BulkGrantResponse | null = $state(null);

	let allSelected = $derived(tools.length > 0 && selectedTools.size === tools.length);
	const successfulImports = $derived(importResults.filter((r) => r.nhi_id && !r.error));

	function toolKey(tool: DiscoveredTool): string {
		return `${tool.gateway_name ?? ''}:${tool.server_name ?? ''}:${tool.name}`;
	}

	function toggleTool(tool: DiscoveredTool) {
		const key = toolKey(tool);
		const next = new Set(selectedTools);
		if (next.has(key)) {
			next.delete(key);
		} else {
			next.add(key);
		}
		selectedTools = next;
	}

	function toggleAll() {
		if (allSelected) {
			selectedTools = new Set();
		} else {
			selectedTools = new Set(tools.map(toolKey));
		}
	}

	async function discover() {
		if (isDiscovering) return;
		isDiscovering = true;
		selectedTools = new Set();
		importResults = [];
		showResults = false;
		discoveryErrors = [];
		try {
			const result = await fetchDiscoveredTools(selectedGateway || undefined);
			tools = result.tools;
			discoveryErrors = result.errors ?? [];
			hasDiscovered = true;
			if (tools.length === 0 && discoveryErrors.length === 0) {
				addToast('info', 'No tools discovered from the selected gateway');
			}
			if (discoveryErrors.length > 0 && tools.length > 0) {
				addToast(
					'info',
					`Discovered ${tools.length} tools. ${discoveryErrors.length} gateway(s) had errors.`
				);
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to discover tools';
			addToast('error', msg);
			tools = [];
		} finally {
			isDiscovering = false;
		}
	}

	function requestImport() {
		const selected = tools.filter((t) => selectedTools.has(toolKey(t)));
		if (selected.length === 0) {
			addToast('info', 'Select at least one tool to import');
			return;
		}
		showConfirmDialog = true;
	}

	async function doImport() {
		if (isImporting) return;
		showConfirmDialog = false;
		const selected = tools.filter((t) => selectedTools.has(toolKey(t)));
		if (selected.length === 0) return;
		isImporting = true;
		try {
			const result = await importSelectedTools(selected);
			importResults = result.results;
			showResults = true;
			const succeeded = result.results.filter((r) => r.nhi_id && !r.error).length;
			const failed = result.results.filter((r) => r.error).length;
			if (failed === 0) {
				addToast('success', `Successfully imported ${succeeded} tool${succeeded !== 1 ? 's' : ''}`);
			} else {
				addToast('info', `Imported ${succeeded}, failed ${failed}`);
			}
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to import tools';
			addToast('error', msg);
		} finally {
			isImporting = false;
		}
	}

	async function loadAgents() {
		if (agents.length > 0 || agentsLoading) return;
		agentsLoading = true;
		try {
			const res = await fetch('/api/nhi?nhi_type=agent&lifecycle_state=active&limit=100');
			if (res.ok) {
				const data: NhiListResponse = await res.json();
				agents = data.data.map((a) => ({ id: a.id, name: a.name }));
			}
		} catch {
			// silent
		} finally {
			agentsLoading = false;
		}
	}

	async function bulkGrant() {
		if (!grantAgentId || isGranting || successfulImports.length === 0) return;
		isGranting = true;
		grantResults = null;
		try {
			const toolIds = successfulImports.map((r) => r.nhi_id!);
			grantResults = await bulkGrantToolPermissionsClient(grantAgentId, { tool_ids: toolIds });
			addToast(
				grantResults.failed === 0 ? 'success' : 'info',
				`Granted ${grantResults.granted} tool${grantResults.granted !== 1 ? 's' : ''}${grantResults.failed > 0 ? `, ${grantResults.failed} failed` : ''}`
			);
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to grant permissions';
			addToast('error', msg);
		} finally {
			isGranting = false;
		}
	}

	async function doSyncCheck() {
		if (isSyncChecking) return;
		isSyncChecking = true;
		syncResult = null;
		showSyncResults = false;
		try {
			syncResult = await fetchSyncCheck(selectedGateway || undefined);
			showSyncResults = true;
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to check sync';
			addToast('error', msg);
		} finally {
			isSyncChecking = false;
		}
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Discover MCP Tools"
		description="Discover tools from AgentGateway and import them as NHI identities"
	/>
	<a
		href="/nhi"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to NHI
	</a>
</div>

{#if data.gatewayError}
	<div class="mb-4 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
		Failed to load gateways: {data.gatewayError}
	</div>
{/if}

<div class="mb-6 flex items-end gap-3">
	<div class="flex flex-col gap-1">
		<label for="gateway-select" class="text-sm font-medium">Gateway</label>
		<select
			id="gateway-select"
			class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
			bind:value={selectedGateway}
		>
			<option value="">All Gateways</option>
			{#each data.gateways as gw}
				<option value={gw.name}>{gw.name}</option>
			{/each}
		</select>
	</div>
	<Button onclick={discover} disabled={isDiscovering}>
		{#if isDiscovering}
			<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			Discovering...
		{:else}
			Discover
		{/if}
	</Button>
	<Button variant="outline" onclick={doSyncCheck} disabled={isSyncChecking}>
		{#if isSyncChecking}
			<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
			</svg>
			Checking...
		{:else}
			Sync Check
		{/if}
	</Button>
</div>

{#if showSyncResults && syncResult}
	<div class="mb-4 rounded-md border p-4">
		<h3 class="mb-3 text-lg font-medium">Sync Check Results</h3>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-md border bg-green-50 p-3 dark:bg-green-950">
				<p class="text-2xl font-bold text-green-700 dark:text-green-300">{syncResult.up_to_date}</p>
				<p class="text-sm text-green-600 dark:text-green-400">Up to date</p>
			</div>
			<div class="rounded-md border bg-yellow-50 p-3 dark:bg-yellow-950">
				<p class="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{syncResult.changed.length}</p>
				<p class="text-sm text-yellow-600 dark:text-yellow-400">Changed</p>
			</div>
			<div class="rounded-md border bg-blue-50 p-3 dark:bg-blue-950">
				<p class="text-2xl font-bold text-blue-700 dark:text-blue-300">{syncResult.new_tools.length}</p>
				<p class="text-sm text-blue-600 dark:text-blue-400">New</p>
			</div>
			<div class="rounded-md border bg-red-50 p-3 dark:bg-red-950">
				<p class="text-2xl font-bold text-red-700 dark:text-red-300">{syncResult.removed.length}</p>
				<p class="text-sm text-red-600 dark:text-red-400">Removed</p>
			</div>
		</div>
		{#if syncResult.changed.length > 0}
			<div class="mt-3">
				<h4 class="mb-1 text-sm font-medium">Changed Tools</h4>
				<div class="space-y-1">
					{#each syncResult.changed as tool}
						<div class="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
							<span class="font-medium">{tool.name}</span>
							<span class="font-mono text-xs text-muted-foreground">
								{tool.old_checksum?.substring(0, 8) ?? '?'}...
								&rarr; {tool.new_checksum?.substring(0, 8) ?? '?'}...
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		{#if syncResult.new_tools.length > 0}
			<div class="mt-3">
				<h4 class="mb-1 text-sm font-medium">New Tools</h4>
				<div class="flex flex-wrap gap-1">
					{#each syncResult.new_tools as name}
						<span class="rounded-md border bg-blue-50 px-2 py-0.5 text-xs dark:bg-blue-950">{name}</span>
					{/each}
				</div>
			</div>
		{/if}
		{#if syncResult.removed.length > 0}
			<div class="mt-3">
				<h4 class="mb-1 text-sm font-medium">Removed Tools</h4>
				<div class="flex flex-wrap gap-1">
					{#each syncResult.removed as name}
						<span class="rounded-md border bg-red-50 px-2 py-0.5 text-xs dark:bg-red-950">{name}</span>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}

{#if discoveryErrors.length > 0}
	<div class="mb-4 rounded-md border border-orange-300 bg-orange-50 p-3 dark:border-orange-700 dark:bg-orange-950">
		<p class="mb-1 text-sm font-medium text-orange-800 dark:text-orange-200">
			Some gateways had errors:
		</p>
		{#each discoveryErrors as err}
			<p class="text-sm text-orange-700 dark:text-orange-300">
				<strong>{err.gateway_name}:</strong>
				{err.error}
			</p>
		{/each}
	</div>
{/if}

{#if hasDiscovered && tools.length > 0}
	<div class="mb-4 flex items-center justify-between">
		<p class="text-sm text-muted-foreground">
			{tools.length} tool{tools.length !== 1 ? 's' : ''} found
			{#if selectedTools.size > 0}
				&middot; {selectedTools.size} selected
			{/if}
		</p>
		<Button onclick={requestImport} disabled={isImporting || selectedTools.size === 0}>
			{#if isImporting}
				<svg class="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
				</svg>
				Importing...
			{:else}
				Import Selected ({selectedTools.size})
			{/if}
		</Button>
	</div>

	<div class="overflow-x-auto rounded-md border">
		<table class="w-full text-sm">
			<thead class="border-b bg-muted/50">
				<tr>
					<th class="w-10 px-3 py-3 text-left">
						<input
							type="checkbox"
							checked={allSelected}
							onchange={toggleAll}
							class="rounded border-input"
							aria-label="Select all tools"
						/>
					</th>
					<th class="px-3 py-3 text-left font-medium">Name</th>
					<th class="px-3 py-3 text-left font-medium">Description</th>
					<th class="px-3 py-3 text-left font-medium">Server</th>
					<th class="px-3 py-3 text-left font-medium">Gateway</th>
				</tr>
			</thead>
			<tbody>
				{#each tools as tool}
					{@const key = toolKey(tool)}
					<tr class="border-b transition-colors hover:bg-muted/50 {selectedTools.has(key) ? 'bg-accent' : ''}"
					>
						<td class="px-3 py-3">
							<input
								type="checkbox"
								checked={selectedTools.has(key)}
								onchange={() => toggleTool(tool)}
								class="rounded border-input"
								aria-label="Select {tool.name}"
							/>
						</td>
						<td class="px-3 py-3 font-medium">{tool.name}</td>
						<td class="max-w-xs truncate px-3 py-3 text-muted-foreground" title={tool.description ?? ''}>
							{#if tool.description}
								{tool.description.length > 80
									? tool.description.substring(0, 80) + '...'
									: tool.description}
							{:else}
								<span class="italic">No description</span>
							{/if}
						</td>
						<td class="px-3 py-3">{tool.server_name ?? '—'}</td>
						<td class="px-3 py-3">{tool.gateway_name ?? '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else if hasDiscovered}
	<div class="flex flex-col items-center justify-center rounded-md border py-12 text-center">
		<p class="text-lg font-medium">No tools discovered</p>
		<p class="mt-1 text-sm text-muted-foreground">
			Try selecting a different gateway or check your AgentGateway configuration.
		</p>
	</div>
{/if}

{#if showResults && importResults.length > 0}
	<div class="mt-6 rounded-md border p-4">
		<h3 class="mb-3 text-lg font-medium">Import Results</h3>
		<div class="space-y-2">
			{#each importResults as result}
				<div class="flex items-center justify-between rounded-md border px-3 py-2">
					<span class="font-medium">{result.tool_name}</span>
					{#if result.error}
						<Badge variant="destructive">{result.error}</Badge>
					{:else}
						<Badge variant="default">Imported</Badge>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/if}

{#if showResults && successfulImports.length > 0}
	<div class="mt-6 rounded-md border p-4">
		<h3 class="mb-3 text-lg font-medium">Grant to Agent</h3>
		<p class="mb-3 text-sm text-muted-foreground">
			Grant the {successfulImports.length} imported tool{successfulImports.length !== 1 ? 's' : ''} to an agent.
		</p>
		<div class="flex items-end gap-3">
			<div class="flex flex-col gap-1">
				<label for="grant-agent-select" class="text-sm font-medium">Agent</label>
				<select
					id="grant-agent-select"
					class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					bind:value={grantAgentId}
					onfocus={loadAgents}
				>
					<option value="">Select an agent</option>
					{#if agentsLoading}
						<option value="" disabled>Loading...</option>
					{:else}
						{#each agents as agent}
							<option value={agent.id}>{agent.name}</option>
						{/each}
					{/if}
				</select>
			</div>
			<Button onclick={bulkGrant} disabled={!grantAgentId || isGranting}>
				{#if isGranting}
					Granting...
				{:else}
					Grant All Imported ({successfulImports.length})
				{/if}
			</Button>
		</div>
		{#if grantResults}
			<div class="mt-3 space-y-1">
				{#each grantResults.results as result}
					<div class="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
						<span class="font-medium">{successfulImports.find((r) => r.nhi_id === result.tool_id)?.tool_name ?? result.tool_id.substring(0, 8) + '...'}</span>
						{#if result.success}
							<Badge variant="default">Granted</Badge>
						{:else}
							<Badge variant="destructive">{result.error ?? 'Failed'}</Badge>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<!-- Confirm import dialog -->
{#if showConfirmDialog}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
		role="dialog"
		aria-modal="true"
		aria-labelledby="confirm-dialog-title"
	>
		<div class="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
			<h2 id="confirm-dialog-title" class="text-lg font-semibold">Confirm Import</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Import {selectedTools.size} tool{selectedTools.size !== 1 ? 's' : ''} as NHI identities? This will create new records in your NHI registry.
			</p>
			<div class="mt-4 flex justify-end gap-2">
				<Button variant="outline" onclick={() => (showConfirmDialog = false)}>
					Cancel
				</Button>
				<Button onclick={doImport}>
					Import {selectedTools.size} Tool{selectedTools.size !== 1 ? 's' : ''}
				</Button>
			</div>
		</div>
	</div>
{/if}
