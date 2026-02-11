<script lang="ts">
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import JsonDisplay from '$lib/components/nhi/json-display.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let showCancelDialog: boolean = $state(false);

	const terminalStates = ['completed', 'failed', 'cancelled'];
	const canCancel = $derived(!terminalStates.includes(data.task.state));

	function stateColor(state: string): string {
		switch (state) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'running':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={data.task.task_type} description="A2A Task details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {stateColor(data.task.state)}"
		>
			{data.task.state}
		</span>
	</div>
	<a
		href="/nhi/a2a"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to A2A Tasks
	</a>
</div>

<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Task information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">ID</span>
				<span class="text-sm font-mono">{data.task.id}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Task Type</span>
				<span class="text-sm font-medium">{data.task.task_type}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Source Agent ID</span>
				<span class="text-sm font-mono">{data.task.source_agent_id ?? '\u2014'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Target Agent ID</span>
				<span class="text-sm font-mono">{data.task.target_agent_id ?? '\u2014'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">State</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {stateColor(data.task.state)}"
				>
					{data.task.state}
				</span>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created</span>
				<span class="text-sm">{new Date(data.task.created_at).toLocaleString()}</span>
			</div>
			{#if data.task.started_at}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Started</span>
					<span class="text-sm">{new Date(data.task.started_at).toLocaleString()}</span>
				</div>
			{/if}
			{#if data.task.completed_at}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Completed</span>
					<span class="text-sm">{new Date(data.task.completed_at).toLocaleString()}</span>
				</div>
			{/if}
		</div>
	</CardContent>
</Card>

{#if data.task.result}
	<Card class="mt-6 max-w-2xl">
		<CardHeader>
			<h2 class="text-xl font-semibold">Result</h2>
		</CardHeader>
		<CardContent>
			<JsonDisplay data={data.task.result} />
		</CardContent>
	</Card>
{/if}

{#if data.task.error_code || data.task.error_message}
	<Alert variant="destructive" class="mt-6 max-w-2xl">
		<AlertDescription>
			{#if data.task.error_code}
				<span class="font-semibold">Error code:</span> {data.task.error_code}<br />
			{/if}
			{#if data.task.error_message}
				<span class="font-semibold">Message:</span> {data.task.error_message}
			{/if}
		</AlertDescription>
	</Alert>
{/if}

{#if canCancel}
	<Separator class="my-6" />

	<Card class="max-w-2xl">
		<CardHeader>
			<h2 class="text-xl font-semibold">Actions</h2>
		</CardHeader>
		<CardContent>
			<Button variant="destructive" onclick={() => (showCancelDialog = true)}>Cancel Task</Button>
		</CardContent>
	</Card>
{/if}

<!-- Cancel confirmation dialog -->
<Dialog.Root bind:open={showCancelDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Cancel task</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to cancel this task? This action cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showCancelDialog = false)}>Go back</Button>
			<form
				method="POST"
				action="?/cancel"
				use:formEnhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							addToast('success', 'Task cancelled');
							showCancelDialog = false;
							await invalidateAll();
						} else if (result.type === 'failure') {
							addToast('error', String(result.data?.error ?? 'Failed to cancel task'));
							showCancelDialog = false;
						}
					};
				}}
			>
				<Button type="submit" variant="destructive">Confirm cancel</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
