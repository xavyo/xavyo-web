<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardHeader } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import ScriptStatusBadge from '$lib/components/provisioning-scripts/script-status-badge.svelte';
	import VersionDiff from '$lib/components/provisioning-scripts/version-diff.svelte';
	import ValidationResult from '$lib/components/provisioning-scripts/validation-result.svelte';
	import DryRunPanel from '$lib/components/provisioning-scripts/dry-run-panel.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import type { PageData } from './$types';
	import type { VersionCompareResponse, ScriptValidationResult } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	const script = $derived(data.script);
	const versions = $derived(data.versions);
	const bindings = $derived(data.bindings);
	const logs = $derived(data.logs);

	let activeTab = $state('details');
	let loading = $state(false);

	// Confirm dialog state
	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmAction = $state<(() => Promise<void>) | null>(null);

	function openConfirm(title: string, message: string, action: () => Promise<void>) {
		confirmTitle = title;
		confirmMessage = message;
		confirmAction = action;
		confirmOpen = true;
	}

	async function executeConfirm() {
		if (confirmAction) {
			await confirmAction();
		}
		confirmOpen = false;
		confirmAction = null;
	}

	// Version creation
	let showCreateVersion = $state(false);
	let newVersionBody = $state('');
	let newVersionDescription = $state('');

	// Version comparison
	let compareFrom = $state(0);
	let compareTo = $state(0);
	let diffResult = $state<VersionCompareResponse | null>(null);

	// Validation
	let validationResult = $state<ScriptValidationResult | null>(null);
	let dryRunLoading = $state(false);

	const tabs = [
		{ id: 'details', label: 'Details' },
		// svelte-ignore state_referenced_locally
		{ id: 'versions', label: 'Versions', count: data.versionsTotal },
		// svelte-ignore state_referenced_locally
		{ id: 'bindings', label: 'Bindings', count: data.bindingsTotal },
		// svelte-ignore state_referenced_locally
		{ id: 'logs', label: 'Logs', count: data.logsTotal }
	];

	const hookPhaseLabels: Record<string, string> = { before: 'Before', after: 'After' };
	const operationLabels: Record<string, string> = { create: 'Create', update: 'Update', delete: 'Delete', enable: 'Enable', disable: 'Disable' };
	const failurePolicyLabels: Record<string, string> = { abort: 'Abort', continue: 'Continue', retry: 'Retry' };
	const logStatusColors: Record<string, string> = {
		success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		failure: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		timeout: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
	};

	async function handleActivate() {
		loading = true;
		try {
			const res = await fetch(`/api/provisioning-scripts/${script.id}/activate`, { method: 'POST' });
			if (res.ok) {
				addToast('success', 'Script activated');
				await invalidateAll();
			} else {
				const body = await res.json().catch(() => ({ error: 'Activation failed' }));
				addToast('error', body.error || 'Failed to activate script');
			}
		} catch {
			addToast('error', 'Failed to activate script');
		}
		loading = false;
	}

	async function handleDeactivate() {
		loading = true;
		try {
			const res = await fetch(`/api/provisioning-scripts/${script.id}/deactivate`, { method: 'POST' });
			if (res.ok) {
				addToast('success', 'Script deactivated');
				await invalidateAll();
			} else {
				const body = await res.json().catch(() => ({ error: 'Deactivation failed' }));
				addToast('error', body.error || 'Failed to deactivate script');
			}
		} catch {
			addToast('error', 'Failed to deactivate script');
		}
		loading = false;
	}

	function handleDelete() {
		openConfirm('Delete Script', 'Are you sure you want to delete this script?', async () => {
			loading = true;
			try {
				const res = await fetch(`/api/provisioning-scripts/${script.id}`, { method: 'DELETE' });
				if (res.ok) {
					addToast('success', 'Script deleted');
					goto('/governance/provisioning-scripts');
				} else {
					const body = await res.json().catch(() => ({ error: 'Delete failed' }));
					addToast('error', body.error || 'Failed to delete script');
				}
			} catch {
				addToast('error', 'Failed to delete script');
			}
			loading = false;
		});
	}

	async function handleCreateVersion() {
		if (!newVersionBody.trim()) return;
		loading = true;
		try {
			const res = await fetch(`/api/provisioning-scripts/${script.id}/versions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ script_body: newVersionBody, change_description: newVersionDescription || undefined })
			});
			if (res.ok) {
				addToast('success', 'New version created');
				showCreateVersion = false;
				newVersionBody = '';
				newVersionDescription = '';
				await invalidateAll();
			} else {
				const body = await res.json().catch(() => ({ error: 'Failed' }));
				addToast('error', body.error || 'Failed to create version');
			}
		} catch {
			addToast('error', 'Failed to create version');
		}
		loading = false;
	}

	async function handleCompare() {
		if (compareFrom <= 0 || compareTo <= 0 || compareFrom === compareTo) return;
		loading = true;
		try {
			const res = await fetch(`/api/provisioning-scripts/${script.id}/versions/compare?from=${compareFrom}&to=${compareTo}`);
			if (res.ok) {
				diffResult = await res.json();
			} else {
				addToast('error', 'Failed to compare versions');
			}
		} catch {
			addToast('error', 'Failed to compare versions');
		}
		loading = false;
	}

	function handleRollback(targetVersion: number) {
		openConfirm('Rollback Version', `Roll back to version ${targetVersion}?`, async () => {
			loading = true;
			try {
				const res = await fetch(`/api/provisioning-scripts/${script.id}/rollback`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ target_version: targetVersion })
				});
				if (res.ok) {
					addToast('success', `Rolled back to version ${targetVersion}`);
					await invalidateAll();
				} else {
					const body = await res.json().catch(() => ({ error: 'Failed' }));
					addToast('error', body.error || 'Failed to rollback');
				}
			} catch {
				addToast('error', 'Failed to rollback');
			}
			loading = false;
		});
	}

	async function handleValidate() {
		const latestVersion = versions[0];
		if (!latestVersion) {
			addToast('error', 'No version to validate');
			return;
		}
		loading = true;
		try {
			const res = await fetch('/api/provisioning-scripts/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ script_body: latestVersion.script_body })
			});
			if (res.ok) {
				validationResult = await res.json();
			} else {
				addToast('error', 'Validation request failed');
			}
		} catch {
			addToast('error', 'Validation request failed');
		}
		loading = false;
	}

	let dryRunResult = $state<import('$lib/api/types').ScriptDryRunResult | null>(null);

	async function handleDryRun(contextStr: string) {
		dryRunLoading = true;
		dryRunResult = null;
		try {
			const context = JSON.parse(contextStr) as Record<string, unknown>;
			const latestVersion = versions[0];
			const res = await fetch('/api/provisioning-scripts/dry-run', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ script_body: latestVersion?.script_body ?? '', context })
			});
			if (res.ok) {
				dryRunResult = await res.json();
			} else {
				addToast('error', 'Dry run failed');
			}
		} catch (e: unknown) {
			const message = e instanceof Error ? e.message : 'Dry run failed';
			addToast('error', message);
		}
		dryRunLoading = false;
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={script.name} description={script.description ?? 'No description'} />
		<ScriptStatusBadge status={script.status} />
		<Badge variant="outline" class="font-mono">v{script.current_version}</Badge>
		{#if script.is_system}
			<Badge variant="outline">System</Badge>
		{/if}
	</div>
	<div class="flex gap-2">
		<a
			href="/governance/provisioning-scripts/{script.id}/edit"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Edit
		</a>
		<a
			href="/governance/provisioning-scripts"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to List
		</a>
	</div>
</div>

<!-- Tab navigation -->
<div class="mt-6 -mb-px flex gap-4 border-b border-border" role="tablist" aria-label="Script detail tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			id="tab-{tab.id}"
			class="inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
			{#if tab.count !== undefined}
				<Badge variant="secondary" class="ml-1 text-xs">{tab.count}</Badge>
			{/if}
		</button>
	{/each}
</div>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	{#if activeTab === 'details'}
		<!-- Details tab -->
		<div class="space-y-6">
			<Card>
				<CardHeader>
					<h3 class="text-lg font-semibold">Script Information</h3>
				</CardHeader>
				<CardContent>
					<dl class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<dt class="text-muted-foreground">Status</dt>
							<dd class="mt-1"><ScriptStatusBadge status={script.status} /></dd>
						</div>
						<div>
							<dt class="text-muted-foreground">Current Version</dt>
							<dd class="mt-1 font-mono">v{script.current_version}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground">Created</dt>
							<dd class="mt-1">{new Date(script.created_at).toLocaleString()}</dd>
						</div>
						<div>
							<dt class="text-muted-foreground">Updated</dt>
							<dd class="mt-1">{new Date(script.updated_at).toLocaleString()}</dd>
						</div>
					</dl>
				</CardContent>
			</Card>

			<!-- Current version body -->
			{#if versions.length > 0}
				<Card>
					<CardHeader>
						<h3 class="text-lg font-semibold">Current Script Body (v{versions[0].version_number})</h3>
					</CardHeader>
					<CardContent>
						<pre class="rounded-md border bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap overflow-x-auto">{versions[0].script_body}</pre>
					</CardContent>
				</Card>
			{/if}

			<!-- Lifecycle actions -->
			<Card>
				<CardHeader>
					<h3 class="text-lg font-semibold">Actions</h3>
				</CardHeader>
				<CardContent class="flex flex-wrap gap-2">
					{#if script.status === 'draft' || script.status === 'inactive'}
						<Button onclick={handleActivate} disabled={loading}>Activate</Button>
					{/if}
					{#if script.status === 'active'}
						<Button variant="outline" onclick={handleDeactivate} disabled={loading}>Deactivate</Button>
					{/if}
					<Button onclick={handleValidate} variant="outline" disabled={loading}>Validate</Button>
					{#if !script.is_system}
						<Button variant="destructive" onclick={handleDelete} disabled={loading}>Delete</Button>
					{/if}
				</CardContent>
			</Card>

			{#if validationResult}
				<ValidationResult result={validationResult} />
			{/if}

			<Card>
				<CardHeader>
					<h3 class="text-lg font-semibold">Dry Run</h3>
				</CardHeader>
				<CardContent>
					<DryRunPanel onDryRun={handleDryRun} loading={dryRunLoading} result={dryRunResult} />
				</CardContent>
			</Card>
		</div>

	{:else if activeTab === 'versions'}
		<!-- Versions tab -->
		<div class="space-y-6">
			<div class="flex justify-end">
				<Button onclick={() => (showCreateVersion = !showCreateVersion)}>
					{showCreateVersion ? 'Cancel' : 'Create New Version'}
				</Button>
			</div>

			{#if showCreateVersion}
				<Card>
					<CardHeader>
						<h3 class="text-lg font-semibold">New Version</h3>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="space-y-2">
							<Label for="version-body">Script Body</Label>
							<textarea
								id="version-body"
								class="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								bind:value={newVersionBody}
								placeholder="Enter script body..."
							></textarea>
						</div>
						<div class="space-y-2">
							<Label for="version-desc">Change Description (optional)</Label>
							<Input
								id="version-desc"
								type="text"
								placeholder="What changed in this version?"
								bind:value={newVersionDescription}
							/>
						</div>
						<Button onclick={handleCreateVersion} disabled={loading || !newVersionBody.trim()}>
							Create Version
						</Button>
					</CardContent>
				</Card>
			{/if}

			<!-- Compare versions -->
			{#if versions.length >= 2}
				<Card>
					<CardHeader>
						<h3 class="text-lg font-semibold">Compare Versions</h3>
					</CardHeader>
					<CardContent class="space-y-4">
						<div class="flex items-end gap-4">
							<div class="space-y-2">
								<Label>From Version</Label>
								<select
									class="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
									value={String(compareFrom)}
									onchange={(e) => { compareFrom = parseInt((e.target as HTMLSelectElement).value); }}
								>
									<option value="0">Select...</option>
									{#each versions as v}
										<option value={String(v.version_number)}>v{v.version_number}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-2">
								<Label>To Version</Label>
								<select
									class="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
									value={String(compareTo)}
									onchange={(e) => { compareTo = parseInt((e.target as HTMLSelectElement).value); }}
								>
									<option value="0">Select...</option>
									{#each versions as v}
										<option value={String(v.version_number)}>v{v.version_number}</option>
									{/each}
								</select>
							</div>
							<Button onclick={handleCompare} disabled={loading || compareFrom <= 0 || compareTo <= 0 || compareFrom === compareTo}>
								Compare
							</Button>
						</div>
						<VersionDiff diff={diffResult} />
					</CardContent>
				</Card>
			{/if}

			<!-- Version history -->
			{#if versions.length === 0}
				<Card>
					<CardContent class="py-12 text-center">
						<p class="text-muted-foreground">No versions yet. Create the first version above.</p>
					</CardContent>
				</Card>
			{:else}
				<div class="rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left font-medium">Version</th>
								<th class="px-4 py-3 text-left font-medium">Change Description</th>
								<th class="px-4 py-3 text-left font-medium">Created</th>
								<th class="px-4 py-3 text-right font-medium">Actions</th>
							</tr>
						</thead>
						<tbody>
							{#each versions as version}
								<tr class="border-b last:border-0">
									<td class="px-4 py-3 font-mono">
										v{version.version_number}
										{#if version.version_number === script.current_version}
											<Badge class="ml-2 text-xs">Current</Badge>
										{/if}
									</td>
									<td class="px-4 py-3 text-muted-foreground">{version.change_description ?? '\u2014'}</td>
									<td class="px-4 py-3 text-muted-foreground">{new Date(version.created_at).toLocaleString()}</td>
									<td class="px-4 py-3 text-right">
										{#if version.version_number !== script.current_version}
											<Button
												variant="outline"
												size="sm"
												onclick={() => handleRollback(version.version_number)}
												disabled={loading}
											>
												Rollback
											</Button>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

	{:else if activeTab === 'bindings'}
		<!-- Bindings tab -->
		<div class="space-y-4">
			{#if bindings.length === 0}
				<Card>
					<CardContent class="py-12 text-center">
						<p class="text-muted-foreground">No bindings configured for this script.</p>
					</CardContent>
				</Card>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left font-medium">Phase</th>
								<th class="px-4 py-3 text-left font-medium">Operation</th>
								<th class="px-4 py-3 text-left font-medium">Connector</th>
								<th class="px-4 py-3 text-right font-medium">Order</th>
								<th class="px-4 py-3 text-left font-medium">Failure Policy</th>
								<th class="px-4 py-3 text-left font-medium">Enabled</th>
							</tr>
						</thead>
						<tbody>
							{#each bindings as binding}
								<tr class="border-b last:border-0">
									<td class="px-4 py-3">
										<Badge variant="outline">{hookPhaseLabels[binding.hook_phase] ?? binding.hook_phase}</Badge>
									</td>
									<td class="px-4 py-3">{operationLabels[binding.operation_type] ?? binding.operation_type}</td>
									<td class="px-4 py-3 font-mono text-xs">{binding.connector_id.substring(0, 8)}...</td>
									<td class="px-4 py-3 text-right">{binding.execution_order}</td>
									<td class="px-4 py-3">
										<Badge variant="outline">{failurePolicyLabels[binding.failure_policy] ?? binding.failure_policy}</Badge>
										{#if binding.failure_policy === 'retry' && binding.max_retries}
											<span class="text-xs text-muted-foreground ml-1">(max {binding.max_retries})</span>
										{/if}
									</td>
									<td class="px-4 py-3">
										{#if binding.enabled}
											<Badge class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Enabled</Badge>
										{:else}
											<Badge class="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Disabled</Badge>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

	{:else if activeTab === 'logs'}
		<!-- Logs tab -->
		<div class="space-y-4">
			{#if logs.length === 0}
				<Card>
					<CardContent class="py-12 text-center">
						<p class="text-muted-foreground">No execution logs found for this script.</p>
					</CardContent>
				</Card>
			{:else}
				<div class="overflow-x-auto rounded-md border">
					<table class="w-full text-sm">
						<thead>
							<tr class="border-b bg-muted/50">
								<th class="px-4 py-3 text-left font-medium">Status</th>
								<th class="px-4 py-3 text-right font-medium">Version</th>
								<th class="px-4 py-3 text-right font-medium">Duration</th>
								<th class="px-4 py-3 text-left font-medium">Dry Run</th>
								<th class="px-4 py-3 text-left font-medium">Executed At</th>
							</tr>
						</thead>
						<tbody>
							{#each logs as log}
								<tr class="border-b last:border-0">
									<td class="px-4 py-3">
										<Badge class={logStatusColors[log.status] ?? ''}>{log.status}</Badge>
									</td>
									<td class="px-4 py-3 text-right font-mono">v{log.script_version}</td>
									<td class="px-4 py-3 text-right">{log.duration_ms}ms</td>
									<td class="px-4 py-3">
										{#if log.dry_run}
											<Badge variant="outline">Dry Run</Badge>
										{/if}
									</td>
									<td class="px-4 py-3 text-muted-foreground">
										{new Date(log.executed_at).toLocaleString()}
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

<!-- Confirm Dialog -->
<Dialog.Root bind:open={confirmOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>{confirmTitle}</DialogTitle>
		</DialogHeader>
		<div class="py-4">
			<p class="text-sm text-muted-foreground">{confirmMessage}</p>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={executeConfirm}>Confirm</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
