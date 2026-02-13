<script lang="ts">
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { enhance as formEnhance } from '$app/forms';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const policy = $derived(data.policy);

	let showDeleteDialog = $state(false);

	function statusBadgeColor(active: boolean): string {
		return active
			? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
			: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={policy.name} description="SLA policy details" />
		<span
			class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(policy.is_active)}"
		>
			{policy.is_active ? 'Active' : 'Inactive'}
		</span>
	</div>
	<div class="flex items-center gap-2">
		<a
			href="/governance/operations/sla/{policy.id}/edit"
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
		<h2 class="text-xl font-semibold">Policy Information</h2>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Name</span>
				<span class="text-sm font-medium">{policy.name}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Description</span>
				<span class="text-sm">{policy.description ?? 'No description'}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Target Duration</span>
				<span class="text-sm font-medium">{policy.target_duration_human ?? `${policy.target_duration_seconds}s`}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Warning Threshold</span>
				<span class="text-sm font-medium">{policy.warning_threshold_percent}%</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Breach Notification</span>
				<span class="text-sm font-medium">{policy.breach_notification_enabled ? 'Enabled' : 'Disabled'}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm text-muted-foreground">Status</span>
				<span
					class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(policy.is_active)}"
				>
					{policy.is_active ? 'Active' : 'Inactive'}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created At</span>
				<span class="text-sm">{formatDate(policy.created_at)}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Updated At</span>
				<span class="text-sm">{formatDate(policy.updated_at)}</span>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={showDeleteDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete SLA Policy</Dialog.Title>
			<Dialog.Description>
				Are you sure you want to delete "{policy.name}"? This action cannot be undone.
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
							addToast('success', 'SLA policy deleted');
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
