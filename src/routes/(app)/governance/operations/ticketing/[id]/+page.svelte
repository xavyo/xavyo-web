<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const config = $derived(data.config);

	let showDeleteDialog = $state(false);

	function formatDateTime(dateStr: string | null): string {
		if (!dateStr || isNaN(new Date(dateStr).getTime())) return '\u2014';
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={config.name} description="Ticketing configuration details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {config.is_active
				? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
				: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}"
		>
			{config.ticketing_type}
		</span>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/governance/operations/ticketing/{config.id}/edit"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Edit
		</a>
		<Button
			variant="destructive"
			onclick={() => {
				showDeleteDialog = true;
			}}
		>
			Delete
		</Button>
		<a
			href="/governance/operations"
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
		>
			Back
		</a>
	</div>
</div>

<Card class="mt-4 max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Configuration Information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Name</span>
				<span class="text-sm font-medium">{config.name}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm text-muted-foreground">Ticketing Type</span>
				<span class="text-sm font-medium">{config.ticketing_type}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Endpoint URL</span>
				<span class="text-sm font-mono">{config.endpoint_url}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Polling Interval</span>
				<span class="text-sm font-medium">{config.polling_interval_seconds}s</span>
			</div>

			{#if config.default_assignee}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Default Assignee</span>
					<span class="text-sm font-medium">{config.default_assignee}</span>
				</div>
			{/if}

			{#if config.default_assignment_group}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Default Assignment Group</span>
					<span class="text-sm font-medium">{config.default_assignment_group}</span>
				</div>
			{/if}

			{#if config.project_key}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Project Key</span>
					<span class="text-sm font-medium">{config.project_key}</span>
				</div>
			{/if}

			{#if config.issue_type}
				<div class="flex justify-between">
					<span class="text-sm text-muted-foreground">Issue Type</span>
					<span class="text-sm">{config.issue_type}</span>
				</div>
			{/if}

			<div class="flex justify-between items-center">
				<span class="text-sm text-muted-foreground">Active</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {config.is_active
						? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
						: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}"
				>
					{config.is_active ? 'Yes' : 'No'}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created At</span>
				<span class="text-sm">{formatDateTime(config.created_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Updated At</span>
				<span class="text-sm">{formatDateTime(config.updated_at)}</span>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Ticketing Configuration</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{config.name}"? This action cannot be undone.
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
							addToast('success', 'Ticketing configuration deleted');
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
