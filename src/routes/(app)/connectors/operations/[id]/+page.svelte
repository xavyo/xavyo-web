<script lang="ts">
	import type { PageData } from './$types';
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
	import OperationStatusBadge from '$lib/components/operations/operation-status-badge.svelte';
	import OperationTypeBadge from '$lib/components/operations/operation-type-badge.svelte';
	import ExecutionAttempts from '$lib/components/operations/execution-attempts.svelte';

	let { data }: { data: PageData } = $props();

	let showResolveDialog = $state(false);
	let resolutionNotes = $state('');

	const op = $derived(data.operation);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleString();
	}

	function formatPayload(payload: Record<string, unknown>): string {
		try {
			return JSON.stringify(payload, null, 2);
		} catch {
			return String(payload);
		}
	}

	function logLevelClass(level: string): string {
		switch (level) {
			case 'error':
				return 'text-red-600 dark:text-red-400';
			case 'warn':
				return 'text-amber-600 dark:text-amber-400';
			default:
				return 'text-muted-foreground';
		}
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title="Operation Detail" description={op.object_class} />
		<OperationTypeBadge type={op.operation_type} />
		<OperationStatusBadge status={op.status} />
	</div>
	<div class="flex items-center gap-2">
		{#if op.status === 'failed' || op.status === 'dead_letter'}
			<form method="POST" action="?/retry" use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Operation retried');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to retry');
					}
				};
			}}>
				<Button type="submit" variant="outline">Retry</Button>
			</form>
		{/if}
		{#if op.status === 'pending'}
			<form method="POST" action="?/cancel" use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Operation cancelled');
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Failed to cancel');
					}
				};
			}}>
				<Button type="submit" variant="outline">Cancel</Button>
			</form>
		{/if}
		{#if op.status === 'dead_letter'}
			<Button variant="outline" onclick={() => { showResolveDialog = true; }}>Resolve</Button>
		{/if}
		<a
			href="/connectors/operations"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back to Queue
		</a>
	</div>
</div>

<Tabs value="details" class="mt-4">
	<TabsList>
		<TabsTrigger value="details">Details</TabsTrigger>
		<TabsTrigger value="attempts">Attempts ({data.attempts.length})</TabsTrigger>
		<TabsTrigger value="payload">Payload</TabsTrigger>
		<TabsTrigger value="logs">Logs ({data.logs.length})</TabsTrigger>
	</TabsList>

	<TabsContent value="details">
		<Card class="max-w-2xl">
			<CardHeader>
				<h2 class="text-xl font-semibold">Operation Information</h2>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-3">
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">ID</span>
						<span class="text-sm font-mono">{op.id}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Type</span>
						<OperationTypeBadge type={op.operation_type} />
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Status</span>
						<OperationStatusBadge status={op.status} />
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Connector</span>
						<span class="text-sm">{op.connector_name}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Object Class</span>
						<span class="text-sm">{op.object_class}</span>
					</div>
					{#if op.target_uid}
						<div class="flex justify-between">
							<span class="text-sm text-muted-foreground">Target UID</span>
							<span class="text-sm font-mono">{op.target_uid}</span>
						</div>
					{/if}
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Priority</span>
						<span class="text-sm">{op.priority}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Retry Count</span>
						<span class="text-sm">{op.retry_count} / {op.max_retries}</span>
					</div>

					<Separator />

					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Created</span>
						<span class="text-sm">{formatDate(op.created_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Updated</span>
						<span class="text-sm">{formatDate(op.updated_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-muted-foreground">Completed</span>
						<span class="text-sm">{formatDate(op.completed_at)}</span>
					</div>

					{#if op.error_message}
						<Separator />
						<div>
							<span class="text-sm text-muted-foreground">Error</span>
							<p class="mt-1 text-sm text-destructive">{op.error_message}</p>
						</div>
					{/if}

					{#if op.resolution_notes}
						<Separator />
						<div>
							<span class="text-sm text-muted-foreground">Resolution Notes</span>
							<p class="mt-1 text-sm">{op.resolution_notes}</p>
						</div>
					{/if}
				</div>
			</CardContent>
		</Card>
	</TabsContent>

	<TabsContent value="attempts">
		<Card>
			<CardHeader>
				<h2 class="text-xl font-semibold">Execution Attempts</h2>
			</CardHeader>
			<CardContent>
				<ExecutionAttempts attempts={data.attempts} />
			</CardContent>
		</Card>
	</TabsContent>

	<TabsContent value="payload">
		<Card class="max-w-2xl">
			<CardHeader>
				<h2 class="text-xl font-semibold">Operation Payload</h2>
			</CardHeader>
			<CardContent>
				<pre class="overflow-auto rounded-md bg-muted p-4 font-mono text-sm">{formatPayload(op.payload)}</pre>
			</CardContent>
		</Card>
	</TabsContent>

	<TabsContent value="logs">
		<Card>
			<CardHeader>
				<h2 class="text-xl font-semibold">Operation Logs</h2>
			</CardHeader>
			<CardContent>
				{#if data.logs.length === 0}
					<p class="text-sm text-muted-foreground">No log entries recorded.</p>
				{:else}
					<div class="space-y-2">
						{#each data.logs as log}
							<div class="flex items-start gap-3 rounded-md border border-gray-200 p-3 dark:border-gray-700">
								<span class="text-xs font-medium uppercase {logLevelClass(log.level)}">{log.level}</span>
								<span class="flex-1 text-sm">{log.message}</span>
								<span class="text-xs text-muted-foreground whitespace-nowrap">{formatDate(log.timestamp)}</span>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>
	</TabsContent>
</Tabs>

<Dialog.Root bind:open={showResolveDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Resolve Operation</Dialog.Title>
			<Dialog.Description>
				Mark this dead-letter operation as resolved with optional notes.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/resolve" use:formEnhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					addToast('success', 'Operation resolved');
					showResolveDialog = false;
					resolutionNotes = '';
					await invalidateAll();
				} else if (result.type === 'failure') {
					addToast('error', (result.data?.error as string) || 'Failed to resolve');
				}
			};
		}}>
			<div class="py-4">
				<label for="resolution_notes" class="text-sm font-medium">
					Resolution Notes
				</label>
				<textarea
					id="resolution_notes"
					name="resolution_notes"
					bind:value={resolutionNotes}
					rows={3}
					class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					placeholder="Describe how this operation was resolved..."
				></textarea>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => { showResolveDialog = false; }}>Cancel</Button>
				<Button type="submit">Resolve</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
